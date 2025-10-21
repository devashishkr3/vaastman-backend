const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authValidator = require("../validators/authVaidation");
const joiValidator = require("../middlewares/joiValidator");

router.post(
  "/register",
  joiValidator(authValidator.registerUserSchema, "body"),
  authController.register
);
router.post(
  "/login",
  joiValidator(authValidator.loginUserSchema, "body"),
  authController.login
);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;
