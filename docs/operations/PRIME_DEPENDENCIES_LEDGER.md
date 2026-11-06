# PRIME Dependencies Ledger

**Scope:** production dependency risk for PRIME Digital Hub / PRIME Learning Engine.  
**Owner:** engineering release process.  
**Update rule:** append one dated release record from the CI artifact; do not replace a measured result with an estimate.

## Critical runtime dependency inventory

| Package / subsystem | Runtime purpose | Release control |
|---|---|---|
| next | Next.js application runtime and API routes | Production audit + build + route smoke tests |
| react, react-dom | Rendering/runtime | Keep versions aligned; production audit + build |
| @prisma/client | Database access for pipeline, Teacher Authority and account relations | Prisma generate + disposable-Postgres migrations/witness |
| next-auth, @next-auth/prisma-adapter | Google sign-in/session and persisted role resolution | Auth contract tests; never treat a redirect as authenticated acceptance |
| firebase-admin | Firebase/Firestore server access | No credentials in tests; staging credential health only |
| google-auth-library | Google OAuth/API client used by Meet/Drive integrations | OAuth scope/token checks in controlled staging |
| @vercel/oidc | Vercel workload identity token integration | Verify Preview/Production trust boundaries |
| sharp | Server image processing | Production audit + deployment build |
| recharts | Dashboard chart rendering | Build and dashboard contract tests |

## Vulnerability record policy

The audit entry point is npm run audit:prime-engine, implemented by scripts/audit-prime-engine.mjs. It runs:

    npm audit --omit=dev --json

It writes both:
- artifacts/prime-engine-npm-audit.json — machine-readable release evidence;
- artifacts/prime-engine-npm-audit.md — reviewer-readable severity/package inventory.

The audit is production-only. Development/test dependency advisories are intentionally excluded from this particular gate and must not be represented as production findings.

### Historical baseline — 2026-11-05

The previous operational handoff recorded a full dependency-tree result of **35 advisories**: 1 low, 10 moderate, 21 high and 3 critical. That figure is a historical whole-tree snapshot, not a verified npm audit --omit=dev result, and does not identify affected packages in this ledger. It must not be copied into a production-only release count.

### Current release snapshot

| Field | Value |
|---|---|
| Measurement date | Pending first CI execution of audit:prime-engine |
| Exact commit | Pending |
| Production advisories | OPEN / NOT MEASURED |
| JSON artifact | artifacts/prime-engine-npm-audit.json |
| Markdown artifact | artifacts/prime-engine-npm-audit.md |
| Lockfile remediation | OPEN; no dependency version or lockfile change is included in this test/governance patch |

## Remediation / acceptance decisions

1. No vulnerability is accepted merely because it is transitive, non-exploited in a smoke test, or has no available fix.
2. Each accepted advisory must name the package, advisory URL, affected range, production exposure, mitigation, reviewer and expiry/revisit date.
3. Each correction must update package.json and package-lock.json together, then pass npm ci, npm run build, PRIME regression tests and a fresh production-only audit.
4. npm audit fix --force is prohibited as an unattended release action.
5. The CI audit is a release gate: any reported production advisory produces a non-zero exit code and remains OPEN until reviewed.

## Release update template

Append for every release:

    Date:
    Commit:
    CI workflow run:
    Critical / High / Moderate / Low / Total:
    Affected packages:
    Fix available:
    PRs / lockfile commits:
    Decision (FIXED / MITIGATED / ACCEPTED / OPEN):
    Reviewer and revisit date:
    Artifact:


### Measured production-only inventory — 2026-11-06

The first CI-only \`npm audit --omit=dev\` measured **27 affected production packages**. This is distinct from npm ci's full-tree 37-vulnerability message, which includes development dependencies.

| Severity | Count | Affected package names |
|---|---:|---|
| Critical | 3 | next, next-auth, websocket-driver |
| High | 13 | @fastify/busboy, @grpc/grpc-js, @vercel/cli-config, @vercel/oidc, fast-xml-builder, form-data, nanoid, node-forge, postcss, protobufjs, sharp, source-map-js, zod |
| Moderate | 10 | @google-cloud/firestore, @google-cloud/storage, @protobufjs/utf8, firebase-admin, gaxios, google-gax, postcss-selector-parser, retry-request, teeny-request, uuid |
| Low | 1 | @tootallnate/once |

**Decision:** OPEN — no advisory has been accepted or marked fixed. The CI audit workflow failed intentionally because the production dependency tree is not clean, and successfully uploaded the detailed JSON/Markdown artifact. Several available fixes require major versions (including next-auth, @vercel/oidc, firebase-admin and sharp); those require separate compatibility, build and regression work before lockfile changes are accepted.

The audit utility now also embeds the workflow's exact \`GITHUB_SHA\` in each generated report. The report embeds the exact checked-out SHA (`git rev-parse HEAD`), not the GitHub pull-request merge ref.
