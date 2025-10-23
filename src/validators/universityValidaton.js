const Joi = require("joi");

/**--------------------CREATE-UNIVERSITY--------------------*/
exports.createUniversitySchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "University name is required",
    "string.min": "University name must be at least 3 characters long",
    "string.max": "University name must be at most 100 characters long",
    "any.required": "University name is required",
  }),
  address: Joi.string().max(255).required().allow(null, "").messages({
    "string.max": "Address must be at most 255 characters long",
    "any.required": "University Address is required",
  }),
});

/**--------------------UPDATE-UNIVERSITY--------------------*/
exports.updateUniversitySchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.min": "University name must be at least 3 characters long",
    "string.max": "University name must be at most 100 characters long",
    "any.required": "University Name is required",
  }),
  address: Joi.string().max(255).required().allow(null, "").messages({
    "string.max": "Address must be at most 255 characters long",
    "any.required": "University Address is required",
  }),
});

/**--------------------PARAMS-ID-VALIDATION--------------------*/
exports.universityIdParamSchema = Joi.object({
  id: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.empty": "University ID is required",
    "string.guid": "University ID must be a valid UUID",
    "any.required": "University ID is required",
  }),
});
