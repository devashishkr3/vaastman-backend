const Joi = require("joi");

/**--------------------CREATE-COLLEGE--------------------*/
exports.createCollegeSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "College name is required",
    "string.min": "College name must be at least 3 characters long",
    "string.max": "College name must be at most 100 characters long",
    "any.required": "College name is required",
  }),
  address: Joi.string().max(255).required().allow(null, "").messages({
    "string.max": "Address must be at most 255 characters long",
    "any.required": "College Address is required",
  }),
  collegeCode: Joi.string()
    .alphanum()
    .max(20)
    .required()
    .allow(null, "")

    .messages({
      "string.alphanum": "College code must contain only letters and numbers",
      "string.max": "College code must be at most 20 characters long",
      "any.required": "College Code is required",
    }),
  universityId: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.empty": "University ID is required",
    "string.guid": "University ID must be a valid UUID",
    "any.required": "University ID is required",
  }),
});

/**--------------------UPDATE-COLLEGE--------------------*/
exports.updateCollegeSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    "string.min": "College name must be at least 3 characters long",
    "string.max": "College name must be at most 100 characters long",
  }),
  address: Joi.string().max(255).optional().allow(null, "").messages({
    "string.max": "Address must be at most 255 characters long",
  }),
  collegeCode: Joi.string()
    .alphanum()
    .max(20)
    .optional()
    .allow(null, "")
    .messages({
      "string.alphanum": "College code must contain only letters and numbers",
      "string.max": "College code must be at most 20 characters long",
    }),
  universityId: Joi.string().uuid({ version: "uuidv4" }).optional().messages({
    "string.guid": "University ID must be a valid UUID",
  }),
});

/**--------------------GET / DELETE / PARAM-ID VALIDATION--------------------*/
exports.collegeIdParamSchema = Joi.object({
  id: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.empty": "College ID is required",
    "string.guid": "College ID must be a valid UUID",
    "any.required": "College ID is required",
  }),
});
