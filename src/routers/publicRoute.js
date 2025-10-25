const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");
const joiValidator = require("../middlewares/joiValidator");
const contactValidator = require("../validators/contactValidaton");
const careerValidator = require("../validators/careerValidaton");

router.post(
  "/contact",
  joiValidator(contactValidator.createContactSchema, "body"),
  publicController.submitContact
);
router.post(
  "/career",
  joiValidator(careerValidator.createCareerSchema, "body"),
  publicController.submitCareer
);

module.exports = router;
