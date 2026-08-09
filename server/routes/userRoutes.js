const express = require('express')

// 1. Import all controllers (including getProfile)
const {
  registerUser,
  login,
  getProfile,
} = require('../controllers/userController')

// 2. Import Validation Middleware & Schemas
const validate = require('../middlewares/validationMiddleware')
const {
  registerUserSchema,
  loginUserSchema,
} = require('../validators/userValidator')

// 3. Import Auth Middleware
const authenticate = require('../middlewares/authMiddleware')

const router = express.Router()

// Protected Route (Requires valid Bearer Token in Authorization Header)
router.get('/profile', authenticate, getProfile)

// Public Routes
router.post('/register', validate(registerUserSchema), registerUser)
router.post('/login', validate(loginUserSchema), login)

module.exports = router

/*const express = require('express')

const { registerUser, login } = require('../controllers/userController')

const validate = require('../middlewares/validationMiddleware')

const {
  registerUserSchema,
  loginUserSchema,
} = require('../validators/userValidator')

const router = express.Router()

router.post('/register', validate(registerUserSchema), registerUser)

router.post('/login', validate(loginUserSchema), login)

module.exports = router
*/

/*const express = require('express')

const router = express.Router()

const { registerUser, login } = require('../controllers/userController')

const validate = require('../middlewares/validationMiddleware')

const {
  registerUserSchema,
  loginUserSchema,
} = require('../validators/userValidator')

const authenticate = require('../middlewares/authMiddleware')

router.get('/profile', authenticate, getProfile)

router.post('/register', validate(registerUserSchema), registerUser)

router.post('/login', validate(loginUserSchema), login)

module.exports = router
*/
