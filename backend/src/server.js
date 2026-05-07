require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled Rejection:", err.message);
      server.close(() => process.exit(1));
    });

    process.on("SIGINT", () => {
      console.log("🛑 Server stopped");
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();