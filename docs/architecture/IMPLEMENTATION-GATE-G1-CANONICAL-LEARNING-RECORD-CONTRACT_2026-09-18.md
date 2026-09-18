# Implementation Gate G1 — Canonical Learning Record Contract

**Date:** 2026-09-18  
**Status:** CLOSED / PASS  
**Gate:** G1 — Canonical record contract  
**Next gate:** G2 — Atomic canonicalization + idempotency

## Evidence baseline

This gate implements only G1 of:

- `docs/architecture/REMEDIATION-SPEC-CANONICAL-LEARNING-RECORD_2026-09-18.md`
- Remediation Spec commit: `934e092f4941a74d2570f8bc3b140b0861996d90`

It does not modify or reopen:

- Student Dashboard Provenance Audit v1;
- ADR-001;
- historical learner records;
- historical Class Reports;
- learner-facing dashboard semantics.

## Implemented contract surface

### TypeScript semantic contract

Created:

`lib/canonical-learning-record-contract.ts`

The contract freezes:

- schema version: `canonical-learning-record-v1`;
- hash algorithm: `sha256`;
- decision types: `accepted | edited | bounded`;
- scope types: `lesson | longitudinal`;
- source references;
- proposal/review references;
- teacher-decision authority metadata;
- structured pedagogical payload;
- immutable canonical record shape;
- deterministic hash-envelope boundary;
- missing-information-remains-missing invariant.

The contract explicitly preserves:

```text
TEACHER DECISION
≠
CANONICAL LEARNING RECORD
```

G2 remains responsible for proving and executing that transition.

### Prisma persistence contract

Added model:

`CanonicalLearningRecord`

Mapped table:

`canonical_learning_records`

The model supports:

- `canonicalRecordId`;
- `schemaVersion`;
- `studentId`;
- optional `studentEmail`;
- optional `lessonId`;
- `scopeType`;
- `scopeKey`;
- `canonicalVersion`;
- `canonicalHash`;
- `hashAlgorithm`;
- `sourceReferences`;
- optional `sourceHash`;
- optional `transcriptId`;
- optional `pipelineRunId`;
- optional `proposalReferences`;
- `teacherDecisionId`;
- `reviewerId`;
- `reviewerRole`;
- `decisionType`;
- `authorityScope`;
- `decisionTimestamp`;
- `canonicalizedAt`;
- `pedagogicalPayload`;
- optional `supersedesRecordId`;
- `createdAt`.

Version uniqueness guard:

```text
@@unique([studentId, scopeKey, canonicalVersion])
```

There is intentionally no `updatedAt` field on canonical versions.

G2 must enforce operational immutability and atomic/idempotent creation.

## G1 contract self-test

Created:

`scripts/canonical-learning-record-contract-self-test.mjs`

Exposed as:

```text
npm run canonical-record-contract:self-test
```

The check asserts the required Prisma fields, version uniqueness guard, schema/hash constants, authority decision vocabulary, pedagogical payload surface, and authority/canonicalization boundary.

It is intentionally not yet promoted into the global regression/build gate. Global regression enforcement belongs to G8.

## Commits

```text
d0ba14d48f5631ea51054240debf8624ffbb3f92
feat(g1): define canonical learning record contract

b85025733454e8fda7d2142ccf2e6b2c776c3178
feat(g1): add canonical learning record persistence model

43bf10e77cc1e3ddb934aa4d438bba29519e970c
test(g1): verify canonical learning record contract

2266c7c2334bfabffb256f59055c458765961bd6
chore(g1): expose canonical record contract self-test
```

## Production/build verification

Production deployment for final G1 implementation commit:

`dpl_Hsoad2ocQKoKc9u23pUMcbdXGcYS`

Status:

```text
READY
```

Build evidence includes:

- `prisma/schema.prisma` loaded successfully;
- `prisma generate` completed successfully;
- Next.js compilation completed successfully;
- lint/type validity stage completed without G1 errors;
- existing Teacher Intelligence tests passed;
- existing Student Dashboard tests passed;
- eligibility boundary test passed;
- canonical consistency validation returned 0 errors.

Existing unrelated canonical consistency warnings for Rafael remain unchanged and are not part of G1.

## Database boundary

The Production build executed:

```text
prisma migrate deploy
```

and reported:

```text
No pending migrations to apply.
```

Therefore G1 did **not** create or alter the Neon table.

This is intentional.

The Prisma model defines the persistence contract in code; creation/application of the durable persistence surface belongs to the controlled G2 implementation together with atomic canonicalization and idempotency.

## Explicitly not implemented in G1

G1 does not implement:

- a Prisma migration;
- a Neon write;
- canonicalization service/command;
- idempotent canonicalization execution;
- canonical version allocation;
- canonical hash computation;
- teacher-decision validation service;
- canonical read-back verification;
- projection writes;
- Class Report changes;
- Learning Intelligence changes;
- Dashboard changes;
- historical migration/backfill.

No historical record was rewritten.

## Gate verdict

```text
G1 — CANONICAL RECORD CONTRACT
PASS / CLOSED

SEMANTIC CONTRACT
DEFINED

PERSISTENCE CONTRACT
DEFINED IN PRISMA

DATABASE MATERIALIZATION
NOT PERFORMED — BY DESIGN

CANONICALIZATION EXECUTION
NOT IMPLEMENTED — G2

READ-BACK VERIFICATION
NOT IMPLEMENTED — G3

DOWNSTREAM PROJECTIONS
UNCHANGED

AUDIT v1
IMMUTABLE
```

## Next authorized implementation gate

```text
G2 — ATOMIC CANONICALIZATION + IDEMPOTENCY
```

G2 must start from the G1 contract and must not silently implement G3 or downstream projection gates.
