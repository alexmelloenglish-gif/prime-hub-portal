# PRIME Digital Hub — Durable Access and Recovery Runbook

## Scope
This runbook covers recovery of the human administrator, Google Workspace/Drive/Docs access, Vercel OIDC/WIF, PostgreSQL/Neon, GitHub, and the Vercel deployment. The dashboard no longer uses Firebase Admin or Firestore at runtime. Historical Firestore records and Firebase credentials are external infrastructure inventory only.

## Canonical active resources

| Resource | Value |
|---|---|
| GitHub repository | `alexmelloenglish-gif/prime-hub-portal` |
| Production site | `https://www.primedigitalhub.com.br/` |
| Drive pipeline identity | `prime-drive-pipeline-worker@prime-hub-portal.iam.gserviceaccount.com` |
| WIF pool | `vercel-prod` |
| WIF provider | `vercel` |
| Meet recordings folder | `1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw` |
| Primary data store | Neon/PostgreSQL through Prisma |

## Recovery rules

1. Use two trusted human administrators with independent recovery factors; never share passwords.
2. Keep secrets in Vercel/Google-managed storage and never commit keys, tokens, cookies, or private credentials.
3. Preserve the Drive/Docs pipeline and its WIF/OIDC configuration.
4. Treat `data/students/*.firestore.json` as retained historical snapshots that are still read by the current dashboard code. Do not present their learning fields as current, and do not delete them as part of application recovery.
5. Do not delete databases, service accounts, WIF pools/providers, IAM bindings, webhooks, cron jobs, secrets, or external records in this code-only workflow.

## Application recovery checklist

1. Confirm the repository branch and commit intended for the change.
2. Run `npm ci`, Prisma generation/validation, TypeScript checks, self-tests, and `npm run build`.
3. Confirm identity authorization separately from learning-data freshness. `repository` identifies a retained profile; snapshot-derived learning data must be marked `historical`, never assumed current.
4. Confirm the admin dashboard labels snapshot levels and historical report counts as historical; published report counts must come only from Neon and remain unavailable when Neon cannot be queried.
5. Confirm Drive/Docs reconciliation still imports `google-auth-library` and `@vercel/oidc` through `lib/drive-reconciliation.ts`.
6. Review the exact diff and publish only the isolated branch; do not push directly to `main`.

## Historical Firestore/Firebase note

The former Firebase Admin module, Firestore dashboard route, and Firestore upsert utilities were removed from the repository. Do not revive or execute those paths as a response to a dashboard issue. Any future retirement or migration of Firestore data, Firebase variables, service accounts, or IAM resources requires a separate inventory and explicit authorization.

## Incident handling

If access is lost, use the second trusted administrator and the documented Google/Vercel/GitHub recovery mechanisms. If the Drive pipeline fails, inspect the WIF issuer, audience, project number, service-account binding, and pipeline logs without exposing secrets. If the dashboard lacks a learner profile, return to the explicit `preview`/`repository` contract; never substitute another learner's data.
