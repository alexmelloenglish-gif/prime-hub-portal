# Student Dashboard Provenance Audit v1

**Date:** 2026-09-18  
**Status:** CLOSED — factual audit baseline  
**Scope:** Student Dashboard provenance, historical witness reconstruction, pedagogical event tracing, V2 authorization lineage, and architectural hypothesis verdict.

> This document records audit findings only. It is not a governance contract, remediation plan, or architecture decision.

---

## 1. Witness and investigation freeze

**Student:** Gustavo Drummond de Andrade Salgado  
**studentId:** `stu_4c4da6c04ac4`  
**Dashboard identity:** `carolvdrummond@gmail.com`

**Investigation cutoff:** 2026-09-15 06:16:21 BRT  
**Historical Git SHA:** `59ec82cf6ca4c0e8ef2be6444f7e21fb6cfc2f1a`

Historical state classification:

```text
RECONSTRUCTED
```

The repository code, learner snapshot, teacher-authorized V2 package, source corpus, and relevant projection logic are preserved sufficiently to reconstruct the semantic state. An immutable historical runtime/database/UI capture at the cutoff is not preserved, so the state is not classified as REPRODUCED.

---

## 2. Source corpus

The witness corpus contains four source-grounded lessons:

| Date | Source document |
|---|---|
| 2026-08-18 | `1BFFOcZ68_QZu2FZy2v1mxmvO1MnLvm9NcEKv_n1R1ZU` |
| 2026-08-25 | `1glruhOpTZS74T4z-N32dfTk5fbO796aUwFj3Yw0xHAs` |
| 2026-09-01 | `1rRWDHpxFzbNvGHNyO61RzyB46lIpoFDmqp2WPvmzsXY` |
| 2026-09-08 | `1AgYhw2rlsjtpv0wmfay1nGgGhU6Pky7hni81_kMXJec` |

A later Gustavo lesson created on 2026-09-15 after the audit cutoff is excluded from the historical witness.

---

## 3. Frozen historical artifacts

Relevant frozen repository artifacts at the cutoff include:

- `data/students/carolvdrummond-gmail-com.firestore.json`
  - blob: `f216d2894f9007a562d5b2a78f7fb26577ee5b2f`
- `data/teacher-intelligence/gustavo-drummond-v2.json`
  - blob: `efb9a3491e657128f92b49f4618b49005cc22082`
- `lib/teacher-decision-packages.ts`
- `lib/student-data.ts`
  - blob: `c7705109e2342fee392e4d5af4c8423330437bd4`
- `lib/canonical-dashboard.ts`
  - blob: `84888bb9db96b3dbccdffa144d9f1cf23ed41a2c`
- `lib/canonical-student-projection.ts`
  - blob: `d66b5aa0b608b4c391d2c261271cff2c15620dc1`
- `app/dashboard/page.tsx`
  - blob: `d2d36eb410f6d28f3434683698dbecfa9490a297`
- `prisma/schema.prisma`
  - blob: `22eaefcb89143f672e61cb4019491a944a618136`

Dashboard projection version at the cutoff:

```text
student-dashboard-v1.0
```

---

## 4. Historical witness findings

### 4.1 Legacy generation

For the preserved legacy August traces, the system demonstrates a representation gap / non-materialization pattern.

For the 2026-08-25 lesson, the preserved trace includes:

```text
Transcript
    ↓
PipelineRun
    ↓
authorityStatus = non_authoritative
    ↓
EvidenceCandidate = 0
LearningSignalProposal = 0
TeacherInsightProposal = 0
    ↓
ClassReportProjection = published placeholder
PortfolioProjection = applied
implementationStatus = not_proven
```

The source transcript is substantial, so this pattern cannot be explained solely by absence of a usable lesson source.

A comparable legacy non-materialization pattern is preserved for the 2026-08-18 generation.

These findings are classified as:

```text
REPRESENTATION GAP / NON-MATERIALIZATION OBSERVED
```

They are not, by themselves, evidence of PERSISTENCE LOSS.

For 2026-09-01 and 2026-09-08, equivalent legacy materialization traces are not preserved sufficiently to support the same operational conclusion.

---

## 5. Pedagogical Event Ledger v1

The four-lesson first-cycle ledger is closed.

### 2026-08-18

```text
SOURCE EVIDENCE
OBSERVED

LEGACY REPRESENTATION GAP
OBSERVED

V2 STRUCTURED PEDAGOGICAL REPRESENTATION
OBSERVED

LEARNER SNAPSHOT
OBSERVED

V2 ↔ SNAPSHOT SEMANTIC CORRESPONDENCE
OBSERVED, PARTIAL

V2 → SNAPSHOT OPERATIONAL LINEAGE
NOT PROVEN

PEDAGOGICAL LOSS
NOT PROVEN
```

### 2026-08-25

```text
SOURCE EVIDENCE
OBSERVED

LEGACY REPRESENTATION GAP
OBSERVED

LEGACY PLACEHOLDER PUBLICATION
OBSERVED

V2 STRUCTURED PEDAGOGICAL REPRESENTATION
OBSERVED

LEARNER SNAPSHOT
OBSERVED

V2 ↔ SNAPSHOT SEMANTIC CORRESPONDENCE
OBSERVED

V2 → SNAPSHOT OPERATIONAL LINEAGE
NOT PROVEN

PEDAGOGICAL LOSS
NOT PROVEN
```

### 2026-09-01

```text
SOURCE EVIDENCE
OBSERVED

V2 STRUCTURED PEDAGOGICAL REPRESENTATION
OBSERVED

LEARNER SNAPSHOT
OBSERVED

V2 ↔ SNAPSHOT SEMANTIC CORRESPONDENCE
OBSERVED

V2 → SNAPSHOT OPERATIONAL LINEAGE
NOT PROVEN

LEGACY MATERIALIZATION
NOT OBSERVABLE FROM PRESERVED DATABASE TRACE

PEDAGOGICAL LOSS
NOT PROVEN
```

### 2026-09-08

```text
SOURCE EVIDENCE
OBSERVED

V2 STRUCTURED PEDAGOGICAL REPRESENTATION
OBSERVED

LEARNER SNAPSHOT
OBSERVED

V2 ↔ SNAPSHOT SEMANTIC CORRESPONDENCE
STRONG / OBSERVED

V2 → SNAPSHOT OPERATIONAL LINEAGE
NOT PROVEN

LEGACY MATERIALIZATION
NOT OBSERVABLE FROM PRESERVED DATABASE TRACE

PEDAGOGICAL LOSS
NOT PROVEN
```

Cross-lesson conclusion:

```text
LEGACY → V2 CAUSAL CONTINUITY
NOT PROVEN

V2 → canonicalProjection OPERATIONAL LINEAGE
NOT PROVEN

V2 → ClassReportProjection OPERATIONAL LINEAGE
NOT PROVEN

HISTORICAL EFFECTIVE RUNTIME
RECONSTRUCTED

PEDAGOGICAL LOSS
NOT PROVEN
```

---

## 6. Current / frozen learner dashboard path

The preserved code establishes two distinct cognitive input paths into the learner-facing dashboard.

### Path A — longitudinal learner state

```text
authorized learner record / snapshot
        ↓
canonicalProjection
        ↓
currentState
whatChanged
priorities
nextAction
schedule
```

### Path B — Learning Intelligence

```text
classReports
    ↓
teacherInsight
    ↓
buildLearningIntelligence()
    ↓
parseTransferPoints()
    ↓
LearningIntelligence
```

The frozen Gustavo learner snapshot contains four narrative `teacherInsight` strings. None begins with the required `Transfer points —` protocol.

Therefore, for the frozen repository snapshot:

```text
buildLearningIntelligence(classReports)
→ 0 qualifying transfer threads
→ learningIntelligence = []
```

This is deterministic for the frozen repository snapshot. It is not proof of the exact historical Production runtime output because historical PostgreSQL `ClassReportProjection` state at the cutoff is not preserved as an immutable snapshot.

The learner dashboard path therefore demonstrates a projection-to-projection reconstruction dependency for part of learner-facing intelligence:

```text
ClassReport
    ↓
teacherInsight textual representation
    ↓
Learning Intelligence reconstruction
```

---

## 7. V2 → Learner Projection Lineage Audit

### 7.1 V2 authority

The cutoff repository contains:

```text
packageId =
teacher-decision-gustavo-v2-2026-09-15

status =
teacher_authorized

canonicalizationStatus =
authorized_for_projection
```

The package records teacher authority over the bounded V2 pedagogical state and is registered in `lib/teacher-decision-packages.ts`.

The package is consumed by Teacher Intelligence / admin surfaces.

Therefore:

```text
V2 PACKAGE EXISTS
PROVEN

TEACHER AUTHORIZATION
PROVEN

AUTHORIZATION FOR PROJECTION
PROVEN

PACKAGE REGISTRATION
PROVEN

ADMIN TEACHER-INTELLIGENCE CONSUMPTION
PROVEN
```

### 7.2 Repository learner snapshot chronology

The Gustavo learner snapshot blob is already present on 2026-09-08:

```text
f216d2894f9007a562d5b2a78f7fb26577ee5b2f
```

At the V2 authorization commit on 2026-09-15, the same learner snapshot remains byte-identical.

Therefore:

```text
59ec82cf authorization
        ↓
repository learner snapshot write/update

REFUTED FOR THIS SPECIFIC COMMIT
```

This result is bounded to the specific Git commit. It does not establish that an external Firestore/PostgreSQL publication never occurred.

The chronology also prevents semantic similarity from being used as proof that the V2 authorization generated the pre-existing learner snapshot.

```text
08/09 learner snapshot exists
        ↓
15/09 V2 package created / teacher-authorized
        ↓
learner snapshot remains byte-identical
```

Therefore:

```text
V2 ↔ EXISTING LEARNER SNAPSHOT
SEMANTIC CORRESPONDENCE OBSERVED

V2 → EXISTING GIT SNAPSHOT CAUSAL DIRECTION
NOT SUPPORTED BY PRESERVED CHRONOLOGY
```

### 7.3 External materialization evidence

At the currently preserved Neon state inspected during the audit:

```text
Gustavo intelligence_candidate_records:        0
Gustavo intelligence_review_transitions:       0
Gustavo intelligence_canonicalizations:        0
intelligence_authorized_projections:            0
```

The dedicated authorized-projection persistence surface is empty in the currently preserved database state, and no post-cutoff `pipeline_events` tied to Gustavo or the V2 package ID were identified.

This is a preserved-current-state observation. It must not be converted into the historical assertion that publication never occurred.

Therefore:

```text
V2 authorization → canonicalProjection publication
NOT PROVEN

V2 authorization → ClassReportProjection publication
NOT PROVEN

V2 authorization → Firestore publication
NOT PROVEN

V2 authorization → PostgreSQL publication
NOT PROVEN
```

### 7.4 Formal lineage finding

> **Authorization-to-materialization provenance gap:** the V2 package was teacher-authorized and explicitly authorized for projection, but the preserved evidence does not demonstrate execution of a materialization transition into the learner-facing canonical projection.

The central empirical distinction is:

```text
AUTHORIZED
    ≠
MATERIALIZED
    ≠
PROJECTED
    ≠
RENDERED
```

For Gustavo V2, teacher authorization is directly established. The subsequent states are not established as consequences of the 2026-09-15 authorization event.

---

## 8. Three-Track Finding

### Track 1 — AUTHORITY

The V2 package exists, is teacher-authorized, and is explicitly authorized for projection.

```text
VERDICT
SUPPORTED BY EVIDENCE
```

### Track 2 — MATERIALIZATION

The preserved evidence does not establish that the V2 authorization was materialized into the operational intelligence / learner projection persistence layer.

The Git evidence establishes no same-commit learner snapshot write. Current preserved Neon records do not establish a subsequent V2 materialization event.

```text
VERDICT
NOT YET SUPPORTED
```

### Track 3 — LEARNER PROJECTION / RENDERING

A learner-facing snapshot and a reconstructable dashboard state exist, but the snapshot predates the V2 authorization and cannot be attributed to it from the preserved evidence.

```text
VERDICT
NOT YET SUPPORTED AS A CONSEQUENCE OF V2 AUTHORIZATION
```

---

## 9. First Proven Loss Category

### Result

```text
NO LOSS CATEGORY IS CURRENTLY PROVEN
```

The earliest established anomaly is:

```text
AUTHORIZATION-TO-MATERIALIZATION
PROVENANCE GAP
```

It is not currently proven as:

- SOURCE LOSS
- EXTRACTION LOSS
- PERSISTENCE LOSS
- TRANSFORMATION LOSS
- PUBLICATION LOSS
- PROJECTION LOSS
- RENDERING LOSS

### Why PERSISTENCE LOSS is not proven

The audit proves that the 2026-09-15 authorization commit did not write the learner Git snapshot.

It does not prove:

```text
V2 was required to persist into that target
        ↓
required persistence transition occurred or was attempted
        ↓
target failed to persist it
```

The obligation and transition are not established.

Current absence of Neon materialization records also cannot be transformed into historical PERSISTENCE LOSS because the historical database state at the authorization cutoff was not preserved immutably.

### Why PROJECTION LOSS is not proven

A learner projection already exists and predates the V2 authorization.

The audit therefore does not establish:

```text
V2 materialized
    ↓
projection was required to change
    ↓
projection failed to reflect the authorized state
```

### Why RENDERING LOSS is not proven

The dashboard can render learner state from preserved learner records. What is not established is that the V2 package was the source that should have produced that rendered state.

---

## 10. Empirically relevant invariant

The witness provides a concrete instance of:

```text
APPROVED ≠ PROJECTED
```

More precisely:

```text
teacher_authorized
        +
authorized_for_projection
        ≠
proven materialized projection
```

This is an empirically relevant distinction in the Gustavo witness rather than only a conceptual architectural rule.

---

## 11. Architectural Hypothesis Verdict

### Hypothesis

> One lesson source should be capable of feeding multiple downstream projections without requiring one downstream projection to reconstruct information from another downstream projection.

### Verdict

```text
PARTIALLY SUPPORTED
```

### Supported by evidence

The preserved legacy pipeline demonstrates an upstream fan-out capability in which one lesson / pipeline execution can generate more than one downstream representation:

```text
lesson / transcript source
        ↓
PipelineRun
        ├── ClassReportProjection
        └── PortfolioProjection
```

Therefore, the system demonstrably supports the architectural capability:

```text
ONE SOURCE
    ↓
MULTIPLE PROJECTIONS
```

### Limiting evidence

The frozen learner dashboard path does not establish projection independence.

For Learning Intelligence, the observed code path is:

```text
ClassReport
    ↓
teacherInsight
    ↓
parseTransferPoints()
    ↓
LearningIntelligence
```

Thus one downstream representation can act as an intermediate source for another learner-facing representation.

This differs from the stronger model:

```text
             Lesson Source
              /        \
             ↓          ↓
      Projection A   Projection B
```

The audit does not establish that projection-to-projection dependency is universal, unavoidable, or itself causes pedagogical loss.

### Formal verdict

```text
ARCHITECTURAL HYPOTHESIS
PARTIALLY SUPPORTED

SUPPORTED:
One lesson source can feed multiple downstream projections.

NOT ESTABLISHED / INCONSISTENT IN OBSERVED PATH:
Projection independence across the full learner-facing chain.

REFUTED:
No.

PEDAGOGICAL LOSS IMPLIED:
No.

PROVENANCE SIGNIFICANCE:
High.
```

Final conclusion:

> **The architecture demonstrates upstream fan-out capability, but the preserved learner dashboard path does not establish projection independence; part of the learner-facing intelligence is derived from an existing downstream projection rather than being demonstrably sourced independently from the original lesson evidence.**

---

## 12. Final audit classification

```text
STUDENT DASHBOARD PROVENANCE AUDIT v1
CLOSED

Historical Witness
GUSTAVO

Historical State
RECONSTRUCTED

Pedagogical Event Ledger
COMPLETE — 4 LESSONS

Legacy Representation Gap
OBSERVED — 18/08 + 25/08

V2 Teacher Authorization
PROVEN

V2 → Learner Projection Operational Lineage
NOT PROVEN

Authorization → Same-Commit Git Snapshot Write
REFUTED FOR THIS SPECIFIC COMMIT

Three-Track Finding

AUTHORITY
SUPPORTED BY EVIDENCE

MATERIALIZATION
NOT YET SUPPORTED

LEARNER PROJECTION / RENDERING
NOT YET SUPPORTED AS A CONSEQUENCE OF V2

FIRST PROVEN LOSS CATEGORY
NONE

FIRST PROVEN ANOMALY
AUTHORIZATION-TO-MATERIALIZATION
PROVENANCE GAP

PEDAGOGICAL LOSS
NOT PROVEN

ARCHITECTURAL HYPOTHESIS
PARTIALLY SUPPORTED
```

---

## 13. Audit boundary

This audit closes at the boundary of preserved evidence.

The evidence presently establishes a failure of provenance observability, not a proven failure of pedagogical persistence.

No architectural remediation is prescribed in this document.

Any future Architecture Decision / Remediation work must be maintained as a separate artifact and may use this audit as a factual baseline without rewriting its historical findings.
