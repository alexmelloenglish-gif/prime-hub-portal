# Implementation Gate G5 — Canonical Learning Intelligence Projection

**Date:** 2026-09-18  
**Status:** IMPLEMENTATION STARTED / RUNTIME PROOF PENDING  
**Gate:** G5 — direct Canonical Learning Intelligence projection  
**Predecessors:** G1–G4 CLOSED / PASS  
**Witness:** Gustavo only — CLR `cmu6jv29k0001bf8kt45pl9ht`

## Frozen boundary

G5 proves only:

CanonicalLearningRecord
→ Canonical Learning Intelligence Projection
→ independent persistence
→ exact read-back
→ exact replay
→ composite cardinality = 1
→ VERIFIED

G6 owns consumption by dashboard/consumer and is not implemented here.

## Composite identity

Uniqueness is defined by:

`canonicalRecordId + targetType=learning_intelligence + projectionVersion`

The database enforces this composite unique constraint in addition to a deterministic projectionKey.

## Canonical source

The pedagogical projection is built exclusively from the persisted CanonicalLearningRecord pedagogicalPayload. Auxiliary reads are permitted only to verify G3 PASS and resolve canonical authority provenance.

No legacy report, portfolio, snapshot, dashboard, candidate, signal proposal or historical Learning Intelligence object is a pedagogical source.

## Provenance

The G5 row preserves:

- canonicalRecordId / canonicalVersion / canonicalHash
- studentId / studentEmail
- scopeType / scopeKey / lessonId without invention
- teacherDecisionId
- validationTaskId
- teacherDecisionPackageId
- authorityScope
- original sourceReferences
- G3 verification id
- explicit unresolved legacy boundary
- projectionVersion / projectionHash / projectionStatus

The projectionHash binds canonical identity, authority lineage, source references, G3 witness and projected payload.

## Runtime acceptance

A single authenticated G5 proof operation must demonstrate all frozen criteria:

1. authorized CLR found;
2. matching G3 PASS;
3. LI projection built directly from CLR;
4. canonical identity preserved;
5. provenance preserved;
6. projectionHash over lineage + payload;
7. materialized projection;
8. exact read-back;
9. VERIFIED;
10. exact replay with same projectionId/key/hash;
11. composite count exactly 1;
12. no Class Report authority;
13. no parseTransferPoints authority;
14. no Portfolio/Snapshot/Dashboard source;
15. no legacy mutation;
16. proof limited to Gustavo.

Until Production runtime proof succeeds:

**G5 = IMPLEMENTATION STARTED / RUNTIME PROOF PENDING**

G6 remains BLOCKED.
