const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Product = require('../models/Product')

const AppError = require('../utils/AppError')

const mongoose = require('mongoose')

const createOrder = async (userId) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    // 1. Find the user's cart (session attached)
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .session(session)

    // 2. Make sure the cart exists
    if (!cart) {
      throw new AppError('Cart not found', 404)
    }

    // 3. Make sure the cart isn't empty
    if (cart.items.length === 0) {
      throw new AppError('Cannot create order from an empty cart', 400)
    }

    // 4. Check stock and create order items
    const orderItems = []

    for (const item of cart.items) {
      const product = item.product

      if (!product) {
        throw new AppError('Product not found', 404)
      }

      /*if (product.stock < item.quantity) {
        throw new AppError(`Not enough stock for ${product.name}`, 400)
      }*/

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      })
    }

    // 5. Calculate total
    const totalAmount = orderItems.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    // 6. Create the order (array syntax + session attached)
    const [order] = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          totalAmount,
        },
      ],
      { session },
    )

    // 7. Reduce product stock (session attached)
    // 7. Atomic Conditional Stock Update (Check + Decrement in one operation)
    for (const item of cart.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product._id,
          stock: { $gte: item.quantity }, // Matches ONLY if current stock >= requested quantity
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        {
          new: true,
          session,
        },
      )

      // If no product matched, stock was insufficient -> trigger immediate rollback
      if (!updatedProduct) {
        throw new AppError(
          `Not enough stock available for ${item.product.name}`,
          400,
        )
      }
    }
    /*for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        { session },
      )
    }*/

    // 8. Clear the cart (session attached)
    cart.items = []
    await cart.save({ session })

    // Commit all changes atomically
    await session.commitTransaction()

    return order
  } catch (error) {
    // Roll back all database changes on failure
    await session.abortTransaction()
    throw error
  } finally {
    // Always release the session context
    await session.endSession()
  }
}

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
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
}
