const {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../services/cartService')

const asyncHandler = require('../middlewares/asyncHandler')

const getMyCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user.userId)

  res.json(cart)
})

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body

  const cart = await addItemToCart(req.user.userId, productId, quantity)

  res.status(201).json(cart)
})

const updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { quantity } = req.body

  const cart = await updateCartItem(req.user.userId, productId, quantity)

  res.json(cart)
})

const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const cart = await removeCartItem(req.user.userId, productId)

  res.json(cart)
})

const clearMyCart = asyncHandler(async (req, res) => {
  const cart = await clearCart(req.user.userId)

  res.json(cart)
})

module.exports = {
  getMyCart,
  addToCart,
  updateItem,
  removeItem,
  clearMyCart,
}
