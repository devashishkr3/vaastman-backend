const Joi = require("joi");

exports.createContactSchema = Joi.object({
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

  message: Joi.string().trim().min(10).max(1000).required().messages({
    "any.required": "Message is required",
    "string.empty": "Message cannot be empty",
    "string.min": "Message must be at least 10 characters",
    "string.max": "Message must be at most 1000 characters",
  }),
});
