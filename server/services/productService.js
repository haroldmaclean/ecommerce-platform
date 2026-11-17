const Product = require('../models/Product')
const AppError = require('../utils/AppError')

const getAllProducts = async () => {
  const products = await Product.find().populate('category')
  //const products = await Product.find()

  return products
  // return 'Products route is working!'
}

const getProductById = async (id) => {
  const product = await Product.findById(id).populate('category')

  return product
}

const createProduct = async (productData) => {
  const product = await Product.create(productData)

  return product
}
const updateProduct = async (id, updates) => {
  const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })

  if (!updatedProduct) {
    throw new AppError('Product not found', 404)
  }

  return updatedProduct
}

const deleteProduct = async (id) => {
  const deletedProduct = await Product.findByIdAndDelete(id)

  if (!deletedProduct) {
    throw new AppError('Product not found', 404)
  }

  return deletedProduct
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}
