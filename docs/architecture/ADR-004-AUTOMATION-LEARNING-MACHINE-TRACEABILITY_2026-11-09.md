# PRIME Automation × Learning Machine — Traceability Matrix

**Date:** 2026-11-09  
**Audited baseline:** `main` = `8b864fa6e831788a2868d4fc73070113210afd37`  
**Companion decision:** [ADR-004](ADR-004-AUTOMATION-LEARNING-MACHINE-INTEGRATION_2026-11-09.md)  
**Purpose:** single handoff index for future agents. This matrix separates code existence from CI proof and Production/runtime proof.

## 1. Evidence vocabulary

| Level | Meaning | What it does not prove |
|---|---|---|
| SPEC | Documented intent/contract | Code exists |
| IMPL | Code exists on the inspected ref | Runtime is active |
| CI-SYNTH | Automated tests/build on named SHA or disposable fixtures | Real external provider, Production or real learner |
| MERGED | PR integrated into main | Deployed or operational |
| DEPLOY | Exact SHA deployed and identified | End-to-end behavior |
| RUNTIME | Actual route/job/provider execution observed | Durable downstream state unless read back |
| PERSIST | Durable records read back from authoritative store | Correct authority/provenance unless linked |
| E2E | Source-to-authorized-dashboard chain independently verified | Anything beyond the explicitly demonstrated path |

Use the narrowest status supported by evidence. Do not upgrade one level to another by inference.

## 2. Pull-request lineage

| PR | Scope | GitHub state checked | What it establishes | What remains unproven |
|---|---|---|---|---|
| [#87](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/87) | Manual canonical Drive source → shared runner | CLOSED / MERGED; merge SHA `8eecaaa0cb105e6bb9a6284e31c1e916830046db` | Manual route accepts sourceFileId and uses canonical Drive preparation + shared Machine | Real Production run/read-back; PR explicitly did not unfreeze automatic ingest |
| [#89](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/89) | Teacher Intelligence Machine inbox | CLOSED / MERGED; merge SHA `9d024daf1c8db6284fb6da3f18309822998e7022` | Admin inbox lists sources and invokes same Machine; no transcript paste needed | Authenticated Production workflow and real source-to-dashboard trace |
| [#90](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/90) | Interchangeable model providers | CLOSED / MERGED; merge SHA `de676a5998be2f376885316e78166c0d25aea5cb` | Provider pool/provenance/fallback implementation integrated | Successful real provider execution/fallback in Production |
| [#91](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/91) | Teacher Intelligence Machine lineage truth | CLOSED / MERGED; merge SHA `9f16732633db71894cc8fe4fde423454c8f9b2f2` | CLR with pipelineRunId + transcriptId distinguishes Machine-linked lineage from historical teacher backfill | Real Production Machine-linked CLR for the required witness |
| [#93](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/93) | Drive event + scheduled reconciliation wiring | CLOSED / MERGED; merge SHA `5aa12d28a2783c76483918cc10a7b569a1380b92` | Pub/Sub webhook and Drive cron route converge on `reconcileDriveTranscripts()`; freeze intentionally preserved | Automatic activation, external Workspace/PubSub config, successful event/cron, durable run |
| [#108](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/108) | Retry, authority, isolation, docs and CI closure | OPEN / DRAFT / UNMERGED; head `a3ba2d503f109b9b63d66ca0cffd78c25a890a85` | At 2026-11-09, issue body reports 4/4 exact-head workflows SUCCESS on that SHA | Formal review, merge, deployment, Production gates A/B/C, real GL-003 and authenticated E2E |

PR metadata above was read from GitHub on 2026-11-09. Recheck before relying on it in a later handoff.

## 3. Code traceability

| Layer | Canonical file(s) | Responsibility | Implementation finding | Proof / open gap |
|---|---|---|---|---|
| Drive event ingress | `app/api/webhooks/drive-events/route.ts` | Authenticated Pub/Sub push | OIDC JWT audience/email/issuer/verified checks; invokes reconciliation only when not frozen | While frozen it acknowledges 204 and logs; no durable event record is created |
| Scheduled source reconciliation | `app/api/cron/drive-transcripts/route.ts` | CRON-protected Drive scan | Calls same reconciliation worker when not frozen | Returns 503 while frozen; no cron entry in current `vercel.json` |
| Source adapter/reconciler | `lib/drive-reconciliation.ts` | Drive list/export/triage/hash/identity/idempotency/dispatch | Recursively lists docs, excludes configured folders, prepares each file individually, checks transcript/run disposition, sends payload to ingest | No live run proven; includes `moveToProcessed()` per-file side effect after ingest acceptance; policy unresolved |
| Automatic ingest adapter | `app/api/pipeline/ingest/route.ts` | Secret-protected automatic entry | Parses payload and calls `executeSharedLearningMachine({triggerOrigin:'automatic'})` | Freeze returns 503 before runner; no live automatic run proven |
| Manual adapter | `app/api/admin/learning-machine/run/route.ts` | Admin-only manual source trigger | Accepts `sourceFileId`, prepares canonical Drive payload, invokes same runner with `manual` | Does not consult `PIPELINE_AUTOMATION_FROZEN`; operational policy/authorization asymmetry must be resolved before use |
| Shared run contract | `lib/learning-machine/shared-run-contract.ts` | Normalize input and derive stable run identity | Supports manual/automatic/retry/resume; identity includes machine version, learner, lesson, source ref and source hash | Code evidence; production persistence/idempotency witness still separate |
| Shared runner | `lib/learning-machine/shared-runner.ts` | Single canonical processing entry | Normalizes input, builds execution options, calls `processLessonTranscript()` | Shared implementation exists; no real full Production trace proven |
| Pipeline engine | `lib/pipeline/run.ts` | Stage execution, provider orchestration and persistence | Existing pipeline invoked by shared runner | Inspect exact current code before any proposed changes; runtime proof remains open |
| Run history | `lib/learning-machine/run-history.ts` | Execution history/checkpoints | Existing shared Machine history implementation identified in prior source inspection | Recheck exact schema and persistence behavior before modifying |
| Continuation | `lib/learning-machine/canonical-continuation.ts` | Canonical resume/continuation | Existing continuation implementation identified | Real resume witness remains separate |
| Freeze policy | `lib/pipeline-freeze.ts` | Automatic pipeline containment | `PIPELINE_AUTOMATION_FROZEN = true`; reason says no new ingest/retry/Drive reconciliation | Do not alter without explicit release decision |
| Deployment schedule | `vercel.json` | Vercel cron registration | Only `/api/cron/meet-attendance` at `0 4 * * *` | Contradicts stale statement in `docs/drive-event-trigger.md` that daily Drive cron is enabled |
| Drive trigger runbook | `docs/drive-event-trigger.md` | External Workspace Events/PubSub setup | Describes OIDC/PubSub/WIF and desired validation | Daily cron assertion is stale relative to `vercel.json`; external subscriptions not independently proven |
| Admin inbox | Teacher Intelligence Machine inbox (introduced by PR #89) | Human-operated source selection | Existing UI workflow, admin-only | Production authenticated interaction not proven |
| Provider pool | provider abstraction introduced by PR #90 | Vendor-neutral stage execution | Merged; order defaults in code/docs | Provider success/fallback in real runtime not proven |
| Canonical record lineage | Teacher Intelligence lineage introduced by PR #91 | Distinguish Machine-linked CLR from historical backfill | CLR with both `pipelineRunId` and `transcriptId` is Machine-linked | Historical CLR without links must not be retroactively called Machine proof |

## 4. Cross-system state contract

Do not implement one overloaded status field for all entities. Preserve separate lifecycles:

### Source
`discovered → identity_resolved → source_read → eligible | quarantined → persisted`

### Processing Run
`queued → processing → awaiting_review | completed | failed → retry_pending → processing`

### Provider Attempt
`started → succeeded | failed | invalid_output | timed_out`

### Human Review
`not_required | review_pending → approved | rejected | returned_for_revision`

### Projection
`not_projected → projection_pending → projected → read_back_verified`

These are semantic lifecycle labels for documentation and review. They are **not** authorization to add Prisma enums, change schema or migrate. Existing schema values must be inspected before code changes.

Critical invariants:
- provider failure belongs to Provider Attempt, not Source existence;
- transcript persisted does not mean Machine completed;
- Machine completed does not mean Teacher approved;
- published does not mean evidence validated;
- projected does not mean authenticated read-back verified;
- duplicate source event must not create duplicate canonical run/artifacts;
- retry/resume must continue the same logical work lineage, not create parallel architecture.

## 5. Current operational gates

| Gate | Current status | Required evidence |
|---|---|---|
| Automatic Drive event configuration | NOT VERIFIED | Workspace Events subscription ACTIVE; Pub/Sub topic/subscription and OIDC push confirmed |
| Drive scheduled fallback | NOT ACTIVE IN REPO CONFIG | `vercel.json` currently has no Drive cron entry |
| Automatic pipeline execution | FROZEN | explicit owner authorization + release decision + exact deployment/runtime witness |
| Manual admin execution | IMPLEMENTED; AUTHORIZATION BOUNDARY OPEN | explicit source/environment/actor approval; no use during current Issue #112 restriction |
| Durable event queue while frozen | NOT IMPLEMENTED BY WEBHOOK | choose whether source-folder reconciliation is sufficient or persist event receipt; do not create second queue without decision |
| Idempotency | IMPLEMENTED IN CODE / SYNTHETIC TESTS EXIST | real repeated event/run read-back |
| Multi-provider fallback | IMPLEMENTED / PR #90 MERGED | actual provider/model/request provenance and fallback witness |
| Teacher Authority | CONTRACT/STRUCTURE IMPLEMENTED | real authorized teacher decision in witness |
| Source → dashboard E2E | NOT VERIFIED | complete authorized GL-003 or separately approved witness |
| Firestore | NOT AUTHORITY FOR THIS PATH | do not revive; inventory consumers before decommissioning resources |
| n8n/other orchestrator | NOT ADOPTED | require ADR showing concrete missing capability and total operating-cost/ownership plan |

## 6. Documentation drift / conflicts to resolve

| Artifact | Conflict | Required action |
|---|---|---|
| `docs/DO_NOT_REINVESTIGATE.md` | Contains historical checkpoint and 2026-10-05 override saying PR #90 OPEN, contradicted by GitHub PR #90 merged 2026-10-10 | Treat that passage as stale; reconcile document in a later documentation-only change |
| `docs/operations/PRIME_EXECUTION_CLOSURE_LEDGER.md` | Its 2026-10-05 section says PR #90 open; later appendices may supersede it | Add explicit live-state correction referencing current PR metadata |
| `docs/drive-event-trigger.md` | Says daily Drive cron remains enabled; current `vercel.json` does not schedule it | Correct assertion or separately approve cron configuration |
| `docs/PRIME_CANONICAL_CURRENT_STATE.md` | Dated 2026-09-11 snapshot and historical Firestore wording; not a live status source for this workstream | Keep historical sections; add current pointer to this ADR/matrix through a reviewed docs-only update |
| Issue #112 | Explicitly prohibits Production DB/learner/attendance mutations, OAuth reauthorization, deployment, merge and unfreeze without separately authorized owner action | Current authority gate; remains open |

Do not silently rewrite historical records. Append dated corrections with source links and preserve prior statements as historical.

## 7. Required next actions — no duplicate implementation

1. Reconcile stale docs using append-only dated corrections; do not rewrite historical snapshots.
2. Decide whether to remove `moveToProcessed()` or explicitly retain per-file archival after a precisely defined success boundary.
3. Decide whether freeze should have separate automatic and manual controls; any code change requires review and authorization.
4. Resolve cron policy: either keep Drive cron unscheduled and update docs, or authorize/configure it in a separate change after operational gates.
5. Decide whether source event receipts need durable persistence while frozen. First assess whether periodic full folder reconciliation provides acceptable recovery.
6. Run only synthetic/disposable tests until Issue #112 gates and explicit operational authorization permit a real witness.
7. Execute one authorized real source witness; preserve first breakpoint and do not repair evidence during execution.
8. Only after witness and release authorization, separately decide automatic activation.

## 8. Mandatory anti-rework instruction

A future agent must not:
- create another Drive worker/reconciliation function;
- create another shared Learning Machine runner;
- create another provider pool;
- introduce n8n/Apps Script as an assumed prerequisite;
- use Firestore as a second authority;
- bypass the shared contract for manual or automatic triggers;
- call a source processed merely because it was scanned or accepted;
- claim a real runtime trace based on merged PRs, CI, mocked providers or deployment READY;
- unfreeze, deploy, merge or mutate Production without explicit current authority.

A future agent must:
1. read ADR-004 and this matrix first;
2. verify current main SHA, PR state and Issue #112;
3. inspect only the specific files relevant to the claimed gap;
4. preserve one source identity and one logical run lineage;
5. document exact evidence and the first unproven boundary;
6. update this matrix when code/PR/runtime facts change.

## 9. Audit sources (GitHub read-back, 2026-11-09)

- Main SHA and PR #108/Issue #112 baseline: Issue #112 body and PR #108 metadata.
- PR #87 metadata and merge SHA: `8eecaaa0cb105e6bb9a6284e31c1e916830046db`.
- PR #89 metadata and merge SHA: `9d024daf1c8db6284fb6da3f18309822998e7022`.
- PR #90 metadata and merge SHA: `de676a5998be2f376885316e78166c0d25aea5cb`.
- PR #91 metadata and merge SHA: `9f16732633db71894cc8fe4fde423454c8f9b2f2`.
- PR #93 metadata and merge SHA: `5aa12d28a2783c76483918cc10a7b569a1380b92`.
- Main code blob SHA — webhook: `151f31422148540af9b09ec2573fe55aac3d3d1a`.
- Main code blob SHA — Drive cron: `d68d823d63a9e42b99ce9a64f858ea14669c3450`.
- Main code blob SHA — automatic ingest: `1309fda6604c07e0b11b6d024a2d3bd312ba54c8`.
- Main code blob SHA — manual admin route: `997340f5c20000fe58288e280ba14ec5726f41bf`.
- Main code blob SHA — Drive reconciliation: `e8a0577bab94d85c1c9f7cb8e0ebd8d9a5716838`.
- Main code blob SHA — shared run contract: `243eb9d95fab91f9dba0a37bc9434ff0440b1610`.
- Main code blob SHA — shared runner: `36ad44bc8fbbb8dd85f537e6001abdda14f69b0e`.
- Main code blob SHA — freeze: `76bf178b1cd03dd36e7e1abbf3d3e1f1b95e731f`.
- Main code blob SHA — vercel.json: `25684120f32d9e190c36d2a19038455c0eb8c506`.
- Main doc blob SHA — drive-event-trigger: `18e8b9648b6aafccbe7ec91e0cabf2353709010c`.
- Closure Ledger blob SHA: `00cb044c0da7899db0c38f680d455ed79cc11b47`.

This matrix is a point-in-time audit. Re-read live GitHub state before execution or release decisions.
