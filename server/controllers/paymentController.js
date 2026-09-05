const { createPayment } = require('../services/paymentService')
const asyncHandler = require('../middlewares/asyncHandler')

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body

  const result = await createPayment(orderId, req.user.userId)

  res.status(201).json(result)
})

module.exports = {
  createPaymentIntent,
}
