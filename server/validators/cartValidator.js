const Joi = require('joi')

const addToCartSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),

  quantity: Joi.number().integer().min(1).required(),
})

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
})

const mergeCartItemSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
})

const mergeCartSchema = Joi.object({
  items: Joi.array().items(mergeCartItemSchema).min(1).required(),
})

module.exports = {
  addToCartSchema,

  updateCartItemSchema,

  mergeCartSchema,
}
