const Joi = require("joi");

const catSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
});

module.exports = catSchema;
