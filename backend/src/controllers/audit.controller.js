const AuditLog = require("../models/AuditLog");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");
const { formatTimestamp } = require("../utils/helpers");

/**
 * GET /api/audit?limit=50&eventType=REPLAY_DETECTED&severity=HIGH
 * Backs the frontend's Audit Trail page / `events` timeline.
 */
const listAuditLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(300, Number(req.query.limit) || 100);
  const filter = {};
  // Hide session-creation noise from the main Audit Trail.
//if (req.query.includeSessions !== "true" && !req.query.eventType) {
 // filter.eventType = { $ne: "SESSION_CREATED" };
//}
  if (req.query.eventType) filter.eventType = req.query.eventType;
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.sessionId) filter.sessionId = req.query.sessionId;

  const docs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

  const events = docs.map((d) => ({
    id: d._id,
    timestamp: formatTimestamp(d.createdAt),
    eventType: d.eventType,
    severity: d.severity,
    decision: d.decision,
    sessionId: d.sessionId,
    signatureId: d.signatureId,
    details: d.description,
  }));

  res.json({ success: true, count: events.length, events });
});

/**
 * GET /api/audit/:id
 */
const getAuditLog = asyncHandler(async (req, res) => {
  const doc = await AuditLog.findById(req.params.id).lean();
  if (!doc) throw new ApiError(404, "Audit log entry not found");

  res.json({
    success: true,
    event: {
      id: doc._id,
      timestamp: formatTimestamp(doc.createdAt),
      eventType: doc.eventType,
      severity: doc.severity,
      decision: doc.decision,
      sessionId: doc.sessionId,
      signatureId: doc.signatureId,
      details: doc.description,
      metadata: doc.metadata,
    },
  });
});

module.exports = { listAuditLogs, getAuditLog };
