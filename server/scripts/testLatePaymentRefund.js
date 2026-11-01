require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
})

const mongoose = require('mongoose')

const connectDB = require('../config/db')

const Order = require('../models/Order')
const Product = require('../models/Product')

const { createPayment } = require('../services/paymentService')
const { releaseExpiredReservation } = require('../services/orderService')

const TEST_USER_ID = '6a81c287f256743e8729996f'
const TEST_PRODUCT_ID = '6a7ccf7df94d8b6c90957423'

const TEST_QUANTITY = 1
const TEST_PRICE = 89

const getInventoryBaseline = async () => {
  const product = await Product.findById(TEST_PRODUCT_ID)

  if (!product) {
    throw new Error('Test product not found')
  }

  return {
    stock: product.stock,
    reservedStock: product.reservedStock,
  }
}

const createTestOrderAndReserveStock = async () => {
  const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const product = await Product.findById(TEST_PRODUCT_ID).session(session)

    if (!product) {
      throw new Error('Test product not found')
    }

    if (product.price !== TEST_PRICE) {
      throw new Error('Test product price has changed')
    }

    const [order] = await Order.create(
      [
        {
          user: TEST_USER_ID,
          items: [
            {
              product: product._id,
              name: product.name,
              price: product.price,
              quantity: TEST_QUANTITY,
            },
          ],
          totalAmount: TEST_PRICE * TEST_QUANTITY,
          status: 'pending',
          reservationStatus: 'active',
          reservationExpiresAt,
        },
      ],
      { session },
    )

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: TEST_PRODUCT_ID,
        $expr: {
          $gte: [
            {
              $subtract: ['$stock', { $ifNull: ['$reservedStock', 0] }],
            },
            TEST_QUANTITY,
          ],
        },
      },
      {
        $inc: {
          reservedStock: TEST_QUANTITY,
        },
      },
      {
        session,
        returnDocument: 'after',
      },
    )

    if (!updatedProduct) {
      throw new Error('Not enough available stock for test order')
    }

    await session.commitTransaction()

    return order
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction()
    }

    throw error
  } finally {
    await session.endSession()
  }
}

const createTestPayment = async (orderId) => {
  const result = await createPayment(orderId, TEST_USER_ID)

  console.log('\nStripe PaymentIntent created')
  console.log('Payment ID:', result.payment._id)
  console.log('PaymentIntent ID:', result.payment.stripePaymentIntentId)
  console.log('Amount:', result.payment.amount)
  console.log('Currency:', result.payment.currency)

  return result.payment
}

const expireAndReleaseReservation = async (orderId) => {
  const expiredDeadline = await Order.findOneAndUpdate(
    {
      _id: orderId,
      status: 'pending',
      reservationStatus: 'active',
    },
    {
      $set: {
        reservationExpiresAt: new Date(Date.now() - 1000),
      },
    },
    {
      returnDocument: 'after',
    },
  )

  if (!expiredDeadline) {
    throw new Error('Could not set the test order expiry deadline')
  }

  try {
    const expiredOrder = await releaseExpiredReservation(orderId)

    console.log('\nReservation released by test script')

    return expiredOrder
  } catch (error) {
    // The background worker may have released it first.
    const currentOrder = await Order.findById(orderId)

    if (
      currentOrder?.status === 'expired' &&
      currentOrder?.reservationStatus === 'released'
    ) {
      console.log('\nReservation was already released by the expiry worker')

      return currentOrder
    }

    throw error
  }
}

const verifyReservationReleased = async (orderId, baseline) => {
  const [currentOrder, currentProduct] = await Promise.all([
    Order.findById(orderId),
    Product.findById(TEST_PRODUCT_ID),
  ])

  if (
    !currentOrder ||
    currentOrder.status !== 'expired' ||
    currentOrder.reservationStatus !== 'released'
  ) {
    throw new Error('Order reservation was not released correctly')
  }

  if (
    currentProduct.stock !== baseline.stock ||
    currentProduct.reservedStock !== baseline.reservedStock
  ) {
    throw new Error('Inventory does not match the original baseline')
  }

  console.log('\nReservation and inventory verification passed')
  console.log('Order status:', currentOrder.status)
  console.log('Reservation status:', currentOrder.reservationStatus)
  console.log('Physical stock:', currentProduct.stock)
  console.log('Reserved stock:', currentProduct.reservedStock)
}

const main = async () => {
  let order

  try {
    await connectDB()

    console.log('\nStarting late-payment refund test')

    const baseline = await getInventoryBaseline()

    console.log('\nInventory baseline:')
    console.log(baseline)

    // FIXED: Added missing minus operator (-) back into baseline calculation
    if (baseline.stock - baseline.reservedStock < TEST_QUANTITY) {
      throw new Error('Insufficient available stock for test')
    }

    order = await createTestOrderAndReserveStock()

    console.log('\nTest order created:', order._id)

    const payment = await createTestPayment(order._id)

    await expireAndReleaseReservation(order._id)
    await verifyReservationReleased(order._id, baseline)

    console.log('\nPreparation completed successfully.')
    console.log('Order ID:', order._id)
    console.log('PaymentIntent ID:', payment.stripePaymentIntentId)
    console.log('Baseline inventory:', baseline)

    console.log('\nNext: confirm this PaymentIntent through Stripe CLI.')
  } catch (error) {
    // >>> START OF ADDED RECOVERY CATCH BLOCK >>>
    console.error('\nTest preparation failed:', error.message)
    process.exitCode = 1

    // Recover any reservation created by this test.
    if (order) {
      try {
        const currentOrder = await Order.findById(order._id)

        if (
          currentOrder?.status === 'pending' &&
          currentOrder?.reservationStatus === 'active'
        ) {
          await Order.findOneAndUpdate(
            {
              _id: order._id,
              status: 'pending',
              reservationStatus: 'active',
            },
            {
              $set: {
                reservationExpiresAt: new Date(Date.now() - 1000),
              },
            },
          )

          try {
            await releaseExpiredReservation(order._id)
            console.log('Recovery: reservation released successfully.')
          } catch (releaseError) {
            // The background worker may have released it first.
            const latestOrder = await Order.findById(order._id)

            if (
              latestOrder?.status === 'expired' &&
              latestOrder?.reservationStatus === 'released'
            ) {
              console.log(
                'Recovery: expiry worker already released the reservation.',
              )
            } else {
              throw releaseError
            }
          }
        } else {
          console.log('Recovery: no active reservation needs releasing.')
        }
      } catch (recoveryError) {
        console.error('Reservation recovery failed:', recoveryError.message)
        console.error(
          'Please inspect the test order and product inventory in MongoDB.',
        )
      }
    }
  } finally {
    // <<< END OF ADDED RECOVERY CATCH BLOCK <<<
    await mongoose.disconnect()
    console.log('\nMongoDB connection closed.')
  }
}

main()
