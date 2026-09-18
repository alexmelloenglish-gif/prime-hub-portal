# Implementation Gate G2 — Atomic Canonicalization + Idempotency

**Date:** 2026-09-18  
**Status:** IMPLEMENTED / RUNTIME PROOF PENDING  
**Gate:** G2 — Atomic canonicalization + idempotency  
**Next gate:** G3 — Canonical read-back verification (**BLOCKED until G2 runtime proof is complete**)

## Evidence baseline

This gate is downstream from:

- Audit v1 — CLOSED
- ADR-001 — ACCEPTED
- Remediation Spec — READY FOR IMPLEMENTATION
- G1 Canonical Learning Record Contract — CLOSED / PASS

G2 does not reopen or rewrite any prior artifact.

## Objective

Transform one valid persisted human teacher decision into exactly one canonical record version and one canonicalization provenance record, atomically and idempotently.

```text
VALID TEACHER DECISION
        ↓
DETERMINISTIC IDEMPOTENCY KEY
        ↓
BEGIN SERIALIZABLE TRANSACTION
        ↓
CREATE EXACTLY ONE
CANONICAL LEARNING RECORD
        +
CANONICALIZATION PROVENANCE
        ↓
COMMIT
```

Replay invariant:

```text
same decision + same scope
        ↓
same idempotency key
        ↓
NO DUPLICATE CANONICAL VERSION
```

## Implemented persistence surface

The G1 model `CanonicalLearningRecord` has now been materialized in Neon PostgreSQL.

G2 adds:

`CanonicalizationProvenance`

with:

- unique `idempotencyKey`;
- unique `canonicalRecordId`;
- composite uniqueness:
  `studentId + teacherDecisionId + scopeType + scopeKey`;
- canonical version/hash reference;
- authority source type;
- reviewer;
- decision timestamp;
- transaction status.

The canonical record and provenance models are linked by a restrictive foreign key.

## Migration

Migration:

`prisma/migrations/20260918051500_add_canonical_learning_record/migration.sql`

Migration commit:

`844e987915a874323b76f46d9db5a903e34b9f0c`

Production deployment:

`dpl_8Fo7a91cE8Q9BKi6HxmXDkBJbSE3`

Migration evidence:

```text
7 migrations found
Applying migration 20260918051500_add_canonical_learning_record
All migrations have been successfully applied.
```

The migration creates both:

- `canonical_learning_records`
- `canonicalization_provenance`

## Canonicalization service

Created:

`lib/canonicalization.ts`

Implementation commit:

`b2e6b9cb70830fd3f9c267609ec14f7ec89085b1`

The service implements:

### Deterministic idempotency identity

```text
canonicalize
+ schemaVersion
+ studentId
+ teacherDecisionId
+ scopeType
+ scopeKey
→ SHA-256 idempotency key
```

### Persisted teacher-decision validation

G2 does not trust an arbitrary decision ID.

For `review_task`, the service requires:

- persisted ReviewTask;
- `decision = approved`;
- reviewer ID;
- reviewed timestamp;
- reviewer resolves to persisted `teacher` or `admin`;
- student/lesson/run consistency where supplied;
- persisted `PublicationReviewApproved` event.

Identity review alone is insufficient authority.

For `validation_task`, the service requires:

- persisted ValidationTask;
- `type = canonical_learning_record_authority`;
- `status = approved`;
- `decision = approved`;
- persisted reviewer and reviewed timestamp;
- reviewer resolves to persisted `teacher` or `admin`.

### Atomicity

Canonical record creation and canonicalization provenance creation occur inside the same Prisma transaction:

```text
Prisma.TransactionIsolationLevel.Serializable
```

If provenance creation fails, canonical record creation is rolled back with the transaction.

### Versioning

Within the scope:

```text
latest canonicalVersion
        ↓
next = latest + 1
```

The previous canonical record becomes `supersedesRecordId` for the new version.

### Hash

The service computes a deterministic SHA-256 canonical hash from the canonical hash envelope defined by G1.

Generated record IDs and persistence timestamps are not part of the hash envelope.

### Idempotent replay

Before creating a new record, the service checks the deterministic idempotency key.

If the same authority transition already exists:

- the existing canonical record is returned;
- `idempotentReplay = true`;
- no new version is created.

If the same decision/scope is replayed with different canonical content:

```text
IDEMPOTENCY_CONFLICT
```

The service fails closed instead of silently accepting divergent content.

### Concurrency

The service handles:

- `P2034` serializable transaction conflicts;
- `P2002` uniqueness races.

It retries bounded concurrency conflicts and rechecks idempotency before deciding whether the operation is a safe replay or a true conflict.

## Database idempotency constraints

The database independently enforces:

```text
idempotencyKey UNIQUE
```

and:

```text
studentId
+ teacherDecisionId
+ scopeType
+ scopeKey
UNIQUE
```

Therefore duplicate canonicalization of the same authority transition is guarded both in application logic and at the PostgreSQL constraint layer.

## G2 structural self-test

Created:

`scripts/canonicalization-g2-self-test.mjs`

Exposed as:

```text
npm run canonicalization:g2:self-test
```

Self-test commit:

`28ee0938957875949c71bb09ed2b3df7294f4eee`

Package-script commit:

`1ed55d73c0490355cbaa40f934ea96d69027d6b1`

The test asserts:

- SERIALIZABLE transaction;
- canonical record + provenance inside transaction;
- deterministic idempotency builder;
- persisted authority checks;
- uniqueness constraints;
- conflict handling;
- no Learning Intelligence invocation;
- no Dashboard projection invocation;
- no Class Report projection creation;
- explicit stop before G3.

## Production verification

Final G2 implementation deployment:

`dpl_7fSwhFEDAa7DYsVE3zLm9djZtuZs`

Status:

```text
READY
```

Build evidence:

- `prisma migrate deploy` — no pending migrations after the G2 migration;
- Prisma Client generation — PASS;
- Next.js compile — PASS;
- lint/type validity — PASS with pre-existing warnings only;
- Teacher Intelligence self-tests — PASS;
- Student Dashboard self-tests — PASS;
- Eligibility self-test — PASS;
- canonical consistency — 0 errors.

## Explicit G2 boundary

G2 does **not** implement:

- G3 canonical read-back verification;
- projection read-back;
- Class Report projection changes;
- Learning Intelligence direct projection;
- Dashboard projection;
- Portfolio projection;
- historical backfill;
- Gustavo historical reconstruction;
- any change to Audit v1.

No new learner-facing canonical claim has been created by this implementation alone.

## Runtime proof still required before G2 can close

The implementation is in Production, but G2 is not yet declared `CLOSED / PASS`.

Required runtime proof:

```text
one persisted valid teacher decision
        ↓
canonicalizeLearningRecord()
        ↓
canonical record vN created
        +
canonicalization provenance created
        ↓
same command replayed
        ↓
same canonicalRecordId
same canonicalVersion
same canonicalHash
idempotentReplay = true
        ↓
canonical record count remains 1
provenance count remains 1
```

Also required:

```text
forced/controlled failure during atomic creation
        ↓
NO partial canonical record without provenance
```

This proof must be performed against Neon before the status changes to:

```text
G2
CLOSED / PASS
```

## Current gate verdict

```text
G2 — ATOMIC CANONICALIZATION + IDEMPOTENCY

SCHEMA MATERIALIZED
PASS

SERVICE IMPLEMENTED
PASS

PRODUCTION BUILD
PASS / READY

ATOMICITY DESIGN
IMPLEMENTED

DATABASE UNIQUENESS
IMPLEMENTED

IDEMPOTENT REPLAY LOGIC
IMPLEMENTED

REAL RUNTIME CANONICALIZATION PROOF
PENDING

G2 FINAL STATUS
IMPLEMENTED / RUNTIME PROOF PENDING

G3
BLOCKED
```

No later gate may infer G2 PASS until the runtime proof above is recorded.
