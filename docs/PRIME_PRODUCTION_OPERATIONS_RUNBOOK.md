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
| Identity/access source | `repository` identifies an authorized learner profile; it does not certify that snapshot-derived learning fields are current. Unknown profiles remain `preview`. |
| Learning-data freshness | Snapshot-backed composites are explicitly `historical` until all displayed learning fields are independently sourced from verified, published Neon projections. |
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
- `StudentDashboardState.source` is only `repository` or `preview`.
- `lib/admin-dashboard.ts` returns the repository learner directory enriched with pipeline state from Prisma.
- Unknown profiles remain unavailable/preview; the application never reads or writes Firestore.
- Files named `data/students/*.firestore.json` are retained as historical local snapshots and fixtures.

## 4. Drive/Docs pipeline continuity

`lib/drive-reconciliation.ts` remains the active integration for Google Drive/Docs transcript discovery and uses `ExternalAccountClient` from `google-auth-library` plus `getVercelOidcToken` from `@vercel/oidc`. Preserve the GCP project number, WIF pool/provider, service-account bindings, webhooks, and cron configuration. Any infrastructure change requires a separate authorization.

## 5. Validation before publication

Run in the candidate branch. The successful build/self-tests do not substitute for Neon integration tests or a proof that each displayed field has published provenance:

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

Record exact results, warnings, advisory IDs, dependency paths, and limitations. The PR dependency gate compares the production audit against the exact base commit and fails on new advisories, newly vulnerable install paths, or severity increases. A passing delta is not a clean audit: pre-existing findings remain open and require separate remediation. Do not use `npm audit fix --force` indiscriminately or make unrelated major upgrades.

## 6. External infrastructure boundary

This repository change does not remove or alter Firebase variables, Firestore databases, historical records, Google service accounts, WIF resources, IAM bindings, OAuth configuration, Vercel secrets, webhooks, cron jobs, or production deployments. A separate infrastructure inventory is required before any such resource is retired.

## 7. Operational failure handling

- Missing authorized learner: preserve the explicit `preview`/unavailable state; never fall back to another learner.
- Missing pipeline data or Neon connectivity: keep the profile marked historical, disclose the limitation, and do not present snapshot-derived levels, attendance, priorities or reports as current.
- Drive/Docs failure: inspect OIDC/WIF audience, issuer, project number, service-account binding, and pipeline logs without exposing credentials.
- Build or type failure: fix only within the isolated code scope and rerun the affected checks.
