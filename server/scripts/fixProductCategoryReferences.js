require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
})

const mongoose = require('mongoose')
const connectDB = require('../config/db')

const Category = require('../models/Category')
const Product = require('../models/Product')

const main = async () => {
  try {
    await connectDB()

    const products = await Product.collection
      .find({ category: { $type: 'string' } })
      .toArray()

    let updated = 0
    let skipped = 0

    for (const product of products) {
      const category = await Category.findOne({
        name: product.category.trim(),
      })

      if (!category) {
        console.log(`No matching category: ${product.category}`)
        skipped++
        continue
      }

      const result = await Product.collection.updateOne(
        { _id: product._id, category: product.category },
        { $set: { category: category._id } },
      )

      if (result.modifiedCount === 1) {
        console.log(`Updated: ${product.name} -> ${category.name}`)
        updated++
      }
    }

    console.log('\nMigration summary')
    console.log('Updated:', updated)
    console.log('Skipped:', skipped)
  } catch (error) {
    console.error('Migration failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('MongoDB connection closed.')
  }
}

main()
