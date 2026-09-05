# Q-SEC Backend

Backend for **Q-SEC** — a quantum-inspired cyber threat detection system for
teleportation-based **Quantum Digital Signature (QDS)** protocols, built for
**SIH Problem Statement 26141** ("Quantum-Inspired Cyber Threat Detection for
Digital Signature Security", Egreen Quanta).

This backend is designed to be dropped directly into the existing Q-SEC
React/Vite frontend repository as a `backend/` folder and run **separately**
from the frontend (`npm run dev` in `backend/`, `npm run dev` in the frontend
root, at the same time). **No frontend files are modified.**

> **Scientific accuracy statement:** This is a **software simulator**. It
> mathematically models Bell-state entanglement, quantum teleportation,
> Pauli correction, and projective measurement, and it detects threats using
> deterministic, rule/statistics-based logic — **no AI or machine learning**
> anywhere in the pipeline. It does **not** run on physical quantum hardware
> or a full quantum state-vector simulator, and it does **not** claim
> unconditional/information-theoretic security for any real deployment. See
> [§18 Limitations](#18-limitations--scientific-honesty) for the precise
> boundary between "simulation metric", "protocol threshold", and "security
> interpretation".

---

## 1. Backend Purpose

The frontend (`QdsContext.jsx` + `src/data/qdsData.js`) currently *simulates*
QDS verification, threat detection, and attack scenarios entirely in
client-side JavaScript with `Math.random()`. This backend replaces that
local simulation with a real Node/Express/MongoDB service that:

- Issues QDS sessions with cryptographically secure nonces.
- Simulates the teleportation-based QDS flow (Bell state → Bell measurement
  → Pauli correction → projective measurement).
- Makes the **final ACCEPT/REJECT/BLOCKED decision itself** — it never
  trusts a decision sent by the frontend.
- Detects **forgery, replay, impersonation, and quantum channel
  tampering** using explicit, documented statistical/rule thresholds.
- Persists every verification, threat, attack simulation, and audit event
  to MongoDB, and serves real (non-hard-coded) dashboard statistics.

## 2. Architecture

```
Frontend (React/Vite, unmodified)
        │  REST (fetch/axios)
        ▼
Express app (src/server.js)
        │
        ├── routes/        → HTTP endpoint definitions
        ├── controllers/    → request parsing, orchestration, response shaping
        ├── services/
        │     ├── quantum/      → Bell state, teleportation, Pauli correction, measurement
        │     ├── statistics/   → all decision math (documented formulas)
        │     ├── security/     → forgery/replay/impersonation/channel detectors + threatEngine
        │     ├── verification/ → verificationEngine (orchestrates quantum + statistics + security)
        │     └── audit/        → auditLogger
        ├── middleware/     → centralized error handling + input validation
        ├── models/         → Mongoose schemas
        └── config/         → MongoDB connection
        │
        ▼
   MongoDB
```

Clean separation is maintained: routes never touch Mongoose models directly
except through controllers; controllers never contain quantum/statistical
math directly; all decision-making math lives in `services/statistics` and
`services/security`, fully documented inline.

## 3. Folder Structure

```
backend/
├── src/
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── Session.js
│   │   ├── Signature.js
│   │   ├── Verification.js
│   │   ├── Threat.js
│   │   ├── Attack.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── qds.routes.js
│   │   ├── verification.routes.js
│   │   ├── threat.routes.js
│   │   ├── attack.routes.js
│   │   ├── dashboard.routes.js
│   │   └── audit.routes.js
│   ├── controllers/
│   │   ├── qds.controller.js
│   │   ├── verification.controller.js
│   │   ├── threat.controller.js
│   │   ├── attack.controller.js
│   │   ├── dashboard.controller.js
│   │   └── audit.controller.js
│   ├── services/
│   │   ├── quantum/
│   │   │   ├── bellState.js
│   │   │   ├── teleportation.js
│   │   │   ├── pauliCorrection.js
│   │   │   └── measurement.js
│   │   ├── verification/
│   │   │   └── verificationEngine.js
│   │   ├── security/
│   │   │   ├── threatEngine.js
│   │   │   ├── forgeryDetector.js
│   │   │   ├── replayDetector.js
│   │   │   ├── impersonationDetector.js
│   │   │   └── channelTamperingDetector.js
│   │   ├── statistics/
│   │   │   └── statisticalEngine.js
│   │   └── audit/
│   │       └── auditLogger.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/
│   │   ├── helpers.js
│   │   └── constants.js
│   └── tests/
│       └── api.smoke.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 4. Installation

```bash
# from the root of your Q-SEC project, after placing this folder as backend/
cd backend
npm install
```

## 5. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/qsec
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=300
```

No real credentials are committed anywhere in this repository — `.env` is
git-ignored, and `.env.example` only contains placeholders.

## 6. MongoDB Setup

Any of the following work:

- **Local MongoDB Community Server**: install per
  [MongoDB's official docs](https://www.mongodb.com/docs/manual/installation/)
  for your OS, then use `MONGO_URI=mongodb://127.0.0.1:27017/qsec`.
- **Docker**: `docker run -d -p 27017:27017 --name qsec-mongo mongo:7`
- **MongoDB Atlas** (free tier): create a cluster, add your IP to the
  network access list, and copy the provided `mongodb+srv://...` connection
  string into `MONGO_URI`.

Collections (`sessions`, `signatures`, `verifications`, `threats`,
`attacks`, `auditlogs`) are created automatically on first write — no
manual schema setup is required.

## 7. How to Run

```bash
npm run dev      # nodemon, auto-restarts on file changes
# or
npm start        # plain node
```

On success you'll see:

```
[database] MongoDB connection established
[server] Q-SEC backend listening on http://localhost:5000
[server] Allowing frontend origin: http://localhost:5173
[server] Database connected: true
```

The frontend (`npm run dev` in the project root, default `http://localhost:5173`)
can now call the API directly — CORS is configured via `FRONTEND_URL`.

## 8. API Endpoints

All endpoints are prefixed with `/api`. All responses are JSON with a
top-level `success: boolean`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/qds/session` | Create a QDS session (sender/receiver + nonce) |
| GET | `/api/qds/session/:sessionId` | Fetch a session |
| POST | `/api/qds/bell-state` | Bell-state entanglement demo |
| POST | `/api/qds/teleportation` | Full teleportation simulation demo |
| POST | `/api/qds/measurement` | Standalone projective measurement demo |
| POST | `/api/verification` | **Authoritative** signature verification |
| GET | `/api/verification/history?limit=` | Verification history table |
| POST | `/api/threats/analyze` | Ad-hoc statistical threat analysis |
| GET | `/api/threats?limit=&type=` | List persisted threat findings |
| POST | `/api/attacks/forgery` | Simulate a forgery attack |
| POST | `/api/attacks/replay` | Simulate a replay attack |
| POST | `/api/attacks/impersonation` | Simulate an impersonation attack |
| POST | `/api/attacks/channel` | Simulate quantum channel tampering |
| GET | `/api/dashboard/stats` | Real, DB-derived dashboard statistics |
| GET | `/api/dashboard/health` | System + protocol component health |
| GET | `/api/dashboard/pauli-stats` | Pauli eigenstate +/- distribution (derived from recent data) |
| GET | `/api/dashboard/probability-series` | Verification-probability-vs-samples chart data |
| GET | `/api/audit?limit=&eventType=&severity=` | Audit trail |
| GET | `/api/audit/:id` | Single audit entry |

## 9–10. Request / Response Examples

**Create session**
```http
POST /api/qds/session
Content-Type: application/json

{ "sender": "Alice", "receiver": "Bob" }
```
```json
{
  "success": true,
  "session": {
    "sessionId": "SESS-482913",
    "sender": "Alice",
    "receiver": "Bob",
    "nonce": "9f1c2e4a7b1d4f0a8c3e5b7d9f1a2c4e",
    "status": "ACTIVE",
    "expiresAt": "2026-09-02T10:15:00.000Z",
    "createdAt": "2026-09-02T10:00:00.000Z"
  }
}
```

**Verify a signature** (backend generates and evaluates the measurement round
itself if `expectedMeasurements`/`receivedMeasurements` are omitted)
```http
POST /api/verification
Content-Type: application/json

{ "sessionId": "SESS-482913", "signatureId": "QDS-2026-00841", "basis": "Z", "samples": 256 }
```
```json
{
  "success": true,
  "verification": {
    "sessionId": "SESS-482913",
    "signatureId": "QDS-2026-00841",
    "sender": "Alice",
    "receiver": "Bob",
    "basis": "Z",
    "samples": 256,
    "matching": 251,
    "mismatch": 5,
    "matchRate": 98.05,
    "errorRate": 1.95,
    "statisticalDeviation": 0.8649,
    "forgeryProbability": 0,
    "decision": "ACCEPT",
    "timestamp": "10:00:05",
    "threat": { "threatDetected": false }
  }
}
```

**Simulate a forgery attack**
```http
POST /api/attacks/forgery
```
```json
{
  "success": true,
  "attack": {
    "type": "Forgery",
    "detected": true,
    "severity": "CRITICAL",
    "riskScore": 92.4,
    "decision": "REJECT",
    "sessionId": "SESS-991203",
    "signatureId": "QDS-2026-55012",
    "matchRate": 64.45,
    "forgeryProbability": 0,
    "logs": [
      "Alice quantum state signature submitted.",
      "Eavesdropping device intercepted teleported states.",
      "Bob measured states with mismatched Bell measurements.",
      "Match rate: 64.45% (Threshold: 95%).",
      "Forgery probability: 0.",
      "Status: REJECT — threat detected."
    ],
    "timestamp": "10:02:11"
  }
}
```

**Dashboard stats**
```http
GET /api/dashboard/stats
```
```json
{
  "success": true,
  "stats": {
    "totalAttempts": 6,
    "successfulVerifications": 1,
    "failedVerifications": 5,
    "threatsDetected": 4,
    "forgeriesDetected": 1,
    "replayAttacks": 1,
    "impersonationAttempts": 1,
    "channelTamperingAttempts": 1,
    "verificationAccuracy": 16.67,
    "averageRiskScore": 80.3,
    "threatBreakdown": { "forgery": 1, "replay": 1, "impersonation": 1, "channel": 1 },
    "falseAcceptanceRate": 2.3,
    "observedConfidence": 0.6445,
    "protocolIntegrity": "ALERT"
  }
}
```

## 11. QDS Simulation Flow

```
Alice's unknown state
        │
Bell pair prepared: |Phi+> = (|00> + |11>) / sqrt(2)
        │
Alice performs a Bell-basis measurement → 2 classical bits (m1 m2)
        │
Classical bits sent to Bob over an authenticated classical channel
        │
Bob applies Pauli correction:
   00 → I     01 → X     10 → Z     11 → Y (== XZ, up to global phase)
        │
Bob's reconstructed state is verified via projective measurement
in the agreed Pauli basis (X, Y, or Z) over N samples
        │
Statistical engine computes matchRate, errorRate, statisticalDeviation,
forgeryProbability = 0.75^matching
        │
Decision: matchRate >= 95% → ACCEPT, else REJECT
(overridden to BLOCKED/REJECT if a structural threat — replay or
impersonation — is detected first)
```

See `services/quantum/pauliCorrection.js` for the exact correction
convention and matrices, and `services/statistics/statisticalEngine.js` for
every formula with inline documentation.

## 12. Verification Flow

1. Frontend calls `POST /api/verification` with `sessionId`, `signatureId`,
   `basis`, `samples` (and optionally `expectedMeasurements` /
   `receivedMeasurements` if the frontend wants to submit its own measured
   bit arrays instead of asking the backend to simulate the round).
2. Backend loads the `Session`. Missing/expired session → `401`, logged as
   `UNAUTHORIZED_ATTEMPT`.
3. Backend checks whether this session/signature was already consumed
   (**replay** check) and whether the claimed requester matches the
   session's participants (**impersonation** check) — both independent of
   measurement statistics.
4. If no structural issue, the backend runs (or evaluates supplied)
   measurements through the statistical engine and applies the
   `REQUIRED_THRESHOLD` (95%) decision rule.
5. Session is marked `CONSUMED` (single-use nonce).
6. Verification, any `Threat` finding, and an `AuditLog` entry are persisted.
7. Backend returns its own authoritative decision — **the frontend's
   locally-computed decision, if any, is ignored.**

## 13. Threat Detection Flow

```
Session/nonce reused or expired?  ──yes──▶ REPLAY (BLOCKED)
        │ no
Requester not in session participants? ──yes──▶ IMPERSONATION (REJECT)
        │ no
matchRate in guessing band (50–73%)?   ──yes──▶ FORGERY
        │ no
matchRate degraded (74–90%) + SUSPICIOUS/THREAT? ──yes──▶ CHANNEL_TAMPERING
        │ no
No threat — decision follows the plain 95% threshold rule.
```

Every rule and its exact bounds are documented at the top of the
corresponding file in `services/security/`. Risk scores (0–100) are built
additively from named contributions (`services/statistics/statisticalEngine.js:computeRiskScore`)
— never a black-box score.

## 14. Attack Simulation

`POST /api/attacks/{forgery|replay|impersonation|channel}` runs a
backend-generated scenario **through the exact same verification + threat
pipeline used for real traffic** (not a separate canned response), so what
the frontend displays is a genuine detection outcome:

- **forgery** — an unauthenticated party ("Eve (Forged)") submits
  measurements consistent only with guessing (~60–72% match rate).
- **replay** — a session/signature that was already verified once is
  resubmitted.
- **impersonation** — "Mallory" submits a verification request claiming to
  be a participant ("Alice") who never authorized it.
- **channel** — measurement statistics consistent with intercept-resend
  eavesdropping noise (~75–83% match rate) on the quantum channel.

Every simulated attack writes a `Threat` (if detected), an `Attack` record,
and one or more `AuditLog` entries.

## 15. Database Models

| Model | Purpose | Key fields |
|---|---|---|
| `Session` | QDS session + nonce | sessionId, sender, receiver, nonce (unique), status, expiresAt |
| `Signature` | Issued teleportation signature package | signatureId, sessionId, basis, bellState, classicalBits, pauliCorrection |
| `Verification` | Result of a verification attempt | matching, mismatch, matchRate, forgeryProbability, decision, mode |
| `Threat` | A detected threat finding | type (enum), severity, riskScore, reason, recommendedAction |
| `Attack` | A simulated attack run | type, detected, severity, riskScore, decision, logs[] |
| `AuditLog` | Full audit trail | eventType (enum), severity, description, decision, metadata |

Unique indexes on `Session.sessionId`, `Session.nonce`, `Signature.signatureId`
prevent duplicate nonces/IDs at the database layer, in addition to the
application-level replay checks.

## 16. Frontend Integration

**No frontend files are modified by this backend.** To wire the existing
Q-SEC frontend to this backend, replace the local-simulation calls inside
`src/context/QdsContext.jsx` with `fetch`/`axios` calls to the endpoints
below. Suggested mapping:

| Existing frontend function / data | → | Backend endpoint | Notes |
|---|---|---|---|
| `generateSessionId()` (data/qdsData.js) | → | `POST /api/qds/session` | Call once when the app mounts / a new session starts; store the returned `sessionId` in place of the locally generated one. |
| `runVerification(samples, basis)` in `QdsContext.jsx` | → | `POST /api/verification` `{ sessionId, signatureId, basis, samples }` | Response `verification` object maps directly onto the shape currently pushed into `history`/`currentSimulation`. |
| `simulateAttack(type)` in `QdsContext.jsx` | → | `POST /api/attacks/{forgery\|replay\|impersonation\|channel}` (map `"Channel Manipulation"` → `channel`) | Response `attack` object maps directly onto `attackSimulation` state (`type`, `detected`, `probability`→`forgeryProbability`, `decision`, `logs`). |
| `initialStats` / computed `stats` | → | `GET /api/dashboard/stats` | Poll or refetch after each verification/attack instead of recomputing in the `useEffect` on `history`. |
| `initialHealth` / `health` | → | `GET /api/dashboard/health` | Same shape: `{ component, status, lastChecked, confidence }[]`. |
| `initialPauliStats` / `pauliStats` | → | `GET /api/dashboard/pauli-stats` | Same shape: `{ X: {plus,minus}, Y: {...}, Z: {...} }`. |
| `generateProbabilitySeries()` | → | `GET /api/dashboard/probability-series` | Same shape: `{ samples, observed, threshold, forgery }[]`. |
| `initialEvents` / `events` (Audit Trail page) | → | `GET /api/audit` | Same shape: `{ id, timestamp, eventType, severity, decision, sessionId, signatureId, details }[]`. |
| `initialHistory` / `history` (Verification table) | → | `GET /api/verification/history` | Same shape as `history` entries. |
| Threat Detection page ad-hoc checks | → | `POST /api/threats/analyze` `{ matching, samples }` | Returns the same statistical evaluation used internally. |

Example client-side call (drop-in replacement for `runVerification`):

```js
async function runVerification(sessionId, basis = "Z", samples = 256) {
  const res = await fetch(`${API_BASE_URL}/api/verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      signatureId: `QDS-${Date.now()}`,
      basis,
      samples,
    }),
  });
  const data = await res.json();
  return data.verification;
}
```

Set `API_BASE_URL` (e.g. `http://localhost:5000`) via a Vite env variable
(`VITE_API_BASE_URL`) in the frontend's own `.env` — no backend file changes
required for this either.

## 17. Security Considerations

- `helmet()` for standard HTTP security headers.
- `cors()` restricted to a single configurable origin (`FRONTEND_URL`).
- `express-rate-limit` on all `/api` routes (configurable via `.env`).
- All input validated in `middleware/validation.js` before reaching
  controllers; malformed requests return `400` with a clear message.
- Centralized error handler (`middleware/errorHandler.js`) never leaks stack
  traces in `NODE_ENV=production`.
- No secrets or credentials are hard-coded anywhere; `.env` is git-ignored.
- Sessions are single-use (nonce consumed after one verification attempt),
  which is the backend's primary replay defense.
- No authentication/authorization framework (JWT/OAuth) was added, per the
  brief ("do not over-engineer authentication unless the existing frontend
  requires it") — the existing frontend has no auth layer to integrate
  with. If you later add user accounts, gate `POST /api/qds/session` and
  `POST /api/verification` behind real authentication.

## 18. Limitations & Scientific Honesty

- This is a **classical software simulation** of QDS concepts, not a
  physical quantum system and not a full quantum state-vector simulator
  (e.g. no complex amplitudes are tracked). Bell states, teleportation, and
  Pauli corrections are represented structurally/mathematically for the
  purpose of driving realistic-looking, protocol-consistent measurement
  statistics and threat detection.
- `forgeryProbability = 0.75^matching` is a **simulation metric**
  illustrating the exponential security margin that teleportation-based QDS
  protocols aim for (per the guessing bound in the problem statement's
  background). It is **not** a formally proven bound for this specific
  codebase, and should not be quoted as a real-world security guarantee.
- `REQUIRED_THRESHOLD` (95%), `CHANNEL_DEVIATION_LIMIT` (5%), and the
  forgery/channel matchRate bands are **protocol thresholds chosen for this
  prototype**, not values derived from a peer-reviewed security proof.
- Attack "detection" is driven by statistical bands that the backend itself
  also uses to *generate* the simulated attack traffic — this makes the
  demo internally consistent and honest about what it's showing, but it is
  a controlled demonstration, not a red-team-validated intrusion detection
  system.
- No AI/ML is used anywhere; every decision traces to an explicit,
  documented formula or rule.

## 19. SIH Problem Statement Alignment (PS 26141)

| Requirement | Where it's implemented |
|---|---|
| Quantum-inspired threat detection framework | `services/security/*`, `services/statistics/statisticalEngine.js` |
| Bell-state entanglement / teleportation-based QDS | `services/quantum/bellState.js`, `teleportation.js` |
| Pauli eigenstates, projective measurements | `services/quantum/measurement.js`, `pauliCorrection.js` |
| Statistical analysis of measurement outcomes | `statisticalEngine.js` (matchRate, errorRate, statisticalDeviation) |
| Forgery probability / verification accuracy analysis | `calculateForgeryProbability`, `evaluateVerification` |
| Threshold-based threat identification | `QDS_CONFIG` in `utils/constants.js`, applied throughout `services/security/` |
| Forgery / impersonation / replay / unauthorized-verification detection | `forgeryDetector.js`, `impersonationDetector.js`, `replayDetector.js`, `verification.controller.js` (401 on invalid session) |
| Quantum channel manipulation detection | `channelTamperingDetector.js` |
| Attack simulation | `attack.controller.js`, `POST /api/attacks/*` |
| Security analysis / audit trail | `AuditLog` model, `audit.controller.js` |
| Performance metrics | `GET /api/dashboard/stats`, `GET /api/dashboard/probability-series` |
| No AI/ML | Verified — every decision is a closed-form formula or explicit rule |
| Deterministic acceptance of legitimate signatures | `decideVerification()` — pure threshold comparison, no randomness in the decision itself |

---

## 20. Testing

Run the bundled smoke test (requires a reachable MongoDB — see §6):

```bash
MONGO_URI=mongodb://127.0.0.1:27017/qsec_test PORT=5050 npm test
```

This starts the real Express app and walks through, in order: health check
→ session creation → Bell-state/teleportation/measurement demos → a normal
verification → a replayed verification (expects `BLOCKED`) → an
unauthorized verification (expects `401`) → all four attack simulations →
ad-hoc threat analysis → threat listing → dashboard stats/pauli-stats/
probability-series → verification history → audit trail, printing
`PASS`/`FAIL` per step.

You can also exercise endpoints manually with `curl`, e.g.:

```bash
curl -X POST http://localhost:5000/api/qds/session \
  -H "Content-Type: application/json" \
  -d '{"sender":"Alice","receiver":"Bob"}'
```

---

Built for SIH 2026 · Problem Statement 26141 · Egreen Quanta · Theme: Blockchain & Cybersecurity
