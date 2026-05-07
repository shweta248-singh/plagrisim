// const express = require("express");
// const authMiddleware = require("../middlewares/auth.middleware");
// const {
//   getHistory,
//   getSubmissionById
// } = require("../controllers/history.controller");

// const router = express.Router();

// router.get("/", authMiddleware, getHistory);
// router.get("/:id", authMiddleware, getSubmissionById);

// module.exports = router;


const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middlewares/auth.middleware");

const {
  getHistory,
  getSubmissionById
} = require("../controllers/history.controller");

const router = express.Router();


// 📄 GET ALL HISTORY (SAFE)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    await getHistory(req, res, next);
  } catch (error) {
    next(error);
  }
});


// 📄 GET SINGLE REPORT BY ID (SAFE + VALIDATION)
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    // 🔒 Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID"
      });
    }

    await getSubmissionById(req, res, next);
  } catch (error) {
    next(error);
  }
});


module.exports = router;