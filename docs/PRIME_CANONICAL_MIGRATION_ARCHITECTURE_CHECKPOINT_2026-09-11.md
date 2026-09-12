# PRIME Digital Hub — Canonical Migration & Architecture Checkpoint

**Date:** 11 September 2026  
**Status:** Canonical / migration boundary  
**Repository:** `alexmelloenglish-gif/prime-hub-portal`  
**Current production main:** `841a190edf4a1a6d35c2564c06ffc3100ebbe2a2`  
**Latest hardening:** PR #17 — Legacy Automation Hardening  
**Production deployment:** `dpl_2PTRmdwc1HLiotddDQc12nuC1Ecq` — READY  
**Domain:** `www.primedigitalhub.com.br`

> **Purpose:** This document is the single canonical checkpoint for the PRIME migration boundary. Future agents and contributors must read it before changing the legacy pipeline, dashboard projection, learner-state semantics, admin runtime, or beginning replacement automation.

---

## 1. Current canonical status

The migration boundary is established and hardened in production.

- **Gate A — Eligibility Boundary:** CLOSED / MERGED
- **Gate B — Evidence / Assessment Contract:** CLOSED / MERGED
- **Gate C — Admin Runtime:** CLOSED / MERGED / production smoke PASS
- **Gate D — Lesson Intelligence:** CLOSED / MERGED
- **Gate H — Legacy Automation Hardening:** CLOSED / MERGED / production READY
- **Gate E — End-to-End Authority:** **NEXT / OPEN**
- **Replacement Automation:** **BLOCKED until Gate E is complete**

The legacy pipeline is frozen. Historical records remain intact. The canonical learner/dashboard reference layer is established. The obsolete Firestore learner-projection publication stack has been removed.

This is an intentional migration boundary, not an unfinished implementation that should be completed by restoring the old automation.

---

## 2. Production checkpoint and Gate H evidence

PR #17 established the final legacy-automation hardening boundary.

Production main is:

`841a190edf4a1a6d35c2564c06ffc3100ebbe2a2`

Vercel deployment:

`dpl_2PTRmdwc1HLiotddDQc12nuC1Ecq`

Status: **READY**  
Domain: `www.primedigitalhub.com.br`

The two residual mutator workflows were removed:

- `.github/workflows/apply-publication-policy.yml`
- `.github/workflows/restore-run-policy.yml`

Production explicitly retains:

`PIPELINE_AUTOMATION_FROZEN=true`

Critical unauthenticated boundary checks returned:

| Endpoint | Result |
|---|---|
| `GET /api/cron/drive-transcripts` | `401 Unauthorized` |
| `POST /api/admin/process-drive` | `401 Authentication required` |
| `POST /api/admin/pipeline/retry` | `401 Authentication required` |
| `POST /api/pipeline/ingest` | `401 Unauthorized` |

No test call crossed the execution boundary.

**Rule:** Do not interpret these checks as proof that the old pipeline is healthy. They prove that the frozen execution boundary is protected.

---

## 3. What the completed gates establish

### Gate A — Eligibility Boundary

Learner access is explicit rather than inferred from profile presence. The canonical eligibility contract distinguishes `prospect` from `learner`, preserves the authorized learner registry, and protects dashboard access and admin preview behavior.

### Gate B — Evidence / Assessment Contract

Processing, evidence, assessment, and report are independent lifecycle axes:

- **PROCESSING:** `NOT_STARTED`, `RUNNING`, `COMPLETED`, `FAILED`
- **EVIDENCE:** `NONE`, `SOURCE_ONLY`, `CANDIDATES_FOUND`, `VALIDATED`
- **ASSESSMENT:** `NOT_ASSESSED`, `REVIEW_REQUIRED`, `TEACHER_VALIDATED`
- **REPORT:** `NONE`, `PLACEHOLDER`, `DRAFT`, `VALIDATED`, `PUBLISHED`

Unknown values remain unknown rather than silently becoming `NOT_ASSESSED`.

### Gate C — Admin Runtime

Teacher Intelligence is reachable and separated from Preview Student Dashboard. Lesson Intelligence supports both the general view and the student-filtered view. Production smoke checks passed for auth/authz, navigation, general intelligence, filtered intelligence, and student preview.

### Gate D — Lesson Intelligence

Admin lesson intelligence distinguishes lesson identity from processing attempts and exposes the authority chain without inventing attendance, evidence, or pedagogical outcomes. Attendance is `NOT PROVEN` when independent authority is absent.

### Gate H — Legacy Automation Hardening

All known legacy automatic/manual/retry entry points remain frozen. Residual mutator workflows were removed. Historical runs were not deleted or rewritten. No replacement automation was introduced by the hardening work.

---

## 4. Legacy pipeline containment

The old automatic creation boundary is frozen across the previously identified surfaces:

- Vercel Cron;
- Google Workspace Events / Pub/Sub webhook processing;
- canonical ingest endpoint callers such as Apps Script or other callers;
- retry/manual Drive processing paths;
- Drive reconciliation/processing paths.

Historical pipeline runs, transcripts, reports, and events are evidence and must remain preserved.

**Do not reactivate, repair, or extend the legacy pipeline as a shortcut.**

---

## 5. Canonical learner-state architecture

The intended authority chain remains:

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

Google Docs may remain a human-readable longitudinal reference, but a document change does not automatically become the dashboard source of truth.

The core registry is the authority for learner-facing canonical portfolio references. Legacy portfolio documents may remain as historical/source evidence, but must not become dashboard destinations.

---

## 6. Canonical learner-facing assessment states

The dashboard contract has exactly four learner-facing states:

- `Strong`
- `Improving`
- `Needs Focus`
- `Not Assessed`

Decorated or legacy labels must be normalized explicitly into this contract. Unknown values must not silently default to `Not Assessed`.

### `Not Assessed` is an epistemic state

`Not Assessed` means that the available evidence did not permit a confident assessment of that specific domain/item. It is not a negative assessment and is not a processing failure.

Therefore:

- no evaluative insight should be rendered underneath `Not Assessed`;
- the renderer must defensively enforce this rule;
- lack of assessment must never be converted into an invented judgment.

---

## 7. Execution state is different from learning state

Do not collapse technical processing status into pedagogical outcome.

Useful distinctions are:

1. `NOT_RUN` — no processing attempt is demonstrated.
2. `INSUFFICIENT_EVIDENCE` — available material is insufficient for the intended assessment.
3. `FAILED` — processing/extraction/assessment execution failed.
4. `ASSESSED` — sufficient evidence was processed and an assessment can be supported.

A technical `COMPLETED` pipeline run does **not** by itself prove that evidence was extracted, interpreted, validated, or reflected in the canonical learning record.

A report artifact can therefore exist without proven end-to-end learning intelligence.

---

## 8. Known evidence warnings

The current canonical audit retains **10 known warnings** intentionally. They are evidence-reconciliation work, not generic build failures.

### Eight historical scheduling warnings

Eight old past lessons across Eduarda, Laura, and Maria Fernanda remain marked as scheduled. They must be traced rather than mechanically cleaned up:

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

Legitimate outcomes include: scheduled but never happened; happened without transcript; transcript never processed; processing failed; processing completed without report; report with insufficient evidence; or evidence that should enter the canonical learning record.

### Rafael — 27/08/2026

The earlier operator-reported hypothesis of a Gemini transcription failure is **superseded by stronger evidence**.

The evidence chain now established is:

```text
Google Calendar event
      ↓
Google Meet / Gemini notes generated
      ↓
Apps Script processPipeline
      ↓
30 execution failures
      ↓
No downstream canonical report
```

#### A. Attendance / lesson identity

Google Calendar confirms:

- **Event:** `🇬🇧 RAFAEL COPOLILLO | Prime Digital Hub`
- **Date:** 27/08/2026
- **Time:** 09:00–10:00 BRT
- **Participants:** Rafael and Alexandre
- **Meet:** `https://meet.google.com/iij-zvgn-yct`
- **Event ID:** `ddotvrsvhvkqttevnqbdo48nmq_20260827T120000Z`

This establishes the scheduled lesson identity and the attendance context available from the calendar record.

#### B. Source capture / Gemini evidence

An official Gemini email exists:

- **Message ID:** `1a0436610ba0d0dd`
- **Subject:** `Anotações: “🇬🇧 RAFAEL COPILOTTO | Prime Digital Hub”`
- **Generated:** 27/08/2026 at 10:24 BRT
- **Gemini document:** `1_yQ0gyOncDsDj49YbS6_D9y8L1Rw811bJSl409jKjvA`

The generated notes include:

> “Technical configuration session successfully established interface settings and tool functionality for the team.”

Therefore the earlier hypothesis that Gemini failed to receive or generate the lesson notes is contradicted by stronger evidence. A source/notes artifact existed before the downstream processing failure.

#### C. Processing failure

An official Google Apps Script failure email exists:

- **Message ID:** `1a048c4e73870c8f`
- **Script:** `PRIME Digital Hub — Google Meet Transcript Automation`
- **Function:** `processPipeline`
- **Failures:** 30 attempts
- **Period:** 27/08/2026, 11:08:15–11:39:15 BRT
- **Error:**

```text
Execution failed.
The Rhino runtime is deprecated and no longer supported.
```

This establishes a processing failure **after source capture**, not a failure of Gemini note generation.

#### D. Current technical conclusion

The best-supported classification is:

**EXPLAINED / PROCESSING FAILURE AFTER SOURCE CAPTURE**

The evidence supports:

- lesson identity established;
- Meet/Gemini source artifact existed;
- downstream `processPipeline` execution was attempted;
- the process failed repeatedly because the Rhino runtime was deprecated/unsupported;
- no downstream canonical report was published for this lesson;
- the 11-attended vs. 10-published-report discrepancy is therefore explained at the processing layer, subject to the exact attendance/report grain remaining consistent with the repository model.

Do **not** manufacture report #11.

Do **not** alter attendance merely to reconcile counts.

The former classification `OPERATOR-REPORTED / PENDING LOG CONFIRMATION` is superseded and should no longer be used for this case.

#### E. Gate E significance

Rafael 27/08 is now a strong **negative / insufficient-evidence witness** for Gate E:

```text
Lesson identity        = PROVEN
Source capture         = PROVEN
Processing attempt     = PROVEN
Processing outcome     = FAILED
Evidence validation    = NOT PROVEN
Assessment             = NOT PROVEN
Teacher validation     = NOT PROVEN
Canonical report       = NOT PRODUCED
```

The case demonstrates why source capture, processing completion, evidence validation, and learner-facing publication must remain separate authority states.

---

## 9. Gate E — next required workstream: End-to-End Authority

Gate E is the only required open gate before replacement automation can be designed/implemented.

The goal is to demonstrate, with real historical evidence, the complete authority chain:

```text
Lesson identity
      ↓
Attendance authority
      ↓
Source / transcript
      ↓
Processing
      ↓
Evidence availability
      ↓
Assessment
      ↓
Teacher validation
      ↓
Canonical learning record
      ↓
Authorized student projection
```

Gate E must include at least:

1. a **positive trace** where the chain can be demonstrated end-to-end;
2. a **negative/insufficient-evidence trace** showing where and why the chain stops without inventing state;
3. explicit handling of the Rafael 27/08 case and the scheduled-warning cases;
4. the observed data contract required by future automation.

Rafael 27/08 now serves as a concrete negative witness: source capture existed, but downstream processing failed before validated evidence/assessment/report publication.

**Do not infer the replacement automation contract from the old pipeline implementation. Derive it from Gate E evidence.**

---

## 10. Replacement automation boundary

Replacement automation is deliberately **BLOCKED** until Gate E is closed.

Do not select or implement a replacement provider, model, scheduler, trigger, or processing mechanism merely because the old system is frozen.

The eventual replacement must preserve at least:

- immutable historical evidence during migration;
- deterministic and traceable lesson identity;
- explicit evidence availability separate from execution status;
- processing failure separate from insufficient evidence;
- technical completion unable to masquerade as assessed learning;
- explicit teacher authority/validation;
- canonical learning state as the authoritative learner record;
- authorized student projection rather than accidental document/pipeline side effects;
- duplicate control that does not incorrectly suppress legitimate migration/reprocessing;
- auditable provenance for every transition that can affect learner-facing state.

---

## 11. Anti-rework rules

Future contributors/agents must **not**:

1. reopen Gates A, B, C, D, or H without an explicit new decision based on new evidence;
2. reactivate the frozen legacy pipeline to “make the numbers work”;
3. delete historical pipeline runs, transcripts, reports, or events to remove warnings;
4. rewrite historical evidence to fit the new schema without an explicit migration decision;
5. treat `COMPLETED` as proof of successful learning assessment;
6. turn `Not Assessed` into an evaluative judgment;
7. create a new dashboard source of truth outside the canonical repository/reference layer;
8. repair the 10 warnings as generic code cleanup without tracing their underlying evidence;
9. implement replacement automation before Gate E establishes the real authority contract;
10. add a second competing canonical document for this same migration boundary.

If future implementation conflicts with this document, resolve the conflict explicitly before code changes are made.

---

## 12. Canonical status

**Migration boundary:** ESTABLISHED  
**Legacy pipeline:** FROZEN  
**Gate A — Eligibility:** CLOSED / MERGED  
**Gate B — Evidence / Assessment:** CLOSED / MERGED  
**Gate C — Admin Runtime:** CLOSED / MERGED / SMOKE PASS  
**Gate D — Lesson Intelligence:** CLOSED / MERGED  
**Gate H — Legacy Automation Hardening:** CLOSED / MERGED / PRODUCTION READY  
**Canonical dashboard reference layer:** ESTABLISHED  
**Firestore learner publication stack:** REMOVED  
**Production:** READY  
**Historical evidence:** PRESERVED  
**Known evidence warnings:** 10, intentionally unresolved  
**Gate E — End-to-End Authority:** NEXT / OPEN  
**Replacement automation:** BLOCKED  

This document is the **single canonical migration/architecture checkpoint** for this state of PRIME Digital Hub. Do not create a competing canonical document for the same boundary.
