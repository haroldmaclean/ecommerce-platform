require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
})

const mongoose = require('mongoose')
const connectDB = require('../config/db')

const Product = require('../models/Product')
const Order = require('../models/Order')

const {
  startReservationExpiryWorker,
} = require('../workers/reservationExpiryWorker')

const PRODUCT_ID = '6a7ccf7df94d8b6c90957423'
const USER_ID = '6a81c287f256743e8729996f'
const TEST_QUANTITY = 2

const runTest = async () => {
  let testOrder
  let workerInterval
  let initialStock
  let initialReservedStock

  try {
    await connectDB()

    const product = await Product.findById(PRODUCT_ID)

    if (!product) {
      throw new Error('Test product not found')
    }

    initialStock = product.stock
    initialReservedStock = product.reservedStock

    if (initialReservedStock !== 0) {
      throw new Error(`Expected reservedStock 0, found ${initialReservedStock}`)
    }

    if (initialStock < TEST_QUANTITY) {
      throw new Error('Insufficient physical stock for test')
    }

    // Step 1: Reserve inventory and create the test order atomically.
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: PRODUCT_ID,
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
          $inc: { reservedStock: TEST_QUANTITY },
        },
        {
          session,
          returnDocument: 'after',
        },
      )

      if (!updatedProduct) {
        throw new Error('Could not reserve test inventory')
      }

      const [order] = await Order.create(
        [
          {
            user: USER_ID,
            items: [
              {
                product: PRODUCT_ID,
                name: product.name,
                price: product.price,
                quantity: TEST_QUANTITY,
              },
            ],
            totalAmount: product.price * TEST_QUANTITY,
            status: 'pending',
            reservationStatus: 'active',
            reservationExpiresAt: new Date(Date.now() - 60 * 1000),
          },
        ],
        { session },
      )

      testOrder = order

      await session.commitTransaction()

      console.log('\nTest order created:', testOrder._id)
      console.log('Reserved stock before worker:', updatedProduct.reservedStock)
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction()
      }

      throw error
    } finally {
      await session.endSession()
    }

    // Step 2: Start the actual worker and retain its interval handle.
    workerInterval = startReservationExpiryWorker()

    // Step 3: Wait for the worker to release this specific reservation.
    const timeoutAt = Date.now() + 10000
    let updatedOrder
    let updatedProduct

    while (Date.now() < timeoutAt) {
      ;[updatedOrder, updatedProduct] = await Promise.all([
        Order.findById(testOrder._id),
        Product.findById(PRODUCT_ID),
      ])

      if (
        updatedOrder?.status === 'expired' &&
        updatedOrder?.reservationStatus === 'released'
      ) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 250))
    }

    console.log('\n--- TEST RESULTS ---')
    console.log('Order status:', updatedOrder?.status)
    console.log('Reservation status:', updatedOrder?.reservationStatus)
    console.log('Physical stock:', updatedProduct?.stock)
    console.log('Reserved stock:', updatedProduct?.reservedStock)

    // Step 4: Assert the expected result.
    if (
      !updatedOrder ||
      !updatedProduct ||
      updatedOrder.status !== 'expired' ||
      updatedOrder.reservationStatus !== 'released' ||
      updatedProduct.stock !== initialStock ||
      updatedProduct.reservedStock !== initialReservedStock
    ) {
      throw new Error(
        'Reservation expiry test failed: expected values were not reached.',
      )
    }

    console.log('\nSUCCESS: Reservation expiry test passed!')
  } catch (error) {
    console.error('\nTEST ERROR:', error.message)
    process.exitCode = 1
  } finally {
    // Stop future worker cycles.
    if (workerInterval) {
      clearInterval(workerInterval)
    }

    // Recover an active reservation if the test did not complete.
    if (testOrder) {
      try {
        const currentOrder = await Order.findById(testOrder._id)

        if (
          currentOrder?.status === 'pending' &&
          currentOrder?.reservationStatus === 'active'
        ) {
          const {
            releaseExpiredReservation,
          } = require('../services/orderService')

          await Order.updateOne(
            { _id: testOrder._id },
            { $set: { reservationExpiresAt: new Date(Date.now() - 1000) } },
          )

          await releaseExpiredReservation(testOrder._id)

          console.log('\nRecovery: test reservation released.')
        }
      } catch (cleanupError) {
        console.error('\nCLEANUP ERROR:', cleanupError.message)
        process.exitCode = 1
      }
    }

    if (initialStock !== undefined) {
      const finalProduct = await Product.findById(PRODUCT_ID)

      console.log('\n--- INVENTORY VERIFICATION ---')
      console.log('Physical stock:', finalProduct?.stock)
      console.log('Reserved stock:', finalProduct?.reservedStock)
      console.log(
        'Original inventory restored:',
        finalProduct?.stock === initialStock &&
          finalProduct?.reservedStock === initialReservedStock,
      )

      if (
        !finalProduct ||
        finalProduct.stock !== initialStock ||
        finalProduct.reservedStock !== initialReservedStock
      ) {
        process.exitCode = 1
      }
    }

    await mongoose.disconnect()
  }
}

runTest()
