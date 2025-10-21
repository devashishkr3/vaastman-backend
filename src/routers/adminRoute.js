const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const universityController = require("../controllers/universityController");
const collegeController = require("../controllers/collegeController");
const joiValidator = require("../middlewares/joiValidator");
const { protect, restrictTo } = require("../middlewares/authMIddleware");

router.use(protect, restrictTo("ADMIN"));

// Dashboard
router.get("/dashboard", adminController.dashboard);

// Employee CRUD
router.post("/employees", adminController.createEmployee);
router.get("/employees", adminController.getAllEmployee);
router.get("/employees/:id", adminController.getEmployeeById);
router.put("/employees/:id", adminController.updateEmployee);
router.patch("/employees/:id/toggle", adminController.toggleActiveEmployee);
router.delete("/employees/:id", adminController.deleteEmployee);

// University CRUD routes
router.post("/", universityController.createUniversity);
router.put("/:id", universityController.updateUniversity);
router.delete("/:id", universityController.deleteUniversity);
router.get("/", universityController.getAllUniversity);
router.get("/:id", universityController.getUniversityById);

// College by University
router.get("/:id/colleges", universityController.getCollegeByUniversity);

// Student by University
router.get("/:id/students", universityController.getStudentByUniversity);

// College CRUD Routes
router.post("/", collegeController.createCollege);
router.get("/", collegeController.getAllColleges);
router.get("/:id", collegeController.getCollegeById);
router.put("/:id", collegeController.updateCollege);
router.delete("/:id", collegeController.deleteCollege);

// Students by college
router.get("/:id/students", collegeController.getStudentsByCollege);

module.exports = router;
