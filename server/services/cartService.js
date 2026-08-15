const Cart = require('../models/Cart')

const getCart = async (userId) => {
  return await Cart.findOne({ user: userId }).populate('items.product')
}

const createCart = async (userId) => {
  return await Cart.create({
    user: userId,
    items: [],
  })
}

const addItemToCart = async (userId, productId, quantity) => {
  let cart = await Cart.findOne({ user: userId })

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    })
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  )

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.items.push({
      product: productId,
      quantity,
    })
  }

  await cart.save()

  return await Cart.findById(cart._id).populate('items.product')
}

const updateCartItem = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId })

  if (!cart) {
    throw new Error('Cart not found')
  }

  const item = cart.items.find((item) => item.product.toString() === productId)

  if (!item) {
    throw new Error('Product not found in cart')
  }

  item.quantity = quantity

  await cart.save()

  return await Cart.findById(cart._id).populate('items.product')
}

const removeCartItem = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId })

  if (!cart) {
    throw new Error('Cart not found')
  }

  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId,
  )

  if (!itemExists) {
    throw new Error('Product not found in cart')
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  )

  await cart.save()

  return await Cart.findById(cart._id).populate('items.product')
}

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId })

  if (!cart) {
    throw new Error('Cart not found')
  }

  cart.items = []

  await cart.save()

  return cart
}

module.exports = {
  getCart,
  //createCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
}
