const Joi = require('joi')

const productFields = {
  name: Joi.string(),

  price: Joi.number().positive(),

  description: Joi.string(),

  category: Joi.string(),

  stock: Joi.number().integer().min(0),
}

const createProductSchema = Joi.object({
  ...productFields,

  name: productFields.name.required(),
  price: productFields.price.required(),
  description: productFields.description.required(),
  category: productFields.category.required(),
  stock: productFields.stock.required(),
})

const updateProductSchema = Joi.object(productFields).min(1)

module.exports = {
  createProductSchema,
  updateProductSchema,
}

/*const Joi = require('joi')

const productSchema = Joi.object({
  name: Joi.string().required(),

  price: Joi.number().positive().required(),

  description: Joi.string().required(),

  category: Joi.string().required(),

  stock: Joi.number().integer().min(0).required(),
})

module.exports = productSchema
*/
