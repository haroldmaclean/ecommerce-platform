const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Product = require('../models/Product')

const AppError = require('../utils/AppError')

const mongoose = require('mongoose')

const createOrder = async (userId) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    // 1. Load the user's cart inside the transaction.
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .session(session)

    if (!cart) {
      throw new AppError('Cart not found', 404)
    }

    if (cart.items.length === 0) {
      throw new AppError('Cannot create order from an empty cart', 400)
    }

    // 2. Prepare an order snapshot from the cart.
    const orderItems = []

    for (const item of cart.items) {
      const product = item.product

      if (!product) {
        throw new AppError('Product not found', 404)
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      })
    }

    // 3. Calculate the order total.
    const totalAmount = orderItems.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    // 4. Set the reservation deadline to 15 minutes from now.
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // 5. Create the pending order within the transaction.
    const [order] = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          totalAmount,
          status: 'pending',
          reservationStatus: 'active',
          reservationExpiresAt,
        },
      ],
      { session },
    )

    // 6. Atomically reserve available stock for every item.
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          $expr: {
            $gte: [
              {
                $subtract: ['$stock', { $ifNull: ['$reservedStock', 0] }],
              },
              item.quantity,
            ],
          },
        },
        {
          $inc: {
            reservedStock: item.quantity,
          },
        },
        {
          new: true,
          session,
        },
      )

      if (!updatedProduct) {
        throw new AppError(`Not enough available stock for ${item.name}`, 400)
      }
    }

    // 7. Commit the order and reservations together.
    // Do not decrement stock or clear the cart yet.
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

const releaseExpiredReservation = async (orderId) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    // 1. Atomically claim an expired, active reservation.
    // Only one transaction should be able to change this state.
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        reservationStatus: 'active',
        status: 'pending',
        reservationExpiresAt: { $lte: new Date() },
      },
      {
        $set: {
          reservationStatus: 'released',
          status: 'expired',
        },
      },
      {
        new: true,
        session,
      },
    )

    if (!order) {
      throw new AppError(
        'No active expired reservation found for this order',
        409,
      )
    }

    // 2. Release the reserved quantity for every item.
    for (const item of order.items) {
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

    // 3. Commit the state change and inventory changes together.
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

/*const releaseExpiredReservation = async (orderId) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    // 1. Find an order whose reservation has expired.
    const order = await Order.findOne({
      _id: orderId,
      reservationStatus: 'active',
      reservationExpiresAt: { $lte: new Date() },
    }).session(session)

    // 2. If no matching order exists, nothing can be released.
    if (!order) {
      throw new AppError(
        'No active expired reservation found for this order',
        409,
      )
    }

    // 3. Release each product quantity held by this order.
    for (const item of order.items) {
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

      // Abort everything if the inventory data is inconsistent.
      if (!updatedProduct) {
        throw new AppError(
          `Could not release reserved stock for ${item.name}`,
          409,
        )
      }
    }

    // 4. Record that this reservation has been released.
    order.reservationStatus = 'released'
    order.status = 'expired'

    await order.save({ session })

    // 5. Commit inventory changes and order changes together.
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
}*/

const getMyOrders = async (userId) => {
  return await Order.find({ user: userId }).sort({ createdAt: -1 })
}

const getOrderById = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  })

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  // if (!order) {
  //   throw new Error('Order not found')
  // }

  return order
}

const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId)

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  order.status = status

  await order.save()

  return order
}

const getAllOrders = async () => {
  return await Order.find().sort({ createdAt: -1 })
}

module.exports = {
  createOrder,
  releaseExpiredReservation,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
}
