const express = require("express");
const { listAuditLogs, getAuditLog } = require("../controllers/audit.controller");

const router = express.Router();

router.get("/", listAuditLogs);
router.get("/:id", getAuditLog);

module.exports = router;
