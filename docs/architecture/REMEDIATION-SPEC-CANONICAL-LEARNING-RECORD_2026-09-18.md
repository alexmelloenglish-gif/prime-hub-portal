# Remediation Specification — Canonical Learning Record

**Date:** 2026-09-18
**Status:** READY FOR IMPLEMENTATION
**Scope:** Remediation of the provenance gap identified by Student Dashboard Provenance Audit v1 and governed by ADR-001.

## 0. Authority boundary

This specification is downstream from the closed factual audit and accepted architecture decision. It must not rewrite either artifact.

- Audit: docs/audits/STUDENT_DASHBOARD_PROVENANCE_AUDIT_V1_2026-09-18.md
- Audit commit: 43b2de7f878201db16355ffde258a50a8524dcf4
- ADR: docs/architecture/ADR-001-CANONICAL-LEARNING-RECORD-PROJECTION-INDEPENDENCE_2026-09-18.md
- ADR commit: 5b8ca3da92a89dc99abe8997a6139e5a9f6a1555
- Dashboard contract: student-dashboard-v1.0

## 1. Objective

Replace the unproven authority path with an explicit durable chain:

~~~~
SOURCE
  ↓
CANDIDATE / PROPOSAL
  ↓
TEACHER DECISION
  ↓
CANONICAL LEARNING RECORD
  ↓
INDEPENDENT PROJECTIONS
  ↓
READ-BACK / VERIFICATION
~~~~

The first implementation target is one real vertical slice, not a broad migration.

## 2. Concrete persistence decision

The Canonical Learning Record will be persisted in Neon PostgreSQL as the authoritative post-review domain record.

Rationale:
- PRIME already uses Neon for durable pipeline, review and projection state.
- PostgreSQL provides transactional writes and uniqueness constraints suitable for idempotency.
- Semantic authority remains independent of Firestore, GitHub snapshots and UI read models.

Firestore, repository snapshots and other learner-facing stores remain projections or compatibility/reference surfaces.

## 3. Minimum Canonical Learning Record contract

Each immutable canonical version must support:

### Identity
- canonicalRecordId
- studentId
- lessonId or explicit longitudinal scope
- canonicalVersion
- canonicalHash

### Provenance
- source reference(s)
- source hash/reference where available
- transcript/lesson source ID
- originating processing attempt/run ID where applicable
- candidate/proposal references where applicable
- teacherDecisionId
- reviewer identity and role
- decision timestamp
- canonicalization timestamp

### Authority
- accepted / edited / bounded decision type
- authority scope
- teacher-approved pedagogical content
- evidence boundaries and limitations

### Pedagogical payload
- validated evidence
- learning signal
- teacher interpretation/insight
- next verification
- validated vocabulary and grammar/correction facts where applicable
- authorized learner-state change
- authorized priority change
- authorized next action

Missing information remains missing. Canonicalization must not manufacture completeness.

## 4. Canonicalization transaction

Canonicalization is an explicit atomic operation:

~~~~
validate teacher decision
→ compute canonical payload
→ compute version/hash
→ persist canonical record + provenance
→ commit
→ read back
→ compare source/version/hash
~~~~

The command must be idempotent.

The idempotency identity must derive from the authority transition and scope, for example:

~~~~
student + authorityDecisionId + canonicalization scope/version
~~~~

Repeated requests with the same identity must not create duplicate canonical versions.

Canonical record and canonicalization provenance must succeed or fail together.

## 5. Canonical read-back verification

A successful write or API response is not sufficient proof.

After canonicalization the system must:
1. read the record back from Neon;
2. confirm canonicalRecordId and canonicalVersion;
3. compare canonicalHash/content;
4. confirm teacherDecisionId and source references;
5. persist verification as PASS or FAIL.

Required proof:

~~~~
WRITE
  ↓
READ-BACK
  ↓
VERSION / HASH / SOURCE-REFERENCE COMPARE
  ↓
PASS / FAIL
~~~~

## 6. Independent projection model

All downstream targets consume the Canonical Learning Record independently:

~~~~
Canonical Learning Record vN
       ├──→ Class Report
       ├──→ Learning Intelligence
       ├──→ Learner / Dashboard
       └──→ Portfolio
~~~~

Each target must retain canonicalRecordId, canonicalVersion and canonicalHash or an equivalent recoverable source reference.

A target must never become the authority source for another target.

## 7. Projection states

Each target must distinguish:

~~~~
NOT_REQUESTED
REQUESTED
WRITTEN
VERIFIED
FAILED
~~~~

A successful sibling projection does not imply success of another target.

## 8. Projection contracts

### Class Report
The Class Report may transform canonical structured content into learner-readable prose. It remains a projection and must retain canonical provenance.

### Learning Intelligence
New Learning Intelligence must consume structured canonical data directly. It must not depend on parsing Class Report prose.

### Learner / Dashboard
The dashboard may curate NOW, RECENT, MEMORY, priorities and next action. Curation must not create pedagogical authority.

### Portfolio
Portfolio may maintain longitudinal human-readable memory. It is not a canonical source for other projections.

## 9. Legacy compatibility

The current path:

~~~~
ClassReport
  ↓
teacherInsight text
  ↓
parseTransferPoints()
  ↓
LearningIntelligence
~~~~

is DEPRECATED AS AN AUTHORITATIVE PATH.

It may remain for bounded historical/read-only compatibility only when:
- the record predates the canonicalization contract;
- no equivalent structured canonical record exists;
- output is classified as legacy-derived;
- reconstructed prose is never promoted into new canonical authority.

## 10. Failure semantics

### Canonicalization failure
- teacher decision remains preserved;
- no canonical success is declared;
- no downstream target may treat the record as canonical;
- retry is safe under the same idempotency identity.

### Projection failure
- canonical authority remains intact;
- other targets may succeed independently;
- failed target remains FAILED/UNVERIFIED;
- retry affects only the failed target.

### Read-back failure
- target is not VERIFIED;
- failure/unknown is surfaced;
- retry remains idempotent;
- unverified publication is not treated as proven projection.

## 11. Versioning and concurrency

Canonical versions are immutable.

A new teacher decision creates a new canonical version/superseding record. A stale projection must not overwrite a newer verified target.

Implementation must use an explicit version guard or equivalent optimistic concurrency control.

## 12. Vertical-slice target

Use one real lesson and one real learner after remediation begins.

Required chain:

~~~~
REAL LESSON SOURCE
      ↓
CANDIDATE / PROPOSAL
      ↓
REAL TEACHER REVIEW
      ↓
TEACHER DECISION
      ↓
CANONICAL LEARNING RECORD v1
      ↓
CANONICAL READ-BACK VERIFIED
      ↓
   ┌───────────────┬──────────────────┐
   ↓               ↓                  ↓
CLASS REPORT   LEARNING INTELLIGENCE  DASHBOARD
   ↓               ↓                  ↓
VERIFIED        VERIFIED             VERIFIED
~~~~

The critical proof is provenance, not merely UI appearance.

## 13. Vertical-slice acceptance matrix

| Stage | Required evidence | Acceptance |
|---|---|---|
| Source capture | stable lesson identity + sourceRef | PASS |
| Candidate | candidate/proposal ID + provenance | PASS |
| Teacher review | decision ID + reviewer + timestamp + scope | PASS |
| Canonicalization | canonicalRecordId + version + hash | PASS |
| Canonical read-back | persisted payload/version/hash matches | PASS |
| Class Report | canonical source reference + read-back | PASS |
| Learning Intelligence | direct canonical source + structured payload | PASS |
| Dashboard | canonical source reference + read-back | PASS |
| Independence | no Class Report → Learning Intelligence reconstruction | PASS |
| Idempotency | repeat does not duplicate canonicalization/projection | PASS |
| Failure containment | target failure does not invalidate canonical authority | PASS |
| Auditability | complete source → decision → canonical → targets chain | PASS |

Any required row that remains UNKNOWN or inferred fails the vertical-slice proof.

## 14. Regression requirements

Regression protection must fail if:
1. Learning Intelligence recovers new authoritative semantics from Class Report prose;
2. canonical source version/hash is missing from a projection;
3. teacher authorization is treated as canonicalization;
4. canonicalization is treated as projection;
5. projection is treated as verification;
6. duplicate canonicalization occurs for a repeated authority command;
7. a stale projection overwrites a newer canonical version;
8. failed publication is presented as successful;
9. a learner-facing claim lacks recoverable canonical provenance.

## 15. Migration boundary

No bulk historical backfill is part of this remediation.

Historical Class Reports and the Gustavo audit remain historical evidence unless a separate migration decision is approved.

## 16. Non-goals

This specification does not authorize:
- reopening the factual audit;
- reprocessing Gustavo historical lessons;
- manufacturing historical V2 publication traces;
- restoring the legacy publication pipeline;
- bulk learner migration;
- changing learner-facing copy;
- changing student-dashboard-v1.0;
- deleting or rewriting historical reports;
- making Class Report a canonical hub;
- autonomous AI publication.

## 17. Implementation gates

~~~~
G1  Canonical record contract
 ↓
G2  Atomic canonicalization + idempotency
 ↓
G3  Canonical read-back verification
 ↓
G4  One independent projection
 ↓
G5  Learning Intelligence direct projection
 ↓
G6  Dashboard projection
 ↓
G7  Vertical-slice verification
 ↓
G8  Regression protection
 ↓
G9  Explicit decision on broader migration
~~~~

A later gate must not silently imply that an earlier gate was proven.

## 18. Definition of done

The remediation is NOT DONE because a model exists, an API returns success, or a dashboard renders.

For the first vertical slice it is DONE only when:

~~~~
SOURCE
  ↓
TEACHER DECISION
  ↓
CANONICALIZED
  ↓
CANONICAL READ-BACK VERIFIED
  ↓
MULTIPLE INDEPENDENT PROJECTIONS
  ↓
EACH TARGET READ-BACK VERIFIED
  ↓
PROVENANCE CHAIN RECOVERABLE
  ↓
REGRESSION TESTS PASS
~~~~

and new canonical records no longer require:

~~~~
ClassReport → teacherInsight → parseTransferPoints() → LearningIntelligence
~~~~

## 19. Final status

~~~~
PROVENANCE AUDIT v1        CLOSED
ARCHITECTURE DECISION      ACCEPTED
REMEDIATION SPEC           READY FOR IMPLEMENTATION
IMPLEMENTATION             NOT STARTED
VERTICAL-SLICE PROOF       NOT STARTED
REGRESSION AUDIT           NOT STARTED
~~~~

The next implementation action is G1 only.