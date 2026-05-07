const rateLimit = require("express-rate-limit");

/**
 * 🔐 IMPORTANT:
 * Ensures correct IP detection behind proxies (Render, Nginx, etc.)
 * MUST also be set in app.js -> app.set("trust proxy", 1)
 */
const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip
  );
};

// 🌐 General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => getClientIP(req),

  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

const isProduction = process.env.NODE_ENV === "production";

// 🔐 Auth limiter (strict)
const authLimiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 1 * 60 * 1000,
  max: isProduction ? 5 : 20,

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => getClientIP(req),

  skipSuccessfulRequests: true,

  message: {
    success: false,
    message: isProduction
      ? "Too many login/signup attempts. Please try again after 15 minutes."
      : "Too many login/signup attempts. Please try again after 1 minute.",
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
};