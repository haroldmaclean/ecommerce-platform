const Joi = require('joi')

const registerUserSchema = Joi.object({
  name: Joi.string().trim().required(),

  email: Joi.string().email().lowercase().trim().required(),

  password: Joi.string().min(8).required(),
})

const loginUserSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),

  password: Joi.string().required(),
})

const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('customer', 'admin').required(),
})

module.exports = {
  registerUserSchema,
  loginUserSchema,
  updateUserRoleSchema,
}
