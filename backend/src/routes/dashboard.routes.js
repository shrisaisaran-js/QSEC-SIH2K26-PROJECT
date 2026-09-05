const express = require("express");
const {
  getStats,
  getHealth,
  getPauliStats,
  getProbabilitySeries,
  resetDashboard,
} = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/stats", getStats);
router.get("/health", getHealth);
router.get("/pauli-stats", getPauliStats);
router.post("/reset", resetDashboard);
router.get("/probability-series", getProbabilitySeries);

module.exports = router;
