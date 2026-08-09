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

const {
  createProductSchema,
  updateProductSchema,
} = require('../validators/productValidator')

//const productSchema = require('../validators/productValidator')

/* router.get('/', (req, res) => {
   res.send('Products route is working!')
 })*/

//router.post('/', addProduct)

router.post('/', validate(createProductSchema), addProduct)

//router.put('/:id', updateExistingProduct)

router.patch('/:id', validate(updateProductSchema), updateExistingProduct)

router.delete('/:id', deleteExistingProduct)

module.exports = router
