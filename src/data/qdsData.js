/**
 * Quantum Digital Signature (QDS) Teleportation Simulation Seed Data & Models
 * Focuses on quantum-inspired mathematical proofs, Pauli eigenstate statistics,
 * Bell-state measurements, and deterministic thresholds.
 */

// Generate random session keys and signature IDs
export const generateSessionId = () => {
  return "SESS-" + Math.floor(100000 + Math.random() * 900000);
};

export const generateSignatureId = () => {
  return "QDS-2026-" + Math.floor(10000 + Math.random() * 90000);
};

// Deterministic Forgery Probability calculator based on Bell State measurement bounds
// In QDS, an adversary (the Receiver or Verification Authority) guessing eigenstates has a maximum probability of success of 3/4 per qubit.
// For n measurement qubits, the forgery probability is (3/4)^n.
export const calculateForgeryProbability = (matchingSamples) => {
  if (matchingSamples <= 0) return 1.0;
  const prob = Math.pow(0.75, matchingSamples);
  // Round to high scientific accuracy
  return parseFloat(prob.toFixed(8));
};

// Base protocol configurations
export const QDS_CONFIGS = {
  REQUIRED_THRESHOLD: 0.95,       // 95% match rate required for acceptance
  CHANNEL_DEVIATION_LIMIT: 0.05,  // Max 5% deviation allowed before flagging channel tampering
  IDENTITY_CONSISTENCY_LIMIT: 0.95, // Max 5% error in sender identification checks
};

// Initial system statistics
export const initialEvents = [];

// Base health check of the quantum simulation environment
export const initialHealth = [];

// Statistical security chart data points (Verification Probability Analysis)
// Plots Acceptance Probability against number of measurement samples.
// Compares: Observed Rate, Required Threshold (95%), Forgery Probability (3/4^n)


// Seed dataset for verification history table
export const initialHistory = [];

// Seed dataset for chronological security alerts & actions
export const initialStats = {
  totalAttempts: 0,
  successfulVerifications: 0,
  failedVerifications: 0,
  threatsDetected: 0,

  forgeriesDetected: 0,
  replayAttacks: 0,
  impersonationAttempts: 0,
  channelTamperingAttempts: 0,
  messageTamperingAttempts: 0,
  signatureTamperingAttempts: 0,

  verificationAccuracy: 0,
  averageRiskScore: 0,
  falseAcceptanceRate: 0,

  forgeryProbability: null,
  observedConfidence: null,

  threatBreakdown: {
    forgery: 0,
    replay: 0,
    impersonation: 0,
    channel: 0,
    messageTampering: 0,
    signatureTampering: 0
  },

  identityConsistency: null,
  measurementDeviation: null,

  protocolIntegrity: "SECURE"
};

// Pauli Eigenstate Baseline distribution
export const initialPauliStats = {
  X: { plus: 0, minus: 0 },
  Y: { plus: 0, minus: 0 },
  Z: { plus: 0, minus: 0 }
};

// Generates simulated measurement states and validates outcomes deterministically
// If attack mode is active, it adds errors to represent adversarial interception, replay, or impersonation.
export const runQdsSimulation = (
  basis = "Z",
  samples = 256,
  attackType = null,
  forceFailure = false
) => {
    if (forceFailure) {
    const matching = Math.floor(samples * 0.70);
    const mismatch = samples - matching;

    return {
      basis,
      samples,
      matching,
      mismatch,
      matchRate: parseFloat(((matching / samples) * 100).toFixed(2)),
      errorRate: parseFloat(((mismatch / samples) * 100).toFixed(2)),
      forgeryProbability: calculateForgeryProbability(matching),
      expectedMeasurements: Array(samples).fill(1),
      receivedMeasurements: [
        ...Array(matching).fill(1),
        ...Array(mismatch).fill(-1),
      ],
    };
  }
  let matching = 0;

  // Determine matching samples first
  switch (attackType) {
    case "Forgery":
      matching = Math.floor(samples * (0.60 + Math.random() * 0.12));
      break;

    case "Impersonation":
      matching = Math.floor(samples * (0.50 + Math.random() * 0.15));
      break;

    case "Channel Manipulation":
      matching = Math.floor(samples * (0.75 + Math.random() * 0.08));
      break;

    case "Replay":
      matching = 0;
      break;

    default:
      // Normal secure run: approximately 96%–99.5% match rate
      matching = Math.floor(samples * (0.96 + Math.random() * 0.035));
      break;
  }

  if (matching > samples) matching = samples;

  // Generate measurements AFTER matching has been calculated
  const expectedMeasurements = Array(samples).fill(1);

  const receivedMeasurements = Array.from(
    { length: samples },
    (_, index) => index < matching ? 1 : 0
  );

  const matchRate = parseFloat(
    ((matching / samples) * 100).toFixed(2)
  );

  const forgeryProb = calculateForgeryProbability(matching);

  let decision = "REJECT";

  if (attackType === "Replay") {
    decision = "BLOCKED";
  } else if (
    matchRate >= QDS_CONFIGS.REQUIRED_THRESHOLD * 100
  ) {
    decision = "ACCEPT";
  }

  return {
    samples,
    matching,
    mismatch: samples - matching,
    matchRate,
    forgeryProbability: forgeryProb,
    decision,
    basis,
    expectedMeasurements,
    receivedMeasurements
  };
};
