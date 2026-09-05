const Threat = require("../models/Threat");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");
const { evaluateVerification } = require("../services/statistics/statisticalEngine");
const { detectForgery } = require("../services/security/forgeryDetector");
const { detectChannelTampering } = require("../services/security/channelTamperingDetector");

/**
 * POST /api/threats/analyze
 * Standalone statistical threat analysis given raw matching/samples counts
 * (no session/identity context required). Useful for the Threat Detection
 * and Measurement Analysis pages to probe "what would this match rate mean".
 */
const analyzeThreat = asyncHandler(async (req, res) => {
  const { matching, samples } = req.body;

  if (matching === undefined || samples === undefined) {
    throw new ApiError(400, "matching and samples are required");
  }
  const m = Number(matching);
  const s = Number(samples);
  if (!Number.isInteger(m) || !Number.isInteger(s) || s <= 0 || m < 0 || m > s) {
    throw new ApiError(400, "matching/samples must be integers with 0 <= matching <= samples");
  }

  const evaluation = evaluateVerification(m, s);
  const finding = detectForgery(evaluation) || detectChannelTampering(evaluation);

  res.json({
    success: true,
    evaluation,
    threatDetected: Boolean(finding),
    ...(finding
      ? {
          type: finding.type,
          severity: finding.severity,
          riskScore: finding.riskScore,
          reason: finding.reason,
          recommendedAction: finding.recommendedAction,
        }
      : { type: "NONE", recommendedAction: "ALLOW" }),
  });
});

/**
 * GET /api/threats?limit=50&type=FORGERY
 * Lists persisted threat findings, most recent first.
 */
const listThreats = asyncHandler(async (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 50);
  const filter = {};
  if (req.query.type) filter.type = req.query.type;

  const threats = await Threat.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ success: true, count: threats.length, threats });
});

module.exports = { analyzeThreat, listThreats };
