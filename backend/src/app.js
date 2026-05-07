require("dotenv").config();
const validateEnv = require("./config/env");
validateEnv();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
// ❌ removed express-mongo-sanitize (causing crash)
const sanitize = require("./middlewares/sanitize");
const hpp = require("hpp");

const authRoutes = require("./routes/auth.routes");
const analyzeRoutes = require("./routes/analyze.routes");
const historyRoutes = require("./routes/history.routes");
const uploadRoutes = require("./routes/upload.routes");
const userRoutes = require("./routes/user.routes");
const reportRoutes = require("./routes/report.routes");

const errorMiddleware = require("./middlewares/error.middleware");

const {
  generalLimiter,
  authLimiter
} = require("./middlewares/rateLimit.middleware.js");

const app = express();
app.set("trust proxy", 1);


// 🔐 SECURITY HEADERS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);


// 🌐 CORS CONFIG
app.use(
  cors({
    origin: [process.env.CLIENT_URL || (process.env.NODE_ENV === "production" ? undefined : "http://localhost:5173")],
    credentials: true
  })
);


// 📦 BODY PARSING (LIMITED SIZE)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));


// 🧼 INPUT SANITIZATION (Mongo Injection Protection)
app.use(sanitize);


// 🔒 HTTP PARAM POLLUTION PROTECTION
app.use(hpp());


// 📊 LOGGING (DEV ONLY)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


// 🚫 GLOBAL RATE LIMIT (EXCEPT AUTH)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/auth")) {
    return next();
  }
  return generalLimiter(req, res, next);
});


// 🏠 HEALTH CHECK
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Plagiarism Detection Backend API is running"
  });
});


// 🔐 ROUTES
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/report", reportRoutes);


// ⚠️ ERROR HANDLER (CUSTOM)
app.use(errorMiddleware);


// 🔥 FINAL ERROR HANDLER (SAFE OUTPUT)
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message
  });
});

module.exports = app;