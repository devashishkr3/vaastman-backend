const Joi = require("joi");

/**--------------create-certificate-validator-------------------- */
exports.createCertificateSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100).required().messages({
    "any.required": "Full name is required",
    "string.empty": "Full name cannot be empty",
  }),

  fatherName: Joi.string().trim().min(3).max(100).required().messages({
    "any.required": "Father name is required",
    "string.empty": "Father name cannot be empty",
  }),

  gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required().messages({
    "any.only": "Gender must be one of MALE, FEMALE, or OTHER",
    "any.required": "Gender is required",
  }),

  email: Joi.string().email().optional().messages({
    "string.email": "A valid email is required",
  }),

  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base": "Mobile number must be exactly 10 digits",
    }),

  universityEnrollmentNo: Joi.string().trim().required().messages({
    "any.required": "University Enrollment Number is required",
  }),

  universityId: Joi.string().uuid().optional().allow(null, ""),
  collegeId: Joi.string().uuid().optional().allow(null, ""),

  universityName: Joi.string().optional().allow(""),
  fieldName: Joi.string().trim().required().messages({
    "any.required": "Field name is required",
  }),

  internshipFrom: Joi.date().optional().allow(null, ""),
  internshipTo: Joi.date().optional().allow(null, ""),
  skills: Joi.string().optional().allow(""),
  issueDate: Joi.date().optional().allow(null, ""),
});

/**----------------update-certificate-validator-------------------- */
exports.updateCertificateSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100).optional(),
  fatherName: Joi.string().trim().min(3).max(100).optional(),
  gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
  email: Joi.string().email().optional(),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),
  universityName: Joi.string().optional(),
  fieldName: Joi.string().optional(),
  internshipFrom: Joi.date().optional().allow(null, ""),
  internshipTo: Joi.date().optional().allow(null, ""),
  skills: Joi.string().optional().allow(""),
  issueDate: Joi.date().optional().allow(null, ""),
});

/**--------------params-validator--------------------- */
exports.certNumberParamSchema = Joi.object({
  certNumber: Joi.string().trim().required().messages({
    "any.required": "Certificate number is required",
    "string.empty": "Certificate number cannot be empty",
  }),
});

/**------------verification-hash-validator------------ */
exports.verifyHashParamSchema = Joi.object({
  hash: Joi.string().trim().required().messages({
    "any.required": "Verification hash is required",
    "string.empty": "Verification hash cannot be empty",
  }),
});
