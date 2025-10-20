const Joi = require("joi");

/**--------------------REIGSTER-USER-------------------- */
exports.registerUserSchema = Joi.object({
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
    .messages({
      "string.pattern.base": "Mobile number must be 10 digits",
    }),
  role: Joi.string().valid("ADMIN", "EMPLOYEE").optional().messages({
    "any.only": "Role must be either ADMIN or EMPLOYEE",
  }),
});

/**--------------------LOGIN-USER---------------------- */
exports.loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

/**-----------------REFRESH-TOKEN--------------------- */
exports.refreshTokenSchema = Joi.object({
  authorization: Joi.string()
    .pattern(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/)
    .required()
    .messages({
      "string.empty": "Authorization header is required",
      "any.required": "Authorization header is required",
      "string.pattern.base":
        "Authorization header must start with 'Bearer ' followed by a valid token",
    }),
});

/**--------------------LOGOUT----------------------- */
exports.logoutSchema = Joi.object({
  authorization: Joi.string()
    .pattern(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/)
    .required()
    .messages({
      "string.empty": "Authorization header is required",
      "any.required": "Authorization header is required",
      "string.pattern.base":
        "Authorization header must start with 'Bearer ' followed by a valid token",
    }),
});
