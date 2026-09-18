# Implementation Gate G4 — First Independent Projection

**Date:** 2026-09-18  
**Status:** CLOSED / PASS  
**Gate:** G4 — First independent projection  
**Predecessor:** G3 — CLOSED / PASS  
**Closure witness:** Production runtime proof on ValidationTask `cmu6je8gg0000101s7os3semk`

## Selection

The first independent projection is an additive **Canonical Portfolio Projection**.

This target was selected because the current real G3 witness is longitudinal (scopeType=longitudinal). A portfolio-style projection can consume that canonical record without inventing a lesson-scoped Class Report identity.

This gate proves the projection infrastructure and authority boundary without modifying legacy PortfolioProjection, Class Report, Learning Intelligence, dashboard snapshots, Firestore, or repository snapshots.

## Authority boundary

CANONICAL LEARNING RECORD v1
        |
        +--> CANONICAL PORTFOLIO PROJECTION v1

The projection reads only the persisted Canonical Learning Record after a persisted G3 PASS.

It does not:
- call canonicalization;
- replay G2;
- replay G3;
- read Class Report prose;
- write PortfolioProjection;
- write ClassReportProjection;
- invoke Learning Intelligence;
- write the learner dashboard;
- mutate Firestore;
- mutate repository snapshots;
- perform historical backfill.

## Provenance

Every projected row stores canonicalRecordId, canonicalVersion and canonicalHash.

The projection sourceReferences also preserve, when resolvable from canonical authority:

- the original CanonicalLearningRecord sourceReferences;
- teacherDecisionId;
- validationTaskId;
- teacherDecisionPackageId;
- authorityScope;
- G3 verification id;
- an explicit null legacySourceId;
- unresolvedBoundary markers instead of inferred legacy identity.

The projectionHash binds both the projected payload and this canonical lineage envelope.

A deterministic projectionKey and projectionHash make repeated execution idempotent and make stale-source reuse detectable.

## Projection states

NOT_REQUESTED
REQUESTED
WRITTEN
VERIFIED
FAILED

VERIFIED means the persisted projection matches the expected canonical source identity and projected content.

FAILED is persisted when read-back comparison detects a mismatch.

## Additive policy

This migration adds exactly one new table:

canonical_learning_record_projections

No legacy table is updated by G4.

No historical snapshot is repaired.

No existing Class Report or Learning Intelligence output is replaced.

## Runtime proof

The Production proof required and demonstrated:
1. approved canonical authority ValidationTask;
2. existing G2 canonicalization provenance;
3. persisted G3 PASS for the same canonical record;
4. direct read of the canonical record from Neon;
5. first projection materialization;
6. exact replay of the same projection command in the same runtime proof;
7. unchanged projectionId, projectionKey, projectionHash and canonical identity;
8. exactly one projection row for the same CLR / target / projection version;
9. read-back comparison of canonical identity, projection version/hash, source references and projected payload;
10. persisted final state VERIFIED.

## Production closure witness

ValidationTask:
`cmu6je8gg0000101s7os3semk`

Canonical record:
`cmu6jv29k0001bf8kt45pl9ht`

Canonical version:
`1`

Canonical hash:
`9d34e5adc6d91974e01f0c3012203bc62749f5a5681a7498b1317c0e5e22d83e`

G3 verification:
`cmu6l5886000041lpoa5pmug7`

G4 projection:
`cmu6lzoty0001okkfhyynha9q`

Projection key:
`bce006b4add162dd05672a4ee250d4ab65bab6ab56bc57b08283eaea0e9f7411`

Projection hash:
`4ef3242a75e1337c0ec79888e589d9942e234b2eba00a548207f781fe30f36bd`

Runtime result:

canonicalRecordId      exact match
canonicalVersion       exact match
canonicalHash          exact match
projectionId           persisted
projectionHash         exact match
sourceReferences       canonical provenance preserved
projection payload     exact read-back
projectionStatus       VERIFIED
idempotent replay      PASS — same projection ID/key/hash
projection count       1
mismatches              none
legacy surfaces         untouched

## Closure

G4 = CLOSED / PASS

The demonstrated chain is now:

TEACHER AUTHORITY
        ↓
CANONICALIZATION
        ↓
G3 VERIFIED CANONICAL RECORD
        ↓
DIRECT CANONICAL PORTFOLIO PROJECTION
        ↓
READ-BACK VERIFIED
        ↓
EXACT IDEMPOTENT REPLAY
        ↓
ONE PERSISTED PROJECTION

G5 is now eligible to start, but is **not started by this closure**.
