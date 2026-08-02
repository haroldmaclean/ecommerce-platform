const express = require('express')

const router = express.Router()

const { getProducts, addProduct } = require('../controllers/productController')

router.get('/', getProducts)
/* router.get('/', (req, res) => {
   res.send('Products route is working!')
 })*/
router.post('/', addProduct)

module.exports = router
