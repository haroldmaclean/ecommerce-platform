const express = require('express')

const router = express.Router()

const {
  getCategories,
  addCategory,
  updateExistingCategory,
  deleteExistingCategory,
} = require('../controllers/categoryController')

const authenticate = require('../middlewares/authMiddleware')
const authorize = require('../middlewares/authorizationMiddleware')

const validate = require('../middlewares/validationMiddleware')
const categorySchema = require('../validators/categoryValidator')

router.get('/', getCategories)

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(categorySchema),
  addCategory,
)

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(categorySchema),
  updateExistingCategory,
)

router.delete('/:id', authenticate, authorize('admin'), deleteExistingCategory)

module.exports = router
