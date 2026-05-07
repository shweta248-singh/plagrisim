const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    console.log("🔄 Connecting to MongoDB...");

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;