const express = require("express");
const { protect, restrictTo } = require("../middlewares/authMIddleware");
const router = express.Router();

router.use("/", protect, restrictTo("EMPLOYEE"));

// router.get("/dashboard", )
