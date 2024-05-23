const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  color: Joi.array().items(Joi.string()),
  size: Joi.string().uppercase().valid("S", "L", "M", "XL", "XXL"),
  price: Joi.number().min(0),
  discount: Joi.number().min(0).max(100),
  stock: Joi.number().min(0),
  category: Joi.array().items(Joi.string()),
});

module.exports = productSchema;
