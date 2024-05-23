const Joi = require("joi");

const addressSchema = Joi.object({
  pin: Joi.number().min(100000).max(999999).required(),
  locality: Joi.string().trim().required(),
  building: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
});

const nameSchema = Joi.string().trim().required();
const emailSchema = Joi.string().trim().email().required();
const passSchema = Joi.string().trim().min(8).max(20).required().messages({
  "string.base": "Password must be a string",
  "string.empty": "Password is required",
  "string.min": "Password must be at least {#limit} characters long",
  "string.max": "Password must be at most {#limit} characters long",
  "any.required": "Password is required",
});

module.exports = {
  addressSchema,
  nameSchema,
  emailSchema,
  passSchema,
};
