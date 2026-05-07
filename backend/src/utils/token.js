const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const jwtConfig = require("../config/jwt");

// ================= ACCESS TOKEN =================
exports.generateAccessToken = (user) => {
  // ✅ EXTRA SAFETY: ensure required fields exist
  if (!user || !user._id || !user.email) {
    throw new Error("Invalid user data for access token");
  }

  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET not configured");
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role, // ✅ ADDED (important for RBAC, safe addition)
      jti: crypto.randomUUID()
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: jwtConfig.accessTokenExpiry || "15m",
      issuer: jwtConfig.issuer || "proofnexa-app",
      audience: jwtConfig.audience || "proofnexa-users",
      algorithm: "HS256"
    }
  );
};


// ================= REFRESH TOKEN =================
exports.generateRefreshToken = (user) => {
  // ✅ EXTRA SAFETY CHECKS
  if (!user || !user._id) {
    throw new Error("Invalid user data for refresh token");
  }

  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET not configured");
  }

  return jwt.sign(
    {
      id: user._id,
      tokenVersion: user.tokenVersion || 0,
      jti: crypto.randomUUID() // ✅ ADDED (refresh token tracking)
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithm: "HS256"
    }
  );
};