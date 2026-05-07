const express = require("express");

const {
  getProfile,
  updateProfile,
  updatePassword,
} = require("../controllers/user.controller");

const protect = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.put("/me/password", protect, updatePassword);

module.exports = router;
