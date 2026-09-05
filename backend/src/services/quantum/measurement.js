/**
 * Projective measurement simulation over Pauli eigenbases {X, Y, Z}.
 *
 * For a qubit prepared in a Pauli eigenstate and measured in the SAME basis,
 * an honest, untampered channel yields the expected eigenvalue with
 * probability close to 1 (bounded below by detector/thermal noise). An
 * attacker who does not hold the correct state/basis is, at best, guessing:
 * for a single unknown qubit measured in a mismatched basis the maximum
 * probability of reproducing the correct outcome is 3/4 (the same bound
 * used by intercept-resend analyses of BB84-family protocols).
 *
 * This module produces sampled measurement OUTCOME COUNTS (not a physical
 * simulation of wavefunction collapse) using a biased Bernoulli process
 * whose bias represents the honest/dishonest scenario being modelled.
 */

const { PAULI_BASES } = require("../../utils/constants");
const { round, seededRandom } = require("../../utils/helpers");

/**
 * @param {Object} opts
 * @param {"X"|"Y"|"Z"} opts.basis
 * @param {number} opts.samples
 * @param {number} opts.correctProbability probability each sample matches the expected eigenvalue (0-1)
 * @param {string} [opts.seed] optional seed for reproducible test runs
 */
function projectiveMeasurement({ basis, samples, correctProbability, seed }) {
  if (!PAULI_BASES.includes(basis)) {
    throw new Error(`Unsupported measurement basis: ${basis}. Expected one of X, Y, Z.`);
  }
  if (!Number.isInteger(samples) || samples <= 0) {
    throw new Error("samples must be a positive integer");
  }
  const p = Math.min(1, Math.max(0, correctProbability));

  const rand = seed ? seededRandom(seed) : Math.random;

  let matching = 0;
  for (let i = 0; i < samples; i++) {
    if (rand() < p) matching++;
  }
  const mismatching = samples - matching;

  return {
    basis,
    samples,
    correctProbabilityUsed: round(p, 4),
    outcomes: {
      "0": matching, // expected eigenvalue observed
      "1": mismatching, // opposite eigenvalue observed (error/mismatch)
    },
    matching,
    mismatching,
  };
}

module.exports = { projectiveMeasurement };
