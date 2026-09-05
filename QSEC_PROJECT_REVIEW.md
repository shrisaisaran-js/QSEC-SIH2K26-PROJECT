# Q-SEC Project Review

## 1. Project Overview

Q-SEC is a Quantum-Inspired Secure Verification & Cyber Threat Detection dashboard. It pairs a
real cryptographic signing/verification pipeline (Ed25519 + SHA-256, session/nonce binding) with
a software simulation of a Quantum Digital Signature (QDS) protocol (Bell-state preparation,
teleportation, Pauli correction, projective measurement), then layers deterministic threat
detection, risk scoring, and audit logging on top. The frontend is a single-page React
application (tab-based navigation, no router) backed by an Express/MongoDB API.

## 2. Architecture

```
User
  -> Live Signature            (message input, key generation)
  -> Session + Nonce           (backend-issued, one-time)
  -> Ed25519                   (real signing / signature verification)
  -> Verification Engine       (backend, statistical + cryptographic checks)
  -> QDS Simulation            (Bell state -> teleportation -> Pauli correction, software only)
  -> Statistical Analysis      (match rate, measurement deviation, guessing-bound context)
  -> Threat Detection          (backend, rule-based: forgery/replay/impersonation/tampering)
  -> Risk Assessment           (backend risk scoring, 0-100)
  -> Security Decision         (ACCEPT / REJECT / BLOCKED — backend only)
  -> Audit Trail                (backend-persisted event log)
```

**Backend-authoritative components** (never recalculated or overridden in the browser):
verification engine, threat engine, risk scoring, ACCEPT/REJECT/BLOCKED decisions, session/nonce
issuance and consumption, all database persistence, and audit logging. The React frontend is a
presentation layer: it renders whatever the backend returns and does not implement parallel
security logic.

## 3. REAL Components

- Ed25519 key generation, signing, and verification (Node.js `crypto`, native `ed25519` curve)
- SHA-256 message hashing (Node.js `crypto.createHash`)
- Session creation and one-time nonce binding
- Session/nonce reuse (replay) detection
- Identity/participant consistency checks (impersonation detection)
- Threat detection rules and risk scoring (deterministic, not ML-based)
- Security decision logic (ACCEPT / REJECT / BLOCKED)
- MongoDB persistence (Sessions, Verifications, Signatures, Threats, Attacks, AuditLog)
- Audit event logging

## 4. SIMULATED Components

- Bell-state preparation and entanglement modeling
- Quantum teleportation of signature states
- Pauli correction
- Projective measurement / basis comparison
- The statistical "match rate" / "measurement deviation" produced by the above simulation

None of this runs on physical quantum hardware; it is a software model used to produce
statistically realistic measurement outcomes for the verification engine to evaluate.

## 5. THEORETICAL Components

**Theoretical Forgery Guessing Bound** — the curve `(3/4)^N`, the maximum probability that a
party without the correct quantum state could still pass N independent basis-measurement
samples by chance. This is a textbook reference bound used to contextualize the simulated
measurement model. It is not an observed attack-success rate and is never used by the backend to
make an accept/reject decision — the actual decision uses live measurement/statistical results
from that specific verification.

## 6. FUTURE Components

- Physical quantum hardware / a real quantum network (the current QDS behavior is a classical
  software simulation of the physics, not a QPU)
- A production-grade QDS deployment
- Post-quantum signature integration — Ed25519, used throughout this project, is a classical
  elliptic-curve scheme and is **not** quantum-safe or post-quantum secure; it is used here for
  its speed and ubiquity, not for quantum resistance

## 7. Attack Scenarios

All six scenarios route through the same backend verification, threat-detection, and
risk-scoring engine used for real traffic — they are not scripted/hardcoded outcomes:

| Scenario | What it tests |
|---|---|
| Forgery | Measurement outcomes consistent with a party lacking the correct quantum state |
| Replay | Reuse of an already-consumed session/nonce |
| Impersonation | A requesting participant who was not bound to the originating session |
| Channel Manipulation | Degraded measurement fidelity consistent with channel interference |
| Message Tampering | A real Ed25519 signature, message altered before verification |
| Signature Tampering | A real Ed25519 signature, signature bytes corrupted before verification |

## 8. Data Separation

NORMAL verification history and ATTACK simulation history are kept strictly separate:

- The verification-history API endpoint filters to `mode: "NORMAL"` only.
- The frontend's normal-verification history state is only ever appended to by the normal
  verification flow; the attack-simulation flow never writes into it.
- Attack results are surfaced only through Threat Detection, Attack Lab, Attack Trace, and the
  Threat Posture section of Security Analysis (plus the general Audit Trail, which records all
  security-relevant events, normal and attack alike, as a unified event log).
- Aggregate acceptance-rate statistics for normal verification are computed only from NORMAL-mode
  records; attack-simulation outcomes are reported separately (e.g. False Acceptance Rate) and
  are not blended into the normal acceptance rate.

## 9. Security Properties

- **Ed25519 verification** — real signature verification against the signed message
- **SHA-256** — real message hashing, used to detect message tampering
- **Session/nonce protection** — one-time session identifiers prevent reuse
- **Replay protection** — reuse of a session/nonce is detected and blocked independent of
  measurement quality
- **Impersonation detection** — the requesting participant must be one of the two parties bound
  to the session at creation time
- **Tampering detection** — message and signature tampering are each detected via real
  cryptographic verification failure, not simulated
- **Threat detection** — rule-based classification into six threat categories
- **Risk assessment** — a 0-100 risk score attached to each detected threat
- **Audit logging** — timestamp, severity, decision, and outcome recorded per security-relevant
  event

## 10. Scientific Limitations

- QDS behavior in this project is a **software simulation**, not physical quantum computing.
- **No physical quantum hardware or quantum network** is used anywhere in this build.
- **Ed25519 is NOT quantum-safe or post-quantum secure.** It is a classical elliptic-curve
  signature scheme.
- Theoretical guessing-probability curves (e.g. `(3/4)^N`) are **not measured attack rates** —
  they contextualize the simulation and are labeled as theoretical throughout the UI.
- The audit trail is a standard database event log. It is **not cryptographically hashed,
  chained, or claimed to be immutable** — entries could in principle be edited or deleted at the
  database level, and the UI does not claim otherwise.

## 11. Validation Results

This project was reviewed and validated inside a sandboxed environment **without outbound
network access** (`npm install` fails with `403 Forbidden` against the npm registry for both the
frontend and backend — confirmed by direct test, not assumed). As a result:

- **`npm install`: NOT COMPLETED** — blocked by sandbox network policy (403 on registry.npmjs.org
  for both `/` and `/backend`). No `node_modules` could be installed.
- **`npm run build`: NOT RUN** — Vite is not available without `node_modules`. As a substitute,
  every `.js`/`.jsx` file under `src/` was individually syntax-checked with `esbuild` (0 errors
  across 36 files), and the real entry point (`src/main.jsx`) was fully bundled with esbuild with
  npm packages marked external to verify every internal import/export resolves correctly (0
  errors, clean bundle). Each of the 10 pages was additionally bundle-checked in isolation to
  confirm no broken imports or missing components.
- **Lint (`oxlint`): NOT RUN** — binary not available in this sandbox and not installable without
  network access. Manual review was performed instead: no unused imports were found in
  new/changed files, all `.map()` calls use stable/unique React keys, and no conditional hook
  calls were introduced.
- **Backend syntax check**: all 40 backend `.js` files pass `node --check` with zero errors.
- **Runtime checks (actually starting the dev server / backend / exercising the UI in a
  browser): NOT PERFORMED** — no network access to install dependencies, so nothing could
  actually be run. All findings above are static-analysis results, not live-execution results.

**Recommendation:** run `npm install && npm run build` (repeat inside `/backend`) and the
configured `oxlint` command in an environment with normal network access before deployment, to
get an actual build/lint pass rather than the static-analysis substitute used here.

## 12. Known Warnings

- Bundle-size figures above (137 KB JS / 2.5 KB CSS) exclude all npm dependencies (React,
  lucide-react, framer-motion, recharts), which were marked external because they are not
  installed in this sandbox. They are **not** representative of the real production bundle size
  and should not be quoted as such — only a real `npm run build` gives that number.
- `src/pages/QDSProtocol.jsx` and `src/components/QuantumFlow.jsx` (Turn 1 scope, not touched in
  Turns 2-4) still use Alice/Bob/Charlie for the general QDS protocol explanation. This is
  intentional per the Turn 4 brief ("Alice/Bob/Charlie may remain only where they are genuinely
  necessary for educational QDS protocol explanation, if already intentionally retained there")
  and is confined to that one educational page — it does not appear anywhere in the Threat
  Detection, Attack Lab, Attack Trace, Audit Trail, or Security Analysis pages.
- `src/api.js`'s `createSession` helper still has unused default parameter values
  (`sender = "Alice", receiver = "Bob"`) that are never actually triggered by any current call
  site (all callers pass explicit "Organization A"/"Organization B" arguments). Left as-is since
  it is dead code with no UI visibility, and changing default parameter values falls outside the
  explicit Turn 3/4 scope of "backend/API parameters."
- No `.env` files, secrets, or credentials were found anywhere in the project tree.

## 13. Final Status

**FUNCTIONALLY COMPLETE (static review) — BUILD/LINT/RUNTIME UNVERIFIED.**

All ten pages statically resolve with no broken imports, no missing components, and correct
routing; the terminology and scientific-transparency rules are satisfied across all Turn 1-3
redesigned pages; NORMAL/ATTACK data separation and backend-authoritative security decisions are
confirmed intact by source review. However, this status reflects thorough **static** validation
only — the actual `npm install`, `npm run build`, `oxlint`, and a live run of the app in a
browser were not possible in this sandboxed, network-disabled environment and have not been
performed. Please run those steps in a normal development environment before considering this
production-ready.
