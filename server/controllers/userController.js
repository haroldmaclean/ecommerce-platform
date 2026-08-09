const { createUser, loginUser } = require('../services/userService')
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

module.exports = {
  registerUser,
  login,
  getProfile, // 👈 Don't forget to export it here!
}

/*const { createUser, loginUser } = require('../services/userService')

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

module.exports = {
  registerUser,
  login,
}
  */

/*// ✅ FIXED: Both functions are now imported
const { createUser, loginUser } = require('../services/userService')

const asyncHandler = require('../middlewares/asyncHandler')

const registerUser = asyncHandler(async (req, res) => {
  const user = await createUser(req.body)

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }

  res.status(201).json({
    success: true,
    user: userResponse,
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

const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  })
})

module.exports = {
  registerUser,
  login,
  getProfile,
}
*/
