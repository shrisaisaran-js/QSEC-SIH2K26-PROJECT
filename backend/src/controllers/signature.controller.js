const crypto = require("crypto");
const Session = require("../models/Session");
const Signature = require("../models/Signature");
const Verification = require("../models/Verification");
const Threat = require("../models/Threat");
const { generateKeyPair, signMessage, verifySignature } = require("../services/signature/keyService");
const { generateSessionId, generateNonce, generateSignatureId, formatTimestamp } = require("../utils/helpers");
const verificationEngine = require("../services/verification/verificationEngine");
const auditLogger = require("../services/audit/auditLogger");
const { QDS_CONFIG } = require("../utils/constants");

const SESSION_TTL_MS = 15 * 60 * 1000;

async function createSignature(req, res) {
  try {
    const { message, sessionId, sender, receiver } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        message: "Message is required.",
      });
    }

    if (!sessionId || !sender || !receiver) {
      return res.status(400).json({
        message: "Session ID, sender, and receiver are required.",
      });
    }

    const session = await Session.findOne({
      sessionId,
      sender,
      receiver,
      status: "ACTIVE",
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({
        message: "Invalid or expired QDS session.",
      });
    }

    const { publicKey, privateKey } = generateKeyPair();

    const signature = signMessage(message, privateKey);

    const messageHash = crypto
      .createHash("sha256")
      .update(message, "utf8")
      .digest("hex");

    const signatureId = generateSignatureId();

    const savedSignature = await Signature.create({
      signatureId,
      sessionId,
      sender,
      receiver,
      message,
      messageHash,
      signature,
      publicKey,
      basis: "Z",
      bellState: "PHI_PLUS",
      samples: QDS_CONFIG.DEFAULT_SAMPLES,
      status: "ISSUED",
    });

    return res.status(201).json({
      signatureId: savedSignature.signatureId,
      message,
      messageHash,
      signature,
      publicKey,
      sessionId,
      sender,
      receiver,
      status: savedSignature.status,
    });
  } catch (error) {
    console.error("[signature] Signing failed:", error);

    return res.status(500).json({
      message: "Failed to create digital signature.",
    });
  }
}

function verifyCreatedSignature(req, res) {
  try {
    const { message, signature, publicKey } = req.body;

    if (!message || !signature || !publicKey) {
      return res.status(400).json({
        message: "Message, signature, and public key are required.",
      });
    }

    const isValid = verifySignature(
      message,
      signature,
      publicKey
    );

    return res.status(200).json({
      message,
      valid: isValid,
    });
  } catch (error) {
    console.error("[signature] Verification failed:", error);

    return res.status(500).json({
      message: "Failed to verify digital signature.",
    });
  }
}

// ---------------------------------------------------------------------------
// POST /api/signature/live-sign
// Creates a session and generates a real signature atomically for the Live UI.
// ---------------------------------------------------------------------------
async function liveSign(req, res) {
  try {
    const { sender, receiver, message } = req.body;
    if (!sender || !receiver || !message) {
      return res.status(400).json({ success: false, message: "Missing sender, receiver, or message" });
    }

    // 1. Create Session
    const sessionId = generateSessionId();
    const nonce = generateNonce();
    const session = await Session.create({
      sessionId,
      sender,
      receiver,
      nonce,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });

    await auditLogger.logEvent({
      eventType: "SESSION_CREATED",
      severity: "LOW",
      sessionId,
      description: `Session created for live signature from ${sender} to ${receiver}`,
    });

    // 2. Generate Signature
    const { publicKey, privateKey } = generateKeyPair();
    const signature = signMessage(message, privateKey);
    const messageHash = crypto.createHash("sha256").update(message, "utf8").digest("hex");
    const signatureId = generateSignatureId();

    const savedSignature = await Signature.create({
      signatureId,
      sessionId,
      sender,
      receiver,
      message,
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
      sessionId,
      signatureId,
      description: `Real Ed25519 signature generated for message: "${message.substring(0, 30)}..."`,
      metadata: { algorithm: "Ed25519" },
    });

    return res.status(201).json({
      success: true,
      data: {
        signatureId: savedSignature.signatureId,
        sessionId,
        algorithm: "Ed25519",
        messageHash,
        publicKey,
        signature,
        status: "VALID SIGNATURE GENERATED",
        timestamp: formatTimestamp(),
      }
    });

  } catch (err) {
    console.error("[liveSign]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ---------------------------------------------------------------------------
// POST /api/signature/live-verify
// Full verification pipeline run for the Live UI.
// ---------------------------------------------------------------------------
async function liveVerify(req, res) {
  try {
    const { signatureId } = req.body;
    if (!signatureId) {
      return res.status(400).json({ success: false, message: "Missing signatureId" });
    }

    const signatureDoc = await Signature.findOne({ signatureId });
    if (!signatureDoc) {
      return res.status(404).json({ success: false, message: "Signature not found" });
    }
    const session = await Session.findOne({ sessionId: signatureDoc.sessionId });

    // 1. Check basic crypto valid
    const cryptoValid = verifySignature(signatureDoc.message, signatureDoc.signature, signatureDoc.publicKey);
    
    if (!cryptoValid) {
       // This shouldn't normally happen in the live UI unless tampered, 
       // but we handle it just in case
       return res.json({
         success: true,
         data: {
           cryptoValid: false,
           sessionValid: false,
           decision: "REJECT"
         }
       });
    }

    const signatureAlreadyVerified = Boolean(
      await Verification.exists({ signatureId })
    );

    // 2. Run QDS verification engine
    const result = verificationEngine.runVerification({
      session,
      signatureAlreadyVerified: signatureAlreadyVerified || (session && session.status === "CONSUMED"),
      requestingParticipant: signatureDoc.receiver,
      signatureId,
      basis: "Z",
      samples: QDS_CONFIG.DEFAULT_SAMPLES,
      scenario: "NORMAL",
    });

    if (session) {
      session.status = "CONSUMED";
      session.consumedAt = new Date();
      await session.save();
    }

    await Verification.create({
      sessionId: signatureDoc.sessionId,
      signatureId,
      sender: signatureDoc.sender,
      receiver: signatureDoc.receiver,
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
      requestingParticipant: signatureDoc.receiver,
    });

    if (result.threat.threatDetected) {
      const primary = result.threat.primary;
      await Threat.create({
        type: primary.type,
        severity: primary.severity,
        riskScore: primary.riskScore,
        reason: primary.reason,
        recommendedAction: primary.recommendedAction,
        sessionId: signatureDoc.sessionId,
        signatureId,
        detected: true,
      });
      await auditLogger.logEvent({
        eventType: "VERIFICATION_REJECTED",
        severity: primary.severity,
        sessionId: signatureDoc.sessionId,
        signatureId,
        description: primary.reason,
        decision: result.decision,
      });
    } else {
      await auditLogger.logEvent({
        eventType: result.decision === "ACCEPT" ? "VERIFICATION_ACCEPTED" : "VERIFICATION_REJECTED",
        severity: result.decision === "ACCEPT" ? "LOW" : "WARNING",
        sessionId: signatureDoc.sessionId,
        signatureId,
        description: `Basis [Z] statistical match rate ${result.matchRate}%. Forgery prob ${result.forgeryProbability}.`,
        decision: result.decision,
      });
    }

    return res.json({
      success: true,
      data: {
        cryptoValid: true,
        sessionValid: session && session.status === "CONSUMED" && !signatureAlreadyVerified,
        nonceValid: session ? true : false,
        qdsAnalysis: result.decision === "ACCEPT" ? "PASS" : "FAIL",
        statisticalAnalysis: result.decision === "ACCEPT" ? "PASS" : "FAIL",
        threatLevel: result.threat.threatDetected ? result.threat.primary.severity : "LOW",
        decision: result.decision,
      }
    });

  } catch (err) {
    console.error("[liveVerify]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  createSignature,
  verifyCreatedSignature,
  liveSign,
  liveVerify,
};