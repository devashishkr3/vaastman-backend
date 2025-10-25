const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const universityController = require("../controllers/universityController");
const collegeController = require("../controllers/collegeController");
const certificateController = require("../controllers/certificateController");
const certificateDownloadController = require("../controllers/certificateDownloadController");
const joiValidator = require("../middlewares/joiValidator");
const universityValidator = require("../validators/universityValidaton");
const collegeValidator = require("../validators/collegeValidation");
const employeeValidator = require("../validators/employeeValidation");
const certificateValidator = require("../validators/certificateValidaton");
const { protect, restrictTo } = require("../middlewares/authMIddleware");

// router.use(protect, restrictTo("ADMIN"));

// Dashboard
router.get("/dashboard", adminController.dashboard);

// Employee CRUD
router.post(
  "/employees",
  joiValidator(employeeValidator.createEmployeeSchema, "body"),
  adminController.createEmployee
);
router.get("/employees", adminController.getAllEmployee);
router.get(
  "/employees/:id",
  joiValidator(employeeValidator.employeeIdParamSchema, "params"),
  adminController.getEmployeeById
);
router.put(
  "/employees/:id",
  joiValidator(employeeValidator.createEmployeeSchema, "body"),
  joiValidator(employeeValidator.employeeIdParamSchema, "params"),
  adminController.updateEmployee
);
router.patch(
  "/employees/:id/toggle",
  joiValidator(employeeValidator.employeeIdParamSchema, "params"),
  adminController.toggleActiveEmployee
);
router.delete(
  "/employees/:id",
  joiValidator(employeeValidator.employeeIdParamSchema, "params"),
  adminController.deleteEmployee
);

// University CRUD routes
router.post(
  "/university",
  joiValidator(universityValidator.createUniversitySchema, "body"),
  universityController.createUniversity
);
router.put(
  "/university/:id",
  joiValidator(universityValidator.updateUniversitySchema, "body"),
  joiValidator(universityValidator.universityIdParamSchema, "params"),
  universityController.updateUniversity
);
router.delete(
  "/university/:id",
  joiValidator(universityValidator.universityIdParamSchema, "params"),
  universityController.deleteUniversity
);
router.get("/university", universityController.getAllUniversity);
router.get(
  "/university/:id",
  joiValidator(universityValidator.universityIdParamSchema, "params"),
  universityController.getUniversityById
);

// College by University
router.get(
  "/university/:id/colleges",
  joiValidator(universityValidator.universityIdParamSchema, "params"),
  universityController.getCollegeByUniversity
);

// Student by University
router.get(
  "/university/:id/students",
  joiValidator(universityValidator.universityIdParamSchema, "params"),
  universityController.getStudentByUniversity
);

// College CRUD Routes
router.post(
  "/college",
  joiValidator(collegeValidator.createCollegeSchema, "body"),
  collegeController.createCollege
);
router.get("/college", collegeController.getAllColleges);
router.get(
  "/college/:id",
  joiValidator(collegeValidator.collegeIdParamSchema, "params"),
  collegeController.getCollegeById
);
router.put(
  "/college/:id",
  joiValidator(collegeValidator.updateCollegeSchema, "body"),
  joiValidator(collegeValidator.collegeIdParamSchema, "params"),
  collegeController.updateCollege
);
router.delete(
  "/college/:id",
  joiValidator(collegeValidator.collegeIdParamSchema, "params"),
  collegeController.deleteCollege
);

// Students by college
router.get(
  "/college/:id/students",
  joiValidator(collegeValidator.collegeIdParamSchema, "params"),
  collegeController.getStudentsByCollege
);

// Certificates
router.post(
  "/certificates/create",
  joiValidator(certificateValidator.createCertificateSchema, "body"),
  certificateController.createCertificate
);
// router.get("/certificates", certificateController.getAllCertificates);
router.put(
  "/certificates/:certNumber",
  joiValidator(certificateValidator.updateCertificateSchema, "body"),
  joiValidator(certificateValidator.certNumberParamSchema, "params"),
  certificateController.updateCertificate
);
// may be this line is problematic
router.patch(
  "/certificates/:certNumber",
  joiValidator(certificateValidator.certNumberParamSchema, "params"),
  certificateController.toggleRevokeCertificate
);
router.get(
  "/certificates/verify/:hash",
  joiValidator(certificateValidator.verifyHashParamSchema, "params"),
  certificateController.verifyCertificate
);
router.delete(
  "/certificates/:certNumber",
  joiValidator(certificateValidator.certNumberParamSchema, "params"),
  certificateController.deleteCertificate
);

// download certificates
router.get(
  "/certificates/download/all",
  certificateDownloadController.downloadAllCertificates
);
router.get(
  "/certificates/download/university/:universityId",
  certificateDownloadController.downloadCertificatesByUniversity
);
router.get(
  "/certificates/download/college/:collegeId",
  certificateDownloadController.downloadCertificatesByCollege
);

module.exports = router;
