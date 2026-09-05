const crypto = require("crypto");
const Session = require("../models/Session");
const Verification = require("../models/Verification");
const Attack = require("../models/Attack");
const Threat = require("../models/Threat");
const Signature = require("../models/Signature");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");
const auditLogger = require("../services/audit/auditLogger");
const verificationEngine = require("../services/verification/verificationEngine");
const { generateKeyPair, signMessage, verifySignature: verifyDigitalSignature } = require("../services/signature/keyService");
const { generateSessionId, generateSignatureId, generateNonce, formatTimestamp } = require("../utils/helpers");
const { QDS_CONFIG, TRACE_STAGES } = require("../utils/constants");

const SESSION_TTL_MS = 15 * 60 * 1000;

const THREAT_EVENT_MAP = {
  REPLAY: "REPLAY_DETECTED",
  IMPERSONATION: "IMPERSONATION_DETECTED",
  FORGERY: "FORGERY_DETECTED",
  CHANNEL_TAMPERING: "CHANNEL_TAMPERING_DETECTED",
  MESSAGE_TAMPERING: "MESSAGE_TAMPERING_DETECTED",
  SIGNATURE_TAMPERING: "SIGNATURE_TAMPERING_DETECTED",
};

// slug (URL segment) -> { scenario key used by the quantum simulator, narrative participants }
//
// NOTE: sender/receiver/requestingParticipant/narrative are display-facing
// identifiers only. They do not affect verification math, threat rules, or
// decision logic (see verificationEngine / threatEngine / teleportation,
// which key exclusively on `scenario`). Renamed from placeholder character
// names to neutral Q-SEC roles for UI presentation consistency.
const ATTACK_DEFINITIONS = {
  forgery: {
    scenario: "Forgery",
    sender: "Adversarial Simulation",
    receiver: "Organization B",
    requestingParticipant: "Adversarial Simulation",
    narrative: [
      "Organization A's quantum state signature submitted.",
      "Adversarial simulation intercepted the teleported states.",
      "Organization B measured states with mismatched Bell measurements.",
    ],
  },
  impersonation: {
    scenario: "Impersonation",
    sender: "Organization A",
    receiver: "Organization B",
    requestingParticipant: "Threat Actor (Impersonation Attempt)",
    narrative: [
      "Threat actor attempting to sign as Organization A.",
      "Verification basis check initiated on auxiliary states.",
      "Statistical check: identity consistency evaluated against session participants.",
    ],
  },
  channel: {
    scenario: "Channel Manipulation",
    sender: "Organization A",
    receiver: "Organization B",
    requestingParticipant: "Organization A",
    narrative: [
      "Fidelity drop observed in the quantum channel.",
      "Checking projective measurement deviation...",
      "Anomalous phase errors consistent with optical noise or eavesdropping.",
    ],
  },
  replay: {
    scenario: "Replay",
    sender: "Organization A",
    receiver: "Organization B",
    requestingParticipant: "Organization A",
    narrative: [
      "Incoming signature validation request received.",
      "Checking unique session nonce...",
      "WARNING: session ID / nonce reuse detected.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Helper: build a single trace step object
// ---------------------------------------------------------------------------
function traceStep(stage, status, detail, extra = {}) {
  return {
    stage,
    status,       // "OK" | "DETECTED" | "FAILED" | "BLOCKED" | "PASS" | "INFO"
    detail,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// Helper: create an ephemeral session for attack simulations
// ---------------------------------------------------------------------------
async function createEphemeralSession(sender, receiver) {
  return Session.create({
    sessionId: generateSessionId(),
    sender,
    receiver,
    nonce: generateNonce(),
    status: "ACTIVE",
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
}
    // Create a real signature artifact for this controlled attack simulation.
  

    

    
// ---------------------------------------------------------------------------
// POST /api/attacks/:type  (type = forgery | replay | impersonation | channel)
//
// Runs a controlled, backend-driven attack simulation through the SAME
// verification + threat-detection pipeline used for real traffic, so the
// detection shown to the frontend is genuine rather than canned.
// ---------------------------------------------------------------------------
const simulateAttack = asyncHandler(async (req, res) => {
  const slug = req.params.type;
  const def = ATTACK_DEFINITIONS[slug];

  const samples = Number(req.body.samples) || QDS_CONFIG.DEFAULT_SAMPLES;
  const basis = req.body.basis || "Z";
  let signatureId;

  const trace = [];
  trace.push(traceStep(TRACE_STAGES.ATTACK_START, "INFO",
    `Controlled attack simulation initiated: ${def.scenario}`));

  let session;
  let signatureAlreadyVerified = false;

  if (slug === "replay") {
  // Replay must reuse an already-issued/verified signature.
  // Do NOT generate a new signature for a replay attack.

  const previousVerification = await Verification.findOne({
  decision: "ACCEPT",
  signatureId: { $exists: true, $ne: null },
}).sort({ createdAt: -1 });

  if (!previousVerification) {
    throw new ApiError(
      400,
      "No previously accepted signature is available for replay simulation. Run a normal verification first."
    );
  }

  signatureId = previousVerification.signatureId;

  const existingSignature = await Signature.findOne({
    signatureId,
    sessionId: previousVerification.sessionId,
  });

  if (!existingSignature) {
    throw new ApiError(
      404,
      "The previously accepted digital signature could not be found."
    );
  }

  session = await Session.findOne({
    sessionId: previousVerification.sessionId,
  });

  if (!session) {
    throw new ApiError(
      404,
      "The session associated with the previous signature could not be found."
    );
  }

  // The first legitimate verification already consumed this session.
  // Reusing it now is the replay attack.
  signatureAlreadyVerified = true;

  trace.push(
    traceStep(
      TRACE_STAGES.SESSION_CREATED,
      "OK",
      `Reusing previously verified session ${session.sessionId} for replay simulation.`,
      {
        sessionId: session.sessionId,
        nonce: session.nonce,
      }
    )
  );

  trace.push(
    traceStep(
      TRACE_STAGES.ATTACK_MODIFICATION,
      "DETECTED",
      `Replay attempt: previously verified signature ${signatureId} is being resubmitted.`,
      {
        sessionId: session.sessionId,
        signatureId,
      }
    )
  );
} else {
    session = await createEphemeralSession(def.sender, def.receiver);

    // Create a real digital signature artifact for this controlled attack simulation.
    signatureId = generateSignatureId();

    const message = `Q-SEC ${def.scenario} attack simulation`;

    const messageHash = crypto
      .createHash("sha256")
      .update(message, "utf8")
      .digest("hex");

    const { publicKey, privateKey } = generateKeyPair();

    const digitalSignature = signMessage(message, privateKey);

    await Signature.create({
      signatureId,
      sessionId: session.sessionId,
      sender: session.sender,
      receiver: session.receiver,
      message,
      messageHash,
      signature: digitalSignature,
      publicKey,
      basis,
      bellState: "PHI_PLUS",
      classicalBits: "00",
      pauliCorrection: "I",
      samples,
      status: "ISSUED",
    });

    trace.push(traceStep(
      TRACE_STAGES.SESSION_CREATED,
      "OK",
      `Session ${session.sessionId} created for attack simulation.`,
      {
        sessionId: session.sessionId,
        nonce: session.nonce
      }
    ));

    trace.push(traceStep(
      TRACE_STAGES.ATTACK_MODIFICATION,
      "INFO",
      `Attack type "${def.scenario}" injected into verification pipeline.`,
      {
        requestingParticipant: def.requestingParticipant,
        signatureId
      }
    ));
  }

  const result = verificationEngine.runVerification({
    session,
    signatureAlreadyVerified,
    requestingParticipant: def.requestingParticipant,
    signatureId,
    basis,
    samples,
    scenario: def.scenario,
  });

  trace.push(traceStep(TRACE_STAGES.QDS_VERIFICATION, result.decision === "ACCEPT" ? "PASS" : "DETECTED",
    `QDS simulation: matchRate=${result.matchRate}%, errorRate=${result.errorRate}%, samples=${result.samples}`,
    { matchRate: result.matchRate, errorRate: result.errorRate, samples: result.samples }));

  trace.push(traceStep(TRACE_STAGES.STATISTICAL_ANALYSIS, "OK",
    `Statistical deviation=${result.statisticalDeviation}, all-match guessing probability=${result.forgeryProbability}`,
    { statisticalDeviation: result.statisticalDeviation, forgeryProbability: result.forgeryProbability }));

  if (slug !== "replay") {
    session.status = "CONSUMED";
    session.consumedAt = new Date();
    await session.save();
  }

  await Verification.create({
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
    mode: "ATTACK_SIMULATION",
    attackType: def.scenario,
    requestingParticipant: def.requestingParticipant,
  });

  const logs = [...def.narrative];
  logs.push(`Match rate: ${result.matchRate}% (Threshold: ${QDS_CONFIG.REQUIRED_THRESHOLD * 100}%).`);
  logs.push(`All-match guessing probability: ${result.forgeryProbability}.`);
  logs.push(`Status: ${result.decision} — ${result.threat.threatDetected ? "threat detected." : "no rule violation matched."}`);

  let threatRecord = null;
  if (result.threat.threatDetected) {
    const primary = result.threat.primary;
    trace.push(traceStep(TRACE_STAGES.THREAT_ENGINE, "DETECTED",
      `Threat detected: ${primary.type} — ${primary.reason}`,
      { type: primary.type, severity: primary.severity, riskScore: primary.riskScore }));
    trace.push(traceStep(TRACE_STAGES.RISK_ENGINE, "OK",
      `Risk score: ${primary.riskScore}/100 (${primary.severity})`,
      { riskScore: primary.riskScore, severity: primary.severity }));

    threatRecord = await Threat.create({
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
      eventType: THREAT_EVENT_MAP[primary.type] || "ATTACK_SIMULATED",
      severity: primary.severity,
      sessionId: session.sessionId,
      signatureId,
      description: primary.reason,
      decision: result.decision,
      metadata: { simulated: true, attackType: def.scenario },
    });
  } else {
    trace.push(traceStep(TRACE_STAGES.THREAT_ENGINE, "OK",
      "No structural threat detected by threat engine.",
      {}));
    trace.push(traceStep(TRACE_STAGES.RISK_ENGINE, "OK",
      `Statistical risk score: ${result.riskScore}/100`,
      { riskScore: result.riskScore }));
  }

  trace.push(traceStep(TRACE_STAGES.SECURITY_DECISION, result.decision,
    `Final security decision: ${result.decision}`,
    { decision: result.decision }));

  await auditLogger.logEvent({
    eventType: "ATTACK_SIMULATED",
    severity: threatRecord ? threatRecord.severity : "WARNING",
    sessionId: session.sessionId,
    signatureId,
    description: `${def.scenario} attack simulation executed. Decision: ${result.decision}.`,
    decision: result.decision,
    metadata: { attackType: def.scenario },
  });

  trace.push(traceStep(TRACE_STAGES.AUDIT_EVENT, "OK",
    "Audit event recorded in database.",
    { sessionId: session.sessionId, signatureId }));

  const attackDoc = await Attack.create({
    type: def.scenario,
    detected: result.threat.threatDetected,
    severity: threatRecord ? threatRecord.severity : "WARNING",
    riskScore: threatRecord ? threatRecord.riskScore : result.riskScore,
    decision: result.decision,
    sessionId: session.sessionId,
    signatureId,
    forgeryProbability: result.forgeryProbability,
    matchRate: result.matchRate,
    logs,
  });

  res.json({
    success: true,
    attack: {
      type: def.scenario,
      detected: attackDoc.detected,
      severity: attackDoc.severity,
      riskScore: attackDoc.riskScore,
      decision: attackDoc.decision,
      sessionId: session.sessionId,
      signatureId,
      matchRate: result.matchRate,
      forgeryProbability: result.forgeryProbability,
      logs,
      trace,
      timestamp: formatTimestamp(attackDoc.createdAt),
    },
  });
});

// ---------------------------------------------------------------------------
// POST /api/attacks/message-tampering
//
// Creates a REAL Ed25519 signature, then verifies against a TAMPERED message.
// Demonstrates that crypto.verify() fails when message bytes change.
// ---------------------------------------------------------------------------
const simulateMessageTampering = asyncHandler(async (req, res) => {
  const trace = [];
  trace.push(traceStep(TRACE_STAGES.ATTACK_START, "INFO",
    "Message Tampering attack simulation initiated (controlled, internal test only)"));

  // 1. Create session
  const session = await createEphemeralSession("Organization A", "Organization B");
  trace.push(traceStep(TRACE_STAGES.SESSION_CREATED, "OK",
    `Session ${session.sessionId} created between Organization A and Organization B.`,
    { sessionId: session.sessionId, nonce: session.nonce }));

  // 2. Generate a REAL Ed25519 key pair and sign the original message
  const originalMessage = req.body.originalMessage ||
    "Transfer authorization request #QSEC-001";
  const tamperedMessage = req.body.tamperedMessage ||
    "Transfer authorization request #QSEC-999";

  const { publicKey, privateKey } = generateKeyPair();
  const signature = signMessage(originalMessage, privateKey);
  const messageHash = crypto.createHash("sha256").update(originalMessage, "utf8").digest("hex");
  const signatureId = generateSignatureId();

  // 3. Persist the real signature
  await Signature.create({
    signatureId,
    sessionId: session.sessionId,
    sender: "Organization A",
    receiver: "Organization B",
    message: originalMessage,
    messageHash,
    signature,
    publicKey,
    basis: "Z",
    bellState: "PHI_PLUS",
    samples: QDS_CONFIG.DEFAULT_SAMPLES,
    status: "ISSUED",
  });

  await auditLogger.logEvent({
    eventType: "SIGNATURE_CREATED",
    severity: "LOW",
    sessionId: session.sessionId,
    signatureId,
    description: `Real Ed25519 signature created for message: "${originalMessage.substring(0, 50)}..."`,
    decision: null,
    metadata: { algorithm: "Ed25519", publicKey: publicKey.substring(0, 60) + "..." },
  });

  trace.push(traceStep(TRACE_STAGES.SIGNATURE_GENERATED, "OK",
    `Real Ed25519 signature generated for original message. Algorithm: Ed25519.`,
    { signatureId, algorithm: "Ed25519", messageHash: messageHash.substring(0, 16) + "..." }));

  // 4. Show the tampering
  const tamperedHash = crypto.createHash("sha256").update(tamperedMessage, "utf8").digest("hex");
  trace.push(traceStep(TRACE_STAGES.ATTACK_MODIFICATION, "DETECTED",
    `Message tampered. Original: "${originalMessage}" → Tampered: "${tamperedMessage}"`,
    {
      originalMessage,
      tamperedMessage,
      originalHash: messageHash.substring(0, 16) + "...",
      tamperedHash: tamperedHash.substring(0, 16) + "...",
    }));

  // 5. Attempt cryptographic verification with the TAMPERED message
  // crypto.verify() will return false because the signed payload no longer matches
  const cryptoValid = verifyDigitalSignature(tamperedMessage, signature, publicKey);

  trace.push(traceStep(TRACE_STAGES.CRYPTO_VERIFICATION, cryptoValid ? "OK" : "FAILED",
    cryptoValid
      ? "Cryptographic signature verification passed (unexpected)."
      : "Cryptographic signature verification FAILED — message content has been altered.",
    { cryptographicSignatureValid: cryptoValid, algorithm: "Ed25519" }));

  // 6. Run QDS / statistical layer
  const samples = QDS_CONFIG.DEFAULT_SAMPLES;
  const verResult = verificationEngine.runVerification({
    session,
    signatureAlreadyVerified: false,
    requestingParticipant: "Organization A",
    signatureId,
    basis: "Z",
    samples,
    scenario: cryptoValid ? "NORMAL" : "Forgery",
  });

  trace.push(traceStep(TRACE_STAGES.QDS_VERIFICATION, "OK",
    `QDS layer: matchRate=${verResult.matchRate}%, samples=${verResult.samples}`,
    { matchRate: verResult.matchRate, samples: verResult.samples }));
  trace.push(traceStep(TRACE_STAGES.STATISTICAL_ANALYSIS, "OK",
    `Statistical analysis: errorRate=${verResult.errorRate}%, deviation=${verResult.statisticalDeviation}`,
    { errorRate: verResult.errorRate, statisticalDeviation: verResult.statisticalDeviation }));

  // 7. Determine final decision — crypto failure always means REJECT regardless of QDS stats
  const finalDecision = !cryptoValid ? "REJECT" : verResult.decision;
  const threatType = "MESSAGE_TAMPERING";
  const riskScore = 95;

  trace.push(traceStep(TRACE_STAGES.THREAT_ENGINE, "DETECTED",
    `Threat detected: MESSAGE_TAMPERING — Ed25519 signature did not verify against tampered message.`,
    { type: threatType, severity: "CRITICAL", riskScore }));
  trace.push(traceStep(TRACE_STAGES.RISK_ENGINE, "OK",
    `Risk score: ${riskScore}/100 (CRITICAL) — cryptographic integrity violated.`,
    { riskScore, severity: "CRITICAL" }));
  trace.push(traceStep(TRACE_STAGES.SECURITY_DECISION, finalDecision,
    `Security decision: ${finalDecision} — message integrity check failed.`,
    { decision: finalDecision }));

  // 8. Consume session
  session.status = "CONSUMED";
  session.consumedAt = new Date();
  await session.save();

  // 9. Persist records
  await Verification.create({
    sessionId: session.sessionId,
    signatureId,
    sender: "Organization A",
    receiver: "Organization B",
    basis: "Z",
    samples,
    matching: verResult.matching,
    mismatch: verResult.mismatch,
    matchRate: verResult.matchRate,
    errorRate: verResult.errorRate,
    statisticalDeviation: verResult.statisticalDeviation,
    forgeryProbability: verResult.forgeryProbability,
    decision: finalDecision,
    mode: "ATTACK_SIMULATION",
    attackType: "Message Tampering",
    requestingParticipant: "Organization A",
  });

  const threat = await Threat.create({
    type: threatType,
    severity: "CRITICAL",
    riskScore,
    reason: `Message tampering detected: Ed25519 signature does not verify against the submitted message. Original message hash: ${messageHash.substring(0, 16)}... Tampered message hash: ${tamperedHash.substring(0, 16)}...`,
    recommendedAction: "BLOCK",
    sessionId: session.sessionId,
    signatureId,
    detected: true,
  });

  await auditLogger.logEvent({
    eventType: "MESSAGE_TAMPERING_DETECTED",
    severity: "CRITICAL",
    sessionId: session.sessionId,
    signatureId,
    description: `Message tampering detected. Original hash ${messageHash.substring(0, 16)} altered to ${tamperedHash.substring(0, 16)}. Cryptographic verification failed.`,
    decision: finalDecision,
    metadata: {
      simulated: true,
      attackType: "Message Tampering",
      originalMessage,
      tamperedMessage,
      originalHash: messageHash,
      tamperedHash,
      cryptoValid,
    },
  });

  trace.push(traceStep(TRACE_STAGES.AUDIT_EVENT, "OK",
    "MESSAGE_TAMPERING_DETECTED audit event recorded in database.",
    { sessionId: session.sessionId, signatureId }));

  const attackDoc = await Attack.create({
    type: "Message Tampering",
    detected: true,
    severity: "CRITICAL",
    riskScore,
    decision: finalDecision,
    sessionId: session.sessionId,
    signatureId,
    forgeryProbability: verResult.forgeryProbability,
    matchRate: verResult.matchRate,
    logs: [
      `Original message: "${originalMessage}"`,
      `Tampered message: "${tamperedMessage}"`,
      `Original hash: ${messageHash}`,
      `Tampered hash: ${tamperedHash}`,
      `Ed25519 cryptographic verification: ${cryptoValid ? "PASSED (unexpected)" : "FAILED"}`,
      `Message integrity: VIOLATED`,
      `Threat: MESSAGE_TAMPERING (CRITICAL)`,
      `Risk score: ${riskScore}/100`,
      `Decision: ${finalDecision}`,
    ],
  });

  res.json({
    success: true,
    attack: {
      type: "Message Tampering",
      detected: true,
      severity: "CRITICAL",
      riskScore,
      decision: finalDecision,
      sessionId: session.sessionId,
      signatureId,
      originalMessage,
      tamperedMessage,
      originalHash: messageHash,
      tamperedHash,
      cryptographicSignatureValid: cryptoValid,
      messageIntegrity: "VIOLATED",
      matchRate: verResult.matchRate,
      forgeryProbability: verResult.forgeryProbability,
      trace,
      logs: attackDoc.logs,
      timestamp: formatTimestamp(attackDoc.createdAt),
    },
  });
});

// ---------------------------------------------------------------------------
// POST /api/attacks/signature-tampering
//
// Creates a REAL Ed25519 signature, then verifies against a CORRUPTED signature.
// Demonstrates that crypto.verify() fails when signature bytes are altered.
// ---------------------------------------------------------------------------
const simulateSignatureTampering = asyncHandler(async (req, res) => {
  const trace = [];
  trace.push(traceStep(TRACE_STAGES.ATTACK_START, "INFO",
    "Signature Tampering attack simulation initiated (controlled, internal test only)"));

  // 1. Create session
  const session = await createEphemeralSession("Organization A", "Organization B");
  trace.push(traceStep(TRACE_STAGES.SESSION_CREATED, "OK",
    `Session ${session.sessionId} created between Organization A and Organization B.`,
    { sessionId: session.sessionId, nonce: session.nonce }));

  // 2. Generate a REAL Ed25519 signature
  const message = req.body.message || "Transfer authorization request #QSEC-001";
  const { publicKey, privateKey } = generateKeyPair();
  const validSignature = signMessage(message, privateKey);
  const messageHash = crypto.createHash("sha256").update(message, "utf8").digest("hex");
  const signatureId = generateSignatureId();

  await Signature.create({
    signatureId,
    sessionId: session.sessionId,
    sender: "Organization A",
    receiver: "Organization B",
    message,
    messageHash,
    signature: validSignature,
    publicKey,
    basis: "Z",
    bellState: "PHI_PLUS",
    samples: QDS_CONFIG.DEFAULT_SAMPLES,
    status: "ISSUED",
  });

  await auditLogger.logEvent({
    eventType: "SIGNATURE_CREATED",
    severity: "LOW",
    sessionId: session.sessionId,
    signatureId,
    description: `Real Ed25519 signature created. Signature will be tampered for this simulation.`,
    decision: null,
    metadata: { algorithm: "Ed25519" },
  });

  trace.push(traceStep(TRACE_STAGES.SIGNATURE_GENERATED, "OK",
    `Real Ed25519 signature generated. Algorithm: Ed25519.`,
    { signatureId, algorithm: "Ed25519", messageHash: messageHash.substring(0, 16) + "..." }));

  // 3. Corrupt the signature: flip a byte in the base64-decoded bytes
  const sigBytes = Buffer.from(validSignature, "base64");
  // Flip the first byte (deterministic corruption — not random)
  const tamperedBytes = Buffer.from(sigBytes);
  tamperedBytes[0] = tamperedBytes[0] ^ 0xFF; // XOR flip all bits of first byte
  const tamperedSignature = tamperedBytes.toString("base64");

  trace.push(traceStep(TRACE_STAGES.ATTACK_MODIFICATION, "DETECTED",
    `Signature bytes tampered: first byte corrupted via XOR 0xFF. Valid sig (first 16 chars): ${validSignature.substring(0, 16)}... → Tampered: ${tamperedSignature.substring(0, 16)}...`,
    {
      validSignaturePrefix: validSignature.substring(0, 20),
      tamperedSignaturePrefix: tamperedSignature.substring(0, 20),
      corruptionMethod: "XOR 0xFF on first byte",
    }));

  // 4. Attempt verification with tampered signature
  const cryptoValid = verifyDigitalSignature(message, tamperedSignature, publicKey);

  trace.push(traceStep(TRACE_STAGES.CRYPTO_VERIFICATION, cryptoValid ? "OK" : "FAILED",
    cryptoValid
      ? "Cryptographic verification passed (unexpected — signature tampering not detected)."
      : "Cryptographic signature verification FAILED — signature bytes have been altered.",
    { cryptographicSignatureValid: cryptoValid, algorithm: "Ed25519" }));

  // 5. QDS layer
  const samples = QDS_CONFIG.DEFAULT_SAMPLES;
  const verResult = verificationEngine.runVerification({
    session,
    signatureAlreadyVerified: false,
    requestingParticipant: "Organization A",
    signatureId,
    basis: "Z",
    samples,
    scenario: cryptoValid ? "NORMAL" : "Forgery",
  });

  trace.push(traceStep(TRACE_STAGES.QDS_VERIFICATION, "OK",
    `QDS layer: matchRate=${verResult.matchRate}%, samples=${verResult.samples}`,
    { matchRate: verResult.matchRate }));
  trace.push(traceStep(TRACE_STAGES.STATISTICAL_ANALYSIS, "OK",
    `Statistical: errorRate=${verResult.errorRate}%, deviation=${verResult.statisticalDeviation}`,
    { errorRate: verResult.errorRate }));

  // 6. Final decision
  const finalDecision = !cryptoValid ? "REJECT" : verResult.decision;
  const riskScore = 98;

  trace.push(traceStep(TRACE_STAGES.THREAT_ENGINE, "DETECTED",
    "Threat detected: SIGNATURE_TAMPERING — Ed25519 signature bytes have been corrupted.",
    { type: "SIGNATURE_TAMPERING", severity: "CRITICAL", riskScore }));
  trace.push(traceStep(TRACE_STAGES.RISK_ENGINE, "OK",
    `Risk score: ${riskScore}/100 (CRITICAL) — signature integrity violated.`,
    { riskScore, severity: "CRITICAL" }));
  trace.push(traceStep(TRACE_STAGES.SECURITY_DECISION, finalDecision,
    `Security decision: ${finalDecision} — signature integrity check failed.`,
    { decision: finalDecision }));

  // 7. Consume session
  session.status = "CONSUMED";
  session.consumedAt = new Date();
  await session.save();

  // 8. Persist records
  await Verification.create({
    sessionId: session.sessionId,
    signatureId,
    sender: "Organization A",
    receiver: "Organization B",
    basis: "Z",
    samples,
    matching: verResult.matching,
    mismatch: verResult.mismatch,
    matchRate: verResult.matchRate,
    errorRate: verResult.errorRate,
    statisticalDeviation: verResult.statisticalDeviation,
    forgeryProbability: verResult.forgeryProbability,
    decision: finalDecision,
    mode: "ATTACK_SIMULATION",
    attackType: "Message Tampering", // closest enum value
    requestingParticipant: "Organization A",
  });

  await Threat.create({
    type: "SIGNATURE_TAMPERING",
    severity: "CRITICAL",
    riskScore,
    reason: `Signature tampering detected: Ed25519 signature bytes were modified. The ${sigBytes.length}-byte signature failed cryptographic verification after byte corruption.`,
    recommendedAction: "BLOCK",
    sessionId: session.sessionId,
    signatureId,
    detected: true,
  });

  await auditLogger.logEvent({
    eventType: "SIGNATURE_TAMPERING_DETECTED",
    severity: "CRITICAL",
    sessionId: session.sessionId,
    signatureId,
    description: `Signature tampering detected. Signature bytes corrupted; Ed25519 cryptographic verification failed. Decision: ${finalDecision}.`,
    decision: finalDecision,
    metadata: {
      simulated: true,
      attackType: "Signature Tampering",
      algorithm: "Ed25519",
      cryptoValid,
      corruptionMethod: "XOR 0xFF on first byte",
    },
  });

  trace.push(traceStep(TRACE_STAGES.AUDIT_EVENT, "OK",
    "SIGNATURE_TAMPERING_DETECTED audit event recorded in database.",
    { sessionId: session.sessionId, signatureId }));

  const attackDoc = await Attack.create({
    type: "Signature Tampering",
    detected: true,
    severity: "CRITICAL",
    riskScore,
    decision: finalDecision,
    sessionId: session.sessionId,
    signatureId,
    forgeryProbability: verResult.forgeryProbability,
    matchRate: verResult.matchRate,
    logs: [
      `Message: "${message}"`,
      `Valid Ed25519 signature generated: ${validSignature.substring(0, 32)}...`,
      `Signature tampered: first byte XOR 0xFF → ${tamperedSignature.substring(0, 32)}...`,
      `Cryptographic verification: ${cryptoValid ? "PASSED (unexpected)" : "FAILED"}`,
      `Signature integrity: VIOLATED`,
      `Threat: SIGNATURE_TAMPERING (CRITICAL)`,
      `Risk score: ${riskScore}/100`,
      `Decision: ${finalDecision}`,
    ],
  });

  res.json({
    success: true,
    attack: {
      type: "Signature Tampering",
      detected: true,
      severity: "CRITICAL",
      riskScore,
      decision: finalDecision,
      sessionId: session.sessionId,
      signatureId,
      message,
      validSignaturePrefix: validSignature.substring(0, 32) + "...",
      tamperedSignaturePrefix: tamperedSignature.substring(0, 32) + "...",
      corruptionMethod: "XOR 0xFF on first byte (deterministic)",
      cryptographicSignatureValid: cryptoValid,
      signatureIntegrity: "VIOLATED",
      matchRate: verResult.matchRate,
      forgeryProbability: verResult.forgeryProbability,
      trace,
      logs: attackDoc.logs,
      timestamp: formatTimestamp(attackDoc.createdAt),
    },
  });
});

module.exports = { simulateAttack, simulateMessageTampering, simulateSignatureTampering, ATTACK_DEFINITIONS };
