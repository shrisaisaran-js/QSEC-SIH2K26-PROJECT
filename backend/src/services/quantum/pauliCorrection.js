/**
 * Pauli correction — the classical post-processing step of quantum
 * teleportation.
 *
 * CONVENTION USED (standard teleportation protocol):
 * Alice performs a Bell-basis measurement on (her unknown-state qubit,
 * her half of the entangled pair) and obtains two classical bits (m1, m2).
 * She sends these bits to Bob over a classical channel. Bob applies a
 * correction operator to his half of the entangled pair to recover the
 * original unknown state:
 *
 *   m1 m2   correction
 *   00      I   (identity, no correction needed)
 *   01      X   (bit flip)
 *   10      Z   (phase flip)
 *   11      XZ  (bit + phase flip). Up to an irrelevant global phase this
 *               equals the Y correction: Y = iXZ, so this module reports it
 *               as "Y" for compactness while noting the XZ decomposition.
 *
 * This is a classical bookkeeping simulation of the correction step, not a
 * physical qubit operation.
 */

const { PAULI_CORRECTION_MAP } = require("../../utils/constants");

/**
 * @param {string} bits two-character string of '0'/'1', e.g. "01"
 * @returns {{bits: string, correction: string, decomposition: string[], matrix: string}}
 */
function correctionFromBits(bits) {
  if (!/^[01]{2}$/.test(bits)) {
    throw new Error(`Invalid classical bit pair for Pauli correction: "${bits}"`);
  }

  const correction = PAULI_CORRECTION_MAP[bits];
  const decomposition = bits === "11" ? ["X", "Z"] : [correction];

  const matrices = {
    I: "[[1,0],[0,1]]",
    X: "[[0,1],[1,0]]",
    Z: "[[1,0],[0,-1]]",
    Y: "[[0,-i],[i,0]] (~= XZ up to global phase)",
  };

  return {
    bits,
    correction,
    decomposition,
    matrix: matrices[correction],
  };
}

/** Deterministically derive a 2-bit classical measurement string from a signatureId. */
function bitsFromSignatureId(signatureId) {
  let hash = 0;
  for (let i = 0; i < signatureId.length; i++) {
    hash = (hash * 31 + signatureId.charCodeAt(i)) >>> 0;
  }
  const b1 = hash & 1;
  const b2 = (hash >>> 1) & 1;
  return `${b1}${b2}`;
}

module.exports = { correctionFromBits, bitsFromSignatureId, PAULI_CORRECTION_MAP };
