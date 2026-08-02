const express = require('express')

const router = express.Router()

const {
  getProducts,
  addProduct,
  updateExistingProduct,
} = require('../controllers/productController')

router.get('/', getProducts)
/* router.get('/', (req, res) => {
   res.send('Products route is working!')
 })*/
router.post('/', addProduct)

router.put('/:id', updateExistingProduct)

module.exports = router
