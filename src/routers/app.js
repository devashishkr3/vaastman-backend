const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({
    success: "true",
    message: "everything is going well",
  });
});

module.exports = router;
