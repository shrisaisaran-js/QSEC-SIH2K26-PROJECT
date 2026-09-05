const Session = require("../models/Session");
const { generateSessionId, generateNonce } = require("../utils/helpers");
const { QDS_CONFIG } = require("../utils/constants");
const { asyncHandler } = require("../middleware/errorHandler");
const auditLogger = require("../services/audit/auditLogger");
const { createBellState } = require("../services/quantum/bellState");
const { simulateTeleportation } = require("../services/quantum/teleportation");
const { projectiveMeasurement } = require("../services/quantum/measurement");

const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * POST /api/qds/session
 * Creates a new QDS session (sender/receiver pair) with a fresh,
 * cryptographically secure nonce. Mirrors the frontend's generateSessionId().
 */
const createSession = asyncHandler(async (req, res) => {
  const { sender, receiver } = req.body;

  const sessionId = generateSessionId();
  const nonce = generateNonce();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const session = await Session.create({
    sessionId,
    sender: sender.trim(),
    receiver: receiver.trim(),
    nonce,
    status: "ACTIVE",
    expiresAt,
  });

  await auditLogger.logEvent({
    eventType: "SESSION_CREATED",
    severity: "LOW",
    sessionId: session.sessionId,
    description: `Session created between "${session.sender}" and "${session.receiver}".`,
    metadata: { expiresAt },
  });

  res.status(201).json({
    success: true,
    session: {
      sessionId: session.sessionId,
      sender: session.sender,
      receiver: session.receiver,
      nonce: session.nonce,
      status: session.status,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    },
  });
});

/**
 * GET /api/qds/session/:sessionId
 * Fetch a session's current state (used to display session status in UI).
 */
const getSession = asyncHandler(async (req, res) => {
  const session = await Session.findOne({ sessionId: req.params.sessionId });
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }
  res.json({ success: true, session });
});

/**
 * POST /api/qds/bell-state
 * Demonstration endpoint returning a simulated Bell-state entanglement
 * structure, for the "QDS Protocol" visualization page.
 */
const bellStateDemo = asyncHandler(async (req, res) => {
  const bellState = req.body.bellState || "PHI_PLUS";
  res.json({ success: true, result: createBellState(bellState) });
});

/**
 * POST /api/qds/teleportation
 * Demonstration endpoint running the full teleportation simulation flow
 * (Bell pair -> Bell measurement -> classical bits -> Pauli correction ->
 * projective measurement verification) for the protocol visualization page.
 */
const teleportationDemo = asyncHandler(async (req, res) => {
  const { signatureId = "DEMO", basis = "Z", samples = QDS_CONFIG.DEFAULT_SAMPLES, scenario = "NORMAL" } = req.body;
  const result = simulateTeleportation({ signatureId, basis, samples: Number(samples), scenario });
  res.json({ success: true, result });
});

/**
 * POST /api/qds/measurement
 * Demonstration endpoint for standalone projective measurement sampling.
 */
const measurementDemo = asyncHandler(async (req, res) => {
  const { basis = "Z", samples = QDS_CONFIG.DEFAULT_SAMPLES, correctProbability = 0.97 } = req.body;
  const result = projectiveMeasurement({
    basis,
    samples: Number(samples),
    correctProbability: Number(correctProbability),
  });
  res.json({ success: true, result });
});

module.exports = { createSession, getSession, bellStateDemo, teleportationDemo, measurementDemo };
