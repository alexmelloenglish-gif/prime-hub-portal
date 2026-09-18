# G6 — AccountLearnerRelation Implementation Contract

**Date:** 2026-09-18  
**Status:** PREPARED FOR REVIEW — ADR-002 ACCEPTED / MIGRATION NOT APPLIED  
**Gate:** G6  
**Predecessors:** G1–G5 CLOSED / PASS  
**Production writes:** NONE  
**Vercel build migration behavior:** DISABLED — migration requires separate explicit authorization

## 1. Purpose

This artifact converts ADR-002 into an implementation-ready contract without authorizing migration execution, production relation creation, dashboard cutover or G6 consumer rendering.

Target chain:

```
authenticated account
        ↓
AccountLearnerRelation
        ↓
studentId
        ↓
canonicalRecordId
        ↓
G5 VERIFIED Learning Intelligence Projection
        ↓
G6 consumer projection
```

## 2. Persistence contract

Primary table:

```
account_learner_relations
```

Required semantics:

```
id
userId
studentId

status
  ACTIVE | REVOKED

relationType
  LEARNER_SELF
  AUTHORIZED_ACCESS
  OTHER_AUTHORIZED

sourceType
sourceReference
authorizationHash?

authorizedBy
authorizedAt

validFrom?
validUntil?

revokedBy?
revokedAt?
revocationReason?

createdAt
updatedAt
```

Database invariants:

```
UNIQUE(userId, studentId)

FK userId → users.id
ON DELETE RESTRICT

status ∈ {ACTIVE, REVOKED}

relationType ∈ {
  LEARNER_SELF,
  AUTHORIZED_ACCESS,
  OTHER_AUTHORIZED
}

validFrom ≤ validUntil when both exist
```

Guardian/contact semantics are intentionally absent.

## 3. Lifecycle audit

A separate additive table preserves relation lifecycle events:

```
account_learner_relation_events
```

Event types:

```
AUTHORIZED
REVOKED
```

Each event preserves:

```
relationId
eventType
actorUserId
sourceType
sourceReference
authorizationHash?
reason?
occurredAt
metadata?
createdAt
```

This ensures revocation is not silent deletion and preserves an auditable authorization history.

## 4. Server-side authority service

File:

```
lib/account-learner-relation.ts
```

Public operations prepared:

```
authorizeAccountLearnerRelation(...)
revokeAccountLearnerRelation(...)
```

Creation requirements:

1. caller must identify an existing privileged authority actor;
2. current implementation requires actor role = `admin`;
3. target account must exist;
4. `studentId` must identify an active operational learner in the canonical student registry;
5. relation type must be one of the frozen access types;
6. source type/reference are mandatory;
7. email-equality and legacy-email-match source types are rejected;
8. creation and initial `AUTHORIZED` event occur atomically;
9. an existing ACTIVE pair is rejected;
10. a REVOKED pair is not silently reactivated.

Revocation requirements:

1. actor must pass the same privileged authority check;
2. relation must exist;
3. revocation is represented by status + provenance, not deletion;
4. a `REVOKED` lifecycle event is written atomically;
5. repeated revocation is idempotent from a state perspective.

No dashboard, CLR or G5 mutation is performed.

## 5. Fail-closed resolver

File:

```
lib/learner-account-resolution.ts
```

Canonical resolver states:

```
AUTHORIZED
ABSENT
NOT_OBSERVABLE
```

### AUTHORIZED

Returned only when:

- accountId is known;
- an ACTIVE relation exists;
- validity window permits access;
- exactly one relation matches, or the requestedStudentId explicitly selects one relation;
- relation provenance is recoverable.

### ABSENT

Returned when the relational source is observable but:

- no active relation exists; or
- requestedStudentId is not authorized for the account.

### NOT_OBSERVABLE

Returned when:

- accountId is missing;
- the relation source cannot be read;
- multiple active learners exist and no explicit learner selection is supplied;
- the source state is otherwise ambiguous.

Canonical resolver never falls back to:

```
User.email
studentEmail
canonicalEmail
emailAliases
Firestore document IDs
snapshots
ADMIN_PREVIEW_EMAILS
pipeline projections
```

Legacy email lookup remains a separate compatibility/shadow mechanism and never returns `AUTHORIZED` from this resolver.

## 6. Multiple-learner behavior

An account may have multiple ACTIVE learner relations.

If the request omits `requestedStudentId` and more than one valid relation exists:

```
NOT_OBSERVABLE
AMBIGUOUS_RELATION
```

No first-match or email-based selection is permitted.

If `requestedStudentId` is supplied, only the exact pair is evaluated.

## 7. Revoked relation behavior

A REVOKED relation never resolves as authorized.

The initial implementation does not silently reactivate a revoked pair.

Any future reauthorization must be an explicit authority action with new provenance and a corresponding lifecycle event.

## 8. Gustavo safety boundary

No production relation for Gustavo is created by this implementation.

Current known state remains:

```
studentId
stu_4c4da6c04ac4

legacy studentEmail
carolvdrummond@gmail.com

accountContactEmail
NOT_OBSERVABLE

guardianEmail
NOT_OBSERVABLE
```

The absence of a matching authenticated User row is not repaired by email equality.

## 9. Review-only artifacts prepared

```
prisma/schema.prisma
prisma/migrations/20260918073000_add_account_learner_relation/migration.sql
lib/account-learner-relation.ts
lib/learner-account-resolution.ts
scripts/g6-account-learner-relation-self-test.mjs
package.json
```

The migration is present only as a branch artifact. It has not been applied by this PR.

Vercel build execution is read-only with respect to Prisma migrations: `vercel-build` runs the application build and G6 structural verification but does not run `prisma migrate deploy`. Migration deployment is exposed only as the explicit `db:migrate:deploy` command and remains outside normal Preview/Production build execution.

No relation row has been inserted.

## 10. Verification contract before merge

Before merge to `main` or production migration, the implementation must pass:

```
git diff --check

Prisma schema validation / generate

G6 structural self-test

TypeScript / Next build

G6 self-test executed by both CI contract and application build

Vercel Preview build with NO migration execution

migration dry-run or isolated branch verification

service review:
  - privileged actor enforcement
  - no email-based authority
  - atomic lifecycle event
  - unique pair semantics

resolver review:
  - AUTHORIZED / ABSENT / NOT_OBSERVABLE
  - explicit requestedStudentId handling
  - ambiguous multi-learner fail-closed behavior

NO production relation creation
NO dashboard cutover
NO CLR mutation
NO G5 mutation
```

Only after these checks may the migration be considered for a separately authorized execution. Merge or Vercel deployment alone must not apply the migration.

## 11. Gate state

```
G1 — CLOSED / PASS
G2 — CLOSED / PASS
G3 — CLOSED / PASS
G4 — CLOSED / PASS
G5 — CLOSED / PASS

G6
  Phase 1 — COMPLETE
  Phase 2 discovery — COMPLETE
  Phase 2 authority model — ACCEPTED / ADR-002
  implementation contract — PREPARED FOR REVIEW
  migration — NOT APPLIED
  relation creation — NOT STARTED
  production writes — NONE
  Phase 3 — NOT STARTED
  Phase 4 — NOT STARTED
  Phase 5 — NOT STARTED
  Phase 6 — NOT STARTED

G7 — BLOCKED
```

No artifact in this contract authorizes a production write.
