# G6 Implementation Design Refinement

**Date:** 2026-09-18  
**Status:** COMPLETE / FROZEN — READ-ONLY DESIGN  
**Gate:** G6  
**Predecessors:** G1–G5 CLOSED / PASS  
**Migration authorized:** NO  
**Production writes:** NONE

## 1. Architectural recommendation

Future implementation should introduce a dedicated domain entity:

```
AccountLearnerRelation
```

It must connect:

```
User.id
  ↕
studentId
```

Do not use as substitutes:

- `User.email`;
- legacy `studentEmail`;
- a simple `studentId` column added to `User`;
- the NextAuth `Account` record as a pedagogical authorization relation.

The relation should preserve:

- relation status;
- optional explicitly supported relation type;
- source type/reference;
- authorizing actor/reference;
- authorization timestamp;
- validity/revocation state;
- explicitly authorized contact relation;
- guardian/responsible-party relation only when separately supported.

## 2. Resolver states

The server-side resolver returns exactly one semantic state:

```
AUTHORIZED
ABSENT
NOT_OBSERVABLE
```

Fail-closed behavior:

| Situation | Resolver state | Canonical consumer projection |
|---|---|---|
| Active authorized relation | AUTHORIZED | Allowed |
| Observable source, no relation | ABSENT | Blocked |
| Source unavailable/unobservable | NOT_OBSERVABLE | Blocked |
| Revoked relation | ABSENT | Blocked |
| Conflicting/ambiguous relations | NOT_OBSERVABLE | Blocked |

`LEGACY_FALLBACK` may exist only for compatibility or shadow comparison. It is never equivalent to `AUTHORIZED` and never satisfies canonical proof.

## 3. Mandatory two-stage resolution

Account resolution:

```
account
  ↓
authorized AccountLearnerRelation
  ↓
studentId
```

Canonical resolution:

```
studentId
  ↓
canonicalRecordId
  ↓
VERIFIED G5 Learning Intelligence Projection
```

Canonical resolution MUST NOT use email.

## 4. Future AccountLearnerRelation contract

Minimum proposed design fields:

```
relationId
userId
studentId
status
relationType?
sourceType
sourceReference
authorizedBy?
authorizedAt
validFrom?
validUntil?
revokedAt?
contactRelationStatus
guardianRelationStatus
createdAt
updatedAt
```

Exact persistence schema, indexes and migration remain implementation decisions and are NOT authorized by this read-only refinement.

Required semantic rules:

1. `userId + studentId` does not imply authorization unless relation status and authority provenance satisfy the resolver contract.
2. Email equality cannot create a relation.
3. Guardian semantics cannot be inferred from account/contact authorization.
4. Revocation blocks projection consumption.
5. Conflicting active relations fail closed until resolved.
6. Missing/unobservable authority remains `NOT_OBSERVABLE`.

## 5. Consumer projection envelope

Minimum lineage envelope:

```
consumerProjectionId
consumerProjectionVersion
consumerProjectionHash
consumerProjectionStatus
accountLearnerRelationStatus
accountLearnerRelationReference
learnerId
learnerName
canonicalRecordId
canonicalVersion
canonicalHash
upstreamProjectionId
upstreamProjectionKey
upstreamProjectionHash
upstreamProjectionVersion
authorityScope
teacherDecisionId
sourceReferences
```

Relationship fields remain nullable or explicitly `NOT_OBSERVABLE`:

```
learnerEmail
accountContactEmail
guardianName
guardianEmail
```

The consumer projection cannot reconstruct pedagogical authority from Class Reports, Portfolio, snapshots, legacy `teacherInsight`, `parseTransferPoints()`, candidate/proposal state or legacy Learning Intelligence.

## 6. Mandatory operational rule

```
NO AUTHORIZED ACCOUNT → LEARNER RELATION
        ⇒ no learner projection
        ⇒ no guardian inference
        ⇒ no canonical write
```

The authenticated account alone is insufficient.

## 7. Gustavo baseline

```
learnerId: stu_4c4da6c04ac4
learnerName: Gustavo Drummond de Andrade Salgado
legacy studentEmail: carolvdrummond@gmail.com
guardianEmail: NOT_OBSERVABLE
accountContactEmail: NOT automatically established
```

Without an observable authorized `AccountLearnerRelation`, the resolver returns `ABSENT` or `NOT_OBSERVABLE`; no canonical consumer projection is generated.

This does not require or authorize any retroactive CLR or G5 change.

## 8. Implementation boundary

Implementation, migration and production writes remain NOT STARTED / NOT AUTHORIZED.

When implementation is explicitly authorized, it must begin with identity authorization infrastructure, not dashboard rendering:

```
AccountLearnerRelation persistence
        ↓
server-side fail-closed resolver
        ↓
studentId
        ↓
canonical resolver
        ↓
G5 VERIFIED projection
        ↓
G6 consumer projection
        ↓
learner-facing render
```

Replacing `?studentEmail=` with `?studentId=` alone does not satisfy G6.

## 9. Gate state

```
G1 — CLOSED / PASS
G2 — CLOSED / PASS
G3 — CLOSED / PASS
G4 — CLOSED / PASS
G5 — CLOSED / PASS

G6 — ELIGIBLE TO START
     technical discovery — COMPLETE
     identity model — DOCUMENTED
     acceptance contract — FROZEN
     implementation design refinement — COMPLETE
     implementation — NOT STARTED
     migration — NOT AUTHORIZED
     production writes — NONE
     runtime proof — NOT STARTED

G7 — BLOCKED
```

No further discovery is required before implementation planning. This refinement does not itself authorize schema migration, production writes, CLR/G5 mutation or dashboard cutover.
