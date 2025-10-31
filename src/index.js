const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const { default: rateLimit } = require("express-rate-limit");
const AppError = require("./utils/error");
const routes = require("../src/routers/app");
const globalErrorHandler = require("./middlewares/globalErrorHandler");

// Load Environment Variable
dotenv.config();

// Initialize Express App
const app = express();

// Api Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply RateLimiter to API
app.use("/api/v1", apiLimiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Root EndPoint
app.get("/", (req, res) => {
  return res.json({
    status: "success",
    message: "Welcome to Vaastman Solutions API",
    version: "1.0.0",
    health: "/health",
    uptime: process.uptime(),
    timeStamp: new Date().toISOString(),
  });
});

// Health EndPoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timeStamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/v1", routes);

// Handle 404
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error Handler
app.use(globalErrorHandler);

// PORT
const port = process.env.PORT || 8080;

// Traditional Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
