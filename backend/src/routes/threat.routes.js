const express = require("express");
const { analyzeThreat, listThreats } = require("../controllers/threat.controller");

const router = express.Router();

router.post("/analyze", analyzeThreat);
router.get("/", listThreats);

module.exports = router;
