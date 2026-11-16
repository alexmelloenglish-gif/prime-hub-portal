# PRIME — Dependency and Vulnerability Management Policy

**Applies to:** npm production dependencies, development dependencies and GitHub Actions.  
**Maintenance mechanism:** Dependabot configuration in PR #106.  
**Execution record:** Issue #58, Security/dependency lane.

## Severity and response

| Finding | Required response |
|---|---|
| Critical, remotely exploitable in a production path, or known exploited | Immediate triage and mitigation; block release/merge until patched, removed, or a documented compensating control is approved by the owner/security reviewer. |
| High in a production dependency or reachable runtime path | Fix in the current maintenance cycle; do not release a new affected surface. A temporary exception requires a named owner, scope, compensating control and expiry date. |
| Moderate in a production dependency | Fix in the next planned maintenance cycle; expedite if reachable through user input, authentication, file parsing or data access. |
| Low, development-only, or not reachable at runtime | Record package path, exploitability rationale, fix availability and next review date. Keep monitoring; do not call it fixed only because it is dev-only. |
| No upstream fix | Record vulnerable path and affected functionality; apply a tested mitigation or disable the affected path; set a dated re-review. |

Severity alone is not a complete risk decision. Reachability, runtime/dev classification, fix availability, exposed functionality and regression risk must be recorded.

## Required advisory matrix

Every report must include package name and installed version; direct/transitive dependency path; production/development classification; advisory ID and affected version range; severity and CVSS when supplied; patched version or `fixAvailable`; runtime reachability rationale; selected action, reviewer, exact SHA, tests and resulting status.

Use both `npm audit --json` and `npm audit --omit=dev --json`. A full-install aggregate count is not a production-only risk matrix.

## Maintenance procedure

1. Run `npm ci` against the committed lockfile.
2. Generate and archive full and production-only audit reports.
3. Classify each advisory with the matrix above.
4. Update only compatible packages; avoid `npm audit fix --force` and broad major upgrades without an isolated compatibility plan.
5. Run TypeScript, provider, retry, canonical/G6, student-dashboard, pedagogy and Next build gates.
6. Review the exact PR SHA and Vercel Preview before merge.
7. After release, record deployed SHA and fresh audit comparison.
8. Re-run weekly via Dependabot and the scheduled audit workflow.

## Baseline and honesty boundary

An earlier `npm ci` output reported 37 vulnerabilities: 1 low, 17 moderate, 16 high and 3 critical on the PR #105 candidate. This is an historical aggregate from that checkout, not a current advisory matrix. PR #106 configures Dependabot; it does not fix any advisory. A fresh current-main audit is required before making resolved-package or current-severity claims.