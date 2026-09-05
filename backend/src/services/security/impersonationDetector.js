/**
 * Impersonation detection — session-based authorization check.
 *
 * A verification request must originate as one of the two participants
 * bound to the session at creation time (session.sender / session.receiver).
 * If the requesting participant does not match, the request is flagged as
 * impersonation regardless of measurement statistics.
 */
const { THREAT_TYPES, SEVERITY } = require("../../utils/constants");

/**
 * @param {Object} session mongoose Session document
 * @param {string} requestingParticipant name/identifier claimed by the caller
 */
function detectImpersonation(session, requestingParticipant) {
  if (!session || !requestingParticipant) return null;

  const validParticipants = [session.sender, session.receiver];
  if (validParticipants.includes(requestingParticipant)) {
    return null;
  }

  return {
    type: THREAT_TYPES.IMPERSONATION,
    severity: SEVERITY.CRITICAL,
    riskScore: 90,
    reason: `Requesting participant "${requestingParticipant}" is not a party to session "${session.sessionId}" (expected "${session.sender}" or "${session.receiver}").`,
    recommendedAction: "BLOCK",
    detected: true,
  };
}

module.exports = { detectImpersonation };
