const AuditLog = require("../../models/AuditLog");

/**
 * Create an audit trail entry. Failures to write an audit entry are logged
 * but never thrown back at the caller — auditing must not be able to break
 * the primary request flow.
 */
async function logEvent({
  eventType,
  severity = "LOW",
  sessionId = null,
  signatureId = null,
  description,
  decision = null,
  metadata = {},
}) {
  try {
    return await AuditLog.create({
      eventType,
      severity,
      sessionId,
      signatureId,
      description,
      decision,
      metadata,
    });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err.message);
    return null;
  }
}

module.exports = { logEvent };
