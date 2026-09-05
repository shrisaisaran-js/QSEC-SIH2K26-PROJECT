/**
 * Statistical engine — all decision math lives here, documented explicitly.
 * No AI/ML. Every function is a closed-form statistical/rule computation.
 *
 * TERMINOLOGY (kept distinct per SIH PS 26141 guidance):
 *  - SIMULATION METRIC: a number this software computes from simulated
 *    measurement samples (e.g. matchRate, statisticalDeviation).
 *  - PROTOCOL THRESHOLD: a configured cut-off this prototype uses to turn a
 *    metric into a decision (e.g. REQUIRED_THRESHOLD = 0.95).
 *  - SECURITY INTERPRETATION: what we say the metric+threshold combination
 *    suggests about the run. This is a prototype-level interpretation, not a
 *    universal, information-theoretic security proof for any real
 *    deployment.
 */

const { QDS_CONFIG, DECISION, CHANNEL_STATUS } = require("../../utils/constants");
const { round } = require("../../utils/helpers");

/**
 * matchRate = matching / totalSamples  (SIMULATION METRIC, expressed as %)
 * errorRate = 1 - matchRate            (SIMULATION METRIC, expressed as %)
 */
function computeRates(matching, totalSamples) {
  if (totalSamples <= 0) {
    return { matchRate: 0, errorRate: 100 };
  }
  const matchRate = round((matching / totalSamples) * 100, 2);
  const errorRate = round(100 - matchRate, 2);
  return { matchRate, errorRate };
}

/**
 * Prototype forgery-guessing probability.
 *
 * This is a simulation metric based on an assumed 3/4
 * per-sample guessing-success bound:
 *
 *   P_guess = (3/4)^n
 *
 * where n is the observed number of matching samples.
 *
 * IMPORTANT:
 * This is not a universal QDS security bound or a formal
 * information-theoretic security proof. Real QDS security
 * bounds are protocol-specific and depend on parameters such
 * as signature length, verification thresholds, and attack model.
 
 * guessing bound: a party without the correct quantum information succeeds
 * at reproducing a single correct outcome with probability at most 3/4.
 * Over n INDEPENDENTLY matching outcomes, the probability that all n were
 * reproduced by guessing alone is (3/4)^n. We use the OBSERVED matching
 * count as n — i.e. "how likely is it that an adversary without the correct
 * state guessed this many correct outcomes by chance".
 *
 * This is a SIMULATION METRIC illustrating the exponential security margin
 * teleportation-based QDS aims for; it is not a claim that any real
 * deployment achieves exactly this number.
 */
function calculateForgeryGuessingProbability(matching) {
  if (matching <= 0) return 1.0;

  // Probability of reproducing all observed matching outcomes
  // by independent guessing under the assumed 3/4 per-sample bound.
  // Keep the full floating-point value so very small probabilities
  // are not incorrectly displayed as zero.
  return Math.pow(0.75, matching);
}

/**
 * Statistical deviation of the observed match rate from a perfect (100%)
 * honest run, expressed in the same units as an error bar: the standard
 * deviation of a Bernoulli(matchRate) process over `samples` trials,
 * mapped to a percentage. This flags runs whose spread is inconsistent
 * with a clean channel even when the mean match rate looks acceptable.
 *
 *   deviation% = sqrt( p * (1 - p) / n ) * 100,   p = matching / n
 */
function calculateStatisticalDeviation(matching, totalSamples) {
  if (totalSamples <= 0) return 0;
  const p = matching / totalSamples;
  const deviation = Math.sqrt((p * (1 - p)) / totalSamples) * 100;
  return round(deviation, 4);
}

/**
 * PROTOCOL THRESHOLD decision: ACCEPT iff matchRate >= REQUIRED_THRESHOLD.
 * This is the deterministic acceptance rule requested by the problem
 * statement ("deterministic acceptance of legitimate signatures").
 */
function decideVerification(matchRatePercent) {
  return matchRatePercent >= QDS_CONFIG.REQUIRED_THRESHOLD * 100
    ? DECISION.ACCEPT
    : DECISION.REJECT;
}

/**
 * Three-tier SECURITY INTERPRETATION of a channel/session's measurement
 * quality, used by the channel tampering detector and threat engine:
 *   matchRate >= threshold                    -> SAFE
 *   suspiciousLowerBound <= matchRate < thresh -> SUSPICIOUS
 *   matchRate < suspiciousLowerBound           -> THREAT
 */
function classifyChannelStatus(matchRatePercent) {
  const thresholdPct = QDS_CONFIG.REQUIRED_THRESHOLD * 100;
  const suspiciousPct = QDS_CONFIG.SUSPICIOUS_LOWER_BOUND * 100;

  if (matchRatePercent >= thresholdPct) return CHANNEL_STATUS.SAFE;
  if (matchRatePercent >= suspiciousPct) return CHANNEL_STATUS.SUSPICIOUS;
  return CHANNEL_STATUS.THREAT;
}

/**
 * A 0-100 explainable risk score, built additively from named, documented
 * rule contributions (never a black-box model).
 */
function computeRiskScore({ matchRatePercent, forgeryProbability, statisticalDeviation }) {
  let score = 0;
  const contributions = [];

  const thresholdPct = QDS_CONFIG.REQUIRED_THRESHOLD * 100;
  const shortfall = Math.max(0, thresholdPct - matchRatePercent);
  const shortfallScore = round(Math.min(60, shortfall * 1.5), 2);
  score += shortfallScore;
  contributions.push({
    rule: "MATCH_RATE_SHORTFALL",
    detail: `matchRate ${matchRatePercent}% is ${round(shortfall, 2)} pts below the ${thresholdPct}% threshold`,
    points: shortfallScore,
  });

  const forgeryScore = round(Math.min(30, forgeryProbability * 30), 2);
  score += forgeryScore;
  contributions.push({
    rule: "FORGERY_PROBABILITY",
    detail: `forgeryProbability=${forgeryProbability}`,
    points: forgeryScore,
  });

  const deviationScore = round(Math.min(10, statisticalDeviation * 2), 2);
  score += deviationScore;
  contributions.push({
    rule: "STATISTICAL_DEVIATION",
    detail: `statisticalDeviation=${statisticalDeviation}`,
    points: deviationScore,
  });

  return { riskScore: round(Math.min(100, score), 2), contributions };
}

/**
 * Full statistical evaluation of a verification attempt. Pure function:
 * given matching/total samples, returns every metric the rest of the
 * system needs.
 */
function evaluateVerification(matching, totalSamples) {
  const { matchRate, errorRate } = computeRates(matching, totalSamples);

  const forgeryGuessingProbability =
    calculateForgeryGuessingProbability(matching);

  const statisticalDeviation =
    calculateStatisticalDeviation(matching, totalSamples);

  const decision = decideVerification(matchRate);
  const channelStatus = classifyChannelStatus(matchRate);

  const { riskScore, contributions } = computeRiskScore({
    matchRatePercent: matchRate,
    forgeryProbability: forgeryGuessingProbability,
    statisticalDeviation,
  });

  return {
    matching,
    mismatch: totalSamples - matching,
    samples: totalSamples,
    matchRate,
    errorRate,
    forgeryProbability: forgeryGuessingProbability,
    statisticalDeviation,
    decision,
    channelStatus,
    riskScore,
    riskContributions: contributions,
  };
}

module.exports = {
  computeRates,
  calculateForgeryGuessingProbability,
  calculateStatisticalDeviation,
  decideVerification,
  classifyChannelStatus,
  computeRiskScore,
  evaluateVerification,
};
