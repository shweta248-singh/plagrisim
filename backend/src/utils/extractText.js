const fs = require("fs/promises");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extract Text from File
 * @param {string} filePath 
 * @param {string} mimeType 
 */
const extractText = async (filePath, mimeType) => {
  try {
    let text = "";

    if (mimeType === "application/pdf") {
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      text = data.text;
    } 
    else if (mimeType.includes("wordprocessingml") || mimeType.includes("msword")) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } 
    else if (mimeType === "text/plain") {
      text = await fs.readFile(filePath, "utf-8");
    } 
    else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Sanitize
    const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").replace(/\s+/g, " ").trim();

    if (!cleaned || cleaned.length < 20) {
      throw new Error("Document is too short or unreadable (min 20 characters).");
    }

    return cleaned;
  } catch (error) {
    console.error("EXTRACTION ERROR:", error.message);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};

module.exports = extractText;