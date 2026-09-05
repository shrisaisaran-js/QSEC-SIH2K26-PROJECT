const express = require("express");
const { validateAttackType } = require("../middleware/validation");
const { simulateAttack, simulateMessageTampering, simulateSignatureTampering } = require("../controllers/attack.controller");

const router = express.Router();

router.post("/message-tampering", simulateMessageTampering);
router.post("/signature-tampering", simulateSignatureTampering);

// POST /api/attacks/forgery | replay | impersonation | channel
router.post("/:type", validateAttackType, simulateAttack);

module.exports = router;
