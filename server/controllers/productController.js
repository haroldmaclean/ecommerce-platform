const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../services/productService')

const asyncHandler = require('../middlewares/asyncHandler')

const getProducts = asyncHandler(async (req, res) => {
  const products = await getAllProducts()
  res.send(products)
})

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  const product = await getProductById(id)

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  res.json(product)
})

const addProduct = asyncHandler(async (req, res) => {
  //console.log('CONTROLLER WAS REACHED', req.body)

  const product = await createProduct(req.body)
  res.status(201).json(product)
})

const updateExistingProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  const updatedProduct = await updateProduct(id, req.body)

  res.json(updatedProduct)
})

const deleteExistingProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  const deletedProduct = await deleteProduct(id)

  res.json(deletedProduct)
})

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  updateExistingProduct,
  deleteExistingProduct,
}
