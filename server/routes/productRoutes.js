const express = require('express')

const router = express.Router()

const {
  getProducts,

  addProduct,
  updateExistingProduct,
  deleteExistingProduct,
} = require('../controllers/productController')

router.get('/', getProducts)

/* router.get('/', (req, res) => {
   res.send('Products route is working!')
 })*/
router.post('/', addProduct)

router.put('/:id', updateExistingProduct)

router.delete('/:id', deleteExistingProduct)

module.exports = router
