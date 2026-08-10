const {
  createUser,
  loginUser,
  updateUserRole,
} = require('../services/userService')
const asyncHandler = require('../middlewares/asyncHandler')

const registerUser = asyncHandler(async (req, res) => {
  const user = await createUser(req.body)

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const result = await loginUser(email, password)

  res.json({
    success: true,
    ...result,
  })
})

// 👇 Step 10: Added profile controller for protected route testing
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  })
})

const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { role } = req.body

  const user = await updateUserRole(id, role)

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
})

module.exports = {
  registerUser,
  login,
  getProfile,
  changeUserRole, // 👈 Don't forget to export it here!
}
