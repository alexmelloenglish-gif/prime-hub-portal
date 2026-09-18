# ADR-001 — Canonical Learning Record as the Common Source for Independent Projections

**Date:** 2026-09-18  
**Status:** ACCEPTED  
**Decision scope:** Post-authority canonicalization, materialization, downstream projection independence, and provenance verification.

## Evidence baseline

This Architecture Decision is downstream of and must not rewrite:

- Audit artifact: `docs/audits/STUDENT_DASHBOARD_PROVENANCE_AUDIT_V1_2026-09-18.md`
- Audit commit: `43b2de7f878201db16355ffde258a50a8524dcf4`
- Audit blob: `601bf3b52e7181cac0d95c100e2383c107bd99b8`
- Audit status: `CLOSED — factual audit baseline`

The audit remains immutable as historical evidence.

This ADR also preserves the existing canonical authority direction already stated in `docs/PRIME_CANONICAL_MIGRATION_ARCHITECTURE_CHECKPOINT_2026-09-11.md`:

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

This ADR makes that boundary operationally precise.

---

## 1. Problem

The closed provenance audit established:

### Proven

- upstream fan-out capability exists;
- teacher authorization exists as a distinct authority event;
- learner-facing projections exist;
- the frozen dashboard contains a downstream reconstruction path:

```text
ClassReport
    ↓
teacherInsight
    ↓
parseTransferPoints()
    ↓
LearningIntelligence
```

### Not proven

- V2 authorization → materialization;
- V2 authorization → learner projection;
- projection independence across the learner-facing chain.

### First proven anomaly

```text
AUTHORIZATION-TO-MATERIALIZATION
PROVENANCE GAP
```

### Architectural hypothesis verdict

```text
PARTIALLY SUPPORTED
```

The architecture therefore needs an explicit common authoritative source after human authorization and before downstream projections.

---

## 2. Decision question

> What is the canonical common source from which Class Report, Learning Intelligence, Learner Projection, Portfolio and other downstream projections may be materialized independently, without reconstructing authoritative learning information from another downstream projection?

---

## 3. Decision

### The canonical common source is the **Canonical Learning Record**.

The Canonical Learning Record is the first durable, versioned pedagogical record created from an explicit authority transition.

It is **not**:

- the raw transcript;
- an Evidence Candidate;
- a Learning Signal Proposal;
- a Teacher Insight Proposal;
- the V2 teacher-decision package itself;
- a Class Report;
- a Portfolio Projection;
- a learner Git snapshot;
- a Firestore learner read model;
- a Dashboard rendering.

It is the canonical post-review domain record from which downstream projections are allowed to derive learner-facing state.

The target architecture is:

```text
LESSON SOURCE / TRANSCRIPT
        ↓
NON-AUTHORITATIVE CANDIDATES
        ↓
TEACHER REVIEW / DECISION
        ↓
CANONICALIZATION
        ↓
CANONICAL LEARNING RECORD
        ├──────────────→ CLASS REPORT PROJECTION
        ├──────────────→ LEARNING INTELLIGENCE PROJECTION
        ├──────────────→ LEARNER / DASHBOARD PROJECTION
        ├──────────────→ PORTFOLIO PROJECTION
        └──────────────→ OTHER AUTHORIZED DOWNSTREAM PROJECTIONS
```

No downstream projection is authoritative merely because it exists or is published.

No downstream projection may be used as the authority source for another downstream projection when the required fact exists in, or should be represented by, the Canonical Learning Record.

---

## 4. Source of truth

### 4.1 Raw lesson source

The transcript and related lesson-source artifacts remain the source evidence.

They preserve what happened, but they do not become official pedagogical conclusions by themselves.

```text
Transcript / source evidence
≠
authorized pedagogical state
```

### 4.2 Human authority

Teacher review is the authority transition.

A teacher decision may accept, reject, edit, qualify, bound or defer candidate learning information.

However:

```text
TEACHER_AUTHORIZED
≠
CANONICALIZED
≠
PROJECTED
```

Teacher authorization grants permission and authority for canonicalization. It does not by itself prove that a canonical record or learner-facing projection was persisted.

### 4.3 Canonical source

The Canonical Learning Record is the authoritative persisted learning state created after the teacher decision has been successfully canonicalized.

It must preserve the teacher-authorized meaning without requiring a Class Report, learner snapshot or other projection to reconstruct that meaning later.

---

## 5. Canonical Learning Record contract

This ADR defines semantic requirements, not a database schema.

Each canonical record version must be able to establish, where applicable:

### Identity

- canonical record ID;
- student ID;
- lesson ID or explicit longitudinal scope;
- source lesson / transcript references;
- originating processing attempt(s), where applicable.

### Authority

- authority decision ID;
- authorized by;
- authorization timestamp;
- authority scope;
- accepted / rejected / edited / bounded decision provenance.

### Pedagogical content

Only teacher-authorized content may enter the canonical record.

The record may contain or reference, where applicable:

- validated evidence;
- authorized learning signals;
- authorized teacher insight;
- evidence boundaries / limitations;
- next verification;
- authorized vocabulary / grammar / correction facts;
- authorized learner-state changes;
- authorized priority or next-action changes.

A field may remain absent. Canonicalization must not manufacture completeness.

### Versioning

Every successful canonicalization must have:

- canonical record version;
- deterministic or stored content hash;
- prior canonical version reference when updating longitudinal state;
- canonicalized timestamp;
- canonicalization event/reference.

The canonical record must be immutable per version. A later teacher decision creates a new version or superseding record rather than silently rewriting provenance.

---

## 6. State-transition contract

The architecture must preserve these states as distinct:

```text
SOURCE_CAPTURED
        ↓
CANDIDATES_CREATED
        ↓
TEACHER_AUTHORIZED
        ↓
CANONICALIZED
        ↓
PROJECTED(target)
        ↓
VERIFIED(target)
        ↓
RENDERABLE / CONSUMABLE
```

### TEACHER_AUTHORIZED

Means:

- a human authority decision exists;
- its scope and reviewer are recorded.

Does not mean:

- canonical record persisted;
- projection written;
- projection verified;
- learner UI updated.

### CANONICALIZED

Means:

- the authorized decision has been materialized into a Canonical Learning Record;
- the exact canonical record ID/version is known;
- write succeeded;
- read-back confirms the persisted record;
- persisted content hash/version matches the intended canonical materialization.

### PROJECTED(target)

Means:

- one specific downstream target has consumed a specific canonical record/version;
- the target write completed;
- the projection records its canonical source reference.

Projection status is target-specific.

A successful Class Report projection does not imply successful Dashboard projection.

### VERIFIED(target)

Means:

- the written target was read back;
- source canonical record ID/version/hash is recoverable from the target or its audit record;
- target content/version satisfies the projection contract;
- verification result is persisted as PASS or FAIL.

Only a verified target may be treated as proven materialized projection in regression proof.

---

## 7. Materialization transition

The required transition is:

```text
Teacher Decision
        ↓
Canonicalization command
        ↓
Canonical Learning Record write
        ↓
Read-back
        ↓
Canonical hash/version comparison
        ↓
CANONICALIZATION PASS / FAIL
```

A PASS creates a stable projection source.

A FAIL must leave the teacher decision preserved but must not be represented as canonicalized.

Therefore:

```text
teacher_authorized + canonicalization_failed
```

is a valid and observable state.

The system must never collapse it into `projected`, `completed` or learner-visible success.

---

## 8. Downstream projection contract

Every downstream projection is an independent consumer of the Canonical Learning Record.

At minimum:

### Class Report Projection

May render lesson information as a learner-readable document.

It may transform presentation and wording, but it must retain provenance to the canonical record/version that authorized its pedagogical content.

It is a projection, not a new domain source of truth.

### Learning Intelligence Projection

Must consume canonical structured learning content directly.

It must not require parsing Class Report prose to recover evidence, signal, interpretation, boundary or next verification when those semantics are part of the canonical record.

### Learner / Student Dashboard Projection

May aggregate multiple canonical record versions into NOW / RECENT / MEMORY.

It may curate presentation, but all pedagogical claims must remain traceable to canonical authorized records.

### Portfolio Projection

May maintain longitudinal or human-readable learning memory.

It must not become a hidden authority source for other projections.

### Other projections

Future projections may consume the same canonical record independently.

Adding a new projection must not require modifying an existing projection into an upstream source.

---

## 9. Projection independence invariant

The canonical invariant is:

```text
                   CANONICAL LEARNING RECORD
                  /        |        |        \
                 ↓         ↓        ↓         ↓
          Class Report   Learning   Learner   Portfolio
                         Intelligence Dashboard
```

The prohibited authority dependency is:

```text
Canonical Learning Record
        ↓
Class Report
        ↓
parse narrative text
        ↓
Learning Intelligence
```

A projection may reference another projection for navigation, display composition or document linking.

It may not rely on another projection to reconstruct authoritative pedagogical facts that belong in the canonical source.

---

## 10. Provenance requirements

For every authoritative transition, a future audit must be able to answer:

1. What lesson/source produced the candidate information?
2. Which evidence supported it?
3. Which processing attempt generated the candidate?
4. Which teacher decision authorized, rejected or edited it?
5. Which canonical record/version materialized that decision?
6. Which exact canonical version did each projection consume?
7. When was each projection written?
8. Was the target read back?
9. Did the target pass verification?
10. Which learner-facing state was derived from that verified target?

At minimum, the provenance chain must retain recoverable references equivalent to:

```text
sourceRef
transcriptId
pipelineRunId / processingAttemptId
candidate / proposal IDs where applicable
teacherDecisionId
reviewedBy
reviewedAt
canonicalRecordId
canonicalVersion
canonicalHash
canonicalizedAt
projectionType
projectionId / targetRef
projectionVersion
projectedAt
verificationStatus
verifiedAt
```

Exact storage names are implementation decisions for the Remediation Spec.

---

## 11. Read-back and verification

Canonicalization and projection publication must use the same proof principle:

```text
WRITE
  ↓
READ-BACK
  ↓
VERSION / HASH / SOURCE-REFERENCE COMPARE
  ↓
PASS / FAIL
```

A successful API response or completed function call is insufficient proof by itself.

A target is proven projected only after the system can read the persisted target and establish that it corresponds to the intended canonical source/version.

The verification record must be durable enough to support later regression audit.

---

## 12. Decision on ClassReport → LearningIntelligence reconstruction

### Decision: DEPRECATED AS AN AUTHORITATIVE PATH

The existing path:

```text
ClassReport
    ↓
teacherInsight
    ↓
parseTransferPoints()
    ↓
LearningIntelligence
```

may be retained temporarily for historical compatibility and read-only legacy rendering.

It must not remain the canonical authority path for newly canonicalized learning records.

For new canonical records:

```text
Canonical Learning Record
        ↓
Learning Intelligence Projection
```

is required.

### Compatibility rule

Legacy reconstruction may be used only when:

- the record predates the new canonicalization contract;
- no canonical structured record exists for that historical item;
- the result is explicitly treated as legacy-derived presentation rather than newly authorized canonical learning state.

No legacy parser may silently promote reconstructed prose into canonical authority.

---

## 13. Decisions rejected

### Rejected: Class Report as canonical hub

Reason: a Class Report is a presentation/document projection. Making it the source of Learning Intelligence reproduces the downstream-to-downstream dependency identified by the audit.

### Rejected: learner Git snapshot as canonical source

Reason: it is a learner-facing/repository projection and, in the Gustavo witness, it predates the V2 authorization that had been semantically associated with it.

### Rejected: V2 teacher-decision package as the final canonical source

Reason: the package proves authority, but the audit established that authorization does not prove materialization. The teacher-decision package is an authority input to canonicalization, not proof that canonical state exists.

### Rejected: raw transcript as canonical pedagogical state

Reason: the transcript is source evidence and may contain ambiguity, scaffolding, errors, social conversation and unsupported interpretations. It requires human authority before becoming canonical pedagogical state.

### Rejected: Firestore or PostgreSQL location alone as the definition of authority

Reason: storage technology does not define semantic authority. Canonical authority is defined by the lifecycle and provenance contract. Physical persistence is selected in the Remediation Spec.

---

## 14. Consequences

### Positive

- one authorized record can feed multiple projections independently;
- teacher authority remains explicit;
- authorization cannot be mistaken for publication;
- projections can fail independently without corrupting authority state;
- Class Report prose no longer needs to carry hidden structured intelligence;
- provenance becomes auditable across source → decision → canonical record → projection;
- read-back verification converts publication from inference into proof.

### Costs

- canonicalization becomes an explicit persisted transition;
- each downstream projection needs source-version provenance;
- legacy ClassReport parsing needs a compatibility boundary;
- migration must distinguish historical records from new canonical records;
- regression proof becomes a required part of publication design.

These costs are accepted because they directly address the audit finding without rewriting historical evidence.

---

## 15. Non-decisions

This ADR intentionally does not decide:

- exact Prisma model names;
- whether the Canonical Learning Record is physically stored in PostgreSQL, Firestore, or both;
- table/collection schemas;
- queue/worker technology;
- endpoint names;
- migration batch strategy;
- UI copy;
- whether historical records are backfilled;
- whether all legacy Class Reports will ever be converted;
- implementation order beyond the architectural dependency defined here.

Those belong to the Remediation Spec.

---

## 16. Acceptance

```text
ARCHITECTURE DECISION
ACCEPTED

SOURCE OF TRUTH
Canonical Learning Record

AUTHORIZED RECORD
Teacher-authorized pedagogical information materialized into
a durable, versioned Canonical Learning Record

MATERIALIZATION TRANSITION
Teacher Decision
→ Canonicalization
→ Canonical Learning Record write
→ Read-back
→ Version/hash verification
→ PASS / FAIL

DOWNSTREAM PROJECTIONS
Independent consumers of the Canonical Learning Record

PROVENANCE REQUIREMENTS
Source
→ candidates/proposals
→ teacher decision
→ canonical record/version
→ target projection/version
→ verification

READ-BACK / VERIFICATION
Required for canonicalization and each authoritative projection

OLD CLASSREPORT → LEARNINGINTELLIGENCE RECONSTRUCTION
DEPRECATED AS AN AUTHORITATIVE PATH
Retained only as bounded legacy compatibility where necessary

AUDIT v1
REMAINS IMMUTABLE
Reference commit:
43b2de7f878201db16355ffde258a50a8524dcf4
```

---

## 17. Next artifact

The next artifact is a **Remediation Spec**.

It must translate this accepted architecture decision into verifiable requirements without changing the Audit v1 or this ADR's factual evidence baseline.

Implementation must not begin until that spec identifies:

- persistence target and minimum data contract;
- canonicalization transaction behavior;
- projection contracts;
- compatibility behavior;
- idempotency;
- failure states;
- read-back verification;
- vertical-slice proof criteria.
