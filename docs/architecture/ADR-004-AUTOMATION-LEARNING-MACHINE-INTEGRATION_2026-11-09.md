# ADR-004 — Integration Contract: PRIME Automation × Learning Machine

**Status:** ACCEPTED AS ARCHITECTURAL DECISION / DOCUMENTATION BASELINE  
**Date:** 2026-11-09  
**Repository baseline audited:** `main` at `8b864fa6e831788a2868d4fc73070113210afd37`  
**Decision scope:** architecture and ownership boundaries only. This ADR does not authorize Production execution, unfreeze, deployment, migration, provider changes, OAuth changes, or learner-data mutation.

## 1. Context

PRIME has two distinct systems that must interoperate without becoming one undifferentiated workflow:

1. **Automation / source orchestration** discovers external lesson artifacts, resolves source identity, reads and triages each transcript, and dispatches eligible work.
2. **PRIME Learning Machine** processes one identified lesson through pedagogical and technical stages, preserves provenance, creates evidence candidates, applies deterministic quality gates, and stops at human-authority boundaries.

These systems already have implementation in `main`. PRs #87, #89, #90, #91 and #93 were independently checked through GitHub metadata and are MERGED. The architectural task is therefore integration governance and proof closure, not greenfield implementation.

The current operational baseline remains constrained:
- `PIPELINE_AUTOMATION_FROZEN = true`.
- The automatic webhook acknowledges authenticated Pub/Sub deliveries with HTTP 204 while frozen; it does not enqueue a durable event.
- The Drive cron route returns HTTP 503 while frozen.
- `/api/pipeline/ingest` returns HTTP 503 before calling the shared runner while frozen.
- The manual admin route invokes the shared runner and does not consult the global freeze constant. This is a distinct operational path and must remain governed by explicit authorization.
- `vercel.json` schedules `/api/cron/meet-attendance`, not `/api/cron/drive-transcripts`.
- No end-to-end Production proof is implied by merged code or synthetic CI.

## 2. Decision

### 2.1 Preserve two bounded systems

**System A — Automation / Source Orchestration**
- Receives Drive events and/or scheduled reconciliation triggers.
- Reconciles the canonical Drive source folder.
- Handles one file at a time.
- Resolves identity and transcript eligibility.
- Preserves `sourceFileId`, source hash, timestamps and source metadata.
- Detects existing transcript/run disposition and avoids duplicate submission.
- Dispatches the normalized source to the existing ingest boundary.
- Does not generate pedagogical interpretation, approve evidence, or publish reports.

**System B — PRIME Learning Machine**
- Accepts a normalized lesson transcript and trigger provenance.
- Uses the shared execution contract and shared runner.
- Owns processing stages, run history, provider attempts, checkpoints and resumability.
- Produces evidence candidates and downstream artifacts only through the established pipeline and quality gates.
- Stops where identity or teacher authority is required.
- Does not discover or crawl Drive folders as its core responsibility.

### 2.2 One integration contract; multiple entry points

The integration point is the existing shared execution contract and runner:
- `lib/learning-machine/shared-run-contract.ts`
- `lib/learning-machine/shared-runner.ts`
- `lib/pipeline/run.ts`

The supported trigger origins are `manual`, `automatic`, `retry`, and `resume`. Manual and automatic are different entry paths into the same Machine; they must not fork into separate processing implementations.

The automatic adapter is:
- `lib/drive-reconciliation.ts`
- `POST /api/pipeline/ingest`

The manual adapter is:
- `POST /api/admin/learning-machine/run`
- accepts canonical `sourceFileId` and prepares the Drive source before invoking the same runner.

No second runner, second provider pool, parallel transcript pipeline, duplicate queue authority, or new orchestration platform is to be introduced without a separately approved ADR demonstrating a concrete gap that cannot be closed in the existing system.

### 2.3 System-of-record boundary

Neon/PostgreSQL through Prisma is the operational persistence authority for transcript/run lineage and PRIME records. Firestore is not an active authority for this processing path and must not be reintroduced as a parallel source of truth.

This ADR does not authorize deleting Firestore resources, credentials, variables, backups or historical data. Any decommissioning requires a separate consumer inventory, retention/export decision, rollback plan and approved change.

Google Drive remains the external source of transcript documents. A Drive file is not considered pedagogically processed merely because it was discovered, read, moved, or accepted by an HTTP endpoint.

### 2.4 Provider boundary

Gemini is not the Learning Machine and is not a required dependency for source discovery, source identity, persistence, deduplication, run tracking or recovery.

PR #90 introduced the interchangeable provider pool and is merged. Provider selection/fallback remains subordinate to PRIME's exact stage contract, provenance, quality gates and authority policy.

If all configured providers fail, the Machine must preserve the failed attempt and recoverable run state. Ingestion/source persistence must not be represented as successful pedagogical processing.

### 2.5 Human authority

AI-generated output is a candidate, not a teacher decision. The teacher remains the pedagogical owner. No webhook, cron, retry, provider fallback or agent may automatically approve teacher authority or publish an incomplete report.

### 2.6 Per-source processing

Each transcript is handled individually. Stable source identity and idempotency must prevent duplicate processing when Pub/Sub redelivers, cron overlaps, a manual action repeats, or a retry is requested.

Do not move entire folders or bulk-mark files processed. The current Drive reconciliation implementation contains `moveToProcessed()` and attempts to move an accepted file individually. This behavior is an unresolved operational policy question; do not treat it as canonical until an owner decision is recorded. Prefer Neon lineage/status as the processing authority and preserve the original source unless an explicit policy approves individual archival.

## 3. Responsibility matrix

| Concern | Automation | Learning Machine | Shared / external |
|---|---|---|---|
| Discover Drive file | Owns | No | Google Drive |
| Read/export transcript | Adapter responsibility | Consumes normalized input | Google APIs |
| Resolve source/student identity | Owns preflight triage | Validates/uses normalized identity | Student registry |
| sourceFileId/source hash | Captures and forwards | Includes in normalized run identity | Shared contract |
| Duplicate source detection | Reconciliation pre-check | Run identity/idempotency | Neon/PostgreSQL |
| Trigger mode | Supplies origin | Persists origin | Shared contract |
| Pipeline stages/checkpoints | No | Owns | Neon/PostgreSQL |
| Provider selection/fallback | No | Owns via provider abstraction | Provider APIs |
| Evidence candidate generation | No | Owns | Provider + deterministic validators |
| Teacher approval | Never | Must stop/request review | Authorized teacher |
| Class Report/Portfolio projection | No | Owns gated downstream processing | Canonical records |
| Dashboard access/isolation | No | Supplies canonical projections | Authenticated app |
| Retry/resume | May request | Owns run continuation | Shared run history |

## 4. Required lifecycle model

Do not collapse source lifecycle, run lifecycle, provider-attempt lifecycle and human-review lifecycle into one status field.

### Source lifecycle
`discovered → identity_resolved → source_read → eligible | quarantined → persisted`

A source may remain persisted even if later processing fails.

### Processing run lifecycle
`queued → processing → awaiting_review | completed | failed → retry_pending → processing`

Exact enum names must follow the existing Prisma/schema contract; this ADR defines semantic boundaries, not permission to add enum values or migrate the database.

### Provider attempt lifecycle
`started → succeeded | failed | invalid_output | timed_out`

A provider failure belongs to the provider attempt, not to the existence of the source or lesson.

### Human review lifecycle
`not_required | review_pending → approved | rejected | returned_for_revision`

A run being technically completed is not equivalent to teacher approval. A published document is not proof of approval or implementation.

### Projection lifecycle
`not_projected → projection_pending → projected → read_back_verified`

Projection and publication must retain provenance to the source/run and must not upgrade unvalidated candidates.

## 5. Freeze and authorization policy

The global `PIPELINE_AUTOMATION_FROZEN` remains true until a separately approved operational release decision.

The freeze behavior is not uniform:
- webhook: authenticated delivery is acknowledged with 204 while frozen; no durable event is created;
- Drive cron route: returns 503 while frozen;
- automatic ingest endpoint: returns 503 before shared-runner invocation;
- manual Admin route: can invoke the shared runner independently of that freeze constant.

This asymmetry is a documented control gap, not an invitation to trigger the manual route. Before any operational witness, the owner must explicitly authorize the environment, actor, source, route, expected mutation and rollback/stop conditions. Current Issue #112 release controls remain authoritative and prohibit Production operations, merge, deployment and unfreeze absent separate explicit approval.

## 6. Known implementation/documentation gaps

1. `docs/drive-event-trigger.md` claims the daily Drive cron is enabled, but `vercel.json` does not schedule it. Correct the document or schedule only through a separately approved change.
2. Webhook acknowledgment while frozen prevents Pub/Sub retry storms but does not durably record the event. Recovery therefore depends on a later source-folder reconciliation; that recovery has not been proven operationally.
3. Manual Admin route bypasses the global automation freeze. Decide and implement separate, explicit controls for automatic ingestion and manual Machine execution only after authorization.
4. `moveToProcessed()` attempts per-file Drive relocation after ingest acceptance. Decide whether this is desired; do not treat HTTP acceptance as proof of full Machine completion.
5. Existing handoffs contain stale/conflicting checkpoints. This ADR and its traceability matrix are the architecture reference; live status must always be revalidated against current SHA, PR metadata, code and runtime evidence.
6. Exact Production execution, provider provenance, real teacher review, projection and authenticated read-back remain separate proof requirements. Merged PRs and CI do not close them.

## 7. Explicit non-goals / prohibited shortcuts

This ADR does not authorize:
- introducing n8n, Apps Script or another orchestration platform;
- creating a second queue or processing runner;
- removing Firestore credentials/resources;
- changing Neon schema or data;
- changing providers or secrets;
- changing `PIPELINE_AUTOMATION_FROZEN`;
- activating Drive Events, cron or ingest;
- moving source files;
- triggering manual or automatic real-learner processing;
- modifying historical Golden Traces GL-001/GL-002;
- treating synthetic CI as Production proof;
- merging PR #108 or deploying.

## 8. Acceptance criteria for future operational proof

A controlled witness must establish, for one explicitly authorized source:

1. event/trigger identity and trigger mode;
2. canonical `sourceFileId` and source hash;
3. resolved learner identity and source eligibility;
4. one persisted transcript and one correctly correlated Processing Run;
5. no duplicate run after repeated delivery/reconciliation;
6. provider/model/request correlation and all provider attempts;
7. generated evidence candidates and durable provenance;
8. deterministic quality-gate result;
9. teacher review decision by the authorized teacher;
10. canonical record and projection lineage;
11. authenticated dashboard read-back and negative isolation test;
12. a second idempotent execution with no duplicate canonical artifacts;
13. preserved logs, timestamps, actor, deployed SHA and first verified breakpoint if any.

A failed witness is still evidence. Preserve it; do not repair its records to make it pass.

## 9. Mandatory instructions for every future agent

Before proposing or implementing anything in this area, the agent MUST:

1. Read this ADR and `docs/architecture/ADR-004-AUTOMATION-LEARNING-MACHINE-TRACEABILITY_2026-11-09.md`.
2. Read `docs/operations/PRIME_EXECUTION_CLOSURE_LEDGER.md`, `docs/DO_NOT_REINVESTIGATE.md`, `docs/PRIME_CANONICAL_CURRENT_STATE.md`, and active Issue #112.
3. Verify current `main` SHA and current PR metadata; do not trust copied SHAs in old handoffs.
4. Inspect the exact implementation paths listed in the matrix.
5. Classify every claim as SPECIFICATION, IMPLEMENTATION, CI/SYNTHETIC, DEPLOYMENT, RUNTIME, PERSISTENCE, PROVENANCE or COMPLETE TRACE.
6. Reuse the existing reconciliation worker, shared runner, contract, provider pool and run history. No duplicate architecture.
7. State one concrete gap and one bounded next action. If no new contradictory evidence exists, continue the existing lane.
8. Respect the current issue's operational authority. Documentation work does not authorize Production execution.

A proposal to replace or recreate either system is invalid unless it cites new contradictory evidence and an approved ADR superseding this one.

## 10. Consequences

**Positive**
- preserves separate ownership of automation and pedagogical processing;
- prevents duplicated runners, providers and orchestration;
- makes source/run/provider/review/projection status independently auditable;
- allows manual and automatic entry into one canonical Machine;
- prevents Gemini outages from destroying source intake/persistence;
- gives future agents a stable, evidence-linked return point.

**Trade-offs**
- the current freeze and missing operational witness remain explicit blockers;
- source acknowledgment without durable event capture requires reconciliation recovery;
- file archival policy and manual-vs-automatic freeze controls need owner decisions;
- documentation must be synchronized when implementation changes.

## 11. References

- [PR #87 — manual canonical Drive source into shared Machine](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/87)
- [PR #89 — Teacher Intelligence Learning Machine inbox](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/89)
- [PR #90 — interchangeable provider pool](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/90)
- [PR #91 — Machine lineage truth](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/91)
- [PR #93 — Drive triggers to canonical reconciliation worker](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/93)
- [Issue #112 — operational acceptance and release gates](https://github.com/alexmelloenglish-gif/prime-hub-portal/issues/112)
- [PR #108 — retry, authority, isolation and CI closure; still Draft/Open/Unmerged](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/108)
