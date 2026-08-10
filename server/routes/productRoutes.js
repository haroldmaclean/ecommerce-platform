const express = require('express')

const router = express.Router()

const {
  getProducts,

  addProduct,
  updateExistingProduct,
  deleteExistingProduct,
} = require('../controllers/productController')

router.get('/', getProducts)

const validate = require('../middlewares/validationMiddleware')

const authenticate = require('../middlewares/authMiddleware')

const authorize = require('../middlewares/authorizationMiddleware')

const {
  createProductSchema,
  updateProductSchema,
} = require('../validators/productValidator')

router.post('/', validate(createProductSchema), addProduct)

//router.put('/:id', updateExistingProduct)

router.patch('/:id', validate(updateProductSchema), updateExistingProduct)

router.delete('/:id', authenticate, authorize('admin'), deleteExistingProduct)

module.exports = router
