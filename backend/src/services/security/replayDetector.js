/**
 * Replay attack detection — structural, not statistical.
 *
 * Every verification is tied to a Session (sessionId + one-time nonce).
 * A session/nonce may back exactly one successful verification. Reusing a
 * sessionId, nonce, or (sessionId, signatureId) pair that was already
 * consumed is a REPLAY, regardless of how "good" the resubmitted
 * measurement statistics look.
 */
const { THREAT_TYPES, SEVERITY } = require("../../utils/constants");

/**
 * @param {Object} session mongoose Session document (or null if not found)
 * @param {boolean} signatureAlreadyVerified whether this signatureId already has a stored Verification
 */
function detectReplay(session, signatureAlreadyVerified) {
  if (!session) {
    return null; // handled by unauthorized-verification checks instead
  }

  if (session.status === "CONSUMED" || signatureAlreadyVerified) {
    return {
      type: THREAT_TYPES.REPLAY,
      severity: SEVERITY.HIGH,
      riskScore: 95,
      reason: `Session "${session.sessionId}" (or its signature) has already been consumed by a prior verification. Nonce/session reuse detected.`,
      recommendedAction: "BLOCK",
      detected: true,
    };
  }

  if (session.status === "EXPIRED" || session.expiresAt < new Date()) {
    return {
      type: THREAT_TYPES.REPLAY,
      severity: SEVERITY.HIGH,
      riskScore: 80,
      reason: `Session "${session.sessionId}" nonce has expired and cannot be reused for a fresh verification.`,
      recommendedAction: "BLOCK",
      detected: true,
    };
  }

  return null;
}

module.exports = { detectReplay };
