const express = require('express')

const { createPaymentIntent } = require('../controllers/paymentController')

const {
  handleStripeWebhook,
} = require('../controllers/paymentWebhookController')

const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router()

//router.post('/webhook', handleStripeWebhook)

router.post('/', authMiddleware, createPaymentIntent)

module.exports = router
