const extractText = require("./src/utils/extractText");
const path = require("path");
const fs = require("fs");

async function testExtraction() {
  const testFilesDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(testFilesDir)) {
    console.log("No uploads directory found.");
    return;
  }

  const files = fs.readdirSync(testFilesDir);
  console.log(`Found ${files.length} files in uploads/`);

  for (const file of files) {
    const filePath = path.join(testFilesDir, file);
    const mimeType = file.endsWith(".pdf") ? "application/pdf" : (file.endsWith(".txt") ? "text/plain" : "unknown");
    
    if (mimeType === "unknown") continue;

    console.log(`Testing extraction for: ${file} (${mimeType})`);
    try {
      const text = await extractText(filePath, mimeType);
      console.log(`Successfully extracted ${text.length} chars.`);
      console.log(`Snippet: ${text.substring(0, 100)}...`);
    } catch (error) {
      console.error(`Extraction failed for ${file}:`, error.message);
    }
  }
}

testExtraction();
