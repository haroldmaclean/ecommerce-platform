const { getAllProducts, createProduct } = require('../services/productService')

const getProducts = async (req, res) => {
  const products = await getAllProducts()
  res.send(products)
}

const addProduct = async (req, res) => {
  const product = await createProduct(req.body)

  res.status(201).json(product)
}

module.exports = { getProducts, addProduct }
