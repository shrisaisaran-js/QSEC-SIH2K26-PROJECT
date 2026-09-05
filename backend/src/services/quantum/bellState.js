/**
 * Bell-state entanglement — SOFTWARE SIMULATION ONLY.
 *
 * This module does not run on a physical quantum device or a state-vector
 * simulator library. It produces a deterministic, structured representation
 * of a Bell pair suitable for driving the QDS teleportation flow and for
 * display in the frontend's "QDS Protocol" visualizations.
 *
 * The four Bell states (in |00>,|01>,|10>,|11> basis order), for reference:
 *   PHI_PLUS  = (|00> + |11>) / sqrt(2)
 *   PHI_MINUS = (|00> - |11>) / sqrt(2)
 *   PSI_PLUS  = (|01> + |10>) / sqrt(2)
 *   PSI_MINUS = (|01> - |10>) / sqrt(2)
 */

const { BELL_STATES } = require("../../utils/constants");

const BELL_STATE_DEFINITIONS = {
  PHI_PLUS: { symbol: "|Phi+>", expression: "(|00> + |11>) / sqrt(2)" },
  PHI_MINUS: { symbol: "|Phi->", expression: "(|00> - |11>) / sqrt(2)" },
  PSI_PLUS: { symbol: "|Psi+>", expression: "(|01> + |10>) / sqrt(2)" },
  PSI_MINUS: { symbol: "|Psi->", expression: "(|01> - |10>) / sqrt(2)" },
};

/**
 * Create a simulated Bell pair used as the entanglement resource for
 * teleportation. Defaults to |Phi+> as is conventional for teleportation
 * protocols and QDS constructions built on it.
 */
function createBellState(bellState = "PHI_PLUS") {
  const key = BELL_STATES.includes(bellState) ? bellState : "PHI_PLUS";
  const def = BELL_STATE_DEFINITIONS[key];

  return {
    bellState: key,
    symbol: def.symbol,
    expression: def.expression,
    qubits: [
      { id: "qA", owner: "Alice", role: "entangled-half", basis: "computational" },
      { id: "qB", owner: "Bob", role: "entangled-half", basis: "computational" },
    ],
    entanglement: {
      type: "maximally-entangled",
      pairs: 1,
      correlation:
        "Measuring qA and qB in the same basis yields perfectly correlated (Phi) or anti-correlated (Psi) classical outcomes.",
    },
    measurementBasis: "computational (Z) at preparation time",
    simulationResult: "PREPARED",
    note:
      "Mathematical/software representation for QDS protocol simulation. Not a physical quantum computation.",
  };
}

module.exports = { createBellState, BELL_STATE_DEFINITIONS };
