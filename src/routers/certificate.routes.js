const express = require("express");
const {
  createCertificateController,
} = require("../controllers/certificate.controller.js");
// const { authMiddleware } = require("../middlewares/auth.js");

const router = express.Router();

router.post("/create", createCertificateController);

module.exports = router;
