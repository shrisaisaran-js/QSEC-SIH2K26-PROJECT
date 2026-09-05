/**
 * Lightweight end-to-end smoke test.
 *
 * Starts the real Express app (with a real MongoDB connection — set
 * MONGO_URI, e.g. to a local/dev database) and exercises every endpoint in
 * sequence, printing PASS/FAIL for each. This is intentionally dependency-free
 * (no Jest/Mocha) so it runs with just `npm test` after `npm install`.
 *
 * Usage:
 *   MONGO_URI=mongodb://127.0.0.1:27017/qsec_test node src/tests/api.smoke.js
 */
require("dotenv").config();
process.env.PORT = process.env.PORT || "5050";
const http = require("http");
const { app, start } = require("../server");

const PORT = process.env.PORT;
let passed = 0;
let failed = 0;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "localhost",
        port: PORT,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null });
          } catch (e) {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function check(label, condition, extra) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}`, extra ?? "");
  }
}

async function run() {
  console.log("Starting Q-SEC backend smoke test...\n");

  // 1. Health check
  let res = await request("GET", "/api/dashboard/health");
  check("GET /api/dashboard/health -> 200 ONLINE", res.status === 200 && res.body.status === "ONLINE");

  // 2. Session creation
  res = await request("POST", "/api/qds/session", { sender: "Alice", receiver: "Bob" });
  check("POST /api/qds/session -> 201", res.status === 201 && res.body.success);
  const session = res.body.session;

  // 3. Bell state demo
  res = await request("POST", "/api/qds/bell-state", {});
  check("POST /api/qds/bell-state -> 200", res.status === 200 && res.body.result.bellState);

  // 4. Teleportation demo
  res = await request("POST", "/api/qds/teleportation", { basis: "Z", samples: 64 });
  check("POST /api/qds/teleportation -> 200", res.status === 200 && res.body.result.pauliCorrection);

  // 5. Measurement demo
  res = await request("POST", "/api/qds/measurement", { basis: "X", samples: 100, correctProbability: 0.9 });
  check("POST /api/qds/measurement -> 200", res.status === 200 && res.body.result.samples === 100);

  // 6. Real verification (normal, honest run simulated by omitting expected/received)
  res = await request("POST", "/api/verification", {
    sessionId: session.sessionId,
    signatureId: "QDS-TEST-00001",
    basis: "Z",
    samples: 256,
  });
  check(
    "POST /api/verification -> backend decides ACCEPT/REJECT",
    res.status === 200 && ["ACCEPT", "REJECT"].includes(res.body.verification.decision),
    res.body
  );

  // 7. Replay of the same session should now be blocked
  res = await request("POST", "/api/verification", {
    sessionId: session.sessionId,
    signatureId: "QDS-TEST-00001",
    basis: "Z",
    samples: 256,
  });
  check(
    "POST /api/verification (same session again) -> replay detected",
    res.status === 200 && res.body.verification.decision === "BLOCKED" && res.body.verification.threat.type === "REPLAY",
    res.body
  );

  // 8. Unauthorized verification (bad session)
  res = await request("POST", "/api/verification", {
    sessionId: "SESS-DOES-NOT-EXIST",
    signatureId: "QDS-TEST-00002",
  });
  check("POST /api/verification (invalid session) -> 401", res.status === 401);

  // 9. Attack simulations
  for (const type of ["forgery", "replay", "impersonation", "channel"]) {
    res = await request("POST", `/api/attacks/${type}`, {});
    check(`POST /api/attacks/${type} -> 200`, res.status === 200 && res.body.attack, res.body);
  }

  // 10. Threat analysis (ad-hoc)
  res = await request("POST", "/api/threats/analyze", { matching: 150, samples: 256 });
  check("POST /api/threats/analyze -> 200", res.status === 200 && res.body.evaluation);

  // 11. Threat listing
  res = await request("GET", "/api/threats");
  check("GET /api/threats -> array", res.status === 200 && Array.isArray(res.body.threats));

  // 12. Dashboard stats (must not be hard-coded zero after all the above activity)
  res = await request("GET", "/api/dashboard/stats");
  check(
    "GET /api/dashboard/stats -> totalAttempts > 0",
    res.status === 200 && res.body.stats.totalAttempts > 0,
    res.body
  );

  // 13. Pauli stats & probability series
  res = await request("GET", "/api/dashboard/pauli-stats");
  check("GET /api/dashboard/pauli-stats -> 200", res.status === 200 && res.body.pauliStats);

  res = await request("GET", "/api/dashboard/probability-series");
  check("GET /api/dashboard/probability-series -> 200", res.status === 200 && res.body.series.length > 0);

  // 14. Verification history
  res = await request("GET", "/api/verification/history");
  check("GET /api/verification/history -> array", res.status === 200 && Array.isArray(res.body.history));

  // 15. Audit trail
  res = await request("GET", "/api/audit");
  check("GET /api/audit -> array", res.status === 200 && Array.isArray(res.body.events));

  if (res.body.events && res.body.events.length > 0) {
    const id = res.body.events[0].id;
    res = await request("GET", `/api/audit/${id}`);
    check("GET /api/audit/:id -> 200", res.status === 200 && res.body.event);
  }

  console.log(`\n${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

start()
  .then(() => setTimeout(run, 300))
  .catch((err) => {
    console.error("Failed to start server for smoke test:", err);
    process.exit(1);
  });
