const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema(
  {
    signatureId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    sender: {
      type: String,
      required: true,
      trim: true,
    },

    receiver: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    messageHash: {
      type: String,
      required: true,
    },

    signature: {
      type: String,
      required: true,
    },

    publicKey: {
      type: String,
      required: true,
    },

    basis: {
      type: String,
      enum: ["X", "Y", "Z"],
      required: true,
    },

    bellState: {
      type: String,
      enum: ["PHI_PLUS", "PHI_MINUS", "PSI_PLUS", "PSI_MINUS"],
      default: "PHI_PLUS",
    },

    classicalBits: {
      type: String,
      default: null,
    },

    pauliCorrection: {
      type: String,
      enum: ["I", "X", "Y", "Z"],
      default: null,
    },

    samples: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["ISSUED", "VERIFIED", "REJECTED"],
      default: "ISSUED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Signature", signatureSchema);