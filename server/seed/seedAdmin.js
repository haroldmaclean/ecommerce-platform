require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

const seedAdmin = async () => {
  try {
    await connectDB()

    const adminEmail = 'admin@example.com'
    const adminPassword = 'admin123'

    const existingAdmin = await User.findOne({
      email: adminEmail,
    })

    if (existingAdmin) {
      console.log('Admin already exists')
      return
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    })

    console.log('Admin created successfully')
  } catch (error) {
    console.error('Admin seed failed:', error.message)
  } finally {
    process.exit()
  }
}

seedAdmin()
