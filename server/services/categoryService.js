const Category = require('../models/Category')

const getAllCategories = async () => {
  return await Category.find()
}

const createCategory = async (categoryData) => {
  return await Category.create(categoryData)
}

const updateCategory = async (id, categoryData) => {
  return await Category.findByIdAndUpdate(id, categoryData, {
    new: true,
    runValidators: true,
  })
}

const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id)
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}
