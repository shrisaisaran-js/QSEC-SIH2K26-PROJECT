const mongoose = require("mongoose");

/**
 * A controlled attack simulation run, triggered from the Attack Simulation
 * sandbox in the frontend.
 */
const attackSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
  "Forgery",
  "Replay",
  "Impersonation",
  "Channel Manipulation",
  "Message Tampering",
  "Signature Tampering"
],
      required: true,
    },
    detected: { type: Boolean, required: true },
    severity: {
      type: String,
      enum: ["LOW", "WARNING", "HIGH", "CRITICAL"],
      required: true,
    },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    decision: {
      type: String,
      enum: ["ACCEPT", "REJECT", "BLOCKED", "INVESTIGATE"],
      required: true,
    },
    sessionId: { type: String, default: null },
    signatureId: { type: String, default: null },
    forgeryProbability: { type: Number, default: null },
    matchRate: { type: Number, default: null },
    logs: { type: [String], default: [] },
  },
  { timestamps: true }
);

attackSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Attack", attackSchema);
