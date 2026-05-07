const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    content: {
      type: String,
      required: true
    },

    // 🔥 MAIN FIELD (IMPORTANT)
    similarity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // Full NLP result (optional but useful)
    result: {
      type: Object,
      default: {}
    },

    // Matches (if NLP returns them)
    matches: [
      {
        source: String,
        similarity: Number,
        matchedText: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("History", historySchema);