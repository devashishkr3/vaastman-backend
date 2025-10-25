const Joi = require("joi");

exports.createCareerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name must be at most 100 characters",
  }),

  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Please provide a valid email",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "any.required": "Phone number is required",
      "string.pattern.base": "Phone number must be exactly 10 digits",
    }),

  domain: Joi.string().trim().min(2).max(100).required().messages({
    "any.required": "Domain is required",
    "string.empty": "Domain cannot be empty",
    "string.min": "Domain must be at least 2 characters",
    "string.max": "Domain must be at most 100 characters",
  }),

  motiveType: Joi.string().trim().min(3).max(100).required().messages({
    "any.required": "Motive is required",
    "string.empty": "Motive cannot be empty",
    "string.min": "Motive must be at least 3 characters",
    "string.max": "Motive must be at most 100 characters",
  }),
});
