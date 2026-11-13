# PRIME — Drive event trigger

## Purpose

The production reconciliation cron remains the safety net. The primary low-latency path is a Google Workspace Events subscription for the canonical Drive folder, delivered through Google Cloud Pub/Sub to:

`POST /api/webhooks/drive-events`

The webhook is authenticated with a Pub/Sub OIDC JWT and fails closed unless both `DRIVE_EVENTS_PUBSUB_AUDIENCE` and `DRIVE_EVENTS_PUBSUB_SERVICE_ACCOUNT` are configured.

## Runtime flow

Google Drive file added/moved into the monitored folder
→ Google Workspace Events subscription
→ Pub/Sub topic
→ authenticated push
→ `/api/webhooks/drive-events`
→ `reconcileDriveTranscripts()`
→ `/api/pipeline/ingest`
→ existing PRIME pipeline

The existing daily Vercel cron at `/api/cron/drive-transcripts` remains enabled as reconciliation fallback.

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
8. Leave the daily cron enabled as the recovery/reconciliation path.

## Security rules

- Never put a secret, token, refresh token, private key, or OIDC credential in this document.
- Never approve PRIME human review automatically from the webhook.
- Never bypass `PRIME_PIPELINE_INGEST_SECRET`.
- Treat Pub/Sub redelivery as normal; rely on existing `sourceFileId`/idempotency protection.


## 2026-11-11 — live schedule and freeze correction

This dated correction supersedes only the earlier statements that describe the daily Drive cron as enabled. It preserves the historical architecture notes above.

On current `main` baseline `fa2e0282af9d358a8580f5316e619023977de772`:

- `vercel.json` (blob `25684120f32d9e190c36d2a19038455c0eb8c506`) schedules only `/api/cron/meet-attendance` at `0 4 * * *`. There is no scheduled `/api/cron/drive-transcripts` entry.
- The Drive cron route exists at `app/api/cron/drive-transcripts/route.ts` (blob `d68d823d63a9e42b99ce9a64f858ea14669c3450`) but returns HTTP 503 when the pipeline freeze is active.
- `lib/pipeline-freeze.ts` (blob `76bf178b1cd03dd36e7e1abbf3d3e1f1b95e731f`) sets `PIPELINE_AUTOMATION_FROZEN = true`.
- The authenticated Drive webhook (blob `151f31422148540af9b09ec2573fe55aac3d3d1a`) acknowledges a verified Pub/Sub push with HTTP 204 while frozen and logs the acknowledgement; this branch does not create a durable event receipt.
- The secret-protected automatic ingest route (blob `1309fda6604c07e0b11b6d024a2d3bd312ba54c8`) returns HTTP 503 before invoking the shared runner while frozen.
- The manual Admin route (blob `997340f5c20000fe58288e280ba14ec5726f41bf`) requires a NextAuth session and administrator authorization, but does not consult the global freeze constant. It accepts either a canonical `sourceFileId` or a transcript payload fallback. This is implementation behavior, not execution authorization; do not use the payload fallback to assemble a real-source witness.

Issue #112 remains the active operational acceptance tracker. Its current hold does not authorize a Production trigger, OAuth reauthorization, database/learner/attendance mutation, deployment, merge, Teacher Authority action, projection change, or unfreeze. Keep `PIPELINE_AUTOMATION_FROZEN=true`; do not invoke the webhook, cron, ingest, or manual Admin route under this monitoring task.
