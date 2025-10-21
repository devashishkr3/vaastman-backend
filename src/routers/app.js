const express = require("express");
const router = express.Router();
const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");

router.use("/auth", authRoute);
router.use("/admin", adminRoute);

module.exports = router;
