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

## Preflight authority-compatibility finding

A read-only Neon preflight identified one preserved approved ReviewTask witness:

```text
ReviewTask
cmta4fzlw0006o2xzfimobdds

student
order08-persistence-20260826@invalid.test

lesson
order08-validation-20260826

decision
approved

reviewedAt
2026-08-26T14:31:54.045Z
```

At preflight time:

```text
canonical_learning_records = 0
canonicalization_provenance = 0
```

The witness does not satisfy the current G2 pedagogical-authority contract.

### Authority-event distinction

The preserved event is:

```text
HumanReviewApproved
```

The repository code establishes that this event belongs to the identity / continuation review path.

G2 therefore does **not** treat it as equivalent to:

```text
PublicationReviewApproved
```

which is emitted only for the explicit publication-review branch.

This is intentional and preserves the distinction:

```text
IDENTITY / CONTINUATION APPROVAL
≠
PEDAGOGICAL PUBLICATION AUTHORITY
```

The G2 service continues to require `PublicationReviewApproved` when a `ReviewTask` is used as the authority source.

### Reviewer identity compatibility

The preflight also exposed a persistence-format mismatch:

```text
ReviewTask.reviewerId
alexandre@primedigitalhub.com.br
```

while newer review surfaces may persist the internal `users.id`.

The application itself historically passes an email reference to `reviewPipelineRun()`, so reviewer references in preserved records are not uniformly internal user IDs.

G2 was corrected to resolve reviewer authority by:

```text
users.id
OR
users.email
```

and then compare reviewers by the resolved internal user identity.

Compatibility fix commit:

```text
091e32e860265366c8b94cbce0074ba3fca62e0b
fix(g2): resolve reviewer authority by user id or email
```

Protection test commit:

```text
b966ae4aec78903ac881e648be2224666054a8d3
test(g2): protect authority-event and reviewer compatibility
```

The test explicitly protects both invariants:

- email-based reviewer references may resolve to a persisted teacher/admin;
- `HumanReviewApproved` must not become accepted as the G2 pedagogical authority event.

### Preflight verdict

```text
G2 IMPLEMENTATION
PASS

REVIEWER IDENTITY COMPATIBILITY
CORRECTED

HUMANREVIEWAPPROVED AS PUBLICATION AUTHORITY
REJECTED BY DESIGN

PRESERVED REVIEWTASK WITNESS
NOT ELIGIBLE FOR G2 RUNTIME PROOF

DATABASE COUNTS BEFORE RUNTIME PROOF
canonical records = 0
provenance = 0

G2 RUNTIME PROOF
BLOCKED PENDING A VALID AUTHORITY WITNESS

G2 FINAL STATUS
IMPLEMENTED / RUNTIME PROOF PENDING

G3
BLOCKED
```

No canonical record or provenance row was created by this preflight.

The next runtime proof must use either:

1. a real `ReviewTask` with persisted `PublicationReviewApproved` authority and a resolvable teacher/admin reviewer; or
2. a real approved `ValidationTask` with `type = canonical_learning_record_authority`.

A synthetic historical witness must not be upgraded or rewritten merely to satisfy the test.

## Legitimate witness preparation path

The G2 witness-preparation flow is now implemented without creating canonical data automatically.

### Exact-payload authority binding

A human approval is not sufficient unless it is bound to the exact canonical payload under review.

For `ValidationTask` authority:

```text
ValidationTask.suggestedValue
        ↓
deterministic authority-payload hash
        ↓
human APPROVED decision
        ↓
canonicalization input must match exactly
```

Any mismatch fails closed as:

```text
AUTHORITY_MISMATCH
```

Implementation:

```text
0a96134e9ae53441d70934f6125db918103f98a6
fix(g2): bind validation authority to exact canonical payload
```

### ReviewTask hardening

`PublicationReviewApproved` remains distinct from `HumanReviewApproved`.

Additionally, a `ReviewTask` may not become a canonical authority source merely because publication approval exists. Its persisted `PublicationReviewApproved` event must bind:

```text
canonicalAuthorityPayloadHash
```

to the exact canonical draft being requested.

Without that binding:

```text
AUTHORITY_NOT_APPROVED
```

Implementation:

```text
5ffc0ce1d43cba29a41f8b58187a2551dc25ee2b
fix(g2): require exact payload binding for review-task authority

8dd9e3c69bc21454a7f9dff1617dbb7983ca9eaa
test(g2): require payload-bound review-task authority
```

This prevents publication approval over one downstream artifact from becoming blanket authority over arbitrary canonical learning content.

### Current witness route

The supported current witness path is a new human-reviewed `ValidationTask`.

A real teacher-reviewed package may be prepared as:

```text
existing teacher-reviewed package
        ↓
build exact CanonicalAuthorityDraft
        ↓
persist pending ValidationTask
type = canonical_learning_record_authority
        ↓
show exact suggestedValue to teacher/admin
        ↓
human Approve / Reject
```

Preparation implementation:

```text
04ac27142156559c468732c8b164635c8ec12d55
feat(g2): expose teacher decision package lookup

60c8ee8c842a1bd0a4bf3577a61ae080cb32c063
feat(g2): prepare exact-payload canonical authority review

5a22bef158a229078f8d544eb70147f6066540a2
fix(g2): serialize canonical authority draft for Prisma JSON

9734ac7f770c147c5b4e594a67c28fd915fdce56
feat(g2): expose canonical authority review preparation

c38c19937dd2c4514aca3d300a45de40975f6a24
feat(g2): show exact canonical payload before approval

ca7d63d4a111b5990989002c8a2fca2688ac79c3
test(g2): bind human authority to exact reviewed payload

9e3fdf676b751c2ccd0899399296dcc13918b28e
test(g2): align exact-payload assertion with Prisma JSON
```

The preparation action is available from the Teacher Intelligence Validation workspace for teacher-reviewed packages.

Preparation is idempotent by the existing ValidationTask uniqueness boundary:

```text
type
+ entityType
+ entityId
```

An existing task is opened rather than silently replaced.

### Production verification

Final hardening deployment:

```text
dpl_9JY1GafZXZi7yQYTtjWi4SxdwccG
READY
```

Verified:

- no pending Prisma migrations;
- Prisma Client generation PASS;
- Next.js compile PASS;
- type validation PASS;
- existing Teacher Intelligence tests PASS;
- existing Student Dashboard tests PASS;
- canonical consistency: 0 errors.

### Human boundary

No `canonical_learning_record_authority` ValidationTask is created by deployment.

No teacher/admin approval is simulated.

No Canonical Learning Record is created by witness preparation.

The next legitimate action is:

```text
teacher/admin opens Validation
        ↓
Prepare canonical authority review
        ↓
inspect exact payload
        ↓
Approve canonical authority
```

Only after that current human decision exists may the G2 runtime experiment execute canonicalization and replay.

### Current status after witness-path implementation

```text
G2 IMPLEMENTATION
PASS

AUTHORITY PAYLOAD BINDING
PASS

REVIEWER RESOLUTION
PASS

WITNESS PREPARATION FLOW
READY

HUMAN WITNESS
NOT YET CREATED / APPROVED

RUNTIME CANONICALIZATION PROOF
PENDING

G2 FINAL STATUS
IMPLEMENTED / RUNTIME PROOF PENDING

G3
BLOCKED
```

