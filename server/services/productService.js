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

module.exports = {
  getAllProducts,
  createProduct,
}
