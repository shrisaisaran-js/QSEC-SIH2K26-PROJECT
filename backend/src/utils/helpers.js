const crypto = require("crypto");

/**
 * ID / nonce generators.
 * Formats intentionally mirror the existing frontend simulation
 * (src/data/qdsData.js) so records read naturally in the existing UI:
 *   sessionId:   "SESS-XXXXXX"
 *   signatureId: "QDS-2026-XXXXX"
 */

function generateSessionId() {
  const n = crypto.randomInt(100000, 1000000);
  return `SESS-${n}`;
}

function generateSignatureId() {
  const year = new Date().getFullYear();
  const n = crypto.randomInt(10000, 100000);
  return `QDS-${year}-${n}`;
}

/** Cryptographically secure random nonce (hex), used once per session. */
function generateNonce(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

/** HH:MM:SS (24h) string, matching the frontend's toLocaleTimeString('en-US', { hour12:false }) look. */
function formatTimestamp(date = new Date()) {
  return date.toTimeString().split(" ")[0];
}

/** Clamp a number between [min, max]. */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Round to a fixed number of decimals and return a Number (not a string). */
function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Deterministic pseudo-random generator (mulberry32) seeded from a string.
 * Used only when the caller explicitly requests deterministic/reproducible
 * simulation output (e.g. for tests). Not used for security-relevant randomness.
 */
function seededRandom(seedStr) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

module.exports = {
  generateSessionId,
  generateSignatureId,
  generateNonce,
  formatTimestamp,
  clamp,
  round,
  seededRandom,
};
