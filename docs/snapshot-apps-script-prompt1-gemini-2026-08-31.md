# PRIME Digital Hub — Forensic Snapshot
## Apps Script / Prompt 1 / Gemini

**Snapshot date:** 2026-08-31  
**Mode:** READ-ONLY forensic state record  
**Purpose:** preserve the verified state so future agents/operators do not repeat the same investigation or incorrectly attribute the Prompt 1 failure.

## 1. Canonical current state

Known historical breakpoint:

`Transcript persisted`
→ `PipelineRun created`
→ `Prompt 1 reached`
→ `GeminiGenerationFailed`
→ `HTTP 403`
→ `PipelineRun failed`
→ `no Evidence / Signal / Insight / Report / Portfolio`

Six historical runs were audited in Neon. All six have intact transcripts and failed PipelineRuns. All six failed at Gemini Prompt 1 with HTTP 403 and have no downstream artifacts.

**Important:** the Apps Script has **not** been proven to cause the Gemini 403.

Canonical attribution status:

`PROMPT_1_403_CAUSED_BY_APPS_SCRIPT = NOT_PROVEN`

## 2. Apps Script forensic status

Primary candidate project:

- **Project:** `PRIME Digital Hub — Google Meet Transcript Automation`
- **Script ID:** `1ZCiOyQPRQocSMbAER9c0FelY494I5TTLP639XWdrzmNrSqzbekNIByB5`
- **Owner:** `alexandre@primedigitalhub.com.br`
- **Last modification observed:** `2026-08-27T14:39:56.912Z`

Four related Apps Script projects were discovered in Drive, but only the project above matches the primary failure-notification name exactly.

The actual Apps Script source, `appsscript.json`, triggers and execution history could not be inspected because the available Google Apps Script/Gmail credentials lacked the required scopes, and the browser session was authenticated as a different account. Therefore the following remain **UNKNOWN**:

- runtime version;
- trigger function/frequency/executing account;
- whether `processPipeline` exists in the actual Apps Script;
- whether Apps Script calls the portal endpoint;
- whether Apps Script calls Gemini directly;
- Apps Script execution history;
- whether V8 migration is required.

Do **not** infer `DEPRECATED_ES5` merely from the historical runtime discussion. It must be read from the actual manifest.

## 3. Portal/GitHub evidence at audited deployment SHA

Audited deployment/source SHA:

`43eda9442732887089a85d23111baa320ab04ca1`

The repository establishes the following architecture:

`/api/pipeline/ingest`
→ validates the pipeline secret
→ parses the ingestion payload
→ calls `processLessonTranscript()`
→ pipeline runtime reaches `runPromptOne()`
→ `runPromptOne()` invokes the Gemini generation layer
→ Gemini `generateContent`

The Gemini generation implementation in `lib/pipeline/prompts.ts` calls:

`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

using:

- `GOOGLE_AI_STUDIO_API_KEY` as the API credential;
- `PRIME_PIPELINE_MODEL` as the configured model, with code fallback `gemini-3.7-flash`;
- `x-goog-api-key` for the provider request.

A non-2xx provider response becomes `GeminiGenerationError` with the provider HTTP status. Prompt 1 is versioned as `prompt-1.v3` in the current inspected code.

The ingestion route itself does **not** directly call Gemini; the Gemini call occurs later in the portal runtime.

## 4. Neon forensic evidence

Canonical Neon environment audited read-only:

- Project: `neon-sky-forest`
- Project ID: `holy-block-04720208`
- Branch: `main`
- Branch ID: `br-cold-cloud-anwml3lu`
- Database: `neondb`
- Schema: `public`

Relevant canonical tables confirmed:

- `pipeline_runs`
- `transcripts`
- `lessons`
- `pipeline_events`
- `evidence_candidates`
- `learning_signal_proposals`
- `teacher_insight_proposals`
- `review_tasks`
- `class_report_projections`
- `portfolio_projections`

For the six historical failures:

- historical PipelineRuns remain `failed`;
- historical transcripts remain present;
- `sourceFileId` values are unique;
- transcript-to-run relationships are intact;
- all six have a persisted `GeminiGenerationFailed` event;
- all six events record `provider=gemini`, `stage=prompt-1`, `httpStatus=403`;
- all downstream artifact counts are zero.

## 5. Laura — canonical historical record

- Historical PipelineRun: `cmtcqbiy800006cqasv3nsziu`
- Historical Transcript: `cmtcqbiyy00026cqafg8r788w`
- Lesson: `lesson_a3368991e6ba0c79`
- Source file: `1gvkGGRuzn-cHz4rrRVG0sXU_-hND_QKgHnmj2qnL534`
- Status: `failed`
- Error: `GEMINI_HTTP_ERROR` / HTTP 403
- Attempt: `1`
- Authority: `non_authoritative`
- Idempotency key: `drive:1gvkGGRuzn-cHz4rrRVG0sXU_-hND_QKgHnmj2qnL534`
- Evidence candidates: `0`
- Learning signals: `0`
- Teacher insights: `0`
- Review tasks: `0`
- Class reports: `0`
- Portfolio projections: `0`

The historical Laura record is intact.

A structurally valid retry can reuse the historical Transcript and Lesson without a schema migration, provided the new PipelineRun uses a new `id`, a new `idempotencyKey`, and an unused `attemptNumber` for that transcript.

However, explicit retry lineage (`retryOf`, `parentRunId`, etc.) is **not currently persisted**. `attemptNumber` can number attempts but does not identify the historical parent run.

## 6. Idempotency finding

There is no `UNIQUE(lessonId)` constraint in `pipeline_runs`.

Relevant constraints include:

- `pipeline_runs_idempotencyKey_key` — unique `idempotencyKey`;
- `pipeline_runs_transcriptId_attemptNumber_key` — unique `(transcriptId, attemptNumber)`;
- `transcripts_sourceFileId_key` — unique `sourceFileId`;
- `transcripts_pipelineRunId_key` — unique `pipelineRunId`.

Therefore:

**Reuse historical Transcript + same Lesson + new PipelineRun:** structurally possible.  
**Create another Transcript with the same sourceFileId:** blocked by `transcripts_sourceFileId_key`.  
**Preserve historical failed run:** possible and already intact.

## 7. Causality separation — DO NOT MERGE

These findings remain independent unless runtime evidence proves otherwise:

- Firebase `UNAUTHENTICATED`;
- Drive `ingest_http_500`;
- historical Drive `403`;
- historical `invalid_grant`;
- historical Gemini HTTP 403;
- retry/idempotency behavior;
- Apps Script runtime/trigger errors.

The Neon evidence does **not** show that Firestore authentication, Drive reconciliation, historical Drive errors, or Apps Script caused the six Gemini 403 failures.

The strongest current localization is:

`PORTAL/Vercel → Gemini provider = historical Prompt 1 HTTP 403`

while:

`Apps Script → ??? = NOT PROVEN`

## 8. Operational status / safety

As of this snapshot:

- **No data modified:** YES
- **No migration executed:** YES
- **No deployment executed:** YES
- **No trigger changed:** YES
- **No Apps Script code changed:** YES
- **No Laura retry executed:** YES
- **No GL-003 executed:** YES

`GL-003_SAFE_TO_EXECUTE = NO` in the forensic procedure because the procedure explicitly required stopping before execution and the provider health/Apps Script dependency picture is not fully proven.

Do not execute Laura retry merely because the database can structurally represent it. The provider path must first be proven healthy and the remaining pre-flight dependencies must be classified.

## 9. Where future agents must look

Use this file as the **first-read snapshot** for the Apps Script / Prompt 1 / Gemini investigation:

`docs/snapshot-apps-script-prompt1-gemini-2026-08-31.md`

Then consult, in this order:

1. `docs/google-drive-transcript-automation.md` — canonical Drive/transcript ingestion architecture and idempotency behavior.
2. `app/api/pipeline/ingest/route.ts` — ingestion boundary and pipeline entry.
3. `lib/pipeline/run.ts` — pipeline execution/orchestration and failure persistence.
4. `lib/pipeline/prompts.ts` — Gemini provider call and Prompt 1 generation behavior.
5. Neon `pipeline_runs`, `transcripts`, and `pipeline_events` — canonical persistence evidence for historical runs.
6. The actual Apps Script project identified above — **only after access is available**, to resolve the remaining UNKNOWN values for manifest, triggers, code and executions.

When checking source behavior relevant to this snapshot, prefer the audited production source/deployment SHA:

`43eda9442732887089a85d23111baa320ab04ca1`

Do not replace this snapshot with assumptions from a different deployment without recording the new SHA and evidence.

## 10. Current decision boundary

The investigation has crossed the point where repeating the same Neon schema/idempotency audit is useful. Those facts are recorded here.

The unresolved question is specifically:

> Does the real Apps Script project call only the PRIME portal ingestion/reconciliation path, or does it independently call Gemini / contain a runtime/trigger failure?

Until the actual Apps Script manifest, source, triggers and execution history are readable, the answer remains:

`NOT_PROVEN`

The historical Prompt 1/Gemini 403 remains localized by portal evidence to the portal-to-Gemini provider call.

**SNAPSHOT STATUS: CANONICAL FORENSIC CHECKPOINT — 2026-08-31**
