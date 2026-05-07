const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ================= CENTRAL CONFIG =================
const JWT_CONFIG = {
  secret: process.env.ACCESS_TOKEN_SECRET,
  issuer: "proofnexa-app",
  audience: "proofnexa-users",
  algorithm: "HS256",
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d"
};

// ================= SECRET HELPERS =================
const getAccessSecret = () => {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret || secret === "undefined") {
    throw new Error("ACCESS_TOKEN_SECRET is not configured properly");
  }

  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!secret || secret === "undefined") {
    throw new Error("REFRESH_TOKEN_SECRET is not configured properly");
  }

  return secret;
};

// ================= ACCESS TOKEN =================
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      jti: crypto.randomUUID()
    },
    getAccessSecret(),
    {
      expiresIn: JWT_CONFIG.accessTokenExpiry,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithm: JWT_CONFIG.algorithm
    }
  );
};

// ================= REFRESH TOKEN =================
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      tokenVersion: user.tokenVersion || 0
    },
    getRefreshSecret(),
    {
      expiresIn: JWT_CONFIG.refreshTokenExpiry,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithm: JWT_CONFIG.algorithm
    }
  );
};

// ================= VERIFY ACCESS TOKEN =================
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getAccessSecret(), {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

// ================= VERIFY REFRESH TOKEN =================
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, getRefreshSecret(), {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  secret: JWT_CONFIG.secret,
  accessTokenExpiry: JWT_CONFIG.accessTokenExpiry,
  refreshTokenExpiry: JWT_CONFIG.refreshTokenExpiry,
  issuer: JWT_CONFIG.issuer,
  audience: JWT_CONFIG.audience
};