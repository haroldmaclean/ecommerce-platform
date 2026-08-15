const Joi = require('joi')

const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),

  description: Joi.string().trim().max(200).allow(''),
})

module.exports = categorySchema
