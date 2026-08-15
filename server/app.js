const express = require('express')
const productRoutes = require('./routes/productRoutes')

const userRoutes = require('./routes/userRoutes')

const categoryRoutes = require('./routes/categoryRoutes')

const cartRoutes = require('./routes/cartRoutes')

const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(express.json())

app.use('/api/products', productRoutes)

app.use('/api/categories', categoryRoutes)

app.use('/api/cart', cartRoutes)

app.use('/api/users', userRoutes)

app.use(errorHandler)

module.exports = app
