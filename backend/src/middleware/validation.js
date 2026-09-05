const { ApiError } = require("./errorHandler");
const { PAULI_BASES } = require("../utils/constants");

const ATTACK_SLUGS = [
  "forgery",
  "replay",
  "impersonation",
  "channel",
  "message-tampering",
  "signature-tampering",
];

/** Generic required-field checker. Throws 400 ApiError listing all missing fields. */
function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  if (missing.length > 0) {
    throw new ApiError(400, `Missing required field(s): ${missing.join(", ")}`);
  }
}

function validateSessionCreate(req, res, next) {
  try {
    requireFields(req.body, ["sender", "receiver"]);
    if (typeof req.body.sender !== "string" || typeof req.body.receiver !== "string") {
      throw new ApiError(400, "sender and receiver must be strings");
    }
    if (req.body.sender.trim() === req.body.receiver.trim()) {
      throw new ApiError(400, "sender and receiver must be different participants");
    }
    next();
  } catch (err) {
    next(err);
  }
}

function validateBasis(basis) {
  if (basis && !PAULI_BASES.includes(basis)) {
    throw new ApiError(400, `Invalid basis "${basis}". Expected one of ${PAULI_BASES.join(", ")}`);
  }
}

function validateVerificationRequest(req, res, next) {
  try {
    requireFields(req.body, ["sessionId", "signatureId"]);
    validateBasis(req.body.basis);
    if (req.body.samples !== undefined) {
      const s = Number(req.body.samples);
      if (!Number.isInteger(s) || s <= 0 || s > 100000) {
        throw new ApiError(400, "samples must be a positive integer up to 100000");
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

function validateAttackType(req, res, next) {
  try {
    const { type } = req.params;
    if (!ATTACK_SLUGS.includes(type)) {
      throw new ApiError(400, `Invalid attack type "${type}". Expected one of ${ATTACK_SLUGS.join(", ")}`);
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requireFields,
  validateSessionCreate,
  validateBasis,
  validateVerificationRequest,
  validateAttackType,
};
