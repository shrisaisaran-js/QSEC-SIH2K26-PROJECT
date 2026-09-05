/**
 * Quantum channel manipulation / tampering detection — statistical.
 *
 * Detects a degraded quantum channel using the observed measurement
 * error/deviation rate.
 *
 * This is a deterministic simulation rule, not an ML model and not
 * a universal security bound.
 */

const {
  THREAT_TYPES,
  SEVERITY,
  QDS_CONFIG,
  CHANNEL_STATUS,
} = require("../../utils/constants");

const { round } = require("../../utils/helpers");

/*
 * A channel attack should occupy the region between:
 *
 *   CLEAN / ACCEPTABLE
 *          ↓
 *   suspicious channel degradation
 *          ↓
 *   severe mismatch / forgery territory
 *
 * We intentionally keep the lower bound broad enough that the
 * detector does not miss a simulated channel attack simply because
 * its measured match rate falls slightly outside the previous band.
 */
const CHANNEL_BAND = {
  min: 0.5,
  max: 0.9,
};

function detectChannelTampering(evaluation) {
  if (!evaluation) return null;

  const rateFraction = Number(evaluation.matchRate || 0) / 100;

  const thresholdFraction =
    Number(QDS_CONFIG.REQUIRED_THRESHOLD) || 0.95;

  const deviationLimit =
    Number(QDS_CONFIG.CHANNEL_DEVIATION_LIMIT || 0) * 100;

  const observedDeviationPct = round(
    100 - Number(evaluation.matchRate || 0),
    2
  );

  /*
   * Clean channel:
   * match rate satisfies the normal verification threshold.
   */
  if (rateFraction >= thresholdFraction) {
    return null;
  }

  /*
   * Don't classify extremely poor measurements as channel tampering.
   * Those belong to the forgery/statistical failure territory.
   */
  if (rateFraction < CHANNEL_BAND.min) {
    return null;
  }

  /*
   * The important condition:
   * actual observed deviation must exceed the configured
   * channel-noise/deviation limit.
   */
  if (observedDeviationPct <= deviationLimit) {
    return null;
  }

  /*
   * If the statistical engine has already classified the channel
   * as SAFE, don't override that result.
   */
  if (evaluation.channelStatus === CHANNEL_STATUS.SAFE) {
    return null;
  }

  /*
   * Calculate risk from how far the observed match rate has fallen
   * below the required verification threshold.
   */
  const degradation =
    thresholdFraction - rateFraction;

  const riskScore = round(
    Math.min(
      100,
      Math.max(
        35,
        30 + degradation * 150
      )
    ),
    2
  );

  const isThreat =
    evaluation.channelStatus === CHANNEL_STATUS.THREAT ||
    observedDeviationPct >= deviationLimit * 1.5;

  return {
    type: THREAT_TYPES.CHANNEL_TAMPERING,

    severity: isThreat
      ? SEVERITY.HIGH
      : SEVERITY.WARNING,

    riskScore,

    reason:
      `Measurement deviation ${observedDeviationPct}% ` +
      `exceeds the configured channel deviation limit of ` +
      `${deviationLimit}%, indicating statistically significant ` +
      `quantum-channel degradation consistent with ` +
      `intercept-resend/channel manipulation.`,

    recommendedAction: isThreat
      ? "BLOCK"
      : "MONITOR",

    detected: true,
  };
}

module.exports = {
  detectChannelTampering,
  CHANNEL_BAND,
};