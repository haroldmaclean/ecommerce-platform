const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../services/productService')

const getProducts = async (req, res) => {
  const products = await getAllProducts()
  res.send(products)
}

const addProduct = async (req, res) => {
  const product = await createProduct(req.body)

  res.status(201).json(product)
}

const updateExistingProduct = async (req, res) => {
  const { id } = req.params
  const updatedProduct = await updateProduct(id, req.body)
  res.json(updatedProduct)
}

const deleteExistingProduct = async (req, res) => {
  const { id } = req.params
  const deletedProduct = await deleteProduct(id)
  res.json(deletedProduct)
}

module.exports = {
  getProducts,
  addProduct,
  updateExistingProduct,
  deleteExistingProduct,
}
