# PRIME Legacy Pipeline Freeze — 2026-09-11

**Status:** ACTIVE FREEZE

The previous transcript automation is intentionally frozen while canonical student projections and dashboard references are repaired.

## Frozen entry paths

- Vercel Cron `/api/cron/drive-transcripts` — schedule removed from `vercel.json`; route returns a frozen response when called with valid cron authorization.
- Google Workspace Events / Pub/Sub webhook `/api/webhooks/drive-events` — authenticated events are acknowledged with `204` but do not trigger reconciliation, preventing a provider retry storm.
- Transcript ingestion `/api/pipeline/ingest` — hard blocked by the central pipeline freeze guard.
- Admin retry `/api/admin/pipeline/retry` — hard blocked by the central pipeline freeze guard.
- Manual Drive reconciliation `/api/admin/process-drive` — hard blocked during the audit window.

## Preservation rule

No historical PipelineRun, Transcript, Lesson, ClassReportProjection or PortfolioProjection record is deleted or rewritten as part of this freeze. Laura's historical failures remain evidence of the behavior of the retired automation.

## Firestore publication relic

The former Firestore student-projection publish/verify endpoints and publisher module are retired as part of the canonical dashboard repair. Firestore remains frozen and is not part of the active production path.

## Unfreeze rule

Do not reactivate any legacy trigger after this audit. A replacement automation must be designed separately with provider/model/cost treated as implementation choices behind the PRIME evidence and transformation contracts.
