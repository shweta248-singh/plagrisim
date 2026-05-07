const express = require("express");

const {
  signup,
  login,
  refreshTokenHandler,
  logout
} = require("../controllers/auth.controller");

// ✅ Correct import (match your actual file name)
const { authLimiter } = require("../middlewares/rateLimit.middleware");

// ✅ Correct middleware path (match folder name: middlewares)
const protect = require("../middlewares/auth.middleware");

const router = express.Router();

// 🔐 Apply limiter ONLY to auth routes
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", protect, logout);

// 🔁 Refresh token (optional: you can also rate limit this if needed)
router.post("/refresh", refreshTokenHandler);

// 🚪 Logout (PROTECTED ROUTE)
router.post("/logout", protect, logout);

module.exports = router;