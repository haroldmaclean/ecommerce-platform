const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../services/productService')

const asyncHandler = require('../middlewares/asyncHandler')

const getProducts = asyncHandler(async (req, res) => {
  const products = await getAllProducts()
  res.send(products)
})

/*const getProducts = async (req, res, next) => {
  try {
    const products = await getAllProducts()
    res.send(products)
  } catch (error) {
    next(error)
  }
}*/

const addProduct = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body)
  res.status(201).json(product)
})

/*const addProduct = async (req, res, next) => {
  try {
    const product = await createProduct(req.body)
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
}*/

const updateExistingProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  const updatedProduct = await updateProduct(id, req.body)

  res.json(updatedProduct)
})

/*const updateExistingProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const updatedProduct = await updateProduct(id, req.body)
    res.json(updatedProduct)
  } catch (error) {
    next(error)
  }
}*/

const deleteExistingProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  const deletedProduct = await deleteProduct(id)

  res.json(deletedProduct)
})

/*const deleteExistingProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const deletedProduct = await deleteProduct(id)
    res.json(deletedProduct)
  } catch (error) {
    next(error)
  }
}*/

module.exports = {
  getProducts,
  addProduct,
  updateExistingProduct,
  deleteExistingProduct,
}

/*const {
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
*/
