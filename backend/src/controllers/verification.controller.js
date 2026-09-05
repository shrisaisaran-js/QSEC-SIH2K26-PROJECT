const Session = require("../models/Session");
const Verification = require("../models/Verification");
const Signature = require("../models/Signature");
const Threat = require("../models/Threat");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");
const auditLogger = require("../services/audit/auditLogger");
const verificationEngine = require("../services/verification/verificationEngine");
const { verifySignature: verifyDigitalSignature } = require("../services/signature/keyService");
const { QDS_CONFIG } = require("../utils/constants");
const { formatTimestamp } = require("../utils/helpers");

const THREAT_EVENT_MAP = {
  REPLAY: "REPLAY_DETECTED",
  IMPERSONATION: "IMPERSONATION_DETECTED",
  FORGERY: "FORGERY_DETECTED",
  CHANNEL_TAMPERING: "CHANNEL_TAMPERING_DETECTED",
};

/**
 * POST /api/verification
 * The backend-authoritative signature verification endpoint. Never trusts a
 * decision supplied by the frontend — always recomputes it from measurement
 * statistics and session/threat checks.
 */
const verifySignature = asyncHandler(async (req, res) => {
  const {
    sessionId,
    signatureId,
    basis = "Z",
    samples = QDS_CONFIG.DEFAULT_SAMPLES,
    expectedMeasurements,
    receivedMeasurements,
    requestingParticipant,
  } = req.body;

  const session = await Session.findOne({ sessionId });
  const signatureDoc = await Signature.findOne({
  signatureId,
  sessionId,
});
  if (!signatureDoc) {
  await auditLogger.logEvent({
    eventType: "VERIFICATION_REJECTED",
    severity: "HIGH",
    sessionId,
    signatureId: signatureId || null,
    description: "Verification rejected: digital signature was not found for this QDS session.",
    decision: "REJECT",
  });

  throw new ApiError(
    401,
    "Digital signature not found for this QDS session."
  );
}

  if (
  !session ||
  session.status === "EXPIRED" ||
  session.status === "CONSUMED" ||
  session.expiresAt < new Date()
) {
    await auditLogger.logEvent({
      eventType: "UNAUTHORIZED_ATTEMPT",
      severity: "HIGH",
      sessionId: sessionId || null,
      signatureId: signatureId || null,
      description: `Verification rejected: session "${sessionId}" is missing, invalid, or expired.`,
      decision: "REJECT",
    });
    throw new ApiError(401, "Invalid, missing, or expired session/nonce. Verification rejected.");
  }

  const signatureAlreadyVerified = Boolean(
    await Verification.exists({ signatureId, sessionId })
  );
  const cryptographicSignatureValid = verifyDigitalSignature(
  signatureDoc.message,
  signatureDoc.signature,
  signatureDoc.publicKey
);


if (!cryptographicSignatureValid) {
  await auditLogger.logEvent({
    eventType: "VERIFICATION_REJECTED",
    severity: "CRITICAL",
    sessionId,
    signatureId,
    description: "Digital signature cryptographic verification failed.",
    decision: "REJECT",
  });

  throw new ApiError(
    401,
    "Digital signature verification failed."
  );
}

  const result = verificationEngine.runVerification({
    session,
    signatureAlreadyVerified: signatureAlreadyVerified || session.status === "CONSUMED",
    requestingParticipant: requestingParticipant || session.sender,
    signatureId,
    basis,
    samples: Number(samples),
    expectedMeasurements,
    receivedMeasurements,
    scenario: "NORMAL",
  });

  const verificationDoc = await Verification.create({
    sessionId: session.sessionId,
    signatureId,
    sender: session.sender,
    receiver: session.receiver,
    basis: result.basis,
    samples: result.samples,
    matching: result.matching,
    mismatch: result.mismatch,
    matchRate: result.matchRate,
    errorRate: result.errorRate,
    statisticalDeviation: result.statisticalDeviation,
    forgeryProbability: result.forgeryProbability,
    decision: result.decision,
    mode: "NORMAL",
    requestingParticipant: requestingParticipant || session.sender,
  });

  // A session/nonce is single-use once a verification attempt completes.
  session.status = "CONSUMED";
  session.consumedAt = new Date();
  await session.save();

  if (result.threat.threatDetected) {
    const primary = result.threat.primary;
    await Threat.create({
      type: primary.type,
      severity: primary.severity,
      riskScore: primary.riskScore,
      reason: primary.reason,
      recommendedAction: primary.recommendedAction,
      sessionId: session.sessionId,
      signatureId,
      detected: true,
    });
    await auditLogger.logEvent({
      eventType: THREAT_EVENT_MAP[primary.type] || "VERIFICATION_REJECTED",
      severity: primary.severity,
      sessionId: session.sessionId,
      signatureId,
      description: primary.reason,
      decision: result.decision,
    });
  } else {
    await auditLogger.logEvent({
      eventType: result.decision === "ACCEPT" ? "VERIFICATION_ACCEPTED" : "VERIFICATION_REJECTED",
      severity: result.decision === "ACCEPT" ? "LOW" : "WARNING",
      sessionId: session.sessionId,
      signatureId,
      description: `Basis [${result.basis}] statistical match rate ${result.matchRate}% vs required ${QDS_CONFIG.REQUIRED_THRESHOLD * 100}%. All-match guessing probability ${result.forgeryProbability}.`,
      decision: result.decision,
    });
  }

  res.json({
    success: true,
    verification: {
      id: verificationDoc._id,
      sessionId: session.sessionId,
      signatureId,
      sender: session.sender,
      receiver: session.receiver,
      basis: result.basis,
      samples: result.samples,
      matching: result.matching,
      mismatch: result.mismatch,
      matchRate: result.matchRate,
      errorRate: result.errorRate,
      statisticalDeviation: result.statisticalDeviation,
      forgeryProbability: result.forgeryProbability,
      cryptographicSignatureValid: true,
      decision: result.decision,
      timestamp: formatTimestamp(verificationDoc.createdAt),
      threat: result.threat.primary
        ? {
            threatDetected: true,
            type: result.threat.primary.type,
            severity: result.threat.primary.severity,
            riskScore: result.threat.primary.riskScore,
            reason: result.threat.primary.reason,
            recommendedAction: result.threat.primary.recommendedAction,
          }
        : { threatDetected: false },
    },
  });
});

/**
 * GET /api/verification/history?limit=20
 * Backs the frontend's verification history table.
 */
const getVerificationHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 50);
  const docs = await Verification.find({ mode: "NORMAL" })
  .sort({ createdAt: -1 })
  .limit(limit)
  .lean();

  const history = docs.map((d) => ({
    signatureId: d.signatureId,
    sender: d.sender,
    receiver: d.receiver,
    basis: d.basis,
    samples: d.samples,
    matching: d.matching,
    matchRate: d.matchRate,
    forgeryProbability: d.forgeryProbability,
    decision: d.decision,
    timestamp: formatTimestamp(d.createdAt),
  }));

  res.json({ success: true, history });
});

module.exports = { verifySignature, getVerificationHistory };
