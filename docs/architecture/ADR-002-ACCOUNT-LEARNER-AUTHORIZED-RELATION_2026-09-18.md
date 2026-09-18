# ADR-002 — Authorized Account → Learner Relation

**Date:** 2026-09-18  
**Status:** ACCEPTED  
**Decision scope:** Account identity, learner-access authority, resolver semantics, ambiguity handling, preview behavior and auditability for G6.

## Evidence baseline

This ADR is downstream from and must not rewrite:

- ADR-001 — Canonical Learning Record as the Common Source for Independent Projections;
- G1–G5 runtime proofs, all CLOSED / PASS;
- G6 technical discovery;
- G6 Identity / Consumer Projection Contract;
- G6 Implementation Design Refinement.

The G6 discovery established that the current learner-facing path is email-first:

```
Google profile.email
        ↓
NextAuth session.user.email
        ↓
getStudentDashboardState()
        ↓
studentEmail
        ↓
legacy composition / routing
        ↓
dashboard
```

That path is compatibility behavior. It is not sufficient authority for canonical learner access.

---

## 1. Problem

G6 requires an explicit transition:

```
authenticated account
        ↓
AUTHORIZED ACCOUNT → LEARNER RELATION
        ↓
studentId
        ↓
canonicalRecordId
        ↓
VERIFIED G5 projection
        ↓
G6 consumer projection
```

The current schema/authentication model does not provide a dedicated authorized relation between an authenticated `User` and a learner `studentId`.

The following must therefore remain false:

```
User.email == studentEmail
        ≠
AUTHORIZED RELATION
```

Email equality, legacy routing, historical account behavior or a NextAuth `Account` row must never be promoted into learner-access authority by inference.

---

## 2. Decision

G6 will use a dedicated domain relation:

```
AccountLearnerRelation
```

Its semantic connection is:

```
User.id
  ↕
studentId
```

This relation is the explicit authority boundary that permits an authenticated account to resolve to a learner.

It is not:

- a replacement for `User`;
- a field added to `User`;
- the NextAuth `Account` model;
- `User.email`;
- legacy `studentEmail`;
- a guardian relation;
- a contact relation;
- a pedagogical record.

---

## 3. Relation cardinality

The relation is many-to-many at the domain level.

### One account may access multiple learners

Allowed only when each learner has its own explicit authorized relation.

```
User A
 ├─→ Learner 1
 └─→ Learner 2
```

No learner may be selected by guessing from email or from the first matching row.

If an account has multiple active authorized learners and the request does not identify which learner is intended, the resolver must require explicit learner selection and fail closed rather than choose one.

### One learner may be accessible by multiple accounts

Allowed only when each account has its own explicit authorized relation.

```
Learner 1
 ├─→ User A
 └─→ User B
```

Each relation has independent provenance, lifecycle and revocation.

### Pair uniqueness

The persistence design must enforce the semantic equivalent of:

```
UNIQUE(userId, studentId)
```

A pair represents one durable relationship identity. Authorization/revocation history must not be represented by duplicate active rows for the same pair.

---

## 4. Relation lifecycle

The domain status is:

```
ACTIVE
REVOKED
```

An `ACTIVE` row is not automatically sufficient for authorization. It must also satisfy validity and provenance requirements.

A relation is resolvable as authorized only when:

- status is `ACTIVE`;
- it is within its validity window, when one exists;
- required authority provenance is present and recoverable;
- it has not been revoked;
- no unresolved conflict makes the relation ambiguous.

Revocation must be explicit and auditable. Revocation must not be implemented as silent deletion.

Reactivation after revocation requires a new explicit authorization event. It must not occur merely by clearing a revocation field without new authority provenance.

---

## 5. Relation type

The access relation may use only types that describe access authority itself:

```
LEARNER_SELF
AUTHORIZED_ACCESS
OTHER_AUTHORIZED
```

`GUARDIAN` is intentionally excluded.

Guardian/responsible-party meaning is a separate relationship domain and must not be inferred from access authorization.

---

## 6. Minimum authority provenance

An authorized relation must preserve, at minimum, recoverable equivalents of:

```
relationId
userId
studentId
status
relationType

sourceType
sourceReference

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

Exact database field names are implementation details, but the semantics above are mandatory.

### Source requirement

`sourceType + sourceReference` must establish why the relation exists.

Email equality is not an authority source.

### Authorizing actor

`authorizedBy` must identify an actor or trusted system authority that is itself permitted to grant learner access.

The implementation may distinguish human and system actors, but it must not omit the authority reference.

---

## 7. Who may create the relation

Creation is a privileged server-side authority operation.

It may be performed only by:

1. an authenticated administrative/identity-authority actor explicitly authorized to manage learner access; or
2. a trusted server-side authority workflow that records an equivalent durable authority source and actor/reference.

It may not be created by:

- a learner-facing session merely because its email matches `studentEmail`;
- a teacher role merely because the teacher teaches that learner, unless that teacher has separately been granted identity-authority permission;
- client-side code;
- dashboard routing;
- Google/NextAuth account creation itself;
- import logic based only on email coincidence;
- legacy fallback resolution.

The first implementation may restrict creation to administrative identity authority only.

---

## 8. Who may revoke the relation

Revocation is also a privileged server-side authority operation.

A relation may be revoked only by:

- an administrative/identity-authority actor with permission to revoke learner access; or
- an explicitly authorized trusted server-side authority workflow.

Revocation must record the revoking actor/reference and timestamp.

A user signing out, changing email, losing a provider account, or failing a legacy lookup does not itself constitute relation revocation.

---

## 9. Resolver contract

The server-side resolver returns one of:

```
AUTHORIZED
ABSENT
NOT_OBSERVABLE
```

### AUTHORIZED

Returned only when one explicit relation satisfies all authority, validity and conflict checks.

Output must include:

```
studentId
relationId/reference
relation status
relation type
authority provenance
```

### ABSENT

Returned when the authority source is observable and no valid authorized relation exists, including:

- no relation for the requested account/learner;
- relation is revoked;
- relation is expired/not yet valid;
- relation exists but is not active.

`ABSENT` blocks canonical learner projection.

### NOT_OBSERVABLE

Returned when the resolver cannot safely determine authority, including:

- relation store/source unavailable;
- authority provenance required for verification cannot be observed;
- conflicting active relation state;
- ambiguous learner selection that cannot be resolved safely;
- corrupt or internally inconsistent relation data.

`NOT_OBSERVABLE` blocks canonical learner projection.

### Legacy fallback

`LEGACY_FALLBACK` may exist only as a compatibility/shadow diagnostic classification.

It is not a resolver authority state, is never equivalent to `AUTHORIZED`, and cannot satisfy G6 proof.

---

## 10. Mandatory fail-closed rule

```
NO AUTHORIZED ACCOUNT → LEARNER RELATION
        ⇒ no canonical learner projection
        ⇒ no guardian inference
        ⇒ no canonical write
```

Authentication proves account identity only.

It does not prove learner identity or relationship type.

---

## 11. Separation from canonical resolution

Account resolution and canonical resolution are distinct operations.

### Account resolution

```
User.id
  ↓
AccountLearnerRelation
  ↓
studentId
```

### Canonical resolution

```
studentId
  ↓
canonicalRecordId
  ↓
VERIFIED G5 Learning Intelligence Projection
```

The second stage must not use email.

The first stage must not infer pedagogical state.

---

## 12. Guardian and contact relations

This ADR does not make guardian identity part of `AccountLearnerRelation`.

The following remain separate semantic claims:

```
account access authorization
guardian relationship
contact relationship
learner-owned email
```

Therefore:

- `guardianName` requires separate explicit guardian evidence;
- `guardianEmail` requires separate explicit guardian evidence;
- `accountContactEmail` requires an explicitly authorized/observable contact relation;
- `learnerEmail` requires explicit evidence that the learner owns that email.

An access relation of type `AUTHORIZED_ACCESS` does not imply any of those claims.

For Gustavo, until such evidence exists:

```
guardianEmail = NOT_OBSERVABLE
accountContactEmail = NOT_OBSERVABLE
```

The legacy `studentEmail = carolvdrummond@gmail.com` remains compatibility data only.

---

## 13. Admin preview

Administrative preview is a separate privileged read path.

An authorized admin may explicitly preview a learner by `studentId` / canonical identity without manufacturing an `AccountLearnerRelation` for the admin account.

Admin preview must:

- be server-authorized;
- be explicitly classified as admin/preview context;
- resolve the learner by learner/canonical identity, not by email inference;
- not create or modify learner access relations;
- not be treated as learner-session proof;
- not satisfy the canonical account→learner authorization proof for a learner-facing session;
- not create guardian/contact semantics.

This preserves administrative observability without corrupting learner-access authority.

---

## 14. Ambiguity rules

### Multiple learners for one account

Multiple authorized relations are valid.

If a request explicitly names an authorized `studentId`, resolve that learner.

If no learner is selected and more than one relation is eligible, the resolver must not choose arbitrarily. It must require a deterministic authorized selection step or return an ambiguous/fail-closed outcome.

### Multiple accounts for one learner

Multiple authorized relations are valid. Revoking one account's relation must not revoke another account's independent relation.

### Conflicting rows/state

Conflicting active state, duplicate semantic relations or irreconcilable provenance produce `NOT_OBSERVABLE` until corrected.

---

## 15. Audit requirements

A future audit must be able to answer:

1. Which account was authenticated?
2. Which relation resolved that account to which `studentId`?
3. Who/what authorized the relation?
4. What source/reference supported the authorization?
5. When did authorization become valid?
6. Was the relation active at access time?
7. Was it later revoked, by whom and when?
8. Was learner selection explicit when the account had multiple learners?
9. Which canonical record and G5 projection were subsequently consumed?
10. Was the access learner-facing or admin preview?

The access/projection proof must retain a recoverable relation reference.

---

## 16. Rejected alternatives

### Rejected: `User.email == studentEmail`

Reason: email coincidence is legacy compatibility, not explicit authority.

### Rejected: add `studentId` directly to `User`

Reason: incorrectly collapses a potentially many-to-many relation and cannot model independent authorization/revocation per learner.

### Rejected: reuse NextAuth `Account`

Reason: it represents authentication-provider linkage, not pedagogical learner-access authority.

### Rejected: encode guardian status inside access relation

Reason: account access and guardian relationship are independent claims with different evidence requirements.

### Rejected: silently auto-create relations from legacy email

Reason: it would convert the exact email-first ambiguity discovered by G6 into apparently canonical authority.

---

## 17. Consequences

### Positive

- learner access becomes explicit and auditable;
- email no longer defines canonical learner identity;
- one account can support multiple learners safely;
- one learner can have multiple separately revocable accounts;
- guardian/contact semantics remain evidence-bound;
- G6 can consume G5 without reconstructing identity from legacy routing;
- admin preview remains available without contaminating learner authority.

### Costs

- a new persistence relation and migration will be required;
- an authorized creation/revocation path must be implemented;
- resolver logic must fail closed;
- legacy email paths need bounded compatibility/shadow handling;
- access migration must be explicit rather than inferred.

These costs are accepted because they resolve the structural authority gap identified by G6 discovery.

---

## 18. Implementation boundary

This ADR accepts the architecture only.

It does **not** authorize:

- Prisma/database migration;
- production relation creation;
- bulk backfill;
- relation creation for Gustavo;
- deriving guardian/contact relations;
- CLR mutation;
- G5 mutation;
- dashboard cutover;
- deletion of legacy email paths.

The next implementation artifact must translate this ADR into a concrete migration + service contract and explicit first relation-creation procedure.

---

## 19. G6 state after ADR-002

```
G1 — CLOSED / PASS
G2 — CLOSED / PASS
G3 — CLOSED / PASS
G4 — CLOSED / PASS
G5 — CLOSED / PASS

G6
  Phase 1 — COMPLETE
  Phase 2 discovery — COMPLETE
  Phase 2 authority-model decision — ACCEPTED (ADR-002)
  Phase 2 implementation/migration — NOT AUTHORIZED
  Phase 3 — NOT STARTED
  Phase 4 — NOT STARTED
  Phase 5 — NOT STARTED
  Phase 6 — NOT STARTED

G7 — BLOCKED
```

The architectural blocker is resolved by this ADR. The implementation boundary remains closed until migration/service design is explicitly authorized.
