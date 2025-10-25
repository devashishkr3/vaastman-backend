const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");
const joiValidator = require("../middlewares/joiValidator");
const contactValidator = require("../validators/contactValidaton");
const careerValidator = require("../validators/careerValidaton");
const certificateController = require("../controllers/certificateController");
const certificateValidator = require("../validators/certificateValidaton");

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

router.get("/certificates/search", publicController.globalCertificateSearch);

router.get(
  "/certificates/verify/:hash",
  joiValidator(certificateValidator.verifyHashParamSchema, "params"),
  certificateController.verifyCertificate
);

module.exports = router;
