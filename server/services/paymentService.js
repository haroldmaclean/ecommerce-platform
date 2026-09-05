const Stripe = require('stripe')

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
}
