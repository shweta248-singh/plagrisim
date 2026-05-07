const { performAnalysis } = require("../services/analysis.service");
const Submission = require("../models/Submission");

/**
 * Analyze Raw Text
 * POST /api/analyze/text
 */
exports.analyzeRawText = async (req, res, next) => {
  try {
    console.log("TEXT ANALYZE STARTED");
    console.log("BODY text length:", req.body?.text?.length);
    
    const { text } = req.body;

    if (!text || text.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "Text must be at least 20 characters",
      });
    }

    const generateTextTitle = (text) => {
      const clean = text.replace(/\s+/g, " ").trim();
      const words = clean.split(" ").slice(0, 8).join(" ");
      return words.length > 0 ? `${words}${clean.split(" ").length > 8 ? "..." : ""}` : "Text Scan";
    };

    const analysisResult = await performAnalysis({
      userId: req.user._id,
      text: text.trim(),
      fileName: generateTextTitle(text),
      fileType: "text/plain",
    });

    return res.status(200).json({
      success: true,
      message: "Text analyzed successfully",
      ...analysisResult,
    });
  } catch (error) {
    console.error("TEXT SCAN ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Analyze Existing Submission
 * POST /api/analyze/:submissionId
 */
exports.analyzeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findOne({
      _id: submissionId,
      userId: req.user._id,
    }).select("+originalText");

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    const analysisResult = await performAnalysis({
      userId: req.user._id,
      text: submission.originalText,
      submissionId: submission._id,
      fileName: submission.fileName,
      storedFileName: submission.storedFileName,
      fileType: submission.fileType,
      fileSize: submission.fileSize,
    });

    return res.status(200).json({
      success: true,
      message: "Submission analyzed successfully",
      ...analysisResult,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};