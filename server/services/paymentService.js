const Stripe = require('stripe')
const mongoose = require('mongoose')

const Order = require('../models/Order')
const Payment = require('../models/Payment')
const Product = require('../models/Product')
const AppError = require('../utils/AppError')

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const createPayment = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  })

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  if (
    order.status !== 'pending' ||
    order.reservationStatus !== 'active' ||
    order.reservationExpiresAt <= new Date()
  ) {
    throw new AppError('Order reservation is no longer valid', 400)
  }

  const existingPayment = await Payment.findOne({
    order: order._id,
  })

  if (existingPayment) {
    throw new AppError('Payment already exists for this order', 409)
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: 'zar',
    metadata: {
      orderId: order._id.toString(),
      userId: userId.toString(),
    },
  })

  const payment = await Payment.create({
    order: order._id,
    user: userId,
    amount: order.totalAmount,
    currency: 'zar',
    status: 'pending',
    refundStatus: 'not_required',
    stripePaymentIntentId: paymentIntent.id,
  })

  return {
    payment,
    clientSecret: paymentIntent.client_secret,
  }
}

// Refund outside the MongoDB transaction.
// The same idempotency key is reused on every retry.
const refundPayment = async (payment) => {
  try {
    await stripe.refunds.create(
      {
        payment_intent: payment.stripePaymentIntentId,
      },
      {
        idempotencyKey: `payment-refund-${payment._id}`,
      },
    )

    payment.refundStatus = 'succeeded'
    await payment.save()
  } catch (error) {
    payment.refundStatus = 'failed'
    await payment.save()

    throw error
  }
}

const handlePaymentSuccess = async (paymentIntent) => {
  const session = await mongoose.startSession()

  let paymentId
  let refundRequired = false

  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({
        stripePaymentIntentId: paymentIntent.id,
      }).session(session)

      if (!payment) {
        throw new AppError('Payment not found', 404)
      }

      paymentId = payment._id

      // Verify the Stripe payment against our own payment record.
      const expectedAmount = Math.round(payment.amount * 100)

      if (
        paymentIntent.amount !== expectedAmount ||
        (paymentIntent.amount_received !== undefined &&
          paymentIntent.amount_received !== expectedAmount) ||
        paymentIntent.currency.toLowerCase() !== payment.currency.toLowerCase()
      ) {
        throw new AppError('Stripe payment amount or currency mismatch', 400)
      }

      if (
        paymentIntent.metadata?.orderId !== payment.order.toString() ||
        paymentIntent.metadata?.userId !== payment.user.toString()
      ) {
        throw new AppError('Stripe payment metadata mismatch', 400)
      }

      // A duplicate webhook must never finalize inventory twice.
      if (payment.status === 'succeeded') {
        refundRequired =
          payment.refundStatus === 'pending' ||
          payment.refundStatus === 'failed'
        return
      }

      const order = await Order.findById(payment.order).session(session)

      let finalized = false

      if (
        order &&
        order.status === 'pending' &&
        order.reservationStatus === 'active' &&
        order.reservationExpiresAt > new Date()
      ) {
        // Claim the active reservation for payment finalization.
        const claimedOrder = await Order.findOneAndUpdate(
          {
            _id: order._id,
            status: 'pending',
            reservationStatus: 'active',
            reservationExpiresAt: { $gt: new Date() },
          },
          {
            $set: {
              status: 'confirmed',
              reservationStatus: 'finalized',
            },
          },
          {
            new: true,
            session,
          },
        )

        if (!claimedOrder) {
          throw new AppError('Could not claim order reservation', 409)
        }

        // Convert reserved stock into sold stock.
        for (const item of claimedOrder.items) {
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: item.product,
              stock: { $gte: item.quantity },
              reservedStock: { $gte: item.quantity },
            },
            {
              $inc: {
                stock: -item.quantity,
                reservedStock: -item.quantity,
              },
            },
            {
              new: true,
              session,
            },
          )

          if (!updatedProduct) {
            throw new AppError(
              `Could not finalize inventory for ${item.name}`,
              409,
            )
          }
        }

        finalized = true
      } else if (
        order &&
        order.status === 'pending' &&
        order.reservationStatus === 'active' &&
        order.reservationExpiresAt <= new Date()
      ) {
        // The deadline passed before payment finalization.
        // Claim the reservation for release.
        const expiredOrder = await Order.findOneAndUpdate(
          {
            _id: order._id,
            status: 'pending',
            reservationStatus: 'active',
            reservationExpiresAt: { $lte: new Date() },
          },
          {
            $set: {
              status: 'expired',
              reservationStatus: 'released',
            },
          },
          {
            new: true,
            session,
          },
        )

        if (!expiredOrder) {
          throw new AppError('Could not release expired reservation', 409)
        }

        for (const item of expiredOrder.items) {
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: item.product,
              reservedStock: { $gte: item.quantity },
            },
            {
              $inc: {
                reservedStock: -item.quantity,
              },
            },
            {
              new: true,
              session,
            },
          )

          if (!updatedProduct) {
            throw new AppError(
              `Could not release reserved stock for ${item.name}`,
              409,
            )
          }
        }
      }

      // Record the successful charge.
      // If inventory could not be finalized, a refund is required.
      payment.status = 'succeeded'
      payment.refundStatus = finalized ? 'not_required' : 'pending'

      await payment.save({ session })

      refundRequired = !finalized
    })
  } finally {
    await session.endSession()
  }

  // Stripe API calls must happen outside MongoDB transactions.
  if (refundRequired) {
    const payment = await Payment.findById(paymentId)
    await refundPayment(payment)
  }

  return {
    success: true,
    refundRequired,
  }
}

module.exports = {
  createPayment,
  handlePaymentSuccess,
}

/*const Stripe = require('stripe')

const Order = require('../models/Order')
const Payment = require('../models/Payment')
const AppError = require('../utils/AppError')

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const createPayment = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  })

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  if (order.status === 'cancelled') {
    throw new AppError('Cannot pay for a cancelled order', 400)
  }

  const existingPayment = await Payment.findOne({
    order: order._id,
  })

  if (existingPayment) {
    throw new AppError('Payment already exists for this order', 409)
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: 'zar',
    metadata: {
      orderId: order._id.toString(),
      userId: userId.toString(),
    },
  })

  const payment = await Payment.create({
    order: order._id,
    user: userId,
    amount: order.totalAmount,
    currency: 'zar',
    status: 'pending',
    stripePaymentIntentId: paymentIntent.id,
  })

  return {
    payment,
    clientSecret: paymentIntent.client_secret,
  }
}

const handlePaymentSuccess = async (paymentIntent) => {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  })

  if (!payment) {
    throw new AppError('Payment not found', 404)
  }

  payment.status = 'succeeded'
  await payment.save()

  const order = await Order.findById(payment.order)

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  order.status = 'confirmed'
  await order.save()

  return {
    payment,
    order,
  }
}

module.exports = {
  createPayment,
  handlePaymentSuccess,
}*/
