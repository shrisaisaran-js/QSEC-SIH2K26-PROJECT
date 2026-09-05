/**
 * Threat engine — orchestrates the individual rule/statistics-based
 * detectors and returns a prioritized list of findings. No AI/ML anywhere
 * in this pipeline; every finding traces to an explicit rule.
 *
 * Priority order:
 *   1. REPLAY (structural — nonce/session reuse) — checked first because a
 *      replayed request should never be evaluated on its measurement merits.
 *   2. IMPERSONATION (structural — session participant mismatch).
 *   3. FORGERY (statistical — matchRate in the guessing band).
 *   4. CHANNEL_TAMPERING (statistical — degraded-but-not-guessing band).
 * A single verification attempt is reported with its single most relevant
 * finding; all findings that fire are still returned in `all` for auditing.
 */
const { detectReplay } = require("./replayDetector");
const { detectImpersonation } = require("./impersonationDetector");
const { detectForgery } = require("./forgeryDetector");
const { detectChannelTampering } = require("./channelTamperingDetector");

/**
 * @param {Object} ctx
 * @param {Object|null} ctx.session
 * @param {boolean} ctx.signatureAlreadyVerified
 * @param {string|null} ctx.requestingParticipant
 * @param {Object} ctx.evaluation output of statisticalEngine.evaluateVerification
 * @param {string} ctx.scenario
 */
function analyze(ctx) {
  const findings = [];

  const replay = detectReplay(ctx.session, ctx.signatureAlreadyVerified);
  if (replay) findings.push(replay);

  const impersonation = detectImpersonation(ctx.session, ctx.requestingParticipant);
  if (impersonation) findings.push(impersonation);

  // Only run statistical detectors if no structural violation already fired,
  // to avoid attributing a replayed/impersonated request to the wrong cause.
  if (
  findings.length === 0 &&
  ctx.evaluation &&
  ctx.scenario !== "NORMAL"
) {
  const forgery = detectForgery(ctx.evaluation);
  if (forgery) findings.push(forgery);

  if (findings.length === 0) {
    const channel = detectChannelTampering(ctx.evaluation);
    if (channel) findings.push(channel);
  }
}

  const primary = findings[0] || null;

  return {
    threatDetected: Boolean(primary),
    primary,
    all: findings,
  };
}

module.exports = { analyze };
