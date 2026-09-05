/**
 * Quantum teleportation simulation, orchestrating the standard flow:
 *
 *   Alice's unknown state
 *          |
 *   Entangled Bell pair (Alice/Bob)
 *          |
 *   Alice: Bell-basis measurement -> 2 classical bits
 *          |
 *   Classical channel: bits sent to Bob
 *          |
 *   Bob: Pauli correction applied using the bits
 *          |
 *   Bob: reconstructed state, verified via projective measurement
 *
 * This is a mathematical/software simulation intended for the QDS
 * prototype's signature verification flow. It does not run on quantum
 * hardware or a full state-vector simulator.
 *
 * "correctProbability" models how faithfully the reconstructed state matches
 * the original when measured in the agreed basis: ~1 for an honest run,
 * degraded for the attack scenarios used by the Attack Simulation sandbox
 * (bounded, in the worst case, by the 3/4 optimal-guessing bound of a party
 * without the correct quantum information).
 */

const { createBellState } = require("./bellState");
const { correctionFromBits, bitsFromSignatureId } = require("./pauliCorrection");
const { projectiveMeasurement } = require("./measurement");
const { round, seededRandom } = require("../../utils/helpers");

// Scenario -> [min, max] probability that a sample reproduces the honest outcome.
// Ranges reflect the fact that a party without the correct quantum state/basis
// is, at best, guessing (bounded above by ~3/4 per the no-cloning / optimal
// intercept-resend guessing bound referenced in the problem statement).
const SCENARIO_RANGES = {
  NORMAL: [0.96, 0.995],
  Forgery: [0.6, 0.72],
  Impersonation: [0.5, 0.65],
  "Channel Manipulation": [0.75, 0.83],
  // Replay is handled separately (blocked pre-measurement by nonce reuse),
  // but if measurement is still requested we treat it as fully invalid.
  Replay: [0, 0],
};

function scenarioCorrectProbability(scenario, seed) {
  const [min, max] = SCENARIO_RANGES[scenario] || SCENARIO_RANGES.NORMAL;

  const rand = seed ? seededRandom(`${seed}:probability`) : Math.random;

  return min + rand() * (max - min);
}

/**
 * Run a full simulated teleportation + verification-measurement round.
 * @param {Object} opts
 * @param {string} opts.signatureId
 * @param {"X"|"Y"|"Z"} opts.basis
 * @param {number} opts.samples
 * @param {"NORMAL"|"Forgery"|"Impersonation"|"Channel Manipulation"|"Replay"} [opts.scenario]
 * @param {string} [opts.seed] optional deterministic seed for reproducible test runs
 */
function simulateTeleportation({ signatureId, basis, samples, scenario = "NORMAL", seed }) {
  const bell = createBellState("PHI_PLUS");
  const bits = bitsFromSignatureId(signatureId || `${basis}-${samples}-${Date.now()}`);
  const pauli = correctionFromBits(bits);

  const correctProbability = scenarioCorrectProbability(scenario, seed);
  const measurement = projectiveMeasurement({
    basis,
    samples,
    correctProbability,
    seed,
  });

  return {
    steps: [
      "Alice holds an unknown quantum state to be signed/teleported.",
      `Bell pair prepared: ${bell.symbol} (${bell.expression}).`,
      `Alice performs a Bell-basis measurement, obtaining classical bits "${bits}".`,
      "Classical bits transmitted to Bob over an authenticated classical channel.",
      `Bob applies Pauli correction "${pauli.correction}" (${pauli.decomposition.join(" then ")}) to his half of the pair.`,
      `Bob's reconstructed state is verified via projective measurement in the ${basis} basis over ${samples} samples.`,
    ],
    bellState: bell,
    classicalBits: bits,
    pauliCorrection: pauli,
    measurement,
    scenario,
  };
}

module.exports = { simulateTeleportation, scenarioCorrectProbability, SCENARIO_RANGES };
