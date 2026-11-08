const {
  createPayment,
  getPaymentByOrderId,
} = require('../services/paymentService')

const asyncHandler = require('../middlewares/asyncHandler')

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body

  const result = await createPayment(orderId, req.user.userId)

  res.status(201).json(result)
})

const getPaymentForOrder = asyncHandler(async (req, res) => {
  const result = await getPaymentByOrderId(req.params.orderId, req.user.userId)

  res.status(200).json(result)
})

module.exports = {
  createPaymentIntent,
  getPaymentForOrder,
}
