require('dotenv').config()

const connectDB = require('./config/db')

const app = require('./app')

const PORT = 5000

connectDB()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
