const Order = require('../models/Order')
const { releaseExpiredReservation } = require('../services/orderService')

const BATCH_SIZE = 50
const CHECK_INTERVAL = 30 * 1000 // 30 seconds

let isRunning = false

const processExpiredReservations = async () => {
  // Prevent overlapping runs in this server process.
  if (isRunning) return

  isRunning = true

  try {
    const expiredOrders = await Order.find({
      status: 'pending',
      reservationStatus: 'active',
      reservationExpiresAt: { $lte: new Date() },
    })
      .select('_id')
      .limit(BATCH_SIZE)
      .lean()

    for (const order of expiredOrders) {
      try {
        await releaseExpiredReservation(order._id)
        console.log(`Reservation expired and released: ${order._id}`)
      } catch (error) {
        // Another process or worker may already have handled this order.
        if (error.statusCode !== 409) {
          console.error(
            `Failed to release reservation ${order._id}:`,
            error.message,
          )
        }
      }
    }
  } catch (error) {
    console.error('Reservation expiry worker failed:', error.message)
  } finally {
    isRunning = false
  }
}

const startReservationExpiryWorker = () => {
  console.log('Reservation expiry worker started')

  // Check immediately, then every 30 seconds.
  processExpiredReservations()

  const interval = setInterval(processExpiredReservations, CHECK_INTERVAL)

  // The timer should not prevent Node from shutting down.
  interval.unref()

  return interval
}

module.exports = { startReservationExpiryWorker }
