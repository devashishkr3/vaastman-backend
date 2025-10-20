// src/middlewares/globalErrorHandler.js
const AppError = require("../utils/error");

module.exports = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (process.env.NODE_ENV === "developement") {
    console.error(err);
  }
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: err.message,
  });
};
