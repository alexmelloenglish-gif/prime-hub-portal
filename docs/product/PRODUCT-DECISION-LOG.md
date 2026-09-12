# PRIME Product Decision Log

This log records deliberate product decisions so that future implementation or agent work does not silently reopen settled product boundaries.

## 2026-09-12 — PD-001 — Dashboard and Companion have different jobs

**Status:** CANONICAL

**Decision:** Student Dashboard is the authorized learning memory/map. PRIME Companion is the between-interaction action/practice layer.

**Rejected:** Building a generic mobile clone of the Dashboard.

**Reason:** The Dashboard explains state, evidence, history and direction; Companion reduces the distance between pedagogical intention and learner action.

---

## 2026-09-12 — PD-002 — Teacher remains pedagogical authority

**Status:** CANONICAL

**Decision:** AI produces candidates. Authorized teacher decisions create authority transitions.

**Invariant:** Attempt ≠ evidence ≠ assessment ≠ progress. APPROVED ≠ CANONICALIZED ≠ PROJECTED.

**Rejected:** AI directly writing canonical learning state or automatically publishing pedagogical conclusions.

---

## 2026-09-12 — PD-003 — PRIME Teacher is an action cockpit, not Admin Panel mobile

**Status:** CANONICAL PRODUCT DIRECTION

**Decision:** PRIME Teacher should answer “What deserves my attention and what decision must I make now?”

**Initial surfaces:** Today/Inbox, Review, Students, Prepare.

**Rejected:** Repackaging every administrative screen into a mobile interface.

---

## 2026-09-12 — PD-004 — Prove the closed loop before broad feature expansion

**Status:** CANONICAL ROADMAP PRINCIPLE

**Decision:** Prioritize one complete vertical slice: interaction → candidate → teacher decision → canonicalization → learner action → attempt → new review.

**Success criterion:** Teacher operates the pedagogical loop without infrastructure consoles.

---

## 2026-09-12 — PD-005 — Commercial architecture may support B2C, B2B2C and B2B

**Status:** PRODUCT HYPOTHESIS

**Direction:** PRIME Direct, PRIME Teacher, PRIME School and potentially Enterprise/University.

**Constraint:** Enterprise capability is not an MVP requirement. Architecture should avoid decisions that make later multi-tenancy impossible.

---

## 2026-09-12 — PD-006 — Core learning model should be discipline-agnostic

**Status:** PRODUCT HYPOTHESIS / ARCHITECTURAL DIRECTION

**Decision:** Prefer Learner, Program, Session, Evidence, Attempt, Action and CanonicalRecord abstractions over English-specific core entities.

**Reason:** Potential future programs include languages, academic subjects, exam preparation and professional communication.

---

## 2026-09-12 — PD-007 — In-person and unscheduled learning interactions are valid inputs

**Status:** CANONICAL DISCOVERY

**Decision:** A scheduled online Calendar event is not the sole condition for a learning interaction to exist.

**Constraint:** Uncertain identity/diarization must remain explicit and cannot be converted into fabricated evidence.

---

## 2026-09-12 — PD-008 — Data strategy prioritizes authorized educational evidence

**Status:** CANONICAL TRUST PRINCIPLE

**Decision:** Position PRIME around transforming authorized educational data into continuity and action.

**Not authorized:** Product claims based on speculative personality/psychological inference from incidental or purchased data without separate governance/legal/product review.

---

## 2026-09-12 — PD-009 — PRIME Companion initial information architecture

**Status:** PRODUCT DIRECTION

**Surfaces:** Today, Practice, Goals, Prepare.

**Decision:** Longitudinal Memory remains primarily in the Student Dashboard; Companion may link back to it rather than duplicate it.

---

## 2026-09-12 — PD-010 — Product family working model

**Status:** DISCOVERY BASELINE

```text
PRIME Learning OS
├── PRIME Intelligence — prepares
├── PRIME Teacher — decides
├── Student Dashboard — explains
└── PRIME Companion — activates
```

This naming/model remains open to brand refinement, but the separation of responsibilities is canonical.
