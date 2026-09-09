const express = require('express')

const cors = require('cors') // 👈 1. ADDED: Require cors package

const productRoutes = require('./routes/productRoutes')

const userRoutes = require('./routes/userRoutes')

const categoryRoutes = require('./routes/categoryRoutes')

const cartRoutes = require('./routes/cartRoutes')

const orderRoutes = require('./routes/orderRoutes')

const paymentRoutes = require('./routes/paymentRoutes')

const paymentWebhookController = require('./controllers/paymentWebhookController')

const errorHandler = require('./middlewares/errorHandler')

const app = express()

// 👈 2. ADDED: Enable CORS for localhost and future deployments
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      // Add your Vercel frontend URL here later once deployed
    ],
    credentials: true,
  }),
)

// API status / health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API is running',
  })
})

// Stripe webhook MUST receive raw body
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentWebhookController.handleStripeWebhook,
)

app.use(express.json())

app.use('/api/products', productRoutes)

app.use('/api/categories', categoryRoutes)

app.use('/api/cart', cartRoutes)

app.use('/api/users', userRoutes)

app.use('/api/orders', orderRoutes)

app.use('/api/payments', paymentRoutes)

app.use(errorHandler)

module.exports = app
