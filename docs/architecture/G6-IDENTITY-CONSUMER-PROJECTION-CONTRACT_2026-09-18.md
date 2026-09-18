# G6 Identity / Consumer Projection Contract

**Date:** 2026-09-18  
**Status:** FROZEN — ADR-002 AUTHORITY MODEL ACCEPTED / IMPLEMENTATION NOT STARTED  
**Gate:** G6  
**Predecessors:** G1–G5 CLOSED / PASS  
**Technical discovery:** COMPLETE  
**Writes authorized by this artifact:** NONE

## 1. Purpose

G6 begins with identity resolution and authorization, not dashboard rendering.

The system currently uses email across authentication, learner selection and legacy composition. G6 must not preserve email-first behavior as canonical authority.

Current compatibility path:

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

Target authority path:

```
authenticated account
        ↓
authorized account → learner relation
        ↓
studentId
        ↓
canonicalRecordId
        ↓
VERIFIED G5 Learning Intelligence Projection
        ↓
G6 Consumer Projection
        ↓
learner-facing rendering
```

## 2. Identity domains

### Account identity

```
User.id
User.email
```

These identify the authenticated account. Account email does not by itself identify the learner.

### Learner identity

```
studentId
```

`studentId` is the operational learner identity used by G6.

### Canonical state identity

```
canonicalRecordId
canonicalVersion
canonicalHash
```

These identify the authorized canonical learning state.

### Account → Learner relation

State is one of:

```
AUTHORIZED
ABSENT
NOT_OBSERVABLE
```

The relation must be explicit, durable/recoverable and attributable to an authorized source. Email equality alone does not create this relation.

### Contact relation

State is one of:

```
AUTHORIZED
ABSENT
NOT_OBSERVABLE
```

`accountContactEmail` may be derived only when an authorized account/contact relation is explicitly observable. Its presence in a legacy projection is insufficient.

### Guardian relation

State is one of:

```
AUTHORIZED
ABSENT
NOT_OBSERVABLE
```

`guardianName` and `guardianEmail` require an explicitly recorded/authorized guardian relation. No guardian relation may be inferred from email, age, surname, authentication behavior or contact usage.

### Legacy email

```
studentEmail
```

Compatibility/display/filter only. It is not canonical learner identity and cannot independently authorize a learner projection.

## 3. Mandatory resolution rule

```
NO AUTHORIZED ACCOUNT → LEARNER RELATION
        ⇒ no learner projection
        ⇒ no guardian inference
        ⇒ no canonical write
```

`NOT_OBSERVABLE` is a valid explicit result. The resolver must fail closed rather than infer a relationship.

## 4. Account → Learner authorization contract

Authority-model decision: `ADR-002-ACCOUNT-LEARNER-AUTHORIZED-RELATION_2026-09-18.md` — ACCEPTED.


A relation may resolve an authenticated account to a learner only when all required elements are available:

```
accountId
studentId
relationStatus = AUTHORIZED
authoritySource
authorityReference
authorizedAt or equivalent durable authority evidence
```

Optional descriptive relationship type may be present only when explicitly supported:

```
SELF
GUARDIAN
RESPONSIBLE_PARTY
AUTHORIZED_CONTACT
OTHER_AUTHORIZED
```

Absence of an authorized relationship type does not prevent an account→learner authorization when the access relation itself is explicitly authorized; it does prevent G6 from inventing guardian/contact semantics.

The resolver output is:

```
AUTHORIZED → studentId + recoverable relation provenance
ABSENT → no learner access
NOT_OBSERVABLE → no learner access
```

## 5. G6 consumer projection source contract

The pedagogical source is the VERIFIED G5 Learning Intelligence projection associated with the resolved learner/canonical record.

Initial Gustavo upstream witness:

```
studentId
stu_4c4da6c04ac4

canonicalRecordId
cmu6jv29k0001bf8kt45pl9ht

G5 projectionId
cmu6mo4v30001n2uxa4llmij6

canonicalVersion
1

canonicalHash
9d34e5adc6d91974e01f0c3012203bc62749f5a5681a7498b1317c0e5e22d83e
```

The consumer must not rebuild authority from ClassReport, ClassReportProjection, PortfolioProjection, snapshots, teacherInsight prose, parseTransferPoints(), candidate/proposal state or legacy Learning Intelligence.

## 6. Consumer projection contract

Minimum identity and lineage envelope:

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

Relationship/display fields are nullable or explicitly NOT_OBSERVABLE:

```
learnerEmail
accountContactEmail
guardianName
guardianEmail
```

No nullable/unknown relationship field may be populated from `studentEmail` by inference.

## 7. Consumer hash boundary

`consumerProjectionHash` must bind at minimum:

- resolved account→learner relation reference/status;
- learnerId;
- canonicalRecordId/version/hash;
- upstream projection ID/key/hash/version;
- authority lineage;
- presented pedagogical payload;
- relationship/contact fields actually emitted;
- consumerProjectionVersion.

A presentation change that alters semantic content must therefore produce a different consumer hash/version as appropriate.

## 8. Gustavo identity baseline

The current evidence supports:

```
learnerName
Gustavo Drummond de Andrade Salgado

learnerId
stu_4c4da6c04ac4

legacy studentEmail
carolvdrummond@gmail.com

guardianEmail
NOT_OBSERVABLE
```

`accountContactEmail` is not automatically established by the legacy email. G6 must resolve an authorized account/contact relation before emitting it as such.

No CLR or G5 mutation is required or authorized.

## 9. Implementation design sequence

No code/write begins until implementation follows this order:

```
1. define durable/recoverable account→learner relation representation
2. define resolver input/output and fail-closed semantics
3. define G6 consumer projection schema/read model
4. define lineage/hash/read-back rules
5. define learner-facing rendering boundary
6. define Gustavo-only runtime witness
7. only then authorize implementation/migration/write
```

Changing `?studentEmail=` to `?studentId=` is not sufficient proof and is not the implementation strategy.

## 10. Frozen acceptance invariants

1. `studentId` is learner identity.
2. `canonicalRecordId` is canonical-state identity.
3. `User.id/User.email` are account/authentication identity.
4. `studentEmail` is legacy/ambiguous.
5. `accountContactEmail` requires an explicitly authorized observable account/contact relation.
6. `guardianEmail` requires an explicitly authorized guardian relation.
7. consumer resolution is by studentId and/or canonicalRecordId after account→learner authorization.
8. email is compatibility/display/filter data, not canonical identity.
9. no write to CLR.
10. no write to the G5 Learning Intelligence Projection.
11. no guardian inference from email or account behavior.
12. `NOT_OBSERVABLE` is valid and explicit.
13. no authorized account→learner relation means no learner projection.
14. G6 does not reconstruct pedagogical intelligence.
15. lineage from rendered consumer state to G5/CLR remains recoverable.
16. G1–G5 remain frozen.

## 11. Gate state

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
     implementation design baseline — FROZEN
     ADR-002 authority model — ACCEPTED
     migration / relation implementation — NOT AUTHORIZED
     implementation — NOT STARTED
     production writes — NONE
     runtime proof — NOT STARTED

G7 — BLOCKED
```

The identity-authority design is now governed by ADR-002. The next artifact is the concrete migration + service contract for `AccountLearnerRelation`, but migration and production writes remain NOT AUTHORIZED until explicitly opened. This artifact does not authorize a CLR change, G5 change or dashboard cutover.
