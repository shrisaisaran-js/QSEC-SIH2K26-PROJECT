const mongoose = require("mongoose");

/**
 * A rule/statistics-based threat finding produced by the threat engine.
 */
const threatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
  "FORGERY",
  "REPLAY",
  "IMPERSONATION",
  "CHANNEL_TAMPERING",
  "MESSAGE_TAMPERING",
  "SIGNATURE_TAMPERING",
  "UNAUTHORIZED_VERIFICATION",
],
      required: true,
    },
    severity: {
      type: String,
      enum: ["LOW", "WARNING", "HIGH", "CRITICAL"],
      required: true,
    },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    reason: { type: String, required: true },
    recommendedAction: {
      type: String,
      enum: ["ALLOW", "MONITOR", "BLOCK"],
      required: true,
    },
    sessionId: { type: String, default: null, index: true },
    signatureId: { type: String, default: null, index: true },
    detected: { type: Boolean, default: true },
  },
  { timestamps: true }
);

threatSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Threat", threatSchema);
