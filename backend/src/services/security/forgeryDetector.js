/**
 * Forgery detection — statistical, based on the verification engine's
 * evaluated matchRate / forgeryProbability / statisticalDeviation.
 *
 * A forged signature is one submitted without knowledge of the correct
 * quantum state/basis; the submitter can do no better than guessing, which
 * (per the problem statement's Pauli-eigenstate bound) tops out around 3/4
 * per measurement. We treat a REJECTed run whose matchRate falls in the
 * "guessing" band as a forgery attempt rather than ordinary channel noise.
 */
const { THREAT_TYPES, SEVERITY, QDS_CONFIG } = require("../../utils/constants");
const { round } = require("../../utils/helpers");

const FORGERY_BAND = { min: 0.5, max: 0.73 }; // matchRate fraction typical of guessing-based forgery

function detectForgery(evaluation) {
  const rateFraction = evaluation.matchRate / 100;
  const thresholdFraction = QDS_CONFIG.REQUIRED_THRESHOLD;

  if (rateFraction >= thresholdFraction) return null; // accepted run, not a forgery
  if (rateFraction < FORGERY_BAND.min || rateFraction > FORGERY_BAND.max) return null;

  const severity = evaluation.forgeryProbability > 0.5 ? SEVERITY.HIGH : SEVERITY.CRITICAL;
  // Note: forgeryProbability shrinks with more matching samples (0.75^matching),
  // so a HIGH match count with a still-failing rate is the most suspicious case.
  const riskScore = round(
    Math.min(100, 40 + (thresholdFraction - rateFraction) * 200),
    2
  );

  return {
    type: THREAT_TYPES.FORGERY,
    severity: riskScore >= 85 ? SEVERITY.CRITICAL : severity,
    riskScore,
    reason: `Match rate ${evaluation.matchRate}% falls in the guessing-consistent band (below the ${thresholdFraction * 100}% threshold), indicating the submitted measurements were not produced from the genuine teleported state.`,
    recommendedAction: "BLOCK",
    detected: true,
  };
}

module.exports = { detectForgery, FORGERY_BAND };
