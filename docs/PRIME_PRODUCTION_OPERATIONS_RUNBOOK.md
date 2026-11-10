# PRIME Digital Hub — Production Operations Runbook

**Status:** Active code/runtime contract
**Product:** PRIME Digital Hub English-learning student dashboard
**Repository:** `alexmelloenglish-gif/prime-hub-portal`
**Production domain:** `https://www.primedigitalhub.com.br`

> The active dashboard architecture is Google Workspace → automation → Drive/Docs pipeline → Neon/PostgreSQL → PLIE → dashboard. Firebase Admin and Firestore are not dashboard runtime dependencies. Historical Firestore records and Firebase variables remain outside this code-only change and must not be deleted here.

## 1. Non-negotiable rules

| Area | Required behavior |
|---|---|
| Student isolation | Resolve only an authorized repository snapshot or an explicit authenticated profile; never substitute another learner. |
| Dashboard source | Keep `StudentDashboardState.source` for access compatibility, and use `dataStatus` to distinguish `neon/current`, `historical_snapshot/historical`, and `historical_snapshot/unavailable`. There is no hidden Firestore fallback. |
| Pipeline authority | Use Prisma/Neon projections and explicit review/publication gates for student-visible learning records. |
| Drive/Docs | Preserve Google Drive/Docs capture, `google-auth-library`, `@vercel/oidc`, and WIF for the pipeline identity. |
| Secrets | Keep credentials in managed secret storage; never commit or print secret values. |
| Deployment integrity | Work on an isolated branch and PR; do not force-push, merge, or alter production from this workflow. |

## 2. Active architecture

```text
Google Workspace / Drive / Docs
        ↓
OIDC/WIF-authenticated reconciliation
        ↓
Pipeline ingestion and review gates
        ↓
Neon/PostgreSQL via Prisma
        ↓
PLIE evidence/provenance projections
        ↓
Repository-backed dashboard with explicit source contract
```

The active Drive worker identity is:

```text
prime-drive-pipeline-worker@prime-hub-portal.iam.gserviceaccount.com
```

## 3. Dashboard data contract

- `lib/student-data.ts` loads authorized repository snapshots and merges published Prisma/Neon projections.
- `StudentDashboardState.source` remains `repository` or `preview` for the access contract. `StudentDashboardState.dataStatus` is the authority for freshness: `source: neon` plus `availability: current` means a published or verified Neon projection was read; `source: historical_snapshot` means the preserved repository record is being shown; `availability: unavailable` means the current Neon read failed and the snapshot must not be described as current.
- `lib/admin-dashboard.ts` returns the repository learner directory enriched with pipeline state from Prisma.
- Unknown profiles remain unavailable/preview; the application never reads or writes Firestore.
- Files named `data/students/*.firestore.json` are retained as historical local snapshots and fixtures.

The dashboard may preserve a historical snapshot for continuity, but it must display the historical or unavailable state whenever no current Neon projection is confirmed. The admin directory keeps historical report counts separate from `publishedReportCount`; a database error never converts a snapshot count into a published count.

## 4. Drive/Docs pipeline continuity

`lib/drive-reconciliation.ts` remains the active integration for Google Drive/Docs transcript discovery and uses `ExternalAccountClient` from `google-auth-library` plus `getVercelOidcToken` from `@vercel/oidc`. Preserve the GCP project number, WIF pool/provider, service-account bindings, webhooks, and cron configuration. Any infrastructure change requires a separate authorization.

## 5. Validation before publication

Run in the candidate branch:

```bash
npm ci
npm ls --all
npx --no-install prisma generate
npx --no-install prisma validate
npx --no-install tsc --noEmit
npm run student-dashboard:self-test
npm run build
npm audit --omit=dev
npm audit
```

Record exact results, warnings, advisory IDs, dependency paths, and limitations. Do not use `npm audit fix --force` indiscriminately or make unrelated major upgrades.

## 6. External infrastructure boundary

This repository change does not remove or alter Firebase variables, Firestore databases, historical records, Google service accounts, WIF resources, IAM bindings, OAuth configuration, Vercel secrets, webhooks, cron jobs, or production deployments. A separate infrastructure inventory is required before any such resource is retired.

## 7. Operational failure handling

- Missing authorized learner: preserve the explicit `preview`/unavailable state; never fall back to another learner.
- Missing pipeline data: report the bounded repository state and inspect Prisma/Neon connectivity.
- Drive/Docs failure: inspect OIDC/WIF audience, issuer, project number, service-account binding, and pipeline logs without exposing credentials.
- Build or type failure: fix only within the isolated code scope and rerun the affected checks.
