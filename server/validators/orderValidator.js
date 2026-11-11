const Joi = require('joi')

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('processing', 'shipped', 'delivered').required(),
})

module.exports = {
  updateOrderStatusSchema,
}
