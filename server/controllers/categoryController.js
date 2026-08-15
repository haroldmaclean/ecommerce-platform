const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../services/categoryService')

const asyncHandler = require('../middlewares/asyncHandler')

const getCategories = asyncHandler(async (req, res) => {
  const categories = await getAllCategories()

  res.json(categories)
})

const addCategory = asyncHandler(async (req, res) => {
  const category = await createCategory(req.body)

  res.status(201).json(category)
})

const updateExistingCategory = asyncHandler(async (req, res) => {
  const { id } = req.params

  const updatedCategory = await updateCategory(id, req.body)

  res.json(updatedCategory)
})

const deleteExistingCategory = asyncHandler(async (req, res) => {
  const { id } = req.params

  const deletedCategory = await deleteCategory(id)

  res.json(deletedCategory)
})

module.exports = {
  getCategories,
  addCategory,
  updateExistingCategory,
  deleteExistingCategory,
}
