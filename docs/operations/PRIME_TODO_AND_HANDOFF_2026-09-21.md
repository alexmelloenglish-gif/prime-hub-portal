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

---

## 2026-09-29 — Gemini transcript-tab source-integrity gate

### Defect found
Modern Gemini Meet Google Docs contain notes and transcript in separate tabs. The production Drive reconciler was concatenating every tab body, which could mix `Quick notes` / `Full notes` / `Observações` into transcript evidence.

### Correct invariant
For tabbed Gemini Meet Docs, lesson source evidence must come exclusively from exactly one tab titled `Transcript` or `Transcrição`.

### Remediation in progress
Draft PR #70, current head `fca1ec5a2ded223b7e958e240a87b4c3abd858c9`, implements:
- transcript-tab-only extraction;
- quarantine when the transcript tab is missing or ambiguous;
- persisted `sourceExtractionMode`, `sourceTabId`, `sourceTabTitle`, `notesExcludedFromEvidence`;
- backend rejection of Drive reconciliation v2 payloads that do not prove transcript-tab provenance;
- a build-gated regression self-test using the observed English and Portuguese Gemini tab structures.

### New lessons held clean
- Louise — 2026-09-28 — transcript tab `t.5o5y0svtjbdt` — 47,222 chars — 00:57:13.
- Gustavo — 2026-09-29 — transcript tab `t.ororffpf4ito` — 30,985 chars — 00:56:26.

Neither new lesson had entered PRIME/Neon at the time of this audit.

### Historical follow-up
10 transcript rows currently exist in Production; 3 contain obvious Gemini notes markers and require provenance/backfill review (Laura, Rafael, historical Gustavo).

### Gate
Do not use the automatic Drive reconciler for the two new lessons until PR #70 exact head is validated and deployed. If a controlled manual ingestion is used earlier, only the verified transcript-tab text may be submitted, with explicit source-tab provenance.

## 2026-09-30 — Production coordination configuration write-back

### Material delta completed
- `main` was reconciled at `4946b1b0668e7d0aee8a06bd9c56447988a87cc9` before this delta.
- Vercel project `prime-hub-portal` / team `prime-digital-hun-dasboard` was verified.
- The following variables are configured in **Production only**:
  - `PRIME_AGENT_BUS_SECRET` — sensitive secret configured; value intentionally omitted.
  - `PRIME_AGENT_WAKE_URLS_JSON` — exact validator URL mapping configured.
  - `PRIME_AGENT_WAKE_SECRET` — separate sensitive secret configured; value intentionally omitted.
- Secret values were not committed to Git and are not recorded in Issue #58 or this handoff.
- Redeploy `dpl_6qEjCdL9zJSxQiTVJcVr5iFzVU5t` was created from exact SHA `4946b1b0668e7d0aee8a06bd9c56447988a87cc9`; it was `BUILDING` at this write-back boundary.
- Pre-witness runtime error read: no runtime errors in the preceding 30-minute window.
- `PIPELINE_AUTOMATION_FROZEN = true` remains unchanged; automatic ingest remains OFF; no Teacher Authority or learner mutation occurred.

### Next action and human boundary
- Commit and deploy this exact handoff write-back SHA.
- After the new deployment is `READY`, execute exactly one harmless Production coordination witness through event creation → durable ledger → claim/lease → dispatcher → real wake receiver → ACK → Neon read-back.
- Then prepare Gustavo's evidence packet and stop for Alexandre's explicit candidate-specific `APPROVE / EDIT / REJECT` Teacher Authority decision.

---
## 2026-09-30 — Controlled Production coordination witness PASS

### Exact execution and durable proof
- Witness deployment: `dpl_5Nb6ijMTFjdAHwMt7sV35oYiCxmx`.
- Witness SHA: `aa6b9502bf5186991c9197cad5fb5e380e0dbb10`.
- Production coordination event: `fea6fa70-4c90-45b0-8eeb-c71526489fbd`.
- Creation returned `duplicate=false`, then dispatcher claimed the event and returned `status=dispatched` with one dispatch attempt.
- Neon Production read-back target: project `holy-block-04720208`, branch `br-cold-cloud-anwml3lu`, database `neondb`.
- Durable read-back proves `ackStatus=ACKNOWLEDGED`, `acknowledgedBy=production-witness-validator`, `acknowledgedAt` populated, cleared claim/lease fields, `dispatchAttempts=1`, `lastDispatchError=NULL`, exact event SHA equal to the witness deployment SHA, and exactly one idempotency identity with zero pending duplicates.
- Witness payload contained only `witnessKind=production-coordination-witness-v1` and matching `expectedSha`; no learner or pedagogical payload was sent.
- Neon confirms `pipeline_runs=24` and `pipeline_runs_since_witness=0`.
- Post-witness Vercel runtime error aggregation: no errors in the selected window.
- Official receiver route remains POST-only and present (`HTTP 405`, `x-matched-path: /api/coordination/wake`).

### Freeze and next boundary
- `PIPELINE_AUTOMATION_FROZEN = true` remains active.
- Automatic Learning Machine/Drive ingestion remains OFF.
- No Teacher Authority, learner mutation, canonicalization, or learner-facing publication occurred.
- New source-integrity gate: reconcile PR #70 (`Fix Drive reconciliation to ingest transcript tab only`) before any automatic ingestion of Gustavo's 2026-09-29 Gemini lesson. If a manual candidate path is used before PR #70 Production release, use only the verified `Transcrição` tab and preserve explicit source-tab provenance; never use `Observações` as pedagogical evidence.
- After legitimate evidence reconciliation, prepare Gustavo's candidate packet and stop at Alexandre's explicit candidate-specific `APPROVE / EDIT / REJECT` decision.

---
## 2026-09-30 — Formal closure: Production coordination witness COMPLETE

**Status: PASS / CLOSED.** This section supersedes earlier in-progress configuration notes for the witness lane.

- Exact event: `fea6fa70-4c90-45b0-8eeb-c71526489fbd`.
- Durable state: `ACKNOWLEDGED`.
- `acknowledgedBy=production-witness-validator`.
- `acknowledgedAt=2026-09-30T02:43:21.780Z`.
- Claim and lease cleared: `claimedBy=NULL`, `claimedAt=NULL`, `leaseExpiresAt=NULL`.
- `dispatchAttempts=1`; `lastDispatchError=NULL`.
- Idempotency read-back: exactly one durable identity and zero pending duplicates.
- Exact witness deployment: `dpl_5Nb6ijMTFjdAHwMt7sV35oYiCxmx`, `READY`.
- Exact witness SHA: `aa6b9502bf5186991c9197cad5fb5e380e0dbb10`.
- Post-witness Vercel runtime error scan: no errors in the selected window.
- Neon read-back: `pipeline_runs=24`, `pipeline_runs_since_witness=0`.
- Witness payload contained no learner data and caused no learner PipelineRun, canonical learner mutation, Teacher Authority record, or learner-facing publication.
- `PIPELINE_AUTOMATION_FROZEN = true` remains active; automatic ingest remains OFF.

### Protected next boundary
- Reconcile PR #70 transcript-only source integrity before any automatic Drive ingestion of Gustavo's 2026-09-29 lesson.
- Use only the verified `Transcrição` tab with explicit source-tab provenance for any interim manual evidence.
- Never use `Observações`, `Quick notes`, or `Full notes` as pedagogical transcript evidence.
- After legitimate evidence reconciliation, prepare the candidate packet and stop at Alexandre's candidate-specific `APPROVE / EDIT / REJECT` decision.


---

## 2026-09-30 — PR #70 transcript-only source-integrity gate RELEASED / PRODUCTION PASS

### Exact release proof
- PR #70 validated head `fca1ec5a2ded223b7e958e240a87b4c3abd858c9`.
- Exact-head PR gates PASS:
  - Student Dashboard Contract `36660486619`;
  - Golden Runtime Witness `36660486636`;
  - Coordination Runtime Witness `36660486641`.
- Same-head Vercel Preview `dpl_BBf9TNmSPZcocqi2UqNrxi2jhQp2`: READY.
- PR #70 marked ready and merged with expected-head protection.
- Merge SHA: `a995ad3cf92beedd08f21864edc1dee36aacdf12`.
- Post-merge push Student Dashboard Contract `36661711154`: SUCCESS on exact merge SHA.
- Vercel Production `dpl_9GLC3aZMXx73Np72xK8fYdGaZ6nS`: READY on exact merge SHA with official domains.
- Post-release Vercel runtime-error scan: no errors in the selected window.

### Gustavo 2026-09-29 transcript-only proof
Google Doc `1F3Oe87eEUgTLOO9d7MupI_C5mU-5U-ESUr_gQYC0Gks` was read through the tab-aware Docs API.
Observed tabs:
- `Observações` — `t.piyr7rigwkbd`;
- `Transcrição` — `t.ororffpf4ito`.

Only `Transcrição` was selected for pedagogical evidence. The selected transcript body contained 31,090 characters and ended at 00:56:26. `Observações` was excluded from evidence.

### Safety / next boundary
- `PIPELINE_AUTOMATION_FROZEN = true` remains active.
- automatic ingest remains OFF.
- no Teacher Authority was consumed by this release.
- no Gustavo canonical learner-state mutation occurred.
- next action: reconcile the existing Gustavo canonical state/evidence against the transcript-only 2026-09-29 source, prepare the candidate/evidence packet, then stop for Alexandre's explicit candidate-specific `APPROVE / EDIT / REJECT` Teacher Authority decision.


---

## 2026-09-30 — Gustavo 2026-09-29 candidate/evidence packet — TEACHER AUTHORITY REQUIRED

**Authority status:** CANDIDATE / NOT CANONICAL.

**Candidate payload SHA-256:** `e0b4aaf9e2931de1ae4a2d298d287dfdb8454de7a2f65279b3d55b1073adbbec`

### Identity / source
- learner: Gustavo Drummond De Andrade Salgado;
- existing `studentId`: `stu_4c4da6c04ac4`; do not create a new learner;
- lesson date: 2026-09-29;
- attendance candidate: attended;
- Google Meet Doc: `1F3Oe87eEUgTLOO9d7MupI_C5mU-5U-ESUr_gQYC0Gks`;
- evidence tab only: `Transcrição` / `t.ororffpf4ito`;
- extraction: `google_docs_transcript_tab_v1`;
- `notesExcludedFromEvidence=true`;
- transcript read-back: 31,090 characters; 00:56:26;
- `Observações` / `t.piyr7rigwkbd` excluded from pedagogical evidence.

### Previous canonical baseline used
Canonical Portfolio v1.1 is updated through five attended lessons (18 Aug–15 Sep 2026) and records:
- CEFR A1 — progressing toward A2;
- target A2;
- current priorities: present/past short answers, Simple Past foundations, complete answers, vocabulary retrieval and functional school/personal English;
- independence must be distinguished as Independent → One clue → Model.

A fresh Neon read-back was attempted for this candidate-preparation step but the connected Neon surface returned its intermittent internal authorization error (HTTP 404). This is recorded as a connector-read limitation only; no database mutation was attempted. The candidate therefore uses the versioned student registry + canonical Portfolio + verified transcript-only source.

### Proposed current-state update
> Simple Past retrieval is becoming more productive across affirmative forms, short answers and question formation. Gustavo can repair several present/past errors after a cue and retrieve forms such as `went`, `ate` and `had`, while `did/didn't + base verb` remains inconsistent (`I didn't went` still appeared). Complete personal answers and short retelling are emerging, but independence varies by task. Maintain CEFR A1 — progressing toward A2; target A2.

### Evidence supporting the candidate
- affirmative past retrieval: `I ate ...`, `Yesterday I went to school`, `He ate barbecue and ice cream`;
- past questions: `Did you go to the mall?`; repair `Do you watch TV yesterday?` → `Did you watch TV yesterday?`;
- short answer: `Yes, I did` appears productively;
- active instability remains: `I didn't went to school` appeared;
- responsive repairs after cue include:
  - `Yesterday I go to school` → `Yesterday I went to school`;
  - `Do you watch TV yesterday?` → `Did you watch TV yesterday?`;
  - `I go at home at five` → `I went home at five`;
- therefore broad independent self-correction is **not** promoted; the supported claim is responsive repair after a cue;
- irregular retrieval is mixed; `went`, `ate`, `had`, `saw` were accessible with varying support.

### Candidate cumulative updates
Grammar:
- present/past short answers — maintain + consolidate;
- Simple Past affirmative — strengthening;
- `did/didn't + base verb` — active priority, not mastered;
- Did + subject + base verb questions — emerging with repair;
- self-correction — responsive repair after cue only;
- should / reflexives / superlatives — practised with support; no mastery claim.

Vocabulary / school support:
- provisional sea-life set observed for the upcoming school-English assessment: `fish`, `whale`, `shark`, `starfish`, `octopus`, `squid`;
- reinforced past forms: `went`, `ate`, `had`, `saw`;
- learner read an upcoming-assessment scope including `sea life`, `must`, `can't`, `don't`, and answering questions about text;
- the actual assessment material was not captured, so do not over-specify or promote this scope beyond provisional school support.

### Proposed next priorities
1. Mix Do/Did questions unpredictably and record Independent → One clue → Model.
2. Consolidate `did/didn't + base verb` across affirmative/negative/question contrasts.
3. Retrieve frequent irregulars without immediate model: go/went, eat/ate, see/saw, have/had, drink/drank, ride/rode, buy/bought, swim/swam.
4. Produce 4–6 complete personal past sentences and one short retell.
5. Review the upcoming school-English assessment only after the actual material is received.

### Protected stop boundary
No canonicalization, Portfolio mutation, learner-facing publication, CEFR change, or automatic-ingest unfreeze is authorized by this candidate.

Alexandre must decide on this exact candidate:
- **APPROVE** — authorize this exact candidate payload/hash;
- **EDIT** — specify changes; a new candidate/hash must be generated;
- **REJECT** — preserve the source evidence without promoting this candidate to canonical state.

`PIPELINE_AUTOMATION_FROZEN = true` remains active until the later protected activation sequence is explicitly satisfied.


---

## 2026-09-30 — Student login + public Portal entry remediation — PR #72

### Diagnosis
Gustavo's learner/account authorization is present and the repository dashboard resolver explicitly maps `gugasalgado7@gmail.com` to existing learner `stu_4c4da6c04ac4`. The blocking risk is upstream of learner resolution: ordinary Google portal sign-in was requesting `https://www.googleapis.com/auth/meetings.space.readonly` from every user.

That Meet permission belongs to the operational organizer attendance integration, not learner identity authentication. `lib/meet-attendance-collector.ts` already resolves its credential independently via `GOOGLE_MEET_ACCESS_TOKEN` or the configured organizer Google Account.

Production runtime inspection showed live NextAuth endpoints with no server-side 5xx in the inspected window (`/api/auth/providers 200`, `/api/auth/signin/google 200`, Google callback 302 observed). A successful end-to-end Gustavo witness was never previously proven; the 2026-09-21 provisioning record explicitly left interactive sign-in/dashboard rendering open.

### Narrow remediation
Draft PR #72, head `fb9add5edecda57683ee37cd713e45dddda46ec6`:
- end-user Google sign-in now requests identity scopes only: `openid email profile`;
- removes learner-facing Meet scope and offline-token request;
- leaves Meet attendance organizer integration untouched;
- public `Portal do aluno` entry is Prime red and includes the Prime mark;
- no Teacher Intelligence code, learner state, canonical state, DB data, or automation-freeze state changed.

### Proof boundary
Repository/Preview gates must pass before merge. After Production release, the real learner account `gugasalgado7@gmail.com` must perform the interactive Google sign-in witness. No agent/admin simulation can prove that final account-specific boundary.


---

## 2026-09-30 — Student login / Portal entry remediation — RELEASED

### Exact release proof
- PR #72 final validated head: `a93c3c5490040e3dfabfd057e2d71805dff8ac24`.
- Exact-head gates PASS:
  - Student Dashboard Contract `36663962437`;
  - Golden Runtime Witness `36663962465`;
  - Coordination Runtime Witness `36663962422`.
- Exact-head Preview `dpl_3d15CktorwWt2L9rivL9fdottGjn`: READY.
- PR #72 merge SHA: `0916b97c5228fe281aaad14f1e0ec4ada104107f`.
- Vercel Production `dpl_14ar2XoP1tFzUjE3HgW7vtmK13Nc`: READY on exact merge SHA with official aliases.

### Released behavior
- learner/end-user Google sign-in requests only `openid email profile`;
- ordinary learner login no longer requests `meetings.space.readonly` or offline-token access;
- Meet attendance remains a separate organizer credential/integration;
- public `Portal do aluno` is Prime red and includes the Prime mark.

### Production read-back
- public root: HTTP 200 and rendered control contains Prime red styling + `/brand/prime-digital-hub-mark-transparent.png`;
- `/login`: HTTP 200;
- `/api/auth/providers`: HTTP 200 with Google provider and official callback;
- Production-only error/fatal scan after release: no errors observed.

### Concurrent Teacher Intelligence work
PR #71 subsequently merged on top of the PR #72 merge. At release reconciliation, current `main` was `1ea279fcb017a5be83c3880a36ade0c8f916959c`, with PR #72 merge `0916b97...` as parent, so the student login/Portal remediation is retained while the Validation bridge proceeds.

### Remaining account-specific witness
The structural OAuth/login remediation is released, but the final Gustavo witness cannot be simulated by an agent:

`gugasalgado7@gmail.com → Google sign-in → NextAuth session → Account/Learner resolution → stu_4c4da6c04ac4 → learner dashboard renders`.

The account-specific interactive witness remains OPEN until the real learner account signs in successfully.

No learner canonical state, Teacher Authority, AccountLearnerRelation, or `PIPELINE_AUTOMATION_FROZEN` state was changed by this lane.

---

## 2026-09-30 — Official Teacher Intelligence authority bridge — PR #71 RELEASED

### Exact release proof
- PR #71: `Bridge shared runner to Teacher Intelligence Validation`.
- Final validated head: `b5e3877229c0c8f010825bf7a76cca6d2e7e6616`.
- Exact-head gates:
  - Coordination Runtime Witness `36663963089`: SUCCESS;
  - Golden Runtime Witness `36663963041`: SUCCESS;
  - Student Dashboard Contract `36663963060`: SUCCESS after rerun of an environmental `next/font` loader failure; the rerun passed all gates including Next build.
- Exact-head Vercel Preview `dpl_ChkzUQYpg9sLgQcSMZP2ZmhMa3a9`: READY.
- Merge SHA: `1ea279fcb017a5be83c3880a36ade0c8f916959c`.
- Production deployment `dpl_58wRxoUgbyjEZa95FbEJKTK3D5Cq`: READY on the merge SHA.

### Released authority behavior
For Shared Learning Machine executions:
- candidate generation now materializes a real pending `ValidationTask` of type `canonical_learning_record_authority`;
- the exact canonical authority draft is preserved in `suggestedValue`;
- evidence/provenance and deterministic payload hash are preserved with the task;
- the machine stops at `awaiting_teacher_authority`;
- no shared-runner publication `ReviewTask` is exposed as a second pedagogical authority surface;
- legacy ReviewTask behavior remains isolated to the legacy path;
- approval remains human-only in Teacher Intelligence Validation;
- G5 is no longer hard-coded to a historical Gustavo witness and follows approved ValidationTask → G2 provenance → G3 PASS lineage.

The Golden Runtime Witness proves:
`shared run → ValidationTask pending → human approval witness → G2 → G3 → G4 → G5`,
with idempotency and without automatically publishing the legacy Class Report.

### Admin/teacher navigation
When an admin/teacher previews a learner dashboard, explicit `Teacher Intelligence` and `Admin` navigation remains visible. These controls remain absent for ordinary student accounts.

### Gustavo 2026-09-29 — now in official Validation
The previously frozen candidate has been materialized in Production as:
- ValidationTask: `validation_gustavo_20260929_e0b4aaf9`;
- status: `pending`;
- type: `canonical_learning_record_authority`;
- external candidate hash: `e0b4aaf9e2931de1ae4a2d298d287dfdb8454de7a2f65279b3d55b1073adbbec`;
- learner: `stu_4c4da6c04ac4`;
- lesson: `lesson_5f1ce76890f1ceea`;
- source document: `1F3Oe87eEUgTLOO9d7MupI_C5mU-5U-ESUr_gQYC0Gks`;
- evidence source only: `Transcrição` / `t.ororffpf4ito`;
- excluded: `Observações` / `t.piyr7rigwkbd`;
- previous CLR: `cmu6jv29k0001bf8kt45pl9ht`;
- reviewerId: NULL;
- reviewedAt: NULL;
- decision: NULL.

This means Gustavo must now be reviewed in:
`/dashboard/admin/intelligence/validation/validation_gustavo_20260929_e0b4aaf9`

No Teacher Authority, canonicalization or learner-facing publication has been performed for this candidate.

### Louise 2026-09-28 — next exact action
The earlier Issue #58 packet remains the source packet, but its old request for a `ReviewTask ID` is superseded by PR #71.

Use the authenticated administrator route:
`POST /api/admin/learning-machine/run`

with the already-verified Louise transcript-only packet:
- studentId `stu_c5930e6e76ae`;
- studentEmail `louise_nogueira@hotmail.com`;
- lessonId `lesson_3c63fdc6a11f5639`;
- source document `1oMzBTVirvTvS9nNVFUeT8ZcHmWLemnJmSjUR8hLeYe4`;
- source tab `Transcript` / `t.5o5y0svtjbdt`;
- `sourceExtractionMode=google_docs_transcript_tab_v1`;
- `notesExcludedFromEvidence=true`.

Required result:
1. one Shared Learning Machine PipelineRun;
2. one pending official `ValidationTask`;
3. run status/resume point `awaiting_teacher_authority`;
4. no approval;
5. no canonicalization;
6. no learner-facing publication.

Write back the exact PipelineRun ID, ValidationTask ID, quality-gate result and transcript provenance to Issue #58 + this handoff.

### Safety state
- `PIPELINE_AUTOMATION_FROZEN = true` remains active.
- automatic ingest remains OFF.
- Gustavo 29/09 is pending human authority in the portal.
- Louise 28/09 still requires the authenticated manual shared-run execution.



---

## 2026-09-30 — Teacher Intelligence legacy-noise / navigation remediation — PR #79

### User-visible defects addressed
- `Pedagogical command center` navigation could land on a 404.
- learner submission audit records were treated as lesson-run navigation even though they are teacher-review submissions, not lesson PipelineRuns.
- failed technical-only legacy processing polluted Lessons/Cockpit.
- Gustavo self-perception caution copy had insufficient contrast.

### Reconciled implementation
PR #79 is based on current main `392753dc4ac56e03518e6edeacabee8c934ac812` after PR #78 and supersedes PRs #75/#77.

Changes:
- filter technical-only failed runs from pedagogical Lessons/Cockpit only when there is no Evidence Candidate, ReviewTask, ClassReportProjection, signal/insight proposal or Portfolio apply;
- preserve all such runs/events in Audit;
- simplify failed lesson trace and keep IDs/errors/provenance/events behind collapsed `Technical trace / audit`;
- make the Teacher Intelligence command-center identity explicitly link to `/dashboard/admin/intelligence`;
- add compatibility route `/dashboard/admin/intelligence/cockpit` redirecting to the valid root;
- route `learner_action_submission` and `learner_self_perception` Audit items to anchored learner submissions in Review;
- render the learner self-perception disclaimer in a high-contrast amber notice;
- update the Teacher Intelligence regression self-test to protect the new behavior.

### Safety
No DB deletion, learner/canonical mutation, Teacher Authority change, or automation-freeze change.

### Release boundary
Do not call Production PASS until the final PR #79 exact head passes CI + Vercel Preview and the merged exact SHA is READY in Production.


---

## 2026-09-30 — Teacher Intelligence cleanup / navigation / portal mark — FINAL PRODUCTION PASS

### Teacher Intelligence cleanup / navigation
Final functional PR: **#79**.

- validated final PR head: `0e216272b24f59a9fd2d1b3dde1a891d46b49e7b`;
- exact-head Student Dashboard Contract / Golden Runtime Witness / Coordination Runtime Witness: SUCCESS;
- merge SHA: `880d4869e1f339e8ee7267a06015646dfc59a538`.

PR #80 then advanced main to `601949e91d6bd71bed20adc8d5a3fc9964905a52`, whose direct parent is `880d4869...`, preserving the #79 changes. Production `dpl_GDJP69maFCnShPooEMVgifZHjD4F` reached READY on `601949e...`; post-push Student Dashboard Contract `36668515532` completed SUCCESS.

Verified behavior:
- failed technical-only legacy runs stay out of pedagogical Lessons/Cockpit only when they have no Evidence Candidates, ReviewTasks, report, signal/insight proposals or Portfolio apply;
- those historical runs/events remain preserved in Audit;
- failed lesson detail is concise and full provenance remains behind collapsed `Technical trace / audit`;
- Teacher Intelligence command-center identity explicitly routes to `/dashboard/admin/intelligence`;
- compatibility route `/dashboard/admin/intelligence/cockpit` redirects to the valid root;
- Production read-back of the compatibility path returned HTTP 200/login rather than 404;
- Audit learner submissions (`learner_action_submission`, `learner_self_perception`) deep-link to anchored items in Review rather than synthetic lesson-run detail;
- Review learner-submission cards expose matching `submission-<eventId>` anchors;
- Gustavo learner self-perception caution uses high-contrast amber styling (`border-amber-200 bg-amber-50 ... text-amber-950`).

### Prime Portal button mark
PR #80 preserved the red Portal button footprint but removed the requested Prime mark. Follow-up PR **#81** restored only that mark.

- PR #81 exact head: `3e70d79cafc53fac711629b3b229ad451fc886ec`;
- exact-head Student Dashboard Contract / Golden Runtime Witness / Coordination Runtime Witness: SUCCESS;
- merge SHA / code-release main: `db12a8fd893f73cde4407c5f5ac07e3b3bee9bd6`;
- post-merge Student Dashboard Contract `36668844880`: SUCCESS;
- Vercel Production `dpl_38NoJjxwtKUwNyas92tMuqQj7enV`: READY on exact SHA `db12a8fd...`;
- official aliases include `www.primedigitalhub.com.br` and `primedigitalhub.com.br`;
- Production HTML read-back proves the red `Portal do aluno` contains `/brand/prime-digital-hub-mark-transparent.png` with alt `Prime Digital Hub mark`;
- Production error/fatal scan during the release window returned no errors.

### Safety / authority
- no PipelineRun/PipelineEvent deletion;
- no learner learning-state mutation;
- no canonical learning-state mutation;
- no Teacher Authority consumed;
- no account/learner relation mutation;
- `PIPELINE_AUTOMATION_FROZEN` unchanged.

**Operational result: PASS.**

Issue #58 final mirror comment: `5904060706`.


---

## 2026-09-30 — RECENT / Attended Lessons layout correction — PR #85 MERGED

### Root cause
The learner-facing RECENT / Attended Lessons block was using `projection.recentLessons`, whose RECENT membership is a temporal-memory classification, as if it meant "latest attended lessons".

Louise has four confirmed attended lessons (02 Mar, 22 Apr, 01 Jun, 20 Jul 2026), but only 20 Jul falls inside the temporal RECENT window. The UI therefore rendered one card and left empty visual space despite three additional confirmed attended lessons.

### Fix
PR #85:
- validated head `3b469ee9fb9add7c9a22a1a4c68d6c43d42974b3`;
- Student Dashboard Contract `36671245958`: SUCCESS;
- Golden Runtime Witness `36671245992`: SUCCESS;
- Coordination Runtime Witness `36671245956`: SUCCESS;
- merge SHA `2eb8a824253c74c649e989fe3002aedcadad140c`.

The learner-facing block now:
- preserves canonical RECENT/MEMORY classification;
- starts with canonically RECENT attended lessons;
- fills remaining card slots with the newest confirmed attended MEMORY lessons;
- accepts only `status === 'present'`;
- uses a 4-card display budget for the two-column grid.

Expected Louise order:
1. July 20, 2026
2. June 1, 2026
3. April 22, 2026
4. March 2, 2026

Attendance remains `4 attended lessons`. No attendance fact, learner state, CEFR or Teacher Authority changed.

### Deployment boundary
Vercel is currently rate-limited. No deployment for `2eb8a824...` was created at this checkpoint. Treat this as a deployment-capacity boundary, not a code/test failure.

Issue #58 mirror: `5904398260`.


---

## 2026-09-30 — Teacher Review actionable + canonical status colors — PR #84 MERGED / DEPLOYMENT BLOCKED

### Exact validation
PR #84 validated head `90ebf3120a8bc28c168e3223be62dafdf87266a7`:
- Student Dashboard Contract `36671498979`: SUCCESS;
- Golden Runtime Witness `36671499022`: SUCCESS;
- Coordination Runtime Witness `36671498900`: SUCCESS.

Merge SHA: `142e16c77cf266b60d26a68bed22bcf778da148c`.

### Teacher Review
- learner self-perception check-ins no longer belong to the normal Review workspace;
- Review lists actionable learner audio submissions;
- learner audio route supports byte ranges / HTTP 206 for robust playback;
- native player + `Open audio` fallback are exposed;
- pending audio exposes `Mark as reviewed`;
- review persists `LearnerSubmissionTeacherReviewed`;
- review event explicitly records `canonicalEvidenceCreated=false`, `teacherAuthorityConsumed=false`, `learningStateChanged=false`.

Production logs before release proved Cláudio event `cmubrtn7k000010kt6eluc82u` is physically retrievable (repeated HTTP 200 responses from its audio endpoint). The observed defect was playback/streaming UX, not missing audio storage.

### Canonical status color contract
- Teacher Confirmed = BLUE;
- Teacher Edited & Confirmed = BLUE;
- Teacher Note = violet;
- Learner Self-Perception = purple;
- Not Confirmed = amber;
- Not Observed = slate;
- Not Applicable = violet;
- Insufficient Evidence = orange;
- Not Available = neutral gray.

Operational PASS/VERIFIED remains green and is not pedagogical authority. Build self-tests protect this distinction.

### Deployment boundary
Vercel is deployment-rate-limited. No deployment for `142e16c7...` exists at this checkpoint. Code is merged and exact-head CI passed; Production publication remains blocked by deployment capacity.

### Explicit unresolved DB deletion
User requested physical deletion of `cmunm6w2q0000qmga9tr30zqr` (Gustavo self-perception checkpoint submitted 30 Sep 2026 04:37:55). Direct Neon access returned the connector's internal authorization HTTP 404. The event has NOT been claimed deleted. Its physical deletion remains an explicit Production DB-access task. The Review UI no longer surfaces self-perception checkpoints regardless.

Issue #58 mirror: `5904443837`.
