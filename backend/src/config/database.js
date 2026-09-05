const mongoose = require("mongoose");

/**
 * Connects to MongoDB using Mongoose.
 * Fails loudly (and lets the caller decide whether to exit) rather than
 * silently running the API against a dead database.
 */
async function connectDatabase() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      "MONGO_URI is not set. Copy .env.example to .env and configure your MongoDB connection string."
    );
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    console.log("[database] MongoDB connection established");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[database] MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[database] MongoDB disconnected");
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  return mongoose.connection;
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

module.exports = { connectDatabase, isDatabaseConnected };
