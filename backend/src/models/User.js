const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please provide a valid email"]
    },

    phone: {
      type: String,
      trim: true,
      default: ""
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false
    },

    // ✅ ✅ ADD THIS BLOCK HERE
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    // 🔐 NEW FIELD (ALREADY PRESENT)
    refreshToken: {
      type: String,
      select: false
    },

    // 🔐 Security fields (Account lock system)
    loginAttempts: {
      type: Number,
      default: 0
    },

    lockUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);
// 🔒 Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// 🔐 Check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// 🔐 Increment login attempts and lock if needed
userSchema.methods.incLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  // Reset if lock expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(updates);
};

// 🔐 Reset attempts after successful login
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

module.exports = mongoose.model("User", userSchema);