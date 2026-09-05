const mongoose = require("mongoose");

let connectionPromise = null;

async function connectDatabase() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      "MONGO_URI is not set. Configure it in your environment variables."
    );
  }

  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
      })
      .then(() => {
        console.log("[database] MongoDB connection established");
        return mongoose.connection;
      })
      .catch((err) => {
        connectionPromise = null;
        console.error(
          "[database] MongoDB connection error:",
          err.message
        );
        throw err;
      });
  }

  return connectionPromise;
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  isDatabaseConnected,
};