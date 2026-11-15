const express = require('express')

const router = express.Router()

const {
  getProducts,
  getProduct,
  addProduct,
  uploadProductImage,
  updateExistingProduct,
  deleteExistingProduct,
} = require('../controllers/productController')

const upload = require('../middlewares/uploadMiddleware')

router.get('/', getProducts)
router.get('/:id', getProduct) // Retrieve one product

const validate = require('../middlewares/validationMiddleware')

const authenticate = require('../middlewares/authMiddleware')

const authorize = require('../middlewares/authorizationMiddleware')

const {
  createProductSchema,
  updateProductSchema,
} = require('../validators/productValidator')

router.post(
  '/upload-image',
  authenticate,
  authorize('admin'),
  upload.single('image'),
  uploadProductImage,
)

router.post('/', validate(createProductSchema), addProduct)

//router.put('/:id', updateExistingProduct)

router.patch('/:id', validate(updateProductSchema), updateExistingProduct)

router.delete('/:id', authenticate, authorize('admin'), deleteExistingProduct)

module.exports = router
