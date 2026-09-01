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

The actual Apps Script source, `appsscript.json`, triggers and execution history could not be inspected in the prior audit because the available Google Apps Script/Gmail credentials lacked the required scopes, and the browser session was authenticated as a different account. Therefore the following remain **UNKNOWN**:

- runtime version;
- trigger function/frequency/executing account;
- whether `processPipeline` exists in the actual Apps Script;
- whether Apps Script calls the portal endpoint;
- whether Apps Script calls Gemini directly;
- Apps Script execution history;
- whether V8 migration is required.

Do **not** infer `DEPRECATED_ES5` merely from historical runtime discussion. It must be read from the actual manifest.

## 3. Portal/GitHub evidence at audited deployment SHA

Audited deployment/source SHA:

`43eda9442732887089a85d23111baa320ab04ca1`

The repository establishes:

`/api/pipeline/ingest`
→ validates the pipeline secret
→ parses the ingestion payload
→ calls `processLessonTranscript()`
→ pipeline runtime reaches `runPromptOne()`
→ `runPromptOne()` invokes the Gemini generation layer
→ Gemini `generateContent`

The Gemini generation implementation calls the Google Generative Language API using:

- `GOOGLE_AI_STUDIO_API_KEY` as the API credential;
- `PRIME_PIPELINE_MODEL` as the configured model, with the code fallback documented in the audited source;
- `x-goog-api-key` for the provider request.

The ingestion route itself does **not** directly call Gemini; the Gemini call occurs later in the portal runtime.

## 4. Neon forensic evidence

Canonical Neon environment audited read-only:

- Project: `neon-sky-forest`
- Project ID: `holy-block-04720208`
- Branch: `main`
- Branch ID: `br-cold-cloud-anwml3lu`
- Database: `neondb`
- Schema: `public`

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
- Evidence candidates: `0`
- Learning signals: `0`
- Teacher insights: `0`
- Review tasks: `0`
- Class reports: `0`
- Portfolio projections: `0`

The historical Laura record is intact.

A structurally valid retry can reuse the historical Transcript and Lesson without a schema migration, provided the new PipelineRun uses a new `id`, a new `idempotencyKey`, and an unused `attemptNumber` for that transcript.

Explicit retry lineage (`retryOf`, `parentRunId`, etc.) is not currently persisted.

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
- Apps Script runtime/trigger errors;
- Cloud Billing / Payments restriction.

The Neon evidence does **not** show that Firestore authentication, Drive reconciliation, historical Drive errors, or Apps Script caused the six Gemini 403 failures.

The strongest current localization is:

`PORTAL/Vercel → Gemini provider = historical Prompt 1 HTTP 403`

while:

`Apps Script → ??? = NOT PROVEN`

## 8. NEW BILLING / GEMINI CHECKPOINT

A separate audited report has now been incorporated into the operational snapshot.

Reported isolated Gemini healthcheck result:

```text
HTTP 403
PERMISSION_DENIED
Your project has been denied access. Please contact support.
```

Reported Cloud Billing setup failure:

```text
OR_BACR2_59
Unable to complete billing setup.
Unable to configure your account.
```

The report also states that the previously used billing account is closed and is not currently available as an active account for the project.

Current operational state adopted from that audit:

```text
GOOGLE_CLOUD_BILLING = BLOCKED
BILLING_SETUP = FAILED / OR_BACR2_59
ACTIVE_BILLING_ACCOUNT_FOR_PROJECT = NO
GEMINI_PROVIDER_ACCESS = FAIL
CURRENT_GEMINI_RESULT = 403 PERMISSION_DENIED
```

This is a **separate provider/infrastructure blocker**. It does not retroactively prove that Apps Script caused the historical Prompt 1 403.

This repository is public; no payment-card data, full financial identifiers, API keys, tokens, passwords or other secrets are stored here. Detailed billing evidence belongs in the private Google Cloud/Payments environment.

## 9. Operational status / safety

As of this snapshot:

- **No data modified:** YES
- **No migration executed:** YES
- **No deployment executed:** YES
- **No trigger changed:** YES
- **No Apps Script code changed:** YES
- **No Laura retry executed:** YES
- **No GL-003 executed:** YES

```text
LAURA RETRY = BLOCKED
GL-003 = BLOCKED
FULL PIPELINE = BLOCKED
```

The current blocker is the reported Cloud Billing / Gemini provider access failure. Do not execute a retry until the provider health gate passes and the remaining retry dependencies have been classified.

## 10. Where future agents must look

Use this file as the **first-read snapshot** for the Apps Script / Prompt 1 / Gemini investigation:

`docs/snapshot-apps-script-prompt1-gemini-2026-08-31.md`

Then consult, in this order:

1. `docs/PRIME_FORENSIC_SNAPSHOT_2026-08-31.md` — canonical cross-layer forensic state and current blocker.
2. `docs/google-drive-transcript-automation.md` — canonical Drive/transcript ingestion architecture.
3. `app/api/pipeline/ingest/route.ts` — ingestion boundary and pipeline entry.
4. `lib/pipeline/run.ts` — pipeline execution/orchestration and failure persistence.
5. `lib/pipeline/prompts.ts` — Gemini provider call and Prompt 1 generation behavior.
6. Neon `pipeline_runs`, `transcripts`, and `pipeline_events` — canonical persistence evidence for historical runs.
7. The actual Apps Script project identified above — **only after access is available**, to resolve the remaining UNKNOWN values for manifest, triggers, code and executions.

When checking source behavior relevant to this snapshot, prefer audited Production source/deployment SHA `43eda9442732887089a85d23111baa320ab04ca1` unless a newer verified deployment is explicitly recorded.

## 11. Current decision boundary

The Neon schema/idempotency audit is complete for this checkpoint and should not be repeated without new evidence.

The historical Apps Script association remains unresolved at source/trigger level, while the current provider health result and Billing setup state are recorded as the active operational blocker.

The next permitted investigation is to resolve the Cloud Billing / Gemini access block, then re-run only the minimal provider healthcheck. No Laura retry or GL-003 execution is authorized by this snapshot.

**SNAPSHOT STATUS: CANONICAL FORENSIC CHECKPOINT — BILLING/GEMINI BLOCKER — 2026-08-31**
