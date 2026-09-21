# Young Learner Access — Production Provisioning Record

**Date:** 2026-09-21  
**Scope:** Gustavo/Carol + Eduarda/Michelle account→learner authorization  
**Database:** Neon production project `holy-block-04720208`, branch `main`, database `neondb`

## Owner-authorized access decisions

### Gustavo

```text
account: gugasalgado7@gmail.com
relationType: LEARNER_SELF
studentId: stu_4c4da6c04ac4
viewer mode: LEARNER
```

### Carol

```text
account: carolvdrummond@gmail.com
relationType: AUTHORIZED_ACCESS
studentId: stu_4c4da6c04ac4
viewer mode: RESPONSIBLE_ADULT
```

### Michelle / Eduarda

```text
account: midias83@hotmail.com
account owner: Michelle
relationType: AUTHORIZED_ACCESS
studentId: stu_e8661006824a
viewer mode: RESPONSIBLE_ADULT
learner-owned Eduarda email: NOT PROVIDED
```

The legacy Eduarda `studentEmail/canonicalEmail = midias83@hotmail.com` is compatibility data and is not learner-owned identity.

## Production write

Three portal User identities and three explicit `AccountLearnerRelation` rows were materialized under the owner-authorized access decisions.

Each relation preserves:

- `status = ACTIVE`;
- exact `studentId`;
- exact `relationType`;
- `sourceType = owner_explicit_authorization`;
- exact source reference;
- authorization SHA-256;
- production admin actor in `authorizedBy`;
- `authorizedAt`;
- one `AUTHORIZED` lifecycle event.

### Persisted relation IDs

```text
Gustavo self
alr_gustavo_self_20260921

Carol responsible
alr_gustavo_carol_20260921

Michelle responsible
alr_eduarda_michelle_20260921
```

## Read-back result

Production read-back returned all three relations as `ACTIVE` with the intended type, learner id, provenance and one matching AUTHORIZED lifecycle event.

Authorization hashes:

```text
Gustavo
af3fdba4084581088ece931b59ab20090fb372e64b98a207df63d46e3e510ea5

Carol
a6b0b2f446a7c1442e5a423ff802a61a0307734078cabb5de0c34cf8c37ef0a7

Michelle
f6886cf976f5f303ed5f25eb272c7e32093fd875a6799feca352c3967c571402
```

## What this proves

- portal account identities now exist for the three authorized access accounts;
- account→learner relations are persisted and auditable;
- Gustavo and Carol resolve to the same learner identity;
- Michelle resolves to Eduarda's learner identity;
- Michelle's email is no longer semantically treated as Eduarda-owned identity in the access contract;
- relation lifecycle provenance is persisted.

## What this does not yet prove

- Google/NextAuth provider-account linkage for those users;
- a successful interactive sign-in by Gustavo, Carol or Michelle;
- authenticated Dashboard rendering;
- G6 consumer cutover;
- responsible-adult presentation behavior in production;
- Eduarda `LEARNER_SELF` access, because no Eduarda-owned login email has been provided.

## Next runtime witness

The next proof must be produced by the actual authenticated accounts:

```text
Google sign-in
→ NextAuth account/session
→ AccountLearnerRelation resolution
→ studentId
→ intended Dashboard consumer
→ same canonical learner state
→ viewer-mode-appropriate presentation
```

No agent or administrator should simulate those Google identities to manufacture the witness.
