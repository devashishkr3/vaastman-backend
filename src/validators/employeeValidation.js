const Joi = require("joi");

/**--------------------CREATE-EMPLOYEE--------------------*/
exports.createEmployeeSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be at most 50 characters long",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).max(50).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must be at most 50 characters long",
    "any.required": "Password is required",
  }),

  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base": "Mobile number must be 10 digits",
    }),
});

/**--------------------UPDATE-EMPLOYEE--------------------*/
exports.updateEmployeeSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional().messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be at most 50 characters long",
  }),

  email: Joi.string().email().optional().messages({
    "string.email": "Please provide a valid email",
  }),

  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base": "Mobile number must be 10 digits",
    }),
});

/**--------------------EMPLOYEE-ID (PARAMS)--------------------*/
exports.employeeIdParamSchema = Joi.object({
  id: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.empty": "Employee ID is required",
    "string.guid": "Employee ID must be a valid UUID",
    "any.required": "Employee ID is required",
  }),
});
