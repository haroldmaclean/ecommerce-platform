const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env'),
})

const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Product = require('../models/Product')

const migrateReservedStock = async () => {
  try {
    // Step 1: Connect to MongoDB.
    await connectDB()

    // Step 2: Initialize only products missing reservedStock.
    const result = await Product.updateMany(
      { reservedStock: { $exists: false } },
      { $set: { reservedStock: 0 } },
    )

    // Step 3: Report what changed.
    console.log('Reserved stock migration completed.')
    console.log(`Matched products: ${result.matchedCount}`)
    console.log(`Modified products: ${result.modifiedCount}`)

    // Step 4: Verify no products are missing the field.
    const remaining = await Product.countDocuments({
      reservedStock: { $exists: false },
    })

    console.log(`Products still missing reservedStock: ${remaining}`)
  } catch (error) {
    console.error('Reserved stock migration failed:', error.message)
    process.exitCode = 1
  } finally {
    // Close the database connection when finished.
    await mongoose.disconnect()
    console.log('MongoDB connection closed.')
  }
}

migrateReservedStock()
