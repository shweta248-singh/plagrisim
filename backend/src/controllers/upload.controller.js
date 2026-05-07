const fs = require("fs/promises");
const { performAnalysis } = require("../services/analysis.service");
const extractText = require("../utils/extractText");

/**
 * Handle File Upload and Analysis
 * POST /api/upload
 */
const uploadFile = async (req, res) => {
  let uploadedFilePath;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    uploadedFilePath = req.file.path;
    console.log("UPLOAD STARTED:", req.file.originalname);

    // 1. Extract Text
    console.log("TEXT EXTRACTION STARTED");
    const extractedText = await extractText(uploadedFilePath, req.file.mimetype);
    console.log("TEXT EXTRACTED (Length:", extractedText.length, ")");

    // 2. Perform Analysis
    const analysisResult = await performAnalysis({
      userId: req.user._id,
      text: extractedText,
      fileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    // 3. Cleanup
    await fs.unlink(uploadedFilePath).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "File analyzed successfully",
      ...analysisResult,
    });
  } catch (error) {
    if (uploadedFilePath) await fs.unlink(uploadedFilePath).catch(() => {});
    console.error("UPLOAD FLOW ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadFile };