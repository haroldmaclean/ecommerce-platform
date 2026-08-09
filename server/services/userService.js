const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require('../models/User')

const createUser = async (userData) => {
  const existingUser = await User.findOne({
    email: userData.email,
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10)

  const user = await User.create({
    ...userData,
    password: hashedPassword,
  })

  return user
}

const loginUser = async (email, password) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new Error('Invalid email or password')
  }

  const passwordMatches = await bcrypt.compare(password, user.password)

  if (!passwordMatches) {
    throw new Error('Invalid email or password')
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  )

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  }
}

module.exports = {
  createUser,
  loginUser,
}
