const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { connectDatabase, isDatabaseConnected } = require("./config/database");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const qdsRoutes = require("./routes/qds.routes");
const verificationRoutes = require("./routes/verification.routes");
const threatRoutes = require("./routes/threat.routes");
const attackRoutes = require("./routes/attack.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const auditRoutes = require("./routes/audit.routes");
const signatureRoutes = require("./routes/signature.routes");

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "RATE_LIMITED", message: "Too many requests, please try again shortly." },
});
app.use("/api", limiter);

// --- Root / liveness (unauthenticated, does not touch the DB) ---
app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "Q-SEC Backend",
    description:
      "Quantum-inspired cyber threat detection backend for teleportation-based Quantum Digital Signature (QDS) protocols. SIH Problem Statement 26141. Software simulation — no AI/ML, no physical quantum hardware.",
    docs: "/README.md",
  });
});

// --- API routes ---
app.use("/api/qds", qdsRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/threats", threatRoutes);
app.use("/api/attacks", attackRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/signature", signatureRoutes);

// --- 404 + centralized error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await connectDatabase();
  } catch (err) {
    console.error("[server] Failed to connect to MongoDB:", err.message);
    console.error(
      "[server] Set MONGO_URI in your .env file (see .env.example) and ensure MongoDB is reachable."
    );
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[server] Q-SEC backend listening on http://localhost:${PORT}`);
    console.log(`[server] Allowing frontend origin: ${FRONTEND_URL}`);
    console.log(`[server] Database connected: ${isDatabaseConnected()}`);
  });
}

// Only auto-start when run directly (not when required by tests).
if (require.main === module) {
  start();
}

module.exports = { app, start };
