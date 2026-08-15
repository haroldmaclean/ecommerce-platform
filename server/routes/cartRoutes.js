const express = require('express')

const router = express.Router()

// 1. Controllers
const {
  getMyCart,
  addToCart,
  updateItem,
  removeItem,
  clearMyCart,
} = require('../controllers/cartController')

// 2. Middlewares
const authenticate = require('../middlewares/authMiddleware')
const validate = require('../middlewares/validationMiddleware')

// 3. Schemas (Import BOTH schemas here 👇)
const {
  addToCartSchema,
  updateCartItemSchema,
} = require('../validators/cartValidator')

// --- Routes ---

// Get User Cart
router.get('/', authenticate, getMyCart)

// Add Item to Cart (Body requires: { productId, quantity })
router.post('/items', authenticate, validate(addToCartSchema), addToCart)

// Update Item Quantity (Body requires: { quantity })
router.patch(
  '/items/:productId',
  authenticate,
  validate(updateCartItemSchema), // 👈 FIXED: Uses updateCartItemSchema now!
  updateItem,
)

router.delete('/items/:productId', authenticate, removeItem)

router.delete('/', authenticate, clearMyCart)

module.exports = router
