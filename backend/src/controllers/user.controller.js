const User = require("../models/User");

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken -loginAttempts -lockUntil");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    // Check if new email is already taken by someone else
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }
    }

    // Update fields
    user.name = name;
    user.email = email;
    if (phone !== undefined) {
      user.phone = phone;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/users/me/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide current and new password" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
    }

    // Must explicitly select password as it is set to select: false in schema
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    next(error);
  }
};
