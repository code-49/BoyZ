const Joi = require("joi");

const couponSchema = Joi.object({
  name: Joi.string().trim().uppercase().min(4).required(),
  offer: Joi.number().min(1).max(100).required(),
  maxAmount: Joi.number().min(0).required(),
  minAmount: Joi.number().min(0).required(),
  expiry: Joi.date().greater("now").required(),
});

module.exports = couponSchema;
