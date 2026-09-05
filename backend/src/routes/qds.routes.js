const express = require("express");
const { validateSessionCreate } = require("../middleware/validation");
const {
  createSession,
  getSession,
  bellStateDemo,
  teleportationDemo,
  measurementDemo,
} = require("../controllers/qds.controller");

const router = express.Router();

router.post("/session", validateSessionCreate, createSession);
router.get("/session/:sessionId", getSession);
router.post("/bell-state", bellStateDemo);
router.post("/teleportation", teleportationDemo);
router.post("/measurement", measurementDemo);

module.exports = router;
