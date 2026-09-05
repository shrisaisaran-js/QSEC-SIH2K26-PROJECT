const express = require("express");
const { validateVerificationRequest } = require("../middleware/validation");
const { verifySignature, getVerificationHistory } = require("../controllers/verification.controller");

const router = express.Router();

router.post("/", validateVerificationRequest, verifySignature);
router.get("/history", getVerificationHistory);

module.exports = router;
