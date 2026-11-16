# Shared Learning Machine — Retry API Contract

**Contract version:** `shared-runner-v1`  
**Machine version:** `prime-learning-machine-v1`  
**API:** `POST /api/admin/pipeline/retry`  
**Implementation authority:** `lib/pipeline/run.ts::retryFailedPipelineRun`  
**HTTP adapter:** `app/api/admin/pipeline/retry/route.ts`

## Request

The route accepts a JSON object with:

| Field | Required | Meaning |
|---|---:|---|
| `pipelineRunId` | Yes | Exact persisted run being targeted. It must be the latest attempt for its preserved Transcript. |
| `sourceFileId` | No | Additional source identity assertion. When supplied, it must match the Transcript already linked to the targeted run. |

The requester is never accepted from the body. It is derived from the authenticated server session.

## Authorization and validation

1. Same-origin mutation check must pass.
2. A valid NextAuth session is required.
3. Only an administrator may call the route.
4. JSON must be an object; `pipelineRunId` must be a non-empty string; optional `sourceFileId` must be a string.
5. The requested run and linked Transcript must exist.
6. The requested run must still be the latest attempt for that Transcript.
7. The run must be `failed`. `completed` and `processing` are not retryable through this endpoint.

## State semantics

| Existing state / mode | Contractual behavior |
|---|---|
| Legacy `FAILED` | Create a new PipelineRun with the next attempt number. Preserve the old run and the same Transcript/Lesson/source identity. |
| Shared Machine `FAILED` | Resume the same PipelineRun and `normalizedRunIdentity`; claim is conditional so only one concurrent caller can resume protected work. |
| `COMPLETED` | Do not retry. Return duplicate/skip semantics from the runner or reject a stale/non-eligible target. |
| `PROCESSING` | Do not start another execution. Return duplicate/in-progress semantics or reject a stale target. |
| Transcript exists without a PipelineRun | This is intake/reconciliation behavior, not a manual retry request. Create attempt 1 against the existing immutable Transcript; do not recreate or rewrite the Transcript. |

A source being seen is not proof it was successfully processed. A retry is not an overwrite. A new legacy attempt is not a new lesson.

## Result envelope

Accepted runner operations return the persisted run result:

```json
{
  "pipelineRunId": "persisted-run-id",
  "status": "failed | processing | awaiting_teacher_authority | awaiting_review | awaiting_publication_review | completed | not_proven",
  "duplicate": false,
  "errorCode": "optional-stable-run-error-code"
}
```

- Legacy retry returns the new attempt's ID.
- Shared retry returns the same durable PipelineRun ID.
- A result with `status: failed` is a persisted execution failure, not a transport success. The client must display the run's terminal state and stable `errorCode`; it must not blindly start another retry.
- A repeated request for an already claimed Shared run is a duplicate and must not repeat protected work.

## HTTP errors

| HTTP | Error code | Meaning |
|---:|---|---|
| 400 | `invalid_json`, `invalid_request_body`, `pipelineRunId_required`, `sourceFileId_must_be_a_string` | Request contract violation |
| 401 | `authentication_required` | No authenticated session |
| 403 | `administrator_access_required` | Authenticated caller is not an administrator |
| 404 | `pipeline_run_not_found` | Target run or linked Transcript does not exist |
| 409 | `pipeline_retry_conflict` | Stale target, non-FAILED state, changed latest attempt, source mismatch, or missing Shared identity/authority prerequisite |
| 502 | `pipeline_provider_unavailable` | Provider failure raised before a durable retry result is returned |
| 500 | `pipeline_retry_failed` | Unexpected server failure |

## Idempotency and audit

- Shared execution identity is deterministic and protected by a unique database constraint.
- Shared retry uses a conditional `FAILED → PROCESSING` claim; one concurrent retry wins.
- Legacy retry preserves the previous attempt and increments the attempt number.
- `PipelineRetryRequested` records requester, previous run, retry mode and resume point.
- The Transcript is reconstructed from its persisted content before identity is recomputed; a later Drive revision cannot silently replace the processed content.

## Definition of done for future changes

A retry change is not complete until all of the following pass on the exact candidate SHA:

- Legacy FAILED → next attempt; previous run unchanged; same Transcript/Lesson; one increment.
- Shared FAILED concurrent retry → one claim winner; loser is duplicate; one protected stage execution.
- COMPLETED replay → no provider call and no new run.
- PROCESSING replay → no provider call and no new run.
- Orphan Transcript → attempt 1 on the same Transcript; one source/lesson identity; stored content/hash unchanged.
- Exact API auth, request validation, stale-target and error-code contract tests.
- Provider provenance and retry audit event read-back.
- Student Dashboard Contract, TypeScript, canonical/G6, Shared Machine, Golden Runtime Witness and Vercel Preview gates pass.
- Production rollout is read back by deployment SHA before any real learner retry.

## Current implementation notes

The runtime route is administrator-only. The retry matrix and orphan case are exercised against disposable PostgreSQL by `scripts/pipeline-retry-state-witness.ts`; the route contract is pinned by `scripts/pipeline-attempts-self-test.mjs`. Production learner retries remain governed separately by Issue #6 (GL-003).
