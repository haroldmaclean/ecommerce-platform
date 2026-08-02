const Product = require('../models/Product')

const getAllProducts = async () => {
  const products = await Product.find()

  return products
  // return 'Products route is working!'
}

const createProduct = async (productData) => {
  const product = await Product.create(productData)

  return product
}
const updateProduct = async (id, updates) => {
  const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
    new: true,
  })

  return updatedProduct
}

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
}
