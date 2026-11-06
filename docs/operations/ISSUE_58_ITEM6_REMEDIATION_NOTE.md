# Issue 58 — Item 6 — Dependency remediation evidence

Status: **HIGH/CRITICAL PRODUCTION ADVISORIES REMEDIATED; 4 MODERATE PRODUCTION ADVISORIES REMAIN OPEN**

## Remediation

Remediation commit: `ca8e8692f15e907b8ade25619676e5943c788159` — `security(deps): remediate production advisories`.

Direct package changes:
- `@vercel/oidc`: 3.8.4 → 4.0.7
- `firebase-admin`: 13.x → 14.5.0
- `sharp`: 0.34.5 → 0.35.5
- resolved `next`: 15.5.29
- resolved `next-auth`: 4.24.15
- `postcss`: 8.5.32 via the root override

Notable resolved transitives:
- `websocket-driver` 0.7.5
- `@fastify/busboy` 3.2.5
- `@grpc/grpc-js` 1.14.7
- `protobufjs` 7.6.6
- `zod` 4.6.7
- `source-map-js` 1.2.2
- `nanoid` 3.3.20

The dependency job used non-forced `npm audit fix` plus explicit version updates; it did not invoke `npm audit fix --force`.

## Exact-head verification

The bot-authored dependency commit was subsequently validated by PR-synchronizing commits. The current candidate head at this checkpoint is `29beb6d9c6d0db1a3c48fd8cafcdcf461f4ccc8e`.

**Production dependency audit:** [GitHub Actions run #42175566066](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175566066), job `Production dependency audit` SUCCESS. Log summary:
```
PRODUCTION_AUDIT_SUMMARY {"info":0,"low":0,"moderate":4,"high":0,"critical":0,"total":4}
PRODUCTION_AUDIT_THRESHOLD {"critical":0,"high":0,"moderate":4,"low":0,"total":4}
Production dependency audit gate PASS
```
The audit job continues to print all advisories. Its pass criterion is explicitly zero critical/high production advisories, not zero advisories overall.

**Dependency remediation + full build:** same run #42175566066, job `Review and remediate production dependency advisories` SUCCESS. It ran:
- `npm ci`
- `npm audit --omit=dev --audit-level=high` PASS
- `npm run build` PASS, including TypeScript/lint and 28/28 static pages

**PR validation on exact head `29beb6d...`:**
- [Issue 58 — PRIME Engine validation #42175573256](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175573256) SUCCESS: Production audit, legacy retry, PostgreSQL shared retry, and provider health/fallback.
- [Golden Runtime Witness #42175573204](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175573204) SUCCESS.
- [Coordination Runtime Witness #42175573303](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175573303) SUCCESS.
- [Student Dashboard Contract #42175573134](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175573134) SUCCESS: TypeScript, Student Dashboard v1.0, canonical strict, G6 authority, Shared Learning Machine and Next build gates.

## Residual moderate advisories

The four production advisories are transitive and moderate:
- `glob` (AbortSignal cancellation bypass)
- `minimatch` (globparts amplification DoS)
- `rimraf` (transitive through glob)
- `google-gax` (transitive through rimraf)

They flow through the optional `@google-cloud/firestore-api` / `google-gax` dependency subtree. npm reports fix paths, but the compatible dependency path did not remove these four within the current reviewed manifest. No forced major override of the nested Firestore API subtree was applied because that could break a Google-generated client dependency contract without adequate runtime coverage.

**Item 6 remains PARTIAL/OPEN** until those moderate advisories are fixed with a compatible dependency path or explicitly accepted with a documented risk decision. Do not claim zero advisories.

## Boundaries

No Production secret, Production database, migration, learner record, deployment, merge, or `PIPELINE_AUTOMATION_FROZEN` setting was changed. All tests used disposable/synthetic CI infrastructure. Issue #58 remains OPEN.


## Final exact-head rerun

The corrected remediation note is present on final branch head `feab5a17c070ad88547a8c7dfb8316c62895ea33`. Exact-head CI passed:
- [Issue 58 validation #42175797922](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175797922): SUCCESS, including fresh Production dependency audit and full build.
- [Student Dashboard Contract #42175803749](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175803749): SUCCESS.
- [Golden Runtime Witness #42175803766](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175803766): SUCCESS.
- [Coordination Runtime Witness #42175803820](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175803820): SUCCESS.

On the final run the production tree remains at 4 moderate advisories and zero high/critical. The build and production high/critical audit gate pass. This is not a zero-advisory audit; Item 6 remains PARTIAL/OPEN pending disposition of the four moderate transitive advisories.
