const express = require('express')

const {
  createPaymentIntent,
  getPaymentForOrder,
} = require('../controllers/paymentController')

const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router()

router.post('/', authMiddleware, createPaymentIntent)

router.get('/order/:orderId', authMiddleware, getPaymentForOrder)

module.exports = router
