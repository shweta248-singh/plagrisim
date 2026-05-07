const requiredEnvVars = ["JWT_SECRET", "MONGO_URI"];

function validateEnv() {
  requiredEnvVars.forEach((key) => {
    if (!process.env[key] || process.env[key] === "undefined") {
      console.error(`❌ Missing required environment variable: ${key}`);
      process.exit(1); // Stop app immediately
    }
  });
}

module.exports = validateEnv;