const express = require("express");
const router = express.Router();
const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");
const employeeRoute = require("./employeeRoute");
const publicRoute = require("./publicRoute");

router.use("/auth", authRoute);
router.use("/admin", adminRoute);
router.use("/employee", employeeRoute);
router.use("/public", publicRoute);

module.exports = router;
