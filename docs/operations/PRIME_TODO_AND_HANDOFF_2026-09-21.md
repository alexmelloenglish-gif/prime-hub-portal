# PRIME — Canonical TODO & Handoff
**Checkpoint:** 2026-09-25 — reconciled from the 2026-09-21 baseline  
**Status:** ACTIVE OPERATIONAL BACKLOG / ISSUE #58 RECONCILED  
**Purpose:** one place to see what is closed, what remains open, and what requires human/runtime validation.

## How to use this file

- `[x]` = closed at the stated proof boundary. Do not reopen without contradictory evidence.
- `[ ]` = genuinely open.
- `[~]` = implementation/specification exists, but runtime or human validation is still required.
- Do not infer that an open downstream proof invalidates a closed upstream implementation.
- Before promoting any item to DONE / PROVEN / DEPLOYED / VALIDATED / RESOLVED / COMPLETE, use `docs/governance/SOURCE_BOUND_PROOF_CHECKLIST_v1.md`.

---

# L. 2026-09-25 — Cross-agent recovery checkpoint: P0 PR #59

**Status:** ACTIVE VALIDATION TARGET — DO NOT REIMPLEMENT FROM ZERO  
**Operational record:** Issue #58  
**Active implementation:** PR #59 — `P0: shared Learning Machine runner + durable run history`

A later direct repository verification recovered the other executor's published P0 work. This supersedes any earlier interpretation that the shared-runner implementation existed only as unpublished/local work.

## Verified remote state

- active branch: `machine/shared-runner-v1-2026-09-25`
- PR #59: OPEN / DRAFT
- PR head: `2e4dc06192ddd2768e21b396c6497b5d2cfbf7cf`
- PR base: `main@f96e7fcbbbe33844b06d5ba5dbb6b89bf7ff88c1`
- exact-head GitHub workflow `Student Dashboard Contract`: SUCCESS
- same PR-head Vercel Preview: READY
- automation remains frozen for production activation; Preview/CI validation is not production rollout authority.

## Recovered implementation scope

The published PR describes and contains the P0 implementation path for:

- deterministic trigger-independent normalized run identity;
- shared runner entry point for manual and automatic adapters;
- durable `PipelineRun` machine state;
- machine/contract versions, current stage, resume point and final manifest;
- durable trigger/checkpoint/manifest events;
- explicit Teacher Authority stop before protected canonical transitions;
- teacher approval bound to the exact canonical payload hash;
- G2 canonicalization and G3 read-back verification after approval;
- canonical Portfolio and Learning Intelligence projections;
- retry/resume/idempotency contract;
- additive migration `20260925013000_add_shared_learning_machine_runner_state`;
- exact-SHA structural CI gate for the shared runner.

## Mandatory interpretation for every executor

1. **Do not create another shared-runner implementation or competing P0 branch.** Continue by auditing and correcting PR #59.
2. **Do not merge merely because CI and Preview are green.** The exact PR head must satisfy the complete acceptance boundary below.
3. **Do not activate production automation or apply runtime migration merely from this checkpoint.** Migration/runtime rollout requires its own reviewed authority boundary.
4. Preserve all existing canonical constraints: history is non-lossy; candidate != canonical; Teacher Authority precedes protected publication; `student-dashboard-v1.0` remains; learner-facing surfaces contain no governance/technical language; ordinary lesson accumulation cannot promote CEFR; Louise's integrated `student-core-registry` state must remain additive and intact.
5. Closed legacy PRs remain provenance only. Do not resurrect #18/#19/#30/#36/#42/#46.

## Acceptance proof still required before merge

Audit the actual PR #59 diff/tests and prove on the **same exact head SHA**:

```text
manual trigger + automatic trigger
→ same normalized run identity
→ same machine stages
→ interruption resumes at the exact durable stage
→ duplicate/retry is idempotent and does not duplicate canonical writes/projections
→ explicit persisted Teacher Authority blocks unauthorized canonicalization
→ approval is bound to the exact payload/hash
→ G2 canonicalization
→ G3 canonical read-back verification
→ canonical Portfolio + Learning Intelligence projections
→ durable final manifest with versions/hashes/stage outcomes/delivery state
```

Required gates on that same head:

- TypeScript
- Student Dashboard v1.0 self-test
- canonical strict
- G6 authority self-test
- Shared Learning Machine structural/self-test
- Next build
- Vercel Preview READY for the same head

If any corrective commit changes PR #59 head, all merge-critical exact-SHA proof must be re-evaluated against the new head. **No merge/release of a SHA different from the SHA actually tested.**

## Immediate next executor action

> Open PR #59, audit its changed files and tests against this acceptance boundary, identify any concrete missing proof or defect, correct only those gaps on the existing P0 branch, rerun the exact-SHA gates, and record the resulting evidence in Issue #58 and this canonical handoff. Do not ask Alexandre to relay state between agents.

---

# A. Closed in the 15–21 Sep closeout

- [x] Current production/governance/landing/reconnection closeout remains as previously recorded. Do not reopen closed proof boundaries without contradictory evidence.
- [x] Gustavo five-lesson reference replay remains completed.
- [x] Legacy repository-side automation remains contained; do not revive it as a shortcut.

---

# B. P0 — Learning Machine

- [~] **Shared PRIME Learning Machine runner + durable run history — PR #59 recovered and under validation**
  - implementation is published remotely and must not be rebuilt from zero;
  - merge remains blocked until the Section L acceptance proof is complete on one exact head SHA.

- [ ] **Implement ObservationDebt reconciliation in code + self-test**
  - remains the next P0 only after PR #59 is safely resolved;
  - normative contract is frozen; current-main durable implementation proof remains required.

- [ ] **CEFR authority regression coverage**
  - ordinary lesson/replay cannot mutate current or target CEFR;
  - formal assessment authority is required for an authorized CEFR profile transition.

- [ ] **Broad self-correction semantics regression coverage**
  - preserve multiple learner-initiated repair types and longitudinal evidence.

---

# C. P0/P1 — vNext / Portfolio / Awareness

- [ ] Audit current `main` for concrete gaps formerly carried by PR #42. PR #42 stays closed/no-merge; preserve `Portfolio = Lesson Archive + Cumulative Learning Memory`, projection/communication separation and Teacher Authority.

---

# D. P1 — Runtime authority proofs

- [~] G6 authenticated runtime witness / controlled cutover remains human/runtime validation work from current main; do not resurrect PR #36.
- [~] Authoritative attendance full production trace remains unproven until a real Meet → AttendanceRecord → downstream consumer trace exists.

---

# E. P1 — Candidate / capture / non-lossy semantics

- [ ] Audit current main against the durable invariants formerly carried by #18/#19/#30. Preserve candidate != canonical, explicit teacher authority, source provenance/uncertainty, idempotency, non-lossy pedagogical history and rich source-grounded extraction. Port only genuinely missing behavior.

---

# F. Reconnection Network

- [x] Phase 1 public landing page.
- [x] Phase 2 Professional Story Architecture.
- [~] Phase 3 LinkedIn Reconstruction requires exact employment metadata and owner approval before publication.
- [~] Phase 4 contact map requires current-role/channel verification before outreach.
- [ ] Phases 5–7 remain individualized outreach, response/alignment log and bounded collaboration pilots.

---

# G. Repository cleanup / provenance

- [x] Issue #58 records legacy conflicting PR cleanup.
- [x] PR #55 superseded/do not merge.
- [x] PRs #1/#18/#19/#30/#36/#42/#46 closed without merge; provenance only.
- [ ] Every executor must update this canonical handoff when its proof boundary materially changes instead of making Alexandre relay cross-agent state.

---

# H. Current blockers / proof boundaries

| Item | Current state |
|---|---|
| PR #59 shared runner | IMPLEMENTED REMOTELY / VALIDATION INCOMPLETE — audit exact diff/tests before merge |
| Durable run history | IMPLEMENTED IN PR #59 / acceptance proof incomplete |
| ObservationDebt | OPEN after PR #59 |
| vNext / Portfolio / Awareness | OPEN gap audit |
| Candidate/capture/non-lossy | OPEN gap audit |
| G6 | WAITING runtime/human witness + controlled cutover authority |
| Attendance | WAITING real production trace |
| Repository protection | administrative enforcement not independently proven; exact-SHA discipline mandatory |

---

# I. Current next-action order — updated 2026-09-25

1. **Validate/correct PR #59 on its existing branch; do not reimplement P0.**
2. Prove all merge-critical gates on one exact PR-head SHA and review migration/runtime boundary.
3. Only then merge if the evidence is complete; post-merge main requires its own exact-SHA validation before release/runtime activation.
4. Implement/audit durable ObservationDebt.
5. Audit vNext / Portfolio / Awareness gaps.
6. Audit candidate/capture/non-lossy gaps.
7. Complete G6 runtime proof / controlled cutover.
8. Complete attendance production witness.
9. Continue Reconnection phases independently.

---

# J. Handoff sentence

> Read Section L first. PR #59 is the recovered active P0 implementation. Continue validation/correction there; do not restart the shared runner, do not resurrect legacy PRs, do not merge/release an untested SHA, and record every material cross-agent delta in Issue #58 plus this handoff so Alexandre is never the synchronization mechanism.


---

# M. 2026-09-25 — Agent Coordination Bus Phase 1

**Status:** ACTIVE NON-BLOCKING INFRASTRUCTURE SPRINT  
**Coordination authority:** Issue #58  
**Branch:** `infra/agent-coordination-bus-phase1-2026-09-25`

This sprint was accepted with changes in Issue #58. It is deliberately outside the PR #59 and learner-visible delivery critical paths.

## Scope

- GitHub remains the sole evidence/governance source.
- Neon stores only routing, deduplication and acknowledgement envelopes.
- Pipedream is the planned GitHub event delivery layer.
- Slack/email, if added, are human observability only.
- Phase 1 event types are limited to candidate/validation/correction routing.
- The bus cannot grant Teacher Authority, merge authority, release authority, runtime migration authority or canonical learner state.

## Phase 1 implementation target

```text
GitHub event
→ Pipedream
→ secured coordination API
→ Neon agent_coordination_events
→ target-role notification
→ executor reads GitHub evidence
→ ACK/result reflected in GitHub
→ bus records ACK/result envelope
```

## Proof boundary

Before this sprint can be called implemented:

- additive Prisma migration exists;
- idempotency key is deterministic and database-unique;
- webhook redelivery collapses to one ledger event;
- ACK transitions are terminal/idempotent;
- API is secret-protected;
- payload is routing metadata only;
- synthetic coordination self-test passes;
- Prisma validation and TypeScript pass on the exact candidate SHA;
- same-head Preview is READY;
- real Pipedream/GitHub delivery remains a separate runtime witness until configured and exercised.

> This sprint must not delay PR #59 or the learner-visible canonical dashboard bridge.
