const express = require("express");
const certificateController = require("../controllers/certificateController");
const { protect, restrictTo } = require("../middlewares/authMIddleware");
const router = express.Router();

router.use("/", protect, restrictTo("EMPLOYEE"));

// router.get("/dashboard", )
router.post("/certificate/create", certificateController.createCertificate);

module.exports = router;
