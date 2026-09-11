# PRIME Digital Hub — Canonical Migration & Architecture Checkpoint

**Date:** 11 September 2026  
**Status:** Canonical / migration boundary  
**Repository:** `alexmelloenglish-gif/prime-hub-portal`  
**Production merge:** `6837e659d8c455810b21324d8e324a0d082cf318`  
**Reference PR:** #11 — `Fix canonical dashboard sync and freeze legacy pipeline`

> **Purpose:** This document is the single canonical checkpoint for the migration boundary established by PR #11. Future agents and contributors must read this before changing the legacy pipeline, dashboard projection, learner-state semantics, or beginning replacement automation.

---

## 1. Migration decision

PR #11 established and merged the current migration boundary.

Production is **READY** with the following architectural state:

- the legacy transcript-processing pipeline is **frozen**;
- its historical records remain intact and must not be deleted or rewritten as part of migration;
- the canonical learner/dashboard reference layer is established;
- the obsolete Firestore learner-projection publication stack was removed;
- the student dashboard consumes the canonical repository/reference path rather than legacy student-specific publication logic;
- canonical learner-facing progress semantics are protected by source normalization and defensive rendering;
- the replacement automation/provider/model has **not** been implemented by this migration checkpoint.

This is an intentional boundary, not an unfinished implementation that should be “completed” by restoring the old automation.

---

## 2. What PR #11 proved

The merged branch passed the production validation set:

1. Teacher Intelligence self-test — PASS
2. Pipeline attempt self-test — PASS
3. Student Dashboard contract self-test — PASS
4. Canonical document → dashboard projection — PASS for 10 profiles
5. All-student canonical consistency audit — PASS for 10 registry students / 10 repository profiles
6. Strict canonical validator — **0 errors / 10 known warnings**
7. Next.js compile/type/static generation/build — PASS
8. GitHub/Vercel production status — SUCCESS / READY

The 10 warnings are deliberately preserved. They are evidence-reconciliation work, not build failures.

---

## 3. Legacy pipeline containment

The old automatic creation boundary was not merely disabled at one scheduler. The migration froze the legacy ingestion/processing entry paths, including the previously identified automatic/manual/retry surfaces:

- Vercel Cron;
- Google Workspace Events / Pub/Sub webhook processing;
- canonical ingest endpoint callers such as Apps Script or other callers;
- retry/manual Drive processing paths;
- Drive reconciliation/processing paths.

**Rule:** Do not reactivate, repair, or extend the legacy pipeline as a shortcut while designing the replacement automation.

Historical pipeline runs, transcripts, reports, and events are evidence. Migration must preserve them.

---

## 4. Canonical learner-state architecture

The intended authority chain is:

```text
TRANSCRIPTS / CLASS EVIDENCE
          ↓
 Teacher review
          ↓
CANONICAL LEARNING RECORD
          ↓
Authorized repository projection
          ↕
     Neon / Prisma
          ↓
STUDENT DASHBOARD
```

Google Docs may remain a human-readable longitudinal reference, but it is not automatically allowed to become the dashboard source merely because a document changed.

The core registry is the authority for learner-facing canonical portfolio references. Legacy portfolio documents may remain as historical/source evidence, but must not become dashboard destinations.

---

## 5. Canonical learner-facing assessment states

The dashboard contract has exactly four learner-facing states:

- `Strong`
- `Improving`
- `Needs Focus`
- `Not Assessed`

Decorated or legacy labels must be normalized explicitly into this contract. Unknown values must not silently default to `Not Assessed`.

### `Not Assessed` is an epistemic state

`Not Assessed` means that the available evidence did not permit a confident assessment of that specific domain/item. It is **not** a negative assessment and is **not** a processing failure.

Therefore:

- no evaluative insight should be rendered underneath `Not Assessed`;
- the renderer must defensively enforce this rule even if upstream data is imperfect;
- “not assessed” must not be converted into an invented judgment.

This distinction is essential for the replacement automation.

---

## 6. Execution state is different from learning state

Do not collapse technical pipeline status into pedagogical outcome.

Useful execution/assessment distinctions are:

1. `NOT_RUN` — no processing attempt is demonstrated.
2. `INSUFFICIENT_EVIDENCE` — the available material is not sufficient for the intended assessment.
3. `FAILED` — processing/extraction/assessment execution failed.
4. `ASSESSED` — sufficient evidence was processed and an assessment can be supported.

A technical `COMPLETED` pipeline run does **not** by itself prove that evidence was extracted, interpreted, validated, or reflected in the canonical learning record.

A report artifact can therefore exist without proven end-to-end learning intelligence. Such artifacts must not be treated as proof merely because their generation process reached a completed technical state.

---

## 7. The 10 known evidence warnings

At this checkpoint there are **10 known warnings**. They are intentionally unresolved.

### Eight historical scheduling warnings

Eight old past lessons across Eduarda, Laura, and Maria Fernanda are still marked as scheduled.

They must be reconciled as evidence, not mechanically “cleaned up.” For each lesson determine the actual chain:

```text
scheduled
   → attended?
   → transcript?
   → pipeline attempt?
   → Class Report?
   → canonical learning evidence?
   → teacher validation?
   → canonical learning record?
   → student projection?
```

Legitimate outcomes include:

- scheduled but never happened;
- happened but no transcript exists;
- transcript exists but was never processed;
- processing failed;
- processing succeeded but no report exists;
- report exists but evidence is insufficient;
- evidence exists and should be reflected in the canonical learning record.

### Two Rafael warnings

Rafael has an August 27 attended lesson without a corresponding report, producing the observed discrepancy of **11 attended lessons vs. 10 published reports**.

The reconciliation question is not simply “where is report #11?” It must establish what happened to the August 27 evidence, including whether the outcome is:

- a genuinely missing report;
- a duplicate/mismatched lesson identity;
- a deliberately unpublished report;
- or a mismatch between attendance grain and report grain.

Do not manufacture a report merely to make the counts equal.

---

## 8. Required next workstream: evidence reconciliation

Before implementing replacement automation, reconcile the 10 warnings using real historical evidence.

The output of this work should establish the actual data contract for automation:

```text
Lesson identity
      ↓
Evidence availability
      ↓
Processing state
      ↓
Assessment state
      ↓
Teacher validation
      ↓
Canonical learning record
      ↓
Student projection
```

The replacement automation must be designed from these observed cases, not from assumptions about how the old pipeline was supposed to behave.

---

## 9. Replacement automation boundary

The replacement automation is intentionally **out of scope** for this checkpoint.

Do not select or implement a replacement provider/model/automation mechanism merely because the old system is frozen.

The replacement must eventually preserve these architectural requirements:

- historical evidence remains immutable during migration;
- lesson identity is deterministic and traceable;
- evidence availability is distinguishable from execution status;
- processing failure is distinguishable from insufficient evidence;
- technical completion cannot masquerade as assessed learning;
- teacher authority/validation remains explicit;
- canonical learning state is the authoritative learner record;
- student dashboard is an authorized projection, not an accidental side effect of a document or pipeline run;
- duplicate processing must be controlled without incorrectly suppressing legitimate migration/reprocessing cases.

---

## 10. Anti-rework rules

Future contributors/agents must **not**:

1. reactivate the frozen legacy pipeline to “make the numbers work”;
2. delete historical pipeline runs, transcripts, reports, or events to remove warnings;
3. rewrite historical evidence to fit the new schema without an explicit migration decision;
4. treat `COMPLETED` as proof of successful learning assessment;
5. turn `Not Assessed` into an evaluative judgment;
6. create a new dashboard source of truth outside the canonical repository/reference layer;
7. repair the 10 warnings as generic code cleanup without tracing their underlying evidence;
8. implement replacement automation before the evidence-reconciliation work establishes the real contract;
9. add a second competing “canonical” document for this same migration boundary.

If a future implementation conflicts with this document, the conflict must be resolved explicitly before code changes are made.

---

## 11. Canonical status

**Migration boundary:** ESTABLISHED  
**Legacy pipeline:** FROZEN  
**Canonical dashboard reference layer:** ESTABLISHED  
**Firestore learner publication stack:** REMOVED  
**Production:** READY  
**Historical evidence:** PRESERVED  
**Known evidence warnings:** 10, intentionally unresolved  
**Next required work:** Evidence reconciliation  
**Replacement automation:** NOT YET IMPLEMENTED  

This document is the single canonical migration/architecture checkpoint for this state of PRIME Digital Hub.
