const mongoose = require("mongoose");

/**
 * Immutable-in-spirit audit trail entry. Every significant protocol event
 * (session creation, verification outcome, threat detection, attack
 * simulation, rejected/unauthorized attempts) is logged here.
 */
const auditLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        "SESSION_CREATED",
        "SIGNATURE_CREATED",
        "SIGNATURE_VERIFICATION",
        "VERIFICATION_ACCEPTED",
        "VERIFICATION_REJECTED",
        "FORGERY_DETECTED",
        "REPLAY_DETECTED",
        "IMPERSONATION_DETECTED",
        "CHANNEL_TAMPERING_DETECTED",
        "MESSAGE_TAMPERING_DETECTED",
        "SIGNATURE_TAMPERING_DETECTED",
        "UNAUTHORIZED_ATTEMPT",
        "ATTACK_SIMULATED",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["LOW", "WARNING", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    sessionId: { type: String, default: null },
    signatureId: { type: String, default: null },
    description: { type: String, required: true },
    decision: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ eventType: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ sessionId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
