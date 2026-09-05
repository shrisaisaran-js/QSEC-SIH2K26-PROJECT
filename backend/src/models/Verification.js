const mongoose = require("mongoose");

/**
 * Result of a signature verification run (real or simulated). This is the
 * backing collection for the frontend's "history" table and dashboard stats.
 */
const verificationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    signatureId: { type: String, required: true, index: true },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    basis: { type: String, enum: ["X", "Y", "Z"], required: true },
    samples: { type: Number, required: true },
    matching: { type: Number, required: true },
    mismatch: { type: Number, required: true },
    matchRate: { type: Number, required: true }, // percent, 0-100
    errorRate: { type: Number, required: true }, // percent, 0-100
    statisticalDeviation: { type: Number, required: true },
    forgeryProbability: { type: Number, required: true }, // 0-1
    decision: {
      type: String,
      enum: ["ACCEPT", "REJECT", "BLOCKED", "INVESTIGATE"],
      required: true,
    },
    mode: {
      type: String,
      enum: ["NORMAL", "ATTACK_SIMULATION"],
      default: "NORMAL",
    },
    attackType: {
  type: String,
  enum: [
    "Forgery",
    "Replay",
    "Impersonation",
    "Channel Manipulation",
    "Message Tampering",
    "Signature Tampering"
  ],
},
    requestingParticipant: { type: String, default: null },
  },
  { timestamps: true }
);

verificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Verification", verificationSchema);
