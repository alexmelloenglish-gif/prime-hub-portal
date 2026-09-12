# PRIME Digital Hub — Canonical Migration & Architecture Checkpoint

**Date:** 11 September 2026  
**Status:** Canonical / migration boundary  
**Repository:** `alexmelloenglish-gif/prime-hub-portal`  
**Current production main:** `841a190edf4a1a6d35c2564c06ffc3100ebbe2a2`  
**Latest hardening:** PR #17 — Legacy Automation Hardening  
**Production deployment:** `dpl_2PTRmdwc1HLiotddDQc12nuC1Ecq` — READY  
**Domain:** `www.primedigitalhub.com.br`

> **Purpose:** This is the single canonical checkpoint for the PRIME migration boundary. Future agents must read it before changing the legacy pipeline, dashboard projection, learner-state semantics, admin runtime, or implementing the new intelligence/review flow.

---

## 1. Current canonical status

The migration boundary is established and hardened in production.

- **Gate A — Eligibility Boundary:** CLOSED / MERGED
- **Gate B — Evidence / Assessment Contract:** CLOSED / MERGED
- **Gate C — Admin Runtime:** CLOSED / MERGED / production smoke PASS
- **Gate D — Lesson Intelligence:** CLOSED / MERGED
- **Gate H — Legacy Automation Hardening:** CLOSED / MERGED / production READY
- **Gate E — End-to-End Authority:** **OPEN**
- **Replacement automation — autonomous publication:** **BLOCKED**
- **New review-gated intelligence lane:** **ALLOWED TO BEGIN**

The legacy pipeline remains frozen. Historical records remain intact. The canonical learner/dashboard reference layer is established. The obsolete Firestore learner-projection publication stack has been removed.

This is an intentional boundary, not an unfinished implementation that should be completed by restoring the old automation.

---

## 2. Production checkpoint and Gate H evidence

Production main:

`841a190edf4a1a6d35c2564c06ffc3100ebbe2a2`

Vercel deployment:

`dpl_2PTRmdwc1HLiotddDQc12nuC1Ecq` — READY  
Domain: `www.primedigitalhub.com.br`

The residual mutator workflows were removed:

- `.github/workflows/apply-publication-policy.yml`
- `.github/workflows/restore-run-policy.yml`

Production retains:

`PIPELINE_AUTOMATION_FROZEN=true`

Unauthenticated boundary checks returned:

| Endpoint | Result |
|---|---|
| `GET /api/cron/drive-transcripts` | `401 Unauthorized` |
| `POST /api/admin/process-drive` | `401 Authentication required` |
| `POST /api/admin/pipeline/retry` | `401 Authentication required` |
| `POST /api/pipeline/ingest` | `401 Unauthorized` |

No test call crossed the execution boundary.

These checks prove the frozen execution boundary is protected; they do not prove the old pipeline is healthy.

---

## 3. Completed gates

### Gate A — Eligibility Boundary

Learner access is explicit: `prospect` versus `learner`. Dashboard access and admin preview behavior are protected by the canonical eligibility contract.

### Gate B — Evidence / Assessment Contract

Independent lifecycle axes:

- **PROCESSING:** `NOT_STARTED`, `RUNNING`, `COMPLETED`, `FAILED`
- **EVIDENCE:** `NONE`, `SOURCE_ONLY`, `CANDIDATES_FOUND`, `VALIDATED`
- **ASSESSMENT:** `NOT_ASSESSED`, `REVIEW_REQUIRED`, `TEACHER_VALIDATED`
- **REPORT:** `NONE`, `PLACEHOLDER`, `DRAFT`, `VALIDATED`, `PUBLISHED`

Unknown values remain unknown rather than silently becoming `NOT_ASSESSED`.

### Gate C — Admin Runtime

Teacher Intelligence is separated from Preview Student Dashboard. General and student-filtered Lesson Intelligence work in production. Auth/authz and smoke checks passed.

### Gate D — Lesson Intelligence

Lesson identity is separated from processing attempts. Attendance, evidence, and pedagogical outcomes are not inferred when independent authority is absent.

### Gate H — Legacy Automation Hardening

Legacy automatic/manual/retry entry points remain frozen. Residual mutator workflows were removed. Historical runs were not deleted or rewritten. No replacement automation was introduced by H.

---

## 4. Canonical learner-state architecture

The learner-facing authority chain remains:

```text
SOURCE / CLASS EVIDENCE
        ↓
REVIEW / AUTHORITY
        ↓
CANONICAL LEARNING RECORD
        ↓
AUTHORIZED PROJECTION
        ↓
STUDENT DASHBOARD
```

Google Docs may remain a human-readable longitudinal reference, but a document change does not automatically become dashboard state.

The core registry is the authority for learner-facing canonical portfolio references. Legacy portfolio documents remain historical/source evidence only and must not become dashboard destinations.

---

## 5. Learner-facing assessment states

The dashboard contract has exactly four learner-facing states:

- `Strong`
- `Improving`
- `Needs Focus`
- `Not Assessed`

`Not Assessed` means available evidence did not permit confident assessment of that specific domain/item. It is not a negative assessment and not a processing failure. No evaluative insight should render beneath it.

---

## 6. Execution state is different from learning state

Do not collapse technical status into pedagogical outcome.

Useful distinctions include:

- `NOT_RUN`
- `INSUFFICIENT_EVIDENCE`
- `FAILED`
- `ASSESSED`

A technical `COMPLETED` run does not prove evidence extraction, interpretation, teacher validation, or canonical learning state.

---

## 7. Known evidence warnings and Rafael 27/08

There are still **10 known warnings**, intentionally retained as evidence-reconciliation work.

Eight historical scheduled warnings across Eduarda, Laura, and Maria Fernanda remain to be traced rather than mechanically cleaned.

### Rafael — 27/08/2026

The earlier hypothesis of a Gemini transcription failure is superseded.

Established evidence chain:

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

Calendar record:

- Event: `🇬🇧 RAFAEL COPILOTTO | Prime Digital Hub`
- Date/time: 27/08/2026, 09:00–10:00 BRT
- Participants: Rafael and Alexandre
- Meet: `https://meet.google.com/iij-zvgn-yct`
- Event ID: `ddotvrsvhvkqttevnqbdo48nmq_20260827T120000Z`

Gemini source evidence:

- Message ID: `1a0436610ba0d0dd`
- Generated: 27/08/2026 10:24 BRT
- Gemini document: `1_yQ0gyOnDsDj49YbS6_D9y8L1Rw811bJSl409jKjvA`

Apps Script failure evidence:

- Message ID: `1a048c4e73870c8f`
- Script: `PRIME Digital Hub — Google Meet Transcript Automation`
- Function: `processPipeline`
- 30 failures from 11:08:15–11:39:15 BRT
- Error: `The Rhino runtime is deprecated and no longer supported.`

Classification:

**EXPLAINED / PROCESSING FAILURE AFTER SOURCE CAPTURE**

Trace:

```text
Lesson identity     = PROVEN
Source capture      = PROVEN
Processing attempt  = PROVEN
Processing outcome  = FAILED
Evidence validation = NOT PROVEN
Assessment          = NOT PROVEN
Teacher validation  = NOT PROVEN
Canonical report    = NOT PRODUCED
```

Do not manufacture report #11 and do not alter attendance merely to equalize counts.

This is a strong negative / insufficient-evidence witness for Gate E.

---

## 8. Ítalo — 18/08/2026 partial positive witness

Known historical material:

- Student: Ítalo Pires
- Lesson: `italo-2026-08-18`
- Transcript source: Google Meet / Gemini
- Gemini document: `13oHYTCiShhOHSIhq4TO2jOXdjxOiDTlob17p6vpBDrc`
- Meet: `yvr-xrvs-gaw`
- Generated: 18/08/2026 16:59 BRT

A controlled reconstruction attempt was made without modifying historical data.

It was correctly blocked because:

1. the historical retry route is protected by `PIPELINE_AUTOMATION_FROZEN` and returned `503 Pipeline automation is frozen`;
2. the execution environment had no authenticated `DATABASE_URL` / `DATABASE_URL_UNPOOLED` and no active WebDev SQL path.

No database, historical GitHub record, or learner state was modified.

Trace:

```text
Lesson identity     = PROVEN
Source / transcript = PROVEN
Historical artifact = PROVEN
Processing          = NOT RECONSTRUCTED
Evidence validation = NOT PROVEN BY THIS ATTEMPT
Assessment          = NOT PROVEN BY THIS ATTEMPT
Teacher validation  = NOT PROVEN BY THIS ATTEMPT
Canonical record    = NOT CREATED
Projection          = NOT CREATED
Overall             = POSITIVE / PARTIAL E2E
```

This is a valid Gate E observation. The protection prevented artificial reconstruction.

---

## 9. Gate E — current authority strategy

Gate E remains **OPEN**. A complete historical positive trace has not yet been established.

However, Gate E is **not a reason to stop operating the product or to keep new lessons in a queue**.

There are now three explicit lanes:

### Lane 1 — Product / Canonical learner state

Existing canonical learning records, portfolios, and dashboards continue operating.

Teacher-authorized maintenance of an existing canonical record is allowed. The dashboard continues to read only the canonical learning record / authorized Registry projection.

**Dashboard never reads an AI candidate directly.**

### Lane 2 — New intelligence / shadow + review

The new automation lane may begin immediately for new real lessons, provided its initial output is a candidate/review artifact rather than automatic learner-state publication.

The chain is:

```text
SOURCE
Meet / Gemini artifact
        ↓
CAPTURE
lessonId
studentId
occurredAt
sourceRef
sourceHash / provenance
        ↓
INTELLIGENCE
EvidenceCandidate(s)
LearningSignal candidate(s)
Assessment candidate(s)
        ↓
REVIEW_REQUIRED
        ↓
TEACHER DECISION
APPROVED / EDITED / REJECTED
        ↓
CANONICAL LEARNING RECORD
        ↓
AUTHORIZED PROJECTION
Dashboard / Portfolio
```

AI must never write canonical learning state directly.

### Lane 3 — Historical Gate E audit

In parallel, search existing read-only historical evidence for a genuine positive trace. Do not manufacture or reprocess history just to close the gate.

---

## 10. Candidate Record and review-transition invariants

The new automation must structurally separate intelligence from authority.

Minimum lifecycle:

```text
CAPTURED
   ↓
CANDIDATE_GENERATED
   ↓
REVIEW_REQUIRED
   ├── REJECTED
   ├── NEEDS_EDIT
   └── APPROVED
          ↓
     CANONICALIZED
          ↓
      PROJECTED
```

`APPROVED` and `PROJECTED` are distinct events. Approval is a teacher-authority transition; projection is a separate authorized publication transition.

Candidate provenance must include, at minimum where applicable:

```text
candidateId
lessonId
studentId
sourceType
sourceRef
sourceTimestamp
capturedAt
processorVersion / model
promptVersion
input/provenance reference
candidateType
candidatePayload
generation metadata
reviewStatus
reviewedBy
reviewedAt
teacherChanges
canonicalRecordId
canonicalizedAt
projectionStatus
projectedAt
```

Do not over-engineer fields that are not supported by the actual persistence model. The non-negotiable requirement is traceability: a future reviewer must be able to answer where a learner-facing fact came from and which human decision authorized it.

### Structural firewall

No shadow-automation code may reuse or call the legacy automatic publication capability.

The new lane must produce reviewable candidates and use an explicit teacher-authorized transition for canonicalization. Unreviewed AI output must be technically incapable of becoming dashboard state.

---

## 11. Positive witness policy for Gate E

Gate E does **not** require finding a historical positive witness at all costs.

A historical positive trace is valuable for explaining the legacy system, but the new architecture may create a legitimate positive witness as soon as there is:

- a real lesson;
- real source evidence;
- real candidate generation;
- explicit human review;
- teacher approval;
- canonicalization;
- authorized projection.

That new witness is valid because it is created through the new authority chain, not by rewriting history.

Therefore:

- **historical positive trace:** preferred for legacy reconciliation, searched read-only;
- **new positive witness:** allowed through the new review-gated architecture;
- **artificial retrospective reconstruction:** forbidden unless a separately authorized reconstruction mechanism is introduced.

---

## 12. Replacement automation boundary

The following remain blocked:

- autonomous AI → canonical learning state;
- autonomous AI → portfolio/dashboard publication;
- reactivation of the legacy pipeline;
- bypassing teacher review;
- retrospective database reconstruction without explicit authority.

The following are allowed to begin now:

- source capture for new real lessons;
- candidate generation;
- provenance recording;
- review queue / teacher decision workflow;
- canonicalization after explicit teacher approval;
- authorized projection after canonicalization;
- read-only historical positive-trace discovery.

This is the immediate operational strategy: **build the new intelligence lane in shadow/review while preserving the canonical learner product.**

---

## 13. Anti-rework rules

Future contributors/agents must not:

1. reopen Gates A, B, C, D, or H without an explicit new decision based on new evidence;
2. reactivate the frozen legacy pipeline;
3. bypass the freeze to manufacture a Gate E trace;
4. delete historical pipeline runs, transcripts, reports, or events;
5. rewrite historical evidence without an explicit migration decision;
6. treat `COMPLETED` as proof of successful learning assessment;
7. turn `Not Assessed` into an evaluative judgment;
8. let the dashboard consume candidate data directly;
9. allow AI output to write canonical learning state without explicit teacher approval;
10. couple `APPROVED` automatically to `PROJECTED`;
11. repair warnings as generic cleanup without evidence tracing;
12. create another competing canonical migration document.

If implementation conflicts with this checkpoint, resolve the conflict explicitly before code changes.

---

## 14. Canonical status

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
**Gate E:** OPEN / AUTHORITY + TRACEABILITY  
**Historical positive trace:** SEARCH IN PARALLEL  
**New review-gated automation:** ALLOWED TO BEGIN  
**Unreviewed AI publication:** FORBIDDEN  
**Legacy pipeline reactivation:** FORBIDDEN

This document is the **single canonical migration/architecture checkpoint** for this state of PRIME Digital Hub. Do not create a competing canonical document for the same boundary.
