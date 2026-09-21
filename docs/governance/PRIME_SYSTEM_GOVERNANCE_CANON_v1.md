
# PRIME System Governance Canon v1.0

Status: ADOPTED — system governance layer / owner-authorized 2026-09-21
Adoption path: governance/closeout-2026-09-21
Scope: system-wide product, architecture, automation, AI, data, UX, deployment and audit work

## 0. Purpose

The PRIME repository already contains substantial governance in separate domains: canonical state checkpoints, ADRs, pipeline contracts, Prompt 1–4 contracts, proof registers, runbooks, dashboard contracts, implementation gates and validators.

This document is the missing orchestration layer above those artifacts.

It does not replace domain contracts. It tells a human or agent what to read, how to classify a task, how to identify authority, how to distinguish intent from implementation and proof, and when work may proceed.

Core principle:

    INTENT → PROCESS → STATE → OUTPUT → PROOF

No non-trivial implementation should occur without process visibility.

## 1. System model

    PRODUCT INTENT
          ↓
    DOMAIN / AUTHORITY
          ↓
    DATA + STATE
          ↓
    PROCESS / AUTOMATION
          ↓
    AI PROPOSALS
          ↓
    HUMAN DECISION
          ↓
    CANONICAL STATE
          ↓
    PROJECTIONS
          ↓
    UI / USER ACTION
          ↓
    RUNTIME
          ↓
    PROOF / AUDIT

A lower layer must not silently become authoritative for an upper layer.

Examples:
- prompt output is not a teacher decision;
- Class Report is not the canonical learner record;
- Dashboard is not the source of learning truth;
- HTTP 200 is not proof of persistence;
- deployment READY is not proof of correct runtime behavior.

## 2. Evidence hierarchy

    SPECIFICATION
        ↓
    IMPLEMENTATION
        ↓
    EXECUTION
        ↓
    PERSISTENCE
        ↓
    PROVENANCE
        ↓
    COMPLETE TRACE

Never use PROVEN, DONE, LOCKED, FROZEN or VERIFIED unless the available evidence supports the claim.

A model response, screenshot, build success, API success or deployment READY is insufficient by itself for an end-to-end claim.

## 3. Authority map

For each important entity or decision identify:

    SOURCE OF TRUTH
    WRITE AUTHORITY
    PROPOSAL AUTHORITY
    CONFIRMATION AUTHORITY
    PROJECTION
    READ SURFACE
    IMMUTABLE PARTS
    DERIVED PARTS

If two artifacts disagree, do not resolve the conflict by inference. Classify them as canonical, downstream, legacy, compatibility, unresolved or contradictory.

## 4. Semantic classes

FACT
- source-backed event or value.

EVIDENCE
- traceable support for a claim.

PROPOSAL
- AI or system suggestion not yet authoritative.

DECISION
- explicit authorized human or system decision.

CANONICAL STATE
- persistent state resulting from an authorized transition.

PROJECTION
- derived representation of canonical state.

ACTION
- future or operational effect.

A proposal must never masquerade as fact, decision or action.

## 5. Universal process contract

Every substantial task must define:

    INTENT
    ENTRY CONDITION
    INPUTS
    PROCESS
    STATE TRANSITIONS
    AUTHORITY
    OUTPUTS
    FAILURE MODES
    PROOF
    ROLLBACK / CONTAINMENT

If one cannot be established, mark it UNKNOWN or BLOCKED.

## 6. Task router

### AUDIT
Determine expected behavior, observed behavior, divergence, evidence, impact and proof requirement before remediation.

### AUTOMATION
Document trigger, identity, idempotency, processing stages, state machine, human gates, persistence, retries, downstream effects and end-to-end proof.

### AI / PROMPT
Document input contract, output schema, authority boundary, forbidden mutations, provenance, versioning, validation and regression tests.

### DATA / DATABASE
Document identity, source of truth, write authority, versioning, idempotency, concurrency control, audit trail and read-back proof.

### PRODUCT
Document user/job, product rule, system capability, authority constraints, success criteria and failure behavior.

### UX / APP DESIGN
Document source state, user role, permitted actions, information hierarchy, unknown/error/loading states, accessibility and privacy. UI must not create domain authority.

### DEPLOYMENT / INFRASTRUCTURE
Document repository ref/SHA, build, environment, deployment, alias/domain, runtime behavior, dependencies, rollback and verification.

## 7. Automation state standard

A process must expose its state transitions.

Minimum vocabulary:

    RECEIVED
    PROCESSING
    PROPOSED
    AWAITING_REVIEW
    APPROVED
    APPLIED
    VERIFIED
    FAILED
    BLOCKED
    REJECTED
    SUPERSEDED

Every process needs a start state, success state, failure state and verification state.

Critical distinctions:

    PROCESSING SUCCESS ≠ PEDAGOGICAL VALIDITY
    WRITE SUCCESS ≠ PERSISTENCE PROOF
    PERSISTENCE ≠ PROJECTION PROOF
    PROJECTION ≠ USER-FACING PROOF

## 8. AI authority contract

AI may extract, classify, correlate, summarize, propose, draft and generate bounded projections where explicitly authorized.

AI may not silently:
- establish pedagogical truth;
- publish teacher decisions;
- mutate canonical state;
- infer attendance from transcript text;
- infer ambiguous identity;
- overwrite newer versions;
- create educational actions.

Every AI stage must expose:
- input;
- prompt version;
- model;
- output schema;
- authority status;
- provenance;
- forbidden actions;
- validation.

## 9. Human decision contract

Human-controlled transitions should retain:

    decisionId
    reviewerId
    reviewerRole
    decision
    previousState
    nextState
    scope
    reason
    sourceReferences
    createdAt

Rejecting an interpretation must not delete supporting evidence.

Editing an AI proposal must preserve the fact that a proposal existed before editing.

## 10. Longitudinal memory

Historical facts and derived memory are different.

    HISTORICAL EVENT
        ↓
    EVIDENCE
        ↓
    REPEATED / RELEVANT PATTERN
        ↓
    LONGITUDINAL PROPOSAL
        ↓
    TEACHER DECISION
        ↓
    LONGITUDINAL MEMORY

A single occurrence must not automatically become a durable weakness, strength or priority.

Every longitudinal claim must answer:

    Why is this in memory?

The answer must be reconstructable from evidence and decisions.

## 11. Projection contract

Every projection identifies:
- canonical source;
- source version;
- source hash or equivalent reference;
- projection version;
- projection status;
- verification status.

A projection may curate but may not create new authority.

Preferred topology:

    Canonical Learning Record
          ├── Class Report
          ├── Learning Intelligence
          ├── Portfolio
          └── Student Dashboard

Do not silently chain sibling projections as authorities.

## 12. Failure containment

A downstream failure must not invalidate already-authorized upstream truth.

Example:

    Canonical Record = VERIFIED
    Dashboard = FAILED

The canonical record remains valid. Only the dashboard retry is needed.

Never repair a projection failure by mutating canonical truth without evidence.

## 13. Idempotency

Every externally repeatable operation must declare:
- idempotency key;
- uniqueness scope;
- duplicate behavior;
- retry behavior;
- concurrency behavior.

Exact replay must produce NO-OP or the same authorized result. It must not duplicate records, reports, memory events or actions.

## 14. Version and concurrency

Mutable projections and revisable canonical state need an explicit version boundary:

    READ version N
       ↓
    PROPOSE against N
       ↓
    APPROVE against N
       ↓
    APPLY only if current=N
       ↓
    WRITE version N+1

If the base version changed:

    VERSION_CONFLICT
    → stop
    → do not overwrite
    → refresh and review again

## 15. Proof package

Every closed non-trivial task should retain:

    TASK
    EXPECTED
    ACTUAL
    SOURCE
    IMPLEMENTATION
    EXECUTION
    PERSISTENCE
    PROVENANCE
    RUNTIME
    TESTS
    LIMITATIONS
    CONCLUSION

Use explicit classifications:
- PROVEN
- OBSERVED
- IMPLEMENTED
- INFERRED
- UNKNOWN
- BLOCKED

## 16. Change management

Before modifying a canonical artifact:
1. identify current version;
2. read dependencies;
3. identify downstream consumers;
4. identify validators/self-tests;
5. classify the change as additive, corrective, breaking or exploratory;
6. update or create the relevant decision record;
7. implement on a branch;
8. run relevant validators;
9. verify runtime when required;
10. update canonical checkpoints only after evidence exists.

Do not rewrite historical audits to match newer implementation.

## 17. Required operator closeout

Every substantial task must finish with:

    # RESULT
    # WHAT WAS SUPPOSED TO HAPPEN
    # WHAT ACTUALLY HAPPENS
    # CHANGE MADE
    # EVIDENCE
    # WHAT IS PROVEN
    # WHAT IS NOT PROVEN
    # DOWNSTREAM IMPACT
    # NEXT AUTHORIZED ACTION

## 18. Stop conditions

Stop and report BLOCKED when:
- canonical source is unknown;
- identities conflict;
- required authority is absent;
- a higher-version state already exists;
- the requested change contradicts a frozen contract;
- proof cannot distinguish fact from hypothesis;
- a production write lacks established authority;
- a migration crosses a frozen boundary silently;
- secure credential handling is unresolved.

Use:

    UNKNOWN → INVESTIGATE
    CONTRADICTION → AUDIT
    BLOCKED → CONTAIN
    PROVEN → CONTINUE

## 19. PRIME-specific canonical inputs

This governance layer uses, but does not replace:
- docs/PRIME_CANONICAL_CURRENT_STATE.md
- docs/PRIME_CANONICAL_PROJECT_REGISTRY.md
- docs/DO_NOT_REINVESTIGATE.md
- docs/PRIME_PRODUCTION_OPERATIONS_RUNBOOK.md
- docs/architecture/* ADRs and implementation gates
- docs/student-dashboard-system-standard.md
- docs/PRIME_STUDENT_DASHBOARD_V1_LOCKED_CANONICAL_CONTRACT.md
- docs/student-learning-portfolio-template-v1.0.md
- lib/pipeline/contracts.ts
- lib/pipeline/prompts.ts
- project validators and self-tests
- dated audit/proof records when specifically referenced.

Its function is to govern how these artifacts are read and combined.

## 20. Governance completion test

Governance is operational only when a new agent/operator can answer, without reconstructing history from chat:

1. What is the canonical system?
2. What is the current state?
3. What is frozen?
4. What is paused?
5. What can AI do?
6. What requires human authority?
7. Which data is authoritative?
8. Which outputs are projections?
9. What does this task change?
10. How will success be proven?
11. What remains unknown?
12. What is the next authorized action?

If the repository cannot answer these questions, governance is incomplete.

## 21. Final principle

PRIME must never depend on one person's memory of what the system is doing.

    HUMAN INTENT
        ↓
    CANON
        ↓
    AGENT EXECUTION
        ↓
    CODE / CONFIG
        ↓
    RUNTIME
        ↓
    PROOF
        ↓
    UPDATED CANON

That is the PRIME operating loop.


## 22. Source-bound proof rule

No status may be promoted to **PROVEN**, **DONE**, **DEPLOYED**, **VALIDATED**, **RESOLVED** or **COMPLETE** by summary language alone.

The closeout must bind the claim to branch/PR, exact commit, primary evidence location, deployment identity when runtime/production is claimed, test/build evidence when validation is claimed, and explicit non-claims.

Canonical checklist: `docs/governance/SOURCE_BOUND_PROOF_CHECKLIST_v1.md`.
