const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus: updateOrderStatusService,
  getAllOrders: getAllOrdersService,
} = require('../services/orderService')

const asyncHandler = require('../middlewares/asyncHandler')

const createNewOrder = asyncHandler(async (req, res) => {
  const order = await createOrder(req.user.userId)

  res.status(201).json(order)
})

const getCustomerOrders = asyncHandler(async (req, res) => {
  /* 🧪 TEMPORARY TEST: Injecting an unhandled technical error
  throw new Error('Unexpected test error')*/
  const orders = await getMyOrders(req.user.userId)

  res.json(orders)
})

const getSingleOrder = asyncHandler(async (req, res) => {
  console.log('AUTHENTICATED USER:', req.user)
  console.log('REQUESTED ORDER:', req.params.orderId)
  const { orderId } = req.params

  const order = await getOrderById(orderId, req.user.userId)

  res.json(order)
})

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await updateOrderStatusService(
    req.params.orderId,
    req.body.status,
  )

  res.json(order)
})

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await getAllOrdersService()

  res.json(orders)
})

module.exports = {
  createNewOrder,
  getCustomerOrders,
  getSingleOrder,
  updateOrderStatus,
  getAllOrders,
}
