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

---

## 2026-09-14 — PD-011 — Landing page communicates the learner experience

**Status:** CANONICAL PRODUCT / COMMUNICATION BOUNDARY

**Decision:** Phase 1 of the landing-page refurbishment is conceptually ready. The public page will use the seven-section architecture defined in [`PHASE_1_EXECUTION_CHECKLIST.md`](../reconnection/PHASE_1_EXECUTION_CHECKLIST.md).

**Student-facing thesis:** `Cada aula ajuda a orientar a próxima.`

**Student-facing mechanism:** `Você pratica → Seu professor observa e interpreta → O próximo foco fica mais claro.`

**Conceptual distinction:** The existence of lesson records is not the differentiator. PRIME communicates how specific signals from what the learner practiced, managed to do and still needed help with remain useful for the teacher's next pedagogical decision.

**“Zero” definition:** If the legacy phrase is referenced, “zero” cannot mean absence of content records or teacher memory. It refers to the loss of specific, useful signals about the learner's current performance. This distinction is internal; the public page should explain the positive mechanism.

**Claim boundary:** The landing page demonstrates continuity, teacher attention and the learner's next step. Fragmented signals, AI, pipelines and the PRIME Learning Intelligence Engine remain part of the professional/product narrative rather than the student acquisition page.

**Conversion hierarchy:** Calendar is the primary action, WhatsApp is support and Portal is a utility for current students.

**Evidence rule:** An illustrative example cannot be presented as a real learner case without verified provenance and authorization.

**Deprecated as central thesis:** `A próxima aula não começa do zero.` It may be retained only as a consequence after the continuity mechanism is already clear: the next lesson does not continue only from where the content stopped; it also considers what the learner's performance showed.

---

## 2026-09-19 — PD-012 — Preserve the learning journey beyond state changes

**Classification:** CANONICAL CORE
**Adoption status:** Proposed canonical amendment; pending review and merge. Runtime implementation is separate.

**Decision:** PRIME preserves the construction of learning. Learning events, teacher-validated interpretations and authorized learner-state decisions are distinct. The absence of a state update must not become a conclusion of no learning. Purpose, documented opportunities for use, task conditions, support and uncertainty constrain comparisons, especially across sustained language development and bounded school-support work.

**Authority:** The [System Governance Canon](../governance/PRIME-SYSTEM-GOVERNANCE-CANON.md) governs the derived [Learning Machine Canon](../governance/PRIME-LEARNING-MACHINE-CANON.md) and versioned presentation contracts.

**Product consequence:** Lead with a source-grounded journey and actionable continuation. Retain correction/support/provenance detail for teacher intelligence and audit, and translate its material meaning for learners and families. Do not substitute a forced success story, an error list or a classification ladder for that journey.

**Language-programme consequence:** Language is also a means of expression, participation and access to other knowledge. Distinguish the learner's appropriation of language, participation in a content task through that language, and understanding/retention of the subject. Recognize supported participation when evidenced without making later recall the only measure of its value.

**Compatibility:** [Adoption registry](../governance/LEARNING-JOURNEY-AMENDMENT-2026-09-19.md). Historical versions and authority gates remain intact; no production or external-document update is implied by this decision log.

**Copy lock:** The canonical continuity copy and its constraints are recorded in [`PHASE_1_CONTINUITY_COPY_LOCK.md`](../reconnection/PHASE_1_CONTINUITY_COPY_LOCK.md).
