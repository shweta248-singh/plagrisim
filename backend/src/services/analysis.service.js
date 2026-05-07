const Submission = require("../models/Submission");
const History = require("../models/history.model");
const callNlpApi = require("../utils/callNlpApi");

/**
 * Perform Plagiarism Analysis
 * @param {Object} params
 */
const performAnalysis = async ({
  userId,
  text,
  fileName = "Raw Text Scan",
  storedFileName = null,
  fileType = "text/plain",
  fileSize = 0,
  submissionId = null
}) => {
  console.log(`[ANALYSIS SERVICE] Started for user: ${userId}, file: ${fileName}`);
  
  try {
    // 0. Prevent duplicates: Check for a very recent submission (last 10s)
    if (!submissionId) {
      const recentSubmission = await Submission.findOne({
        userId,
        textLength: text.length,
        createdAt: { $gt: new Date(Date.now() - 10000) }
      }).select("+originalText");

      if (recentSubmission && recentSubmission.originalText === text) {
        console.log("[ANALYSIS SERVICE] Duplicate detected. Returning existing submission.");
        return {
          success: true,
          submissionId: recentSubmission._id,
          result: recentSubmission
        };
      }
    }

    // 1. Create or Find Submission
    let submission;
    if (submissionId) {
      submission = await Submission.findById(submissionId);
      if (!submission) throw new Error("Submission not found");
    } else {
      submission = await Submission.create({
        userId,
        fileName,
        storedFileName: storedFileName || `text_${Date.now()}`,
        fileType,
        fileSize: fileSize || Buffer.byteLength(text, "utf8"),
        originalText: text,
        textLength: text.length,
        status: "processing"
      });
    }

    // 2. Call NLP Engine
    console.log("[ANALYSIS SERVICE] Calling NLP Engine...");
    let nlpResult;
    try {
      const axios = require("axios");
      const aiEngineUrl = process.env.AI_ENGINE_URL || "http://127.0.0.1:8000";
      
      console.log("NLP REQUEST STARTED to:", `${aiEngineUrl}/analyze-text`);
      
      const aiResponse = await axios.post(
        `${aiEngineUrl}/analyze-text`,
        { 
          text, 
          submissionId: submission._id.toString() 
        },
        { timeout: 30000 }
      );
      
      nlpResult = aiResponse.data;
      console.log("NLP RESPONSE RECEIVED");
    } catch (nlpError) {
      console.error("[ANALYSIS SERVICE] NLP Engine call failed:", nlpError.message);
      submission.status = "failed";
      submission.errorMessage = nlpError.message;
      await submission.save();
      throw new Error("NLP engine is not responding. Please start FastAPI service.");
    }

    const similarity = nlpResult.similarity ?? nlpResult.similarityScore ?? 0;
    
    // 3. Format & Deduplicate Matches
    const generateTextTitle = (str) => {
      if (!str) return "Unknown Source";
      const clean = str.replace(/\s+/g, " ").trim();
      const words = clean.split(" ");
      const maxWords = 12;
      return words.length > 0 ? `${words.slice(0, maxWords).join(" ")}${words.length > maxWords ? "..." : ""}` : "Unknown Source";
    };

    let formattedMatches = [];
    const seenTexts = new Set();

    for (let i = 0; i < (nlpResult.matches || []).length; i++) {
      const match = nlpResult.matches[i];
      const matchedText = (match.matchedText || match.text || "").trim();
      
      // Deduplicate: Skip identical text snippets
      if (matchedText && seenTexts.has(matchedText.toLowerCase())) {
        continue;
      }
      
      if (matchedText) {
        seenTexts.add(matchedText.toLowerCase());
      }

      let sourceName = match.source || match.sourceName || match.title || `Matched Source ${i + 1}`;
      if (sourceName === "Raw Text Scan" || sourceName.includes("Raw Text Scan")) {
         sourceName = generateTextTitle(matchedText);
      }
      
      formattedMatches.push({
        source: sourceName,
        similarityScore: match.similarityScore ?? match.similarity ?? 0,
        matchedText: matchedText,
        url: match.url || ""
      });
    }

    // Sort by similarity and keep top 10
    formattedMatches = formattedMatches
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 10);

    // 4. Update Submission
    console.log("[ANALYSIS SERVICE] Finalizing submission document...");
    submission.similarityScore = similarity;
    submission.matches = formattedMatches;
    submission.analysisSummary = nlpResult.summary || "Analysis completed successfully";
    submission.status = "completed";
    submission.analyzedAt = new Date();
    await submission.save();
    console.log("REPORT SAVED:", submission._id);

    // 5. Save to History
    await History.create({
      user: userId,
      content: text.substring(0, 1000),
      similarity,
      result: nlpResult,
      matches: formattedMatches.map(m => ({
        source: m.source,
        similarity: m.similarityScore,
        matchedText: m.matchedText
      }))
    });

    return {
      success: true,
      submissionId: submission._id,
      result: submission
    };
  } catch (error) {
    console.error("[ANALYSIS SERVICE] Fatal Error:", error.message);
    throw error;
  }
};

module.exports = {
  performAnalysis
};
