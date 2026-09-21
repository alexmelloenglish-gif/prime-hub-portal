# Young Learner Account Access Contract v1

**Date:** 2026-09-21  
**Status:** OWNER-AUTHORIZED ACCESS POLICY / G6 implementation target  
**Scope:** learner-facing access for minors / Young Learners

## Core rule

The learner is identified by `studentId`, never by login email.

One learner may be accessed by multiple separately authorized accounts:

```text
learner account (optional)
  → LEARNER_SELF
        \
         → same studentId → same canonical learner state
        /
responsible adult account
  → AUTHORIZED_ACCESS
```

There is one learner history. There are not separate parent and learner copies of the Dashboard.

## Viewer modes

### LEARNER

Used when the authenticated account belongs to the learner.

Baseline rights:
- read the learner-facing Dashboard;
- read the learner Portfolio / learning journey exposed to the learner;
- use learner-facing class/logistics links exposed by the product;
- no teacher validation authority;
- no canonical write authority;
- no access to another learner without another explicit relation.

### RESPONSIBLE_ADULT

Used when an adult has explicit authorized access to a Young Learner.

Baseline rights:
- read the same canonical learner state for the authorized student;
- access learner logistics intentionally exposed to responsible adults (booking/support/portfolio where product policy allows);
- no teacher validation authority;
- no canonical pedagogical write authority;
- no inference that the adult is the learner;
- no automatic access to siblings/other learners.

Presentation may be relationship-aware (for example, “Gustavo’s learning journey” rather than pretending the adult is Gustavo) while the underlying learner state remains identical.

## Gustavo / Carol

```text
Gustavo
gugasalgado7@gmail.com
→ LEARNER_SELF
→ viewerMode LEARNER
→ studentId stu_4c4da6c04ac4

Carol
carolvdrummond@gmail.com
→ AUTHORIZED_ACCESS
→ viewerMode RESPONSIBLE_ADULT
→ same studentId stu_4c4da6c04ac4
```

## Eduarda / Michelle

Owner-confirmed identity facts:

```text
Eduarda Coelho Gabriel
studentId = stu_e8661006824a
learner-owned email = NOT PROVIDED

Michelle
midias83@hotmail.com
relationship = mother/responsible adult
→ AUTHORIZED_ACCESS
→ viewerMode RESPONSIBLE_ADULT
→ studentId stu_e8661006824a
```

The legacy field that currently stores `midias83@hotmail.com` as Eduarda's `studentEmail/canonicalEmail` is compatibility data only.

It must not be interpreted as:
- Eduarda-owned email;
- LEARNER_SELF authority;
- proof that Michelle is the learner.

Until Eduarda later provides an account email:

```text
Eduarda LEARNER_SELF account = ABSENT
Michelle AUTHORIZED_ACCESS = authorized target state
```

When Eduarda later receives her own login:

```text
new User account
→ LEARNER_SELF
→ same existing studentId
→ no learner duplication
→ no history migration
```

## Access vs family relationship

`AUTHORIZED_ACCESS` is the G6 access relation.

“mother”, “father”, “guardian”, “responsible adult” remain relationship-context metadata / separate family-domain evidence. They do not replace the access relation type.

## Invariants

1. learner history belongs to `studentId`;
2. login email belongs to an authenticated account;
3. account access is explicit and independently revocable;
4. multiple accounts may resolve to one learner;
5. no duplicated Dashboard state per parent/learner account;
6. responsible access never implies teacher authority;
7. a responsible adult account must not be rendered as if it were the learner;
8. legacy email routing is compatibility only and must disappear as authority after G6 cutover;
9. missing learner email is valid;
10. adding a learner login later never creates a new learner.

## Runtime proof required

For each Young Learner pair:

```text
authenticated User
→ ACTIVE AccountLearnerRelation
→ correct relationType
→ same studentId
→ same verified canonical consumer state
→ viewer-mode-appropriate presentation
→ no learner duplication
```
