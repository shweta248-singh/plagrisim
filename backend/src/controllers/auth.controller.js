const User = require("../models/User");
const validator = require("validator"); // ✅ ADDED
const { verifyRefreshToken } = require("../utils/jwt");


const {
  validateSignup,
  validateLogin
} = require("../validations/auth.validation");

const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/token");


// ================= SIGNUP =================
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const validationError = validateSignup({ name, email, password });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // ✅ TYPE CHECK (NoSQL injection protection)
    if (typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // ✅ EMAIL VALIDATION (NEW)
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    // ✅ FIX: Generate tokens here
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // ✅ Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
};


// ================= LOGIN =================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validationError = validateLogin({ email, password });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // ✅ TYPE CHECK (CRITICAL)
    if (typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // ✅ EMAIL VALIDATION
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail // safe because already validated
    }).select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 🔐 Check if account is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: "Account locked. Try again later."
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      // 🔐 Increment failed attempts
      if (user.incLoginAttempts) {
        await user.incLoginAttempts();
      }

      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 🔐 Reset login attempts after successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      if (user.resetLoginAttempts) {
        await user.resetLoginAttempts();
      }
    }

    // ✅ FIX: Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // ✅ Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
};


// ================= REFRESH TOKEN =================
exports.refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // ✅ TYPE CHECK (extra security)
    if (typeof refreshToken !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token format"
      });
    }

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });
    }

    let decoded;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token"
      });
    }

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh token mismatch"
      });
    }

    // ✅ ROTATION STARTS HERE

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+refreshToken");

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    next(error);
  }
};