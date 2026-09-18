# Implementation Gate G3 — Canonical Read-back Verification

**Date:** 2026-09-18  
**Status:** IMPLEMENTATION STARTED / RUNTIME PROOF PENDING  
**Gate:** G3 — Canonical read-back verification  
**Predecessor:** G2 — CLOSED / PASS

## Boundary

G3 is isolated from all downstream projections.

It does not:
- canonicalize or replay canonicalization;
- create a new teacher decision;
- create a new canonical record;
- invoke Class Report;
- invoke Learning Intelligence;
- invoke Dashboard projection;
- invoke Portfolio projection;
- backfill historical records.

## Required proof

```text
G2 write result / preserved witness
        ↓
read canonical record from Neon
        ↓
compare
- canonicalRecordId
- canonicalVersion
- canonicalHash
- teacherDecisionId
- sourceReferences
- pedagogicalPayload
        ↓
persist verification result
        ↓
PASS / FAIL
```

The hash is also recomputed from the exact authority input using the existing G2 canonical hash envelope. The persisted record hash must equal both the preserved write-result hash and the recomputed expected hash.

Source references and pedagogical payload are compared using deterministic stable JSON serialization.

## Existing real witness

```text
ValidationTask
cmu6je8gg0000101s7os3semk

CanonicalLearningRecord
cmu6jv29k0001bf8kt45pl9ht

Canonical version
1

Canonical hash
9d34e5adc6d91974e01f0c3012203bc62749f5a5681a7498b1317c0e5e22d83e

Canonicalization provenance
cmu6jv2a40003bf8kxt9rlrxb
```

No second witness is created.

## Implementation

Added:

```text
lib/canonical-readback-verification.ts
lib/g3-runtime-proof.ts
scripts/canonical-readback-g3-self-test.mjs
prisma/migrations/20260918070000_add_canonical_readback_verification/migration.sql
```

and Prisma model:

```text
CanonicalLearningRecordVerification
```

The verification record stores expected and observed identifiers, hashes, source references, pedagogical payload, individual comparison results, mismatch fields, and final PASS/FAIL state.

## Runtime proof policy

The G3 runtime proof reconstructs the expected authority input from the already-approved ValidationTask and reads the already-materialized G2 witness.

It deliberately does **not** call `canonicalizeLearningRecord()`.

The proof therefore tests read-back independently from G2 write execution.

## Acceptance

G3 becomes **CLOSED / PASS** only when Production runtime proof records:

```text
canonicalRecordId       exact match
canonicalVersion        exact match
canonicalHash           exact match
teacherDecisionId       exact match
sourceReferences        exact match
pedagogicalPayload      exact match
expected hash           exact match
verification row        persisted
verificationStatus      PASS
```

Until that runtime proof exists:

```text
G3 = IMPLEMENTATION STARTED / RUNTIME PROOF PENDING
```

No downstream gate may infer G3 PASS.