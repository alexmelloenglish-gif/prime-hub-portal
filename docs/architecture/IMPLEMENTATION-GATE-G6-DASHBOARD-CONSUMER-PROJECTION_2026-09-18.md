# Implementation Gate G6 — Dashboard Consumer Projection

**Date:** 2026-09-18  
**Status:** CONTRACT FROZEN / IMPLEMENTATION NOT STARTED  
**Gate:** G6 — consumer/dashboard projection from verified canonical projections  
**Predecessors:** G1–G5 CLOSED / PASS  
**Initial witness:** Gustavo Drummond de Andrade Salgado — learnerId `stu_4c4da6c04ac4`

## 1. Objective

G6 must prove that a real consumer/dashboard surface reads an authorized canonical projection without reconstructing pedagogical authority from legacy surfaces.

The initial vertical slice is:

```
CanonicalLearningRecord
        ↓
VERIFIED Canonical Learning Intelligence Projection
        ↓
G6 consumer projection
        ↓
read-back / render verification
```

G6 does not reopen or rewrite G1–G5.

## 2. Frozen identity boundary

Learner identity, account identity and contact/guardian relationship are separate concepts.

```
learnerId / studentId     = canonical learner identity
canonicalRecordId         = canonical learning-record identity
learnerEmail              = learner's own email only when explicitly authorized
guardianName              = guardian identity only when explicitly authorized
guardianEmail             = guardian email only when explicitly authorized
accountContactEmail       = email used for account/contact/access when that is all the source proves
```

The existing field `studentEmail` is semantically ambiguous and MUST NOT be interpreted as proof that the address personally belongs to the learner.

For Gustavo, the current canonical witness preserves:

```
learnerName: Gustavo Drummond de Andrade Salgado
learnerId: stu_4c4da6c04ac4
studentEmail: carolvdrummond@gmail.com
```

G6 must treat that existing email as an account/contact identifier unless an authorized source explicitly establishes a more specific relationship. It must not manufacture `learnerEmail`, `guardianName`, or `guardianEmail`.

No retroactive CLR or G5 mutation is authorized by this contract.

## 3. Required discovery before implementation

Before any G6 write, map every current use of `studentEmail` and equivalent email keys that affects:

- authentication/session identity;
- learner selection;
- repository/snapshot lookup;
- dashboard projection;
- dashboard routing/query parameters;
- account access;
- contact display;
- guardian/responsible-party display;
- Learning Intelligence consumer selection.

Each use must be classified as one of:

```
LEARNER_IDENTITY
ACCOUNT_IDENTITY
CONTACT_RELATIONSHIP
GUARDIAN_RELATIONSHIP
LEGACY_AMBIGUOUS
```

Unknown semantics remain `LEGACY_AMBIGUOUS`; they must not be upgraded by inference.

## 4. Canonical source boundary

The G6 pedagogical consumer must use a VERIFIED canonical projection as its authority source.

For the first witness, the required upstream Learning Intelligence projection is:

- projectionId: `cmu6mo4v30001n2uxa4llmij6`
- canonicalRecordId: `cmu6jv29k0001bf8kt45pl9ht`
- canonicalVersion: `1`
- canonicalHash: `9d34e5adc6d91974e01f0c3012203bc62749f5a5681a7498b1317c0e5e22d83e`
- projectionStatus: `VERIFIED`

G6 must not rebuild authoritative Learning Intelligence from:

- ClassReport or ClassReportProjection;
- PortfolioProjection;
- student/repository snapshot;
- `teacherInsight` prose;
- `parseTransferPoints()`;
- legacy LearningIntelligence objects;
- candidate/proposal state.

Legacy sources may be observed for compatibility diagnostics only.

## 5. Consumer projection contract

A G6 consumer projection/read model must preserve recoverable lineage at minimum:

- learnerId;
- canonicalRecordId;
- canonicalVersion;
- canonicalHash;
- upstreamProjectionId;
- upstreamProjectionKey;
- upstreamProjectionHash;
- upstreamProjectionVersion;
- authorityScope;
- teacherDecisionId where available;
- sourceReferences or recoverable canonical reference;
- consumerProjectionVersion;
- consumerProjectionHash;
- verification status.

Presentation may curate or rename fields, but it must not create new pedagogical authority.

## 6. Young-learner/account relationship rule

The consumer model may expose these fields when supported:

```
learnerName
learnerId
learnerEmail
guardianName
guardianEmail
accountContactEmail
```

Rules:

1. `learnerEmail` requires explicit evidence that the email belongs to the learner.
2. `guardianName` and `guardianEmail` require explicit evidence of the guardian relationship.
3. `accountContactEmail` may preserve an existing account/access/contact email without asserting ownership by the learner.
4. A single legacy email may not populate multiple semantic roles by inference.
5. Missing relationship data remains missing.
6. Authentication convenience does not create canonical learner or guardian identity.

## 7. Runtime acceptance

G6 may close only when the Gustavo Production witness demonstrates:

1. the upstream G5 projection exists and is VERIFIED;
2. the consumer reads that projection as authority;
3. canonicalRecordId/version/hash are preserved;
4. upstream projection ID/key/hash/version are preserved;
5. consumer projection/read model is materialized or deterministically produced;
6. consumer hash binds lineage + presented payload;
7. read-back/render verification succeeds;
8. exact replay is idempotent when persistence is used;
9. learner selection is anchored to learnerId/canonical lineage, not inferred email ownership;
10. `studentEmail` is not rendered or promoted as learner-owned email without evidence;
11. guardian fields are not manufactured;
12. account/contact semantics are explicit where the existing email is required operationally;
13. no ClassReport → teacherInsight → parseTransferPoints authority path is used;
14. no Portfolio/snapshot/legacy Learning Intelligence becomes authority;
15. G1–G5 records remain unchanged;
16. witness remains limited to Gustavo;
17. the learner-facing output contains no technical pipeline/audit language that changes pedagogical meaning;
18. provenance remains recoverable from the rendered/consumer state.

Any UNKNOWN or inferred required criterion fails the G6 witness.

## 8. Non-goals

G6 does not authorize:

- changing CLR content;
- changing the G5 Learning Intelligence projection;
- reclassifying an email as guardian/learner-owned without evidence;
- bulk account migration;
- historical backfill;
- deleting legacy renderers;
- changing authentication provider;
- starting G7;
- treating successful rendering as proof without provenance.

## 9. Gate state

```
G1 — CLOSED / PASS
G2 — CLOSED / PASS
G3 — CLOSED / PASS
G4 — CLOSED / PASS
G5 — CLOSED / PASS

G6 — CONTRACT FROZEN
     identity/account/contact boundary — FROZEN
     discovery — NOT STARTED
     implementation — NOT STARTED
     runtime proof — NOT STARTED

G7 — BLOCKED
```

The next authorized action is G6 read-only discovery only. No G6 production write is authorized until that mapping is complete.
