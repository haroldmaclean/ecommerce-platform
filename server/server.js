require('dotenv').config()

const connectDB = require('./config/db')
const app = require('./app')
const {
  startReservationExpiryWorker,
} = require('./workers/reservationExpiryWorker')

const PORT = 5000

const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      startReservationExpiryWorker()
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
