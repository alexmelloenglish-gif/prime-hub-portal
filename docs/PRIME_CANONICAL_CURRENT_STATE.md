# 🚨 DO NOT RE-INVESTIGATE — PRIME DIGITAL HUB

## CANONICAL CURRENT STATE — OPERATIONAL SNAPSHOT

> **STOP. READ THIS FIRST.** This document is the canonical return point for the current implementation state. Facts marked **PROVEN / DONE / LOCKED / FROZEN** must not be rebuilt or re-litigated without new contradictory runtime evidence or an explicit product decision.

**Date:** 2026-09-11  
**Status:** CANONICAL / CURRENT / FROZEN CHECKPOINT  
**Repository:** `alexmelloenglish-gif/prime-hub-portal`  
**Canonical branch:** `main`  
**Production:** `www.primedigitalhub.com.br`

The prior 2026-08-31 forensic checkpoint remains historical evidence in Git history and in the dated forensic documents. This file supersedes it as the **current operational return point**.

---

# 0. Current canonical operating model

The student dashboard product is repository-backed and uses one shared visual/pedagogical presentation system.

Canonical presentation sequence:

```text
STATE → PRIORITY → EVIDENCE → ACTION → HISTORY
```

Canonical product principle:

```text
shared system layer + individualized student layer
```

The dashboard must not use named-student UI hacks. Cláudio remains a validation case, not a special implementation path.

The detailed product contract is maintained in:

- `docs/student-dashboard-system-standard.md`
- `docs/PRIME_PROGRESS_TRACKER_FROZEN_STANDARD.md`
- `docs/student-learning-portfolio-template-v1.0.md`

---

# 1. Student dashboard visual system — DONE / PRODUCTION

The shared dashboard refinement is implemented and deployed across the student dashboard system.

Current shared behavior includes:

- reusable Current State presentation;
- qualitative Development Trajectory;
- standardized Next Action card;
- Attendance Summary using family-facing `attended lesson(s)` terminology;
- distinct RECENT / LONGITUDINAL / MEMORY visual layers;
- full published class-report history preserved longitudinally;
- progressive disclosure for long content;
- stronger contrast and hierarchy in the light dashboard system;
- shared component architecture rather than student-specific styling.

Production implementation has passed the student dashboard self-test and canonical projection validation.

---

# 2. PRIME Progress Tracker — FROZEN

Exactly four learner-facing progress states are canonical:

| State | Semantic color | Meaning |
|---|---|---|
| **Strong** | Green / emerald | Skill is demonstrated consistently |
| **Improving** | Blue | Skill shows active, observable development |
| **Needs Focus** | Amber | Skill requires targeted attention and practice |
| **Not Assessed** | Neutral gray | Insufficient evidence to classify the skill |

No visible synonyms or dashboard-specific variants are authorized.

Legacy labels are normalized at rendering time, including:

```text
Very Strong / Secure / Established → Strong
Active Growth / Developing / Progressing / On Track → Improving
Needs Attention / Priority → Needs Focus
Unknown / unsupported state → Not Assessed
```

Artificial progress percentages and progress bars are not part of the canonical tracker.

The frozen implementation is protected by shared code and self-tests.

---

# 3. Next Action — canonical separation

The Next Action component is a shared system component, but its pedagogical action must remain student-specific.

Canonical rule:

```text
NEXT ACTION
→ student-specific action
→ why it matters
→ supporting evidence when available
→ CTA
```

**Schedule information does not belong inside the Next Action card.** Schedule belongs to Attendance / Schedule context.

This avoids mixing pedagogical action with administrative timing metadata.

For Rafael specifically, vocabulary reuse must not be treated as the whole B2→C1 learning objective. His action logic should prioritize precision in speaking while vocabulary reuse remains supporting practice.

---

# 4. Vocabulary workspace contrast — FIXED / PRODUCTION

The `Vocabulary to Reuse` destination previously inherited dark-theme assumptions inside a light dashboard shell, causing weak contrast and poor readability.

That visual mismatch was corrected in the shared dashboard experience.

Reference production commit:

```text
fc713c5f5c52b11836db4a1b7deb757648417904
fix: align vocabulary reuse page with light dashboard contrast
```

Do not reintroduce low-contrast dark-theme tokens into light student dashboard pages.

---

# 5. Attendance semantics — FROZEN

Family-facing terminology:

```text
scheduled = booked / expected, not evidence of attendance
attended = lesson happened and student was present
cancelled = lesson did not happen
unknown = unresolved until evidence exists
```

Use **attended lesson(s)**, not **confirmed lesson(s)**, in the student/family UI.

Do not convert past `scheduled` items into `attended` or `cancelled` without evidence.

Do not invent attendance percentages, absence trends or scheduled totals merely to complete a visual component.

---

# 6. RECENT vs LONGITUDINAL — FROZEN

`RECENT` is bounded presentation context.

`LONGITUDINAL` preserves the complete published class-report history.

New lessons must never push older published reports out of the longitudinal history.

This is a system invariant, not a per-student exception.

---

# 7. Evidence authority — FROZEN

Evidence-status presentation remains distinct from learner progress status.

Examples of evidence authority include:

- Teacher Validated
- Portfolio Confirmed
- Qualified Insight
- Not Available

These labels describe **authority/provenance**, not progress quality.

Never visually or semantically equate an unvalidated automated interpretation with teacher validation.

---

# 8. Legacy ingestion pipeline — PAUSED IN PRODUCTION

The old ingestion boundary is now blocked by default in Production.

Canonical endpoint:

```text
POST /api/pipeline/ingest
```

Production behavior now requires explicit opt-in:

```text
PRIME_PIPELINE_INGEST_ENABLED=true
```

Without that explicit value, the endpoint returns:

```text
503
PIPELINE_INGESTION_PAUSED
Legacy pipeline ingestion is paused
```

Reference commit:

```text
75806164ea1f70540a478f4b17fffdd98a5041fc
chore: pause legacy pipeline ingestion by default
```

Reference production deployment:

```text
dpl_6KojVB5R1XeSnfg2SM1wdsQrecuu
READY
```

This deployment is associated with the production aliases including `www.primedigitalhub.com.br`.

### Important limitation

The external Apps Script trigger itself has **not** been proven disabled or deleted because direct trigger-management access is not available here.

Therefore the canonical statement is:

```text
APPS SCRIPT MAY STILL ATTEMPT CALLS
PORTAL LEGACY INGESTION = BLOCKED BY DEFAULT
LAURA CANNOT ENTER processLessonTranscript() THROUGH THIS LEGACY ENDPOINT WHILE THE KILL SWITCH REMAINS OFF
```

Do not claim the Apps Script trigger was removed unless direct trigger evidence is later obtained.

---

# 9. Laura — DEFERRED / DO NOT PROCESS NOW

Laura is intentionally deferred.

The legacy pipeline must not be used to keep retrying or reprocessing Laura while this checkpoint is active.

Do not execute a Laura retry merely because historical retry infrastructure exists.

Known unresolved historical `scheduled` items remain unresolved until evidence supports a change.

Laura is **not the next dashboard processing priority**.

---

# 10. Louise — CANONICAL PORTFOLIO + DASHBOARD DONE / PRODUCTION

Louise has been processed against the frozen shared system rather than through a student-specific implementation path.

Canonical portfolio master contract:

```text
docs/student-learning-portfolio-template-v1.0.md
```

Louise portfolio registry:

```text
docs/student-portfolios/louise-nogueira-canonical-v1.0.md
```

Official canonical Google Doc:

```text
https://docs.google.com/document/d/1Yc3aUuzsyP9WIuCISCJWvbWE74anvKLXUjxv2A_Vt88/edit
```

Canonical student snapshot:

```text
data/students/louise-d-silva-nogueira.firestore.json
```

The dashboard snapshot and the portfolio Quick Access block both point to the canonical v1.0 document.

Louise's current teacher-validated canonical state is:

```text
Current CEFR = B1
Target CEFR = B2
Class frequency = Once a week — Monday, 8:00–9:00 AM
Attendance = 3 attended lessons documented
Fluency = Strong
Analytical & Reflective Communication = Strong
Grammar Precision = Needs Focus
Lexical Precision & Reuse = Improving
Pronunciation = Not Assessed
```

The CEFR level, target and recurring schedule are teacher-validated profile data and are not inferred solely from transcripts. No fourth attended lesson was invented.

Quick Access is now aligned across Louise's portfolio and dashboard:

- `My Portfolio` → canonical Louise Portfolio v1.0
- `Join My Live Class` → Louise's current Meet room
- `Class Materials` → Louise's Drive materials folder
- `Prime Support` → the shared PRIME Support WhatsApp destination used system-wide, matching the Rafael/Gustavo pattern

Reference dashboard sync commit:

```text
7d711ad85d1574b8a67068726a4fee18969eb84e
feat: sync Louise teacher-validated profile and shared support links
```

Reference production deployment:

```text
dpl_FBzAC5qxFeiTeR7FGP5BtSgLyBqf
READY
```

The deployment is aliased to `www.primedigitalhub.com.br`.

Portfolio registry sync commit:

```text
24da82e0c1bf091837fa0f9b4c93641aa8a2ad39
docs: sync Louise portfolio registry with teacher validation
```

Production responds successfully, but unauthenticated runtime inspection redirects to the login page, so student-specific rendered content is verified through the canonical repository snapshot plus successful production build rather than by bypassing authentication.

---

# 11. Known non-blocking canonical backlog

The strict canonical validator currently distinguishes contradictions from unresolved historical evidence.

Known warnings include unresolved past `scheduled` items for some students and Rafael's attendance/report mismatch.

Rafael currently has a known evidence backlog:

```text
11 attended lessons
10 published class reports
August 27, 2026 attended lesson has no same-date published report
```

These are warnings, not facts to auto-repair. Backfill only when source evidence is available.

The current validator principle remains:

```text
unknown historical state = warning / unresolved
true contradiction = error
```

---

# 12. Firestore/runtime architecture — DO NOT REVIVE BY ACCIDENT

The student dashboard runtime is repository-backed for the canonical student snapshots.

Firestore runtime was intentionally frozen/retired from the dashboard path during the previous architecture stabilization.

Do not revive Firestore as the student dashboard source merely as part of visual/dashboard processing unless an explicit architecture decision reverses that freeze.

---

# 13. What is canonical vs what is not

Canonicalize:

- product contracts;
- data semantics;
- shared component behavior;
- evidence-authority rules;
- progress-state taxonomy;
- attendance semantics;
- deployment gates;
- operational kill switches;
- known unresolved evidence states;
- processing order when intentionally frozen;
- verified production checkpoints.

Do **not** treat every transient artifact as product canon.

Not canonical by itself:

- a failed intermediate deployment;
- temporary build logs;
- exploratory wording from chat;
- abandoned implementation alternatives;
- screenshots used only for diagnosis;
- assumptions not backed by code, data or runtime evidence.

Git history preserves those artifacts when useful, but they do not define the product contract.

---

# 14. Regression protection

The repository should continue to protect these invariants through tests/validators:

```text
NO STUDENT-SPECIFIC UI HACKS
FOUR PROGRESS STATES ONLY
NO ARTIFICIAL PROGRESS PERCENTAGES
ATTENDED ≠ SCHEDULED
SCHEDULE OUTSIDE NEXT ACTION
RECENT BOUNDED / LONGITUDINAL COMPLETE
EVIDENCE AUTHORITY EXPLICIT
LEGACY INGESTION PAUSED UNLESS EXPLICITLY ENABLED
UNKNOWN HISTORY NOT SILENTLY REWRITTEN
```

---

# 15. Current reading order for future agents/operators

Read in this order:

1. `docs/DO_NOT_REINVESTIGATE.md`
2. `docs/PRIME_CANONICAL_CURRENT_STATE.md` — **this file**
3. `docs/student-dashboard-system-standard.md`
4. `docs/PRIME_PROGRESS_TRACKER_FROZEN_STANDARD.md`
5. `docs/student-learning-portfolio-template-v1.0.md`
6. `scripts/student-dashboard-contract-self-test.mjs`
7. `scripts/canonical-consistency-validator.mjs`
8. `app/dashboard/page.tsx`
9. `components/dashboard/student-dashboard-primitives.tsx`
10. `lib/progress-states.ts`
11. `app/api/pipeline/ingest/route.ts`
12. dated 2026-08-31 forensic documents only when historical pipeline evidence is needed

For Louise specifically, also read:

- `docs/student-portfolios/louise-nogueira-canonical-v1.0.md`
- `data/students/louise-d-silva-nogueira.firestore.json`

---

# 16. CURRENT STOP POINT

```text
DASHBOARD SHARED VISUAL SYSTEM = IMPLEMENTED / PRODUCTION
DASHBOARD SYSTEM STANDARD = CANONICAL
STUDENT LEARNING PORTFOLIO TEMPLATE v1.0 = FROZEN / CANONICAL
PROGRESS TRACKER = FROZEN TO 4 STATES
VOCABULARY PAGE CONTRAST = FIXED
NEXT ACTION / SCHEDULE SEPARATION = CANONICAL
ATTENDANCE SEMANTICS = FROZEN
LONGITUDINAL HISTORY = PRESERVED
REPOSITORY-BACKED STUDENT DASHBOARD = ACTIVE
LEGACY /api/pipeline/ingest = PAUSED BY DEFAULT IN PRODUCTION
APPS SCRIPT TRIGGER ITSELF = NOT PROVEN DISABLED
LAURA = DEFERRED
LOUISE PORTFOLIO v1.0 = CANONICALIZED
LOUISE CURRENT LEVEL = B1 / TEACHER VALIDATED
LOUISE TARGET LEVEL = B2 / TEACHER VALIDATED
LOUISE CLASS RHYTHM = MONDAY 8:00–9:00 AM / TEACHER VALIDATED
LOUISE DASHBOARD = UPDATED / PRODUCTION
LOUISE DASHBOARD PORTFOLIO LINK = CANONICAL v1.0
LOUISE PRIME SUPPORT = SHARED SYSTEM-WIDE DESTINATION
NEXT STUDENT PROCESSING PRIORITY = NOT YET FROZEN
```

**NEXT AUTHORIZED PRODUCT ACTION:** choose the next student processing priority and process that student against the frozen canonical Portfolio + Dashboard system. Do not reactivate the legacy Laura ingestion flow unless an explicit product decision reverses the pause.

**STATUS: 🚨 CANONICAL CURRENT RETURN POINT — 2026-09-11**