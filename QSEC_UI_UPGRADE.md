# Q-SEC UI Upgrade — Premium Enterprise / Quantum Security Command Center

This document records the UI/UX transformation applied on top of the already-validated Turn 1-4
Q-SEC project. **No backend, cryptographic, or security-decision logic was changed in this
pass.** This is a presentation-layer upgrade only.

## 1. Global Visual Design System

One unified design system was extended in `src/index.css` and used consistently across all ten
pages, so the whole app now reads as a single product rather than a set of separately-styled
screens:

- **Color language** (unchanged, reused): near-black/graphite backgrounds, cyan/blue primary
  accent (`quantum-blue`), violet accent for simulated quantum components (`quantum-purple`),
  green/amber/red for trusted/warning/threat states.
- **New surface tiers**:
  - `.glass-card` / `.glass-card-purple` (existing) — standard translucent content panels.
  - `.glass-panel` (new) — a stronger, more opaque blur for navigation chrome (Sidebar, Topbar)
    so nav stays legible over the animated background.
  - `.glass-dense` (new) — a denser, less-transparent surface specifically for information that
    must stay highly readable: cryptographic values, hashes, logs, and data tables.
- **New motion utilities**: `orbit-spin`, `node-pulse-ring`, `particle-drift`, and
  `card-entrance` keyframes for the quantum visual language (see §4).

## 2. Glassmorphism

Translucent, backdrop-blurred panels remain the primary surface across the app (`glass-card`,
`glass-panel`). Per the brief's explicit caution, **dense/critical information does not use the
same transparency** — signature values, hashes, audit tables, and trace details sit on the new
`.glass-dense` surface (in Live Signature's generated payload panel and elsewhere) so they stay
sharply readable rather than see-through.

## 3. Neumorphism / Skeuomorphic Depth

Added a restrained, modern neumorphic layer on top of the glass system:

- `.neu-raised` — a soft dual-shadow giving cards, buttons, and nav items a subtle raised feel.
  Applied to essentially every top-level panel across all ten pages, the Sidebar's active nav
  item, the Topbar's status capsules, and the MetricCard KPI tiles.
- `.neu-raised-hover` / `.card-lift` — hover-lift micro-interaction (translateY + stronger
  shadow) for interactive cards that are **not** already animated by framer-motion.
- `.neu-pressed` — inset shadow, available for pressed/active toggle states.
- `.cyber-btn` (used by the new `CyberButton` component) — every primary action button now has a
  raised resting state, a slight lift on hover, and a pressed/inset look on click.

**A deliberate technical choice**: for elements already animated by framer-motion (e.g.
`MetricCard`, which fades in on mount), the hover-lift was implemented via framer-motion's own
`whileHover` prop instead of the CSS `:hover { transform }` classes. Framer-motion controls the
`transform` style inline, so a competing CSS rule on the same property would silently lose to the
inline style — this was caught and corrected during implementation rather than shipped as a
non-functional hover effect.

## 4. Cyber / Quantum Visual Language

A consistent set of quantum-inspired motifs was introduced, used sparingly and only where they
add meaning (protocol education, pipeline diagrams) rather than decorating every screen:

- **QuantumNode** — a ringed, orbiting node motif (dashed orbital ring + small orbiting particle,
  optional pulse when "active"). Used throughout the redesigned QDS Protocol page and its
  Dashboard summary (`QuantumFlow`).
- **Orbit / pulse / particle-drift keyframes** — subtle, slow (18-24s) animations; never fast or
  distracting.
- **Quantum grid background** (pre-existing, reused) — a faint animated grid + scan-line sits
  behind all content at low opacity, never reducing text contrast.

## 5. Reusable Components Created

| Component | Purpose |
|---|---|
| `GlassCard.jsx` | Consistent glass surface wrapper (variants: default/purple/dense, optional lift/raised) |
| `CyberButton.jsx` | Premium action button with raised/lift/press micro-interactions (variants: primary/danger/ghost/outline) |
| `ThreatSeverityBadge.jsx` | Consistent LOW/WARNING/HIGH/CRITICAL pill — renders whatever the backend returns, never computes severity itself |
| `QuantumNode.jsx` | Decorative orbiting node motif for quantum/protocol visuals |
| `ForensicEvent.jsx` | Expandable single event card for the Attack Trace timeline |

`GlassCard` and `ThreatSeverityBadge` are available for future pages; not every existing panel was
migrated to use them where the existing inline styling already matched the design system, to
avoid unnecessary churn on working code (per the "prioritize stability" directive). A `PipelineNode`
component was considered but not created — `QuantumNode` plus the existing `FlowConnector` already
cover that need without duplicating logic.

## 6. QDS Protocol Page — Full Redesign

`src/pages/QDSProtocol.jsx` was completely rebuilt:

- Expanded from 5 to the requested 6 stages: **Key State Preparation → Bell-State Entanglement →
  Quantum Teleportation → Classical Correction → Projective Measurement → Verification.**
- Added a new horizontal protocol-flow diagram (`QuantumNode` + `FlowConnector`) above the
  existing interactive step-by-step explainer.
- The final "Verification" stage explicitly states that the real ACCEPT/REJECT/BLOCKED decision
  is made by the backend verification/threat engine, not by this educational page — reinforcing
  that this page is illustrative only.
- `QuantumFlow.jsx` (the condensed 5-step version embedded on the Dashboard) was also fully
  rewritten with the same terminology.

## 7. Terminology Cleanup

All visible occurrences of Alice/Bob/Charlie/Eve/Mallory were removed from the frontend and
replaced with **Organization A / Organization B / Signer / Receiver / Verification Authority /
Quantum Channel**, per the mapping specified in the brief. This included:

- `QDSProtocol.jsx` and `QuantumFlow.jsx` (the two files explicitly flagged) — fully rewritten.
- `src/api.js` — `createSession`'s unused default parameters (`"Alice"`/`"Bob"`) changed to
  `"Organization A"`/`"Organization B"`. These defaults are not currently triggered by any call
  site, but were corrected so no code path can ever surface the old names even if a future caller
  omits arguments.
- `src/data/qdsData.js` — two source-code comments referencing the old names were reworded. These
  were never rendered in the UI (comments aren't visible to end users), but were cleaned up for
  completeness and to leave zero ambiguity in future searches.

**Final verification**: a whole-frontend, whole-word, case-sensitive regex sweep
(`grep -rnE "\b(Alice|Bob|Charlie|Eve|Mallory)\b" src/`) returns **zero matches** anywhere in
`src/`.

**Backend note**: a small number of backend-internal simulation files
(`bellState.js`, `pauliCorrection.js`, `teleportation.js`) and one test file still use these names
in internal variable names/comments describing the physics being modeled. Per the brief
("backend-only variable names may remain if changing them could break functionality... the
requirement is zero visible occurrences in the actual website UI"), these were intentionally left
untouched — they are never returned to the frontend or rendered anywhere in the UI, and renaming
them carries needless risk to working simulation code for zero user-visible benefit.

## 8. Accessibility / Reduced Motion

- The entire app is now wrapped in framer-motion's `<MotionConfig reducedMotion="user">`
  (`App.jsx`). This makes **every** framer-motion animation in the app — entrance fades,
  `whileHover` lifts, `AnimatePresence` transitions on the QDS Protocol stepper — automatically
  honor the OS-level "prefers reduced motion" setting, without needing to guard each animation
  individually.
- The pre-existing global CSS reduced-motion block (forcing near-zero animation/transition
  duration on `*`) continues to cover all CSS-driven animations (pulses, orbit rings, particle
  drift).
- Added `aria-current="page"` to the active Sidebar nav item and `focus-visible` ring styles to
  the Sidebar links and `CyberButton`, improving keyboard-navigation legibility.
- A genuine accessibility/navigation bug was fixed in `Topbar.jsx`: the page-title lookup was
  missing entries for the `live` and `attack-trace` tabs, so visiting either page silently showed
  a generic fallback title instead of a real one.

## 9. Responsive Behavior

No layout structure was removed; existing responsive patterns (Tailwind breakpoints, `flex-wrap`,
horizontal-scroll tables, `break-all` on long crypto values) were preserved and extended to every
new element added in this pass (the QDS Protocol flow diagram stacks vertically below `lg`, the
Topbar's new status capsules wrap and hide progressively on narrow viewports, `ThreatSeverityBadge`
has an `xs` size for tight spaces).

## 10. Security / Backend Behavior — Explicitly Preserved

**No backend file was modified in this UI pass.** Verified by checking file modification times: no
file under `backend/` has changed since the Turn 4 documentation was written. The only backend
change in the project's entire history remains the Turn 3 fix to `attack.controller.js`'s
`ATTACK_DEFINITIONS` display strings (participant/narrative text only — no logic, thresholds, or
field names), which was reviewed again in this pass and confirmed unrelated to this UI work.

Specifically confirmed untouched in this pass: Ed25519 signing/verification, SHA-256 hashing,
session/nonce issuance and consumption, the verification engine, the threat engine, the
impersonation detector, risk scoring, all Mongoose models, and all API routes/contracts. The
frontend continues to render backend-returned values only — no page in this transformation
computes or overrides an ACCEPT/REJECT/BLOCKED decision, a risk score, or a threat classification.

## 11. REAL vs. SIMULATED vs. THEORETICAL

The existing `StatusBadge` labeling system (REAL / SIMULATED / THEORETICAL / FUTURE) was kept and
extended visually, not altered in meaning:

- **REAL**: Ed25519, SHA-256, session/nonce, threat detection, risk scoring, security decisions,
  audit logging — labeled REAL wherever shown (Threat Detection, Audit Trail, SigningFlow,
  Security Analysis's "Security Posture" section).
- **SIMULATED**: QDS/Bell-state/teleportation behavior, Attack Lab, Attack Trace, QDS Protocol
  education page — all explicitly badged SIMULATED, and the QDS Protocol page's intro text
  explicitly states no physical quantum hardware is used.
- **THEORETICAL**: the `(3/4)^N` forgery-guessing bound remains labeled "Theoretical Forgery
  Guessing Bound" everywhere it appears and is never presented as an observed attack rate.

## 12. Validation Performed

This sandbox has **no outbound network access** — `npm install` was run and confirmed to fail
with `403 Forbidden` against `registry.npmjs.org` for both the frontend and `/backend`, exactly as
in Turns 3-4. `npm run build` (Vite) therefore cannot execute, since no `node_modules` can be
installed. As a substitute, the same static-validation approach used in prior turns was run again
after every change in this pass:

- **Per-file syntax check**: all 42 frontend `.js`/`.jsx` files individually parsed with
  `esbuild` — **0 errors**.
- **Full bundle check**: the real entry point (`src/main.jsx`) bundled with `esbuild`, with all
  npm packages (`react`, `react-dom`, `lucide-react`, `framer-motion`, `recharts`) marked
  external — **0 errors**, confirming every internal import/export (including all five newly
  created components) resolves correctly.
- **Per-page bundle check**: all 10 pages (Dashboard, Live Signature, Signature Verification,
  Measurement Analysis, Threat Detection, Attack Lab, Attack Trace, Audit Trail, Security
  Analysis, QDS Protocol) bundled individually — **all OK**, no broken imports or missing
  components.
- **Backend syntax check**: all 40 backend `.js` files pass `node --check` — **0 errors**
  (unchanged from prior turns, since no backend file was touched).

**This is real static validation, not a substitute for an actual `npm run build`.** It confirms
there are no syntax errors and no broken imports/exports, but it does not catch everything a real
Vite build, Tailwind JIT compilation, or a live browser render would (e.g. a Tailwind class typo
that's syntactically valid but produces no CSS, or a runtime-only error that only appears when the
app actually executes in a browser against a running backend). **No runtime/browser testing was
performed** — there is no way to start the dev server or the backend without installed
dependencies in this environment.

**Recommendation**: run `npm install && npm run build` (and the same inside `/backend`) in an
environment with normal registry access before relying on this as a final, verified build.

## 13. Known Warnings / Limitations

- Bundle-size figures above exclude all npm dependencies (marked external because they aren't
  installed here) and are not representative of a real production bundle size.
- `oxlint` (the project's configured linter) could not be run — not installed, and installation is
  blocked by the same network restriction.
- A handful of backend-internal simulation files retain Alice/Bob/Charlie/Eve terminology in
  code comments/internal variable names (see §7) — intentionally left alone per the brief, never
  visible in the UI.
- No live browser/runtime verification was possible; all validation in this pass is static.
