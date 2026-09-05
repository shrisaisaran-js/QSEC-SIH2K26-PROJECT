/**
 * Protocol-level constants for the QDS simulation and threat-detection rules.
 * These are SIMULATION THRESHOLDS chosen for this prototype, not universal
 * cryptographic guarantees. See README section "Scientific Accuracy & Limitations".
 */
const QDS_CONFIG = {
  // Minimum match rate (matching / samples) required to ACCEPT a signature.
  REQUIRED_THRESHOLD: 0.95,
  // Max allowed deviation in measurement distribution before flagging channel tampering.
  CHANNEL_DEVIATION_LIMIT: 0.05,
  // Max allowed error in sender/receiver identity consistency checks.
  IDENTITY_CONSISTENCY_LIMIT: 0.95,
  // Match-rate band that is neither clearly safe nor clearly an attack -> SUSPICIOUS.
  SUSPICIOUS_LOWER_BOUND: 0.85,
  // Default number of projective measurement samples.
  DEFAULT_SAMPLES: 256,
};

const PAULI_BASES = ["X", "Y", "Z"];

const BELL_STATES = ["PHI_PLUS", "PHI_MINUS", "PSI_PLUS", "PSI_MINUS"];

// 2-classical-bit -> Pauli correction mapping used by Bob after teleportation's
// Bell measurement (standard teleportation convention, documented in
// services/quantum/pauliCorrection.js).
const PAULI_CORRECTION_MAP = {
  "00": "I",
  "01": "X",
  "10": "Z",
  "11": "Y", // XZ applied (global phase aside) == Y correction
};

const THREAT_TYPES = {
  FORGERY: "FORGERY",
  REPLAY: "REPLAY",
  IMPERSONATION: "IMPERSONATION",
  CHANNEL_TAMPERING: "CHANNEL_TAMPERING",
  MESSAGE_TAMPERING: "MESSAGE_TAMPERING",
  SIGNATURE_TAMPERING: "SIGNATURE_TAMPERING",
  UNAUTHORIZED_VERIFICATION: "UNAUTHORIZED_VERIFICATION",
  NONE: "NONE",
};

const SEVERITY = {
  LOW: "LOW",
  WARNING: "WARNING",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

const DECISION = {
  ACCEPT: "ACCEPT",
  REJECT: "REJECT",
  BLOCKED: "BLOCKED",
  INVESTIGATE: "INVESTIGATE",
};

const CHANNEL_STATUS = {
  SAFE: "SAFE",
  SUSPICIOUS: "SUSPICIOUS",
  THREAT: "THREAT",
};

const AUDIT_EVENT_TYPES = {
  SESSION_CREATED: "SESSION_CREATED",
  SIGNATURE_CREATED: "SIGNATURE_CREATED",
  SIGNATURE_VERIFICATION: "SIGNATURE_VERIFICATION",
  VERIFICATION_ACCEPTED: "VERIFICATION_ACCEPTED",
  VERIFICATION_REJECTED: "VERIFICATION_REJECTED",
  FORGERY_DETECTED: "FORGERY_DETECTED",
  REPLAY_DETECTED: "REPLAY_DETECTED",
  IMPERSONATION_DETECTED: "IMPERSONATION_DETECTED",
  CHANNEL_TAMPERING_DETECTED: "CHANNEL_TAMPERING_DETECTED",
  MESSAGE_TAMPERING_DETECTED: "MESSAGE_TAMPERING_DETECTED",
  SIGNATURE_TAMPERING_DETECTED: "SIGNATURE_TAMPERING_DETECTED",
  UNAUTHORIZED_ATTEMPT: "UNAUTHORIZED_ATTEMPT",
  ATTACK_SIMULATED: "ATTACK_SIMULATED",
};

const ATTACK_TYPES = [
  "Forgery",
  "Replay",
  "Impersonation",
  "Channel Manipulation",
  "Message Tampering",
  "Signature Tampering",
];

// Attack trace stage labels — used by all attack endpoints to produce a uniform timeline.
const TRACE_STAGES = {
  ATTACK_START: "ATTACK_START",
  SESSION_CREATED: "SESSION_CREATED",
  SIGNATURE_GENERATED: "SIGNATURE_GENERATED",
  ATTACK_MODIFICATION: "ATTACK_MODIFICATION",
  CRYPTO_VERIFICATION: "CRYPTO_VERIFICATION",
  QDS_VERIFICATION: "QDS_VERIFICATION",
  STATISTICAL_ANALYSIS: "STATISTICAL_ANALYSIS",
  THREAT_ENGINE: "THREAT_ENGINE",
  RISK_ENGINE: "RISK_ENGINE",
  SECURITY_DECISION: "SECURITY_DECISION",
  AUDIT_EVENT: "AUDIT_EVENT",
};

module.exports = {
  QDS_CONFIG,
  PAULI_BASES,
  BELL_STATES,
  PAULI_CORRECTION_MAP,
  THREAT_TYPES,
  SEVERITY,
  DECISION,
  CHANNEL_STATUS,
  AUDIT_EVENT_TYPES,
  ATTACK_TYPES,
  TRACE_STAGES,
};
