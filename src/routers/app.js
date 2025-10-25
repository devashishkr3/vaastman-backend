const express = require("express");
const router = express.Router();
const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");
const employeeRoute = require("./employeeRoute");

router.use("/auth", authRoute);
router.use("/admin", adminRoute);
router.use("/employee", employeeRoute);

module.exports = router;
