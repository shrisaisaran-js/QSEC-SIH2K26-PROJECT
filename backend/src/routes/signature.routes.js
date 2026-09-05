const express = require("express");
const {
  createSignature,
  verifyCreatedSignature,
  liveSign,
  liveVerify,
} = require("../controllers/signature.controller");

const router = express.Router();

router.post("/live-sign", liveSign);
router.post("/live-verify", liveVerify);

router.post("/", createSignature);
router.post("/verify", verifyCreatedSignature);

module.exports = router;