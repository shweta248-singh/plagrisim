const axios = require("axios");

/**
 * Call FastAPI NLP Engine
 * @param {Object} payload - { text, submissionId }
 */
const callNlpApi = async (payload) => {
  const aiEngineUrl = process.env.NLP_API_URL || "http://127.0.0.1:8000/api/analyze-text";
  const timeout = Number(process.env.NLP_API_TIMEOUT || 30000);

  console.log("-----------------------------------------");
  console.log("NLP REQUEST STARTED");
  console.log("URL:", aiEngineUrl);
  console.log("TEXT LENGTH:", payload?.text?.length);
  console.log("-----------------------------------------");

  try {
    const response = await axios.post(
      aiEngineUrl,
      {
        text: payload.text,
        submissionId: payload.submissionId || null,
      },
      {
        timeout: timeout,
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("NLP RESPONSE RECEIVED");
    return response.data;
  } catch (error) {
    console.error("NLP ENGINE ERROR:", error.message);

    if (error.code === "ECONNABORTED") {
      throw new Error("NLP engine is not responding (Timeout).");
    }

    if (error.response) {
      throw new Error(`NLP engine failed: ${error.response.data?.detail || "Server Error"}`);
    }

    throw new Error("NLP engine is not reachable. Ensure the service is running.");
  }
};

module.exports = callNlpApi;