require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
})

const mongoose = require('mongoose')
const connectDB = require('../config/db')

const Product = require('../models/Product')
const Order = require('../models/Order')
const Payment = require('../models/Payment')

const { handlePaymentSuccess } = require('../services/paymentService')

const PRODUCT_ID = '6a7ccf7df94d8b6c90957423'
const USER_ID = '6a81c287f256743e8729996f'
const QUANTITY = 2

const runTest = async () => {
  let testOrder
  let reservationAdded = false
  let initialStock
  let initialReservedStock

  try {
    await connectDB()

    const product = await Product.findById(PRODUCT_ID)

    if (!product) throw new Error('Test product not found')

    initialStock = product.stock
    initialReservedStock = product.reservedStock

    if (initialReservedStock !== 0) {
      throw new Error('Expected reservedStock to be 0')
    }

    if (initialStock < QUANTITY) {
      throw new Error('Insufficient stock for test')
    }

    // Step 1: Reserve two units.
    const reservedProduct = await Product.findOneAndUpdate(
      {
        _id: PRODUCT_ID,
        $expr: {
          $gte: [{ $subtract: ['$stock', '$reservedStock'] }, QUANTITY],
        },
      },
      {
        $inc: { reservedStock: QUANTITY },
      },
      { returnDocument: 'after' },
    )

    if (!reservedProduct) {
      throw new Error('Could not reserve test inventory')
    }

    reservationAdded = true

    // Step 2: Create a valid pending order.
    testOrder = await Order.create({
      user: USER_ID,
      items: [
        {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: QUANTITY,
        },
      ],
      totalAmount: product.price * QUANTITY,
      status: 'pending',
      reservationStatus: 'active',
      reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    })

    // Step 3: Create a local test payment record.
    const testPaymentIntentId = `pi_local_test_${Date.now()}`

    const payment = await Payment.create({
      order: testOrder._id,
      user: USER_ID,
      amount: testOrder.totalAmount,
      currency: 'zar',
      status: 'pending',
      refundStatus: 'not_required',
      stripePaymentIntentId: testPaymentIntentId,
    })

    const paymentIntent = {
      id: testPaymentIntentId,
      amount: Math.round(payment.amount * 100),
      amount_received: Math.round(payment.amount * 100),
      currency: 'zar',
      metadata: {
        orderId: testOrder._id.toString(),
        userId: USER_ID,
      },
    }

    console.log('\nTEST ORDER:', testOrder._id)
    console.log('Reserved stock before payment:', reservedProduct.reservedStock)

    // Step 4: Process successful payment.
    console.log('\n--- FIRST PAYMENT NOTIFICATION ---')

    await handlePaymentSuccess(paymentIntent)

    let updatedProduct = await Product.findById(PRODUCT_ID)
    let updatedOrder = await Order.findById(testOrder._id)
    let updatedPayment = await Payment.findById(payment._id)

    console.log('Physical stock:', updatedProduct.stock)
    console.log('Reserved stock:', updatedProduct.reservedStock)
    console.log('Order status:', updatedOrder.status)
    console.log('Reservation status:', updatedOrder.reservationStatus)
    console.log('Payment status:', updatedPayment.status)

    if (
      updatedProduct.stock !== initialStock - QUANTITY ||
      updatedProduct.reservedStock !== 0 ||
      updatedOrder.status !== 'confirmed' ||
      updatedOrder.reservationStatus !== 'finalized' ||
      updatedPayment.status !== 'succeeded'
    ) {
      throw new Error('First payment finalization check failed')
    }

    console.log('\nFIRST PAYMENT: PASSED')

    // Step 5: Send the same successful notification again.
    console.log('\n--- DUPLICATE PAYMENT NOTIFICATION ---')

    await handlePaymentSuccess(paymentIntent)

    updatedProduct = await Product.findById(PRODUCT_ID)
    updatedOrder = await Order.findById(testOrder._id)
    updatedPayment = await Payment.findById(payment._id)

    console.log('Physical stock:', updatedProduct.stock)
    console.log('Reserved stock:', updatedProduct.reservedStock)
    console.log('Order status:', updatedOrder.status)
    console.log('Reservation status:', updatedOrder.reservationStatus)
    console.log('Payment status:', updatedPayment.status)

    if (
      updatedProduct.stock !== initialStock - QUANTITY ||
      updatedProduct.reservedStock !== 0 ||
      updatedOrder.status !== 'confirmed' ||
      updatedOrder.reservationStatus !== 'finalized' ||
      updatedPayment.status !== 'succeeded'
    ) {
      throw new Error('Duplicate payment protection check failed')
    }

    console.log('\nDUPLICATE NOTIFICATION: PASSED')
    console.log('\nALL PAYMENT FINALIZATION CHECKS PASSED!')
  } catch (error) {
    console.error('\nTEST ERROR:', error.message)
    // FIXED: Added process.exitCode = 1 to ensure test failures propagate an exit code
    process.exitCode = 1
  } finally {
    // Clean up only our test data and reverse our inventory changes.
    try {
      if (testOrder) {
        const order = await Order.findById(testOrder._id)

        if (order?.reservationStatus === 'finalized') {
          await Product.updateOne(
            { _id: PRODUCT_ID },
            { $inc: { stock: QUANTITY } },
          )
        } else if (order?.reservationStatus === 'active') {
          await Product.updateOne(
            {
              _id: PRODUCT_ID,
              reservedStock: { $gte: QUANTITY },
            },
            { $inc: { reservedStock: -QUANTITY } },
          )
        }

        await Payment.deleteOne({ order: testOrder._id })
        await Order.deleteOne({ _id: testOrder._id })
      } else if (reservationAdded) {
        await Product.updateOne(
          {
            _id: PRODUCT_ID,
            reservedStock: { $gte: QUANTITY },
          },
          { $inc: { reservedStock: -QUANTITY } },
        )
      }

      if (initialStock !== undefined) {
        const finalProduct = await Product.findById(PRODUCT_ID)

        console.log('\n--- CLEANUP VERIFICATION ---')
        console.log('Physical stock:', finalProduct.stock)
        console.log('Reserved stock:', finalProduct.reservedStock)
        console.log(
          'Original inventory restored:',
          finalProduct.stock === initialStock &&
            finalProduct.reservedStock === initialReservedStock,
        )
      }
    } catch (cleanupError) {
      console.error('CLEANUP ERROR:', cleanupError.message)
    }

    await mongoose.disconnect()
  }
}

runTest()
