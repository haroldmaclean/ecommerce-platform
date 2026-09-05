const Joi = require('joi')

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    )
    .required(),
})

module.exports = {
  updateOrderStatusSchema,
}
