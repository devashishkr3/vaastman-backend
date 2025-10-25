const express = require("express");
const certificateController = require("../controllers/certificateController");
const certificateValidator = require("../validators/certificateValidaton");
const employeeController = require("../controllers/employeeController");
const joiValidator = require("../middlewares/joiValidator");
const { protect, restrictTo } = require("../middlewares/authMIddleware");
const router = express.Router();

router.use("/", protect, restrictTo("EMPLOYEE"));

router.get("/dashboard", employeeController.dashboard);

router.post(
  "/certificates/create",
  joiValidator(certificateValidator.createCertificateSchema, "body"),
  certificateController.createCertificate
);

router.put(
  "/certificates/:certNumber",
  joiValidator(certificateValidator.updateCertificateSchema, "body"),
  joiValidator(certificateValidator.certNumberParamSchema, "params"),
  certificateController.updateCertificate
);

module.exports = router;
