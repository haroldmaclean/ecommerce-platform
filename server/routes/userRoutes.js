const express = require('express')

// 1. Import all controllers (including getProfile)
const {
  registerUser,
  login,
  getProfile,
  changeUserRole,
} = require('../controllers/userController')

// 2. Import Validation Middleware & Schemas
const validate = require('../middlewares/validationMiddleware')
const {
  registerUserSchema,
  loginUserSchema,
  updateUserRoleSchema,
} = require('../validators/userValidator')

// 3. Import Auth & Authorization Middlewares
const authenticate = require('../middlewares/authMiddleware')
const authorize = require('../middlewares/authorizationMiddleware')

const router = express.Router()

// Protected Route (Requires valid Bearer Token in Authorization Header)
router.get('/profile', authenticate, getProfile)

// Admin Protected Route: Change User Role
router.patch(
  '/:id/role',
  authenticate,
  authorize('admin'),
  validate(updateUserRoleSchema),
  changeUserRole,
)

// Public Routes
router.post('/register', validate(registerUserSchema), registerUser)

router.post('/login', validate(loginUserSchema), login)

//router.patch('/:id/role', authenticate, authorize('admin'), changeUserRole)

module.exports = router
