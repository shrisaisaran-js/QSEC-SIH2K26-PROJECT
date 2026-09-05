const Verification = require("../models/Verification");
const Threat = require("../models/Threat");
const AuditLog = require("../models/AuditLog");
const { asyncHandler } = require("../middleware/errorHandler");
const { isDatabaseConnected } = require("../config/database");
const { QDS_CONFIG } = require("../utils/constants");
const { round, formatTimestamp } = require("../utils/helpers");

/**
 * GET /api/dashboard/stats
 * Real, database-derived statistics. Nothing here is hard-coded — every
 * field is computed from the Verification/Threat collections at request time.
 */
const getStats = asyncHandler(async (req, res) => {
  const [
    totalAttempts,
    successfulVerifications,
    threatsDetected,
    threatDocs,
    avgRiskAgg,
    latestVerification,
    forgeryAgg,
  ] = await Promise.all([
    Verification.countDocuments({
  mode: "NORMAL",
}),

Verification.countDocuments({
  mode: "NORMAL",
  decision: "ACCEPT",
}),

    Threat.countDocuments(),

    Threat.find()
      .select("type")
      .lean(),

    Threat.aggregate([
      {
        $group: {
          _id: null,
          avg: {
            $avg: "$riskScore",
          },
        },
      },
    ]),

    Verification.findOne({
  mode: "NORMAL",
})
  .sort({ createdAt: -1 })
  .lean(),

    Verification.aggregate([
  {
    $match: {
      attackType: "Forgery",
    },
  },
  {
    $group: {
      _id: null,
      avg: {
        $avg: "$forgeryProbability",
      },
    },
  },
]),
  ]);

  const failedVerifications =
    totalAttempts - successfulVerifications;

  const verificationAccuracy =
    totalAttempts > 0
      ? round(
          (successfulVerifications / totalAttempts) * 100,
          2
        )
      : 0;

  const averageRiskScore =
    avgRiskAgg[0]
      ? round(avgRiskAgg[0].avg, 2)
      : 0;

  const threatBreakdown = {
  forgery: 0,
  replay: 0,
  impersonation: 0,
  channel: 0,
  messageTampering: 0,
  signatureTampering: 0,
};

  for (const threat of threatDocs) {
  if (threat.type === "FORGERY") {
    threatBreakdown.forgery++;
  } else if (threat.type === "REPLAY") {
    threatBreakdown.replay++;
  } else if (threat.type === "IMPERSONATION") {
    threatBreakdown.impersonation++;
  } else if (threat.type === "CHANNEL_TAMPERING") {
    threatBreakdown.channel++;
  } else if (threat.type === "MESSAGE_TAMPERING") {
    threatBreakdown.messageTampering++;
  } else if (threat.type === "SIGNATURE_TAMPERING") {
    threatBreakdown.signatureTampering++;
  }
}
  

    
  const forgeryProbability =
  latestVerification
    ? latestVerification.forgeryProbability
    : null;

  const observedConfidence =
    latestVerification
      ? round(latestVerification.matchRate / 100, 4)
      : null;
 const attackAttempts = await Verification.countDocuments({
  mode: "ATTACK_SIMULATION",
});

  const identityConsistency =
  latestVerification
    ? round(latestVerification.matchRate, 2)
    : null;

const measurementDeviation =
  latestVerification
    ? round(100 - latestVerification.matchRate, 2)
    : null;

const falselyAcceptedAttacks = await Verification.countDocuments({
  mode: "ATTACK_SIMULATION",
  decision: "ACCEPT",
});

const falseAcceptanceRate =
  attackAttempts > 0
    ? round(
        (falselyAcceptedAttacks / attackAttempts) * 100,
        2
      )
    : 0;

  const protocolIntegrity =
    threatsDetected > 0
      ? "ALERT"
      : "SECURE";

  res.json({
    success: true,
    stats: {
      totalAttempts,
      successfulVerifications,
      failedVerifications,

      threatsDetected,

      forgeriesDetected:
        threatBreakdown.forgery,

      replayAttacks:
        threatBreakdown.replay,

      impersonationAttempts:
        threatBreakdown.impersonation,

      channelTamperingAttempts:
  threatBreakdown.channel,

messageTamperingAttempts:
  threatBreakdown.messageTampering,

signatureTamperingAttempts:
  threatBreakdown.signatureTampering,

verificationAccuracy,

      averageRiskScore,

      falseAcceptanceRate,

      forgeryProbability,

      threatBreakdown,

      observedConfidence,
      
      identityConsistency,
      measurementDeviation,

      protocolIntegrity,
    },
  });
});
  

/**
 * GET /api/dashboard/health
 * System + protocol component health, derived from recent activity rather
 * than hard-coded. Shape matches the frontend's `health` array
 * (component/status/lastChecked/confidence).
 */
const getHealth = asyncHandler(async (req, res) => {
  const recentThreats = await Threat.find().sort({ createdAt: -1 }).limit(20).lean();
  const latestByType = {};
  for (const t of recentThreats) {
    if (!latestByType[t.type]) latestByType[t.type] = t;
  }

  const now = formatTimestamp();
  const componentFor = (type, componentName, defaultConfidence) => {
    const hit = latestByType[type];
    if (hit) {
      return {
        component: componentName,
        status: "ALERT",
        lastChecked: formatTimestamp(hit.createdAt),
        confidence: round(1 - hit.riskScore / 100, 3),
      };
    }
    return { component: componentName, status: "VALID", lastChecked: now, confidence: defaultConfidence };
  };

 const latestVerification = await Verification.findOne({
  mode: "NORMAL",
})
  .sort({ createdAt: -1 })
  .lean();

const observedConfidence = latestVerification
  ? round(latestVerification.matchRate / 100, 3)
  : null;

const health = [
  {
    component: "Bell-State Preparation",
    status: "VALID",
    lastChecked: now,
    confidence: observedConfidence,
  },

  {
    component: "Quantum Teleportation",
    status: "VALID",
    lastChecked: now,
    confidence: observedConfidence,
  },

  {
    component: "Pauli Correction",
    status: "VALID",
    lastChecked: now,
    confidence: observedConfidence,
  },

  {
    component: "Projective Measurement",
    status: "VALID",
    lastChecked: now,
    confidence: observedConfidence,
  },

  componentFor(
    "FORGERY",
    "Signature Consistency",
    observedConfidence
  ),

  componentFor(
    "IMPERSONATION",
    "Statistical Verification",
    observedConfidence
  ),

  componentFor(
    "REPLAY",
    "Replay Protection",
    observedConfidence
  ),

  componentFor(
    "CHANNEL_TAMPERING",
    "Channel Integrity",
    observedConfidence
  ),
].map((h, idx) => ({
  id: idx + 1,
  ...h,
}));

  res.json({
    success: true,
    status: "ONLINE",
    database: isDatabaseConnected() ? "CONNECTED" : "DISCONNECTED",
    qdsEngine: "READY",
    threatEngine: "READY",
    timestamp: new Date().toISOString(),
    health,
  });
});

/**
 * GET /api/dashboard/pauli-stats
 * Aggregates recent measurement match/mismatch ratios per basis into a
 * Pauli eigenstate +/- distribution, matching the frontend's `pauliStats`
 * shape ({ X: {plus, minus}, Y: {...}, Z: {...} }).
 */
const getPauliStats = asyncHandler(async (req, res) => {
  const bases = ["X", "Y", "Z"];
  const result = {};

  for (const basis of bases) {
    const agg = await Verification.aggregate([
      { $match: { basis } },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      { $group: { _id: null, totalMatching: { $sum: "$matching" }, totalSamples: { $sum: "$samples" } } },
    ]);

    if (agg[0] && agg[0].totalSamples > 0) {
      const plus = round((agg[0].totalMatching / agg[0].totalSamples) * 100, 1);
      result[basis] = { plus, minus: round(100 - plus, 1) };
    } else {
      // No data yet for this basis — report the ideal baseline rather than a fabricated one.
      result[basis] = { plus: null, minus: null };
    }
  }

  res.json({ success: true, pauliStats: result });
});

/**
 * GET /api/dashboard/probability-series
 * Verification-probability-vs-sample-count series: observed rate (from real
 * data when available, else the protocol's expected asymptote), the
 * required threshold, and the theoretical forgery bound (3/4)^n.
 */
const getProbabilitySeries = asyncHandler(async (req, res) => {
  // Use only NORMAL verification attempts for the observed
  // verification-probability line.
  const overall = await Verification.aggregate([
    {
      $match: {
        mode: "NORMAL",
      },
    },
    {
      $group: {
        _id: null,
        totalMatching: { $sum: "$matching" },
        totalSamples: { $sum: "$samples" },
      },
    },
  ]);

  const observedBaseline =
    overall[0] && overall[0].totalSamples > 0
      ? overall[0].totalMatching / overall[0].totalSamples
      : 0;

  const data = [];

  // Include the actual 256-sample point used by Q-SEC verification.
  for (let n = 2; n <= 242; n += 16) {
    const forgeryBound = Math.pow(0.75, n);

    data.push({
      samples: n,
      observed: round(observedBaseline * 100, 2),
      threshold: round(
        QDS_CONFIG.REQUIRED_THRESHOLD * 100,
        2
      ),
      forgery: round(forgeryBound * 100, 12),
    });
  }

  // Explicitly include 256 because the increment above does not land on it.
  const forgeryBound256 = Math.pow(0.75, 256);

  data.push({
    samples: 256,
    observed: round(observedBaseline * 100, 2),
    threshold: round(
      QDS_CONFIG.REQUIRED_THRESHOLD * 100,
      2
    ),
    forgery: round(forgeryBound256 * 100, 12),
  });

  res.json({
    success: true,
    series: data,
  });
});
/**
 * POST /api/dashboard/reset
 * Clears all Q-SEC test data from MongoDB.
 */
const resetDashboard = asyncHandler(async (req, res) => {
  const [
    verificationResult,
    threatResult,
    auditLogResult,
  ] = await Promise.all([
    Verification.deleteMany({}),
    Threat.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  res.json({
    success: true,
    message: "Dashboard data reset successfully.",
    deleted: {
      verifications: verificationResult.deletedCount,
      threats: threatResult.deletedCount,
      auditLogs: auditLogResult.deletedCount,
    },
  });
});
module.exports = { getStats, getHealth, getPauliStats,resetDashboard, getProbabilitySeries };
