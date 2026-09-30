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

## 2026-09-26 — Finalization queue after integrated proof

This section supersedes older pre-integration wording for the current finalization sequence.

### Core technical state now proven
- [x] PR #65 integrated candidate `1f704ab97ac858fbad54a01126f12293e6f39358` is the current pre-Production proof target.
- [x] Same-SHA Student Dashboard Contract, Agent Coordination Bus, Golden Runtime Witness and Coordination Runtime Witness all PASS.
- [x] Same-SHA Vercel Preview/deployment status is SUCCESS.
- [x] Disposable-Postgres rehearsal successfully applies the integrated post-baseline migrations in order and returns clean migration status.
- [x] PR #66 and #67 isolated witness lanes are superseded by the integrated #65 witnesses and preserved only as provenance.

### Required to finish the core platform
- [ ] Merge the validated #65 integration candidate into `main` with exact merge SHA recorded.
- [ ] Apply the three validated additive migrations to Production in recorded order with pre/post read-back.
- [ ] Deploy the merged exact `main` SHA to Vercel Production and verify runtime health on the official domain.
- [ ] Configure the real Production coordination wake/auth target while keeping automatic Learning Machine ingestion frozen for preflight.
- [ ] Execute one controlled Production activation witness through Teacher Authority and verify durable run, canonical record, G3/G4/G5 projections, dashboard read-back, coordination ACK and no duplicate protected write.
- [ ] Only after that witness passes, enable the intended automatic trigger path and immediately verify idempotency/freeze rollback behavior.
- [ ] Close component PRs #59/#60/#61/#63/#64 as superseded after the integrated merge is safely established.

### Product-completion work outside the core activation path
- [ ] Integrate PR #62 family-portfolio presentation layer after rebasing/revalidating it on the new main.
- [ ] Synchronize/read back the external learner/family Google Docs where still required.
- [ ] Complete real authenticated G6 sign-in witnesses for the named learner/guardian accounts.
- [ ] Complete the authoritative attendance Production trace.
- [ ] Resolve only genuinely missing ObservationDebt, vNext/Portfolio/Awareness and candidate/capture semantics after current-main gap audit.
- [ ] Verify/disable any legacy external Google/Studio trigger only if still operationally relevant.
- [ ] Add repository branch protection / required checks so exact-SHA discipline is enforced administratively.

### Scope note
Reconnection/LinkedIn phases remain business-development work, not a blocker for declaring the learning platform technically complete.

---

## 2026-09-26 — Post-Production / Portfolio consolidation handoff

This section supersedes the remaining stale pre-integration queue text above.

### Executed state
- [x] PR #65 integrated core was merged into `main`; Production release completed and official-domain read-back passed.
- [x] PR #62 was reconciled onto the post-#65 `main`, its Portfolio workflow was corrected to enforce exact-head checkout/SHA verification, and exact head `a220e395a421f740a7b9c02aef78467db1327b8e` passed:
  - Student Family Portfolio Supervision;
  - Student Dashboard Contract;
  - Golden Runtime Witness;
  - Coordination Runtime Witness;
  - Vercel Preview READY.
- [x] PR #62 merged as `e6ddd7b10d7702720b2d5dbd5b629a5d6ac1bd12`.
- [x] Post-merge `main@e6ddd7b10d7702720b2d5dbd5b629a5d6ac1bd12` passed Student Family Portfolio Supervision and Student Dashboard Contract; Vercel Production deployment `dpl_DZrmAwNicKxwquJ5cwbkeDjc9gDh` is READY on the official aliases.
- [x] Component lanes #59/#60/#61/#64 are closed as superseded provenance.
- [x] PR #63 is closed/merged provenance because its head became reachable through the integrated merge path; do not describe it as an unmerged closure.
- [x] GitHub currently reports no open pull requests.

### Remaining activation blocker
- [ ] Production DB migration/read-back remains blocked only by Neon connector authorization failure before database access.
- [ ] No Production coordination wake/auth target or automatic Learning Machine trigger may be claimed active until the DB pre-read/migrations/post-read and controlled activation witness are completed.
- [ ] Teacher Authority remains human and candidate-specific.

### Next safe work
1. On each autonomous run, read Issue #58 and this handoff before deriving work.
2. Retry read-only Neon Production preflight; if authorization is restored, execute the already-recorded migration → read-back → controlled wake → Teacher Authority witness → idempotency/ACK sequence.
3. While Neon access remains externally blocked, continue non-conflicting product-completion audits/read-backs from current `main`, including external Portfolio publication witness only when its document-write boundary is explicitly authorized.
4. Do not reopen superseded component PRs without a concrete regression.



---

## 2026-09-27 — Cross-agent execution discipline / handoff contract

This section records the operating standard required for all executors working on PRIME.

### Required executor loop
1. **Evidence first** — reconcile current GitHub/runtime evidence before explaining state.
2. **Own the assigned lane** — do not wait for Alexandre to relay state between agents.
3. **Act before reporting** when the next step is safe and already authorized.
4. **Follow blockers through correction and rerun**; a failed test is an input to execution, not a stopping condition.
5. **Close the loop** with exact SHA / workflow / persisted runtime evidence.
6. **Persist the handoff** in Issue #58 and this canonical handoff whenever the proof boundary materially changes.
7. **Escalate only genuine human boundaries**: irreversible Production activation, explicit Teacher Authority, release/merge authority where separately required, or an external blocker that cannot be resolved safely by the executor.

### Attribution discipline
- Never attribute a decision, prohibition, delay, interruption, or instruction to Alexandre unless it is traceable to an actual message or authoritative record.
- Separate **observed fact**, **repository/runtime proof**, and **inference**.
- Do not convert a previous summary, compressed context, or stale handoff sentence into a user-authored instruction without verifying its source.
- If authorship of a GitHub comment cannot be distinguished between agent instances because they share the same GitHub account, say so explicitly.

### Meaning of “proceed”
When Alexandre says **proceed / continue**, treat that as an execution command for the owned safe lane, not as permission to describe future execution. Continue tool-backed work in that execution until:
- the owned acceptance boundary passes, or
- a genuine external/human decision boundary is reached.

### Reporting standard
Prefer:
`PASS @ exact SHA / workflow run / persisted record`
or
`BLOCKED at exact stage → correction applied / narrow external blocker identified`

Avoid:
`I am continuing`, `I will keep working`, or other intention-only status language when no tool-backed execution remains in the current turn.

### Current cross-agent synchronization rule
Issue #58 remains the durable coordination record. This handoff remains the canonical queue/state summary. Alexandre must not be used as the synchronization mechanism between executors.

---

## 2026-09-29 — Production DB activation boundary crossed

### Completed
- [x] Neon Production read-only authorization restored for project `holy-block-04720208`, branch `br-cold-cloud-anwml3lu`.
- [x] Applied and recorded the three validated additive migrations:
  - `20260925013000_add_shared_learning_machine_runner_state`
  - `20260925162500_add_agent_coordination_bus_phase1`
  - `20260925213000_add_agent_coordination_bus_phase2_active`
- [x] Post-read confirms final shared-runner columns on `pipeline_runs` and Phase 2 claim/lease/dispatch columns on `agent_coordination_events`.
- [x] Existing 24 PipelineRun rows preserved.
- [x] Vercel Production remains READY on `main@d68203b58aaac5b89ac98a04968308f1f75b02cb`.
- [x] No new Vercel runtime errors observed in the immediate post-migration window.

### Remaining protected/runtime boundary
- [ ] Configure a real Production coordination wake target and auth secrets.
- [ ] Execute one real candidate-specific Teacher Authority Production witness with durable run/canonical/projection/dashboard/coordination ACK read-back.
- [ ] Only after that witness passes, remove the hard `PIPELINE_AUTOMATION_FROZEN` guard and enable the intended automatic transcript trigger.
- [ ] Immediately verify idempotency and rollback/freeze after first automatic run.

### Current blocker
No real Production wake target URL is preserved in the repository, and the currently connected Vercel surface does not expose environment-variable writes. No authenticated Vercel CLI/token is available in this executor runtime. This is now the only infrastructure blocker before the controlled Production witness; Teacher Authority itself remains human and candidate-specific.

---

## 2026-09-29 — Standing cross-agent handoff write-back rule

### Alexandre's standing instruction
Every executor must treat this file plus Issue #58 as the shared execution state.

Before execution:
1. read Issue #58;
2. read this canonical handoff;
3. reconcile both against current repository/runtime evidence.

After every material execution delta, update BOTH:
- Issue #58; and
- this canonical handoff.

Do not leave material execution state only in chat, a PR comment, or Issue #58.

A material delta includes migrations, runtime witnesses, blockers, exact SHA/deployment changes, automation state, wake/auth configuration, Teacher Authority boundaries, superseded lanes, freeze/rollback state, and any change to the next execution queue.

### Required handoff payload
Record:
- exact current state;
- what was actually executed;
- exact SHA / deployment / DB target / workflow evidence;
- what is now proven;
- what remains open;
- exact next action;
- explicit human/Teacher Authority boundary if present.

### Current inherited state
- current `main`: `65c8c5a939e7f325676575b22904780281ef67b6`;
- Vercel Production `dpl_2yxNvDXSzA1TqC4jUYKSKPbQWiLk`: READY on that exact SHA;
- Neon Production migration gate: PASS;
- the three validated migrations are applied and durably recorded;
- post-read confirms final shared-runner + coordination Phase 2 schema;
- 24 historical PipelineRun rows preserved;
- no immediate post-migration Vercel runtime errors observed;
- no real Production wake target configured yet;
- `PIPELINE_AUTOMATION_FROZEN = true`;
- automatic Learning Machine ingestion remains OFF;
- no candidate-specific Teacher Authority has been consumed.

### Current execution queue
1. obtain/provision a real Production wake target/runtime;
2. obtain a writable Vercel env/config channel;
3. configure `PRIME_AGENT_BUS_SECRET`, `PRIME_AGENT_WAKE_URLS_JSON`, `PRIME_AGENT_WAKE_SECRET`;
4. keep automatic ingest frozen and run one controlled Production coordination witness;
5. prepare the Gustavo candidate/evidence packet;
6. stop at the candidate-specific Teacher Authority decision for Alexandre's explicit approve/edit/reject;
7. after genuine Teacher Authority, prove durable run, bound approval, canonical record, G3/G4/G5 projections, dashboard/Next Action, coordination ACK and idempotent retry;
8. only after the complete witness passes, remove the hard ingest freeze and verify the first automatic run plus rollback/freeze behavior.

### Execution discipline
Acknowledge instructions, then execute. Do not treat acknowledgement, planning, or "proceeding" language as completion.

Required loop:

`act → prove → persist in #58 + canonical handoff → continue until a genuine stop boundary`



---

## 2026-09-29 — Production coordination wake receiver remediation lane

### Reconciled baseline before mutation
- current `main` at lane creation: `6fb8714ff4c21a70847dc07ecc18dac5095c3ce6`;
- Vercel Production deployment `dpl_82Y56G7nTKAdgwVM8JLcnxpfNatn`: READY on that exact SHA;
- Production DB migration gate remains recorded PASS from the prior persisted Production read-back;
- a fresh Neon read-back in this executor is currently unavailable because the Neon connector returns authorization error `HTTP 404: The request could not be authorized due to an internal error`;
- `PIPELINE_AUTOMATION_FROZEN = true`;
- automatic Learning Machine ingestion remains OFF;
- no candidate-specific Teacher Authority has been consumed.

### Executed in the owned blocker-remediation lane
A new lane was created from exact current main:

- branch: `infra/production-coordination-wake-receiver-2026-09-29`;
- PR: #69 — `Infra: guarded Production coordination wake witness`.

The lane adds a narrowly scoped Production-capable receiver:

`POST /api/coordination/wake`

The receiver:
- remains inert unless `PRIME_AGENT_WAKE_SECRET` is configured;
- validates the wake secret with timing-safe equality;
- reads the exact persisted coordination event before any ACK;
- accepts only target role `validator`, event `VALIDATION_REQUESTED`, repository `alexmelloenglish-gif/prime-hub-portal`, Issue #58 evidence, workstream prefix `production-activation:wake-witness:`, and marker `production-coordination-witness-v1`;
- requires the event SHA and `expectedSha` to equal the executing Vercel `VERCEL_GIT_COMMIT_SHA`;
- writes only the ACK for that same durable coordination event;
- does not authorize Teacher Authority, learner/canonical mutation, pipeline ingest, merge/release, or automatic trigger activation.

The Phase 2 self-test was extended to cover the receiver guardrails and reject mismatched SHA / invalid witness marker / deployment-SHA mismatch.

### Intended Production target after exact-head validation
```json
{"validator":"https://www.primedigitalhub.com.br/api/coordination/wake"}
```

### Remaining runtime boundary
The currently connected Vercel tool surface exposes project/deployment/log reads and deploy operations but no environment-variable write primitive. This executor runtime also has no authenticated Vercel CLI/token. Therefore the following values are **not yet configured by this lane**:

- `PRIME_AGENT_BUS_SECRET`;
- `PRIME_AGENT_WAKE_URLS_JSON`;
- `PRIME_AGENT_WAKE_SECRET`.

No secret may be committed to Git as a workaround.

### Exact next action
1. validate PR #69 on one final exact head SHA with the relevant GitHub gates + same-SHA Vercel Preview;
2. if the lane is released to Production, prove the receiver is present but inert before secrets are configured;
3. obtain a writable Vercel environment configuration path and set only the three coordination values above;
4. keep automatic ingest frozen;
5. execute one controlled Production coordination event → dispatch → guarded receiver → ACK/read-back witness;
6. prepare Gustavo's candidate/evidence packet;
7. stop at the candidate-specific Teacher Authority decision for Alexandre's explicit approve/edit/reject.

Teacher Authority remains a separate human boundary and is not implied by this infrastructure work.


### Release/read-back update — PR #69
- PR #69 exact code-bearing head `49a8a279a5bcb280dafaff099a7d1f5bb17539e2` passed all four relevant pull-request gates:
  - Student Dashboard Contract — SUCCESS (run `36659193849`);
  - Golden Runtime Witness — SUCCESS (run `36659193775`);
  - Coordination Runtime Witness — SUCCESS (run `36659193800`);
  - Agent Coordination Bus — SUCCESS (run `36659193776`), including exact-SHA checkout, Phase 1 self-test, Phase 2 active self-test with the new Production witness guards, Prisma validation and TypeScript.
- final PR head `f4ddc6e8a9292269577f947941f7ca1b89d98018` differs only by this canonical handoff write-back and produced Vercel Preview `dpl_4H4asg5axL7Y6wFPJdqoFaDKyWsS`: READY.
- PR #69 merged successfully.
- merge SHA: `71e11428e7cbb5110fc5fc8d6af973eb9136596c`.
- Vercel Production deployment `dpl_3Qjme9s63ArNmXBQoKtBAKLJPYzK` for exact merge SHA `71e11428e7cbb5110fc5fc8d6af973eb9136596c`: READY and assigned to the official domains.
- `PIPELINE_AUTOMATION_FROZEN = true` remains unchanged.
- no coordination secret was committed or configured through Git.
- no Teacher Authority or learner canonical mutation occurred.
- subsequent documentation-only main `f00bd461eaad39321d2b387ff029e5c994dd27c3` deployed as `dpl_8z4ZjUHiRVdHNwdrEukmU87E2KFm`: READY on the official domains.
- Production route read-back: GET `https://www.primedigitalhub.com.br/api/coordination/wake` returned HTTP 405 with `x-matched-path: /api/coordination/wake`, proving the POST-only receiver is present on Production.

### Remaining blocker after receiver implementation
The repository/runtime wake-target **implementation gap is closed**: a guarded receiver now exists in `main`. The remaining gap is configuration authority/capability, not code.

The connected Vercel surface available to this executor still exposes no environment-variable write action, and this executor has no authenticated Vercel CLI/token. Therefore the three Production coordination values remain unconfigured from this runtime:
- `PRIME_AGENT_BUS_SECRET`;
- `PRIME_AGENT_WAKE_URLS_JSON={"validator":"https://www.primedigitalhub.com.br/api/coordination/wake"}`;
- `PRIME_AGENT_WAKE_SECRET`.

Do not bypass this by committing secrets or weakening the receiver. Once a writable Vercel configuration path is available, configure only those values, keep automatic ingest frozen, and execute the controlled event → dispatch → wake → ACK/read-back witness before advancing to Gustavo's candidate/Teacher Authority boundary.
