# PRIME — Drive event trigger

## Purpose

The Drive reconciliation endpoint exists, but the current repository configuration does not schedule it. The intended low-latency path is a Google Workspace Events subscription for the canonical Drive folder, delivered through Google Cloud Pub/Sub to. This describes the intended architecture; it does not prove that the Workspace Events subscription or Pub/Sub push is configured or active:

`POST /api/webhooks/drive-events`

The webhook is authenticated with a Pub/Sub OIDC JWT and fails closed unless both `DRIVE_EVENTS_PUBSUB_AUDIENCE` and `DRIVE_EVENTS_PUBSUB_SERVICE_ACCOUNT` are configured.

## Intended runtime flow (not independently proven active)

Google Drive file added/moved into the monitored folder
→ Google Workspace Events subscription
→ Pub/Sub topic
→ authenticated push
→ `/api/webhooks/drive-events`
→ `reconcileDriveTranscripts()`
→ `/api/pipeline/ingest`
→ existing PRIME pipeline

The route `/api/cron/drive-transcripts` exists but is **not scheduled** in the current `vercel.json`. That file schedules only `/api/cron/meet-attendance` at `0 4 * * *`. Do not describe the Drive cron as enabled.

## Required Production configuration

Set these sensitive/runtime variables in Vercel Production without putting their values in source control:

- `DRIVE_EVENTS_PUBSUB_AUDIENCE`: exact audience configured on the authenticated Pub/Sub push subscription.
- `DRIVE_EVENTS_PUBSUB_SERVICE_ACCOUNT`: email of the user-managed service account attached to the Pub/Sub push subscription.

No Drive access token or JSON service-account key is stored by this webhook. The Drive worker continues to use Vercel OIDC → WIF → the existing dedicated Drive service account.

## Google Cloud setup

In the canonical Google Cloud project, create one Pub/Sub topic and one authenticated push subscription. The Workspace Events subscription should monitor the canonical Drive folder and request `google.workspace.drive.file.v3.created` (and, if desired for files moved into the folder, `google.workspace.drive.file.v3.moved`). Configure the notification endpoint as the Production webhook URL.

The Pub/Sub push subscription must use OIDC authentication. The webhook validates the JWT signature, audience, issuer, email and `email_verified` claim.

Do not create a second WIF pool/provider or a second Drive worker identity. Reuse the existing PRIME WIF and `prime-drive-pipeline-worker` for Drive access.

## Validation

1. Confirm the Workspace Events subscription is ACTIVE.
2. Confirm the Pub/Sub push subscription is attached to the expected topic and authenticated.
3. Add one eligible Google Docs transcript to the canonical folder.
4. Confirm one webhook invocation in Vercel Production.
5. Confirm exactly one internal `POST /api/pipeline/ingest` for that `sourceFileId`.
6. Confirm one new `pipeline_run` and the expected downstream artifacts in Neon.
7. Repeat/re-deliver the same event and confirm idempotency: no duplicate `pipeline_run`.
8. Do not assume a Drive cron is enabled. Adding a Drive schedule requires a separate approved change.

## Security rules

- Never put a secret, token, refresh token, private key, or OIDC credential in this document.
- Never approve PRIME human review automatically from the webhook.
- Never bypass `PRIME_PIPELINE_INGEST_SECRET`.
- Treat Pub/Sub redelivery as normal; rely on existing `sourceFileId`/idempotency protection.


## Current code and authority boundary — 2026-11-10

This section supersedes the stale cron-activation wording above; earlier architecture notes remain historical.

- `lib/pipeline-freeze.ts` sets `PIPELINE_AUTOMATION_FROZEN = true`.
- The authenticated Drive webhook returns HTTP 204 while frozen and logs the acknowledgement; it does not create a durable event receipt.
- `GET /api/cron/drive-transcripts` exists, is CRON-secret protected, and returns HTTP 503 while frozen. It is not listed in `vercel.json`.
- `POST /api/pipeline/ingest` verifies `PRIME_PIPELINE_INGEST_SECRET` and returns HTTP 503 before calling the shared runner while frozen.
- The existing manual Admin route requires a NextAuth session and administrator authorization, but does not consult the global freeze constant. It accepts either a canonical `sourceFileId` (then prepares the Drive source) or a transcript payload parsed from the request body. This alternate payload path is not authorization to run; do not use it to manually assemble a real-source witness.
- `lib/drive-reconciliation.ts` attempts `moveToProcessed()` for an individually accepted, non-duplicate ingest response. HTTP acceptance is not proof of a completed Learning Machine run. The archival side effect remains an unresolved policy decision; preserve the original source unless separately approved.
- Issue #112 currently keeps operational Gates A/B/C BLOCKED / NOT STARTED and does not authorize Production triggers, OAuth reauthorization, database/learner/attendance mutation, deployment, merge, or unfreeze.

Do not invoke the webhook, cron, ingest, or manual Admin route as part of this documentation task. The freeze remains unchanged.
