const mongoose = require("mongoose");

/**
 * A QDS session between a sender and receiver. Holds the nonce used to
 * defend against replay attacks and the participants used to defend
 * against impersonation.
 */
const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    sender: { type: String, required: true, trim: true },
    receiver: { type: String, required: true, trim: true },
    nonce: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["ACTIVE", "CONSUMED", "EXPIRED"],
      default: "ACTIVE",
    },
    // A nonce/session should only back a successful verification once.
    consumedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

sessionSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model("Session", sessionSchema);
