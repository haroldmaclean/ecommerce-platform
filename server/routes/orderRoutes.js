const express = require('express')

const {
  createNewOrder,
  getCustomerOrders,
  getSingleOrder,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController')

const authMiddleware = require('../middlewares/authMiddleware')

const validationMiddleware = require('../middlewares/validationMiddleware')
const { updateOrderStatusSchema } = require('../validators/orderValidator')

const authorize = require('../middlewares/authorizationMiddleware')

const router = express.Router()

router.post('/', authMiddleware, createNewOrder)

router.get('/', authMiddleware, getCustomerOrders)

router.get('/admin', authMiddleware, authorize('admin'), getAllOrders)

router.get('/:orderId', authMiddleware, getSingleOrder)

//router.patch('/:orderId/status', authMiddleware, updateOrderStatus)

router.patch(
  '/:orderId/status',
  authMiddleware,
  authorize('admin'),
  validationMiddleware(updateOrderStatusSchema),
  updateOrderStatus,
)

module.exports = router
