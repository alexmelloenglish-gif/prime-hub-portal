# Issue 58 - Item 6 - Dependency remediation note

Status: REMEDIATION APPLIED, NOT YET VERIFIED

Remediation commit: ca8e8692f15e907b8ade25619676e5943c788159 (github-actions[bot]).
Changed: package.json (3 additions, 3 deletions net 6/3) and package-lock.json.

Direct dependency changes visible in package.json:
- @vercel/oidc 3.8.4 -> 4.0.7 (major)
- firebase-admin ^13.8.0 -> 14.5.0 (major)
- sharp 0.34.5 -> 0.35.5
- overrides.postcss = $postcss added

Not changed in package.json ranges: next ^15.0.0, next-auth ^4.24.0 (any fix depends on lockfile resolution).

Why this commit exists: the remediation commit was authored by github-actions[bot] using GITHUB_TOKEN, and GitHub does not start new workflow runs for pushes made with GITHUB_TOKEN. No check runs were reported for that head, so the audit and build were not executed against it.

Required before Item 6 can be marked DONE, on the exact head SHA:
1. npm ci succeeds.
2. npm audit --omit=dev --audit-level=high exits 0 (record remaining moderate/low, if any).
3. Full build (npm run build) passes.
4. Issue 58 workflows and Golden Runtime Witness pass.
5. Compatibility review of firebase-admin 14 and @vercel/oidc 4 majors against their call sites.

Until these are recorded with run URLs, Item 6 stays OPEN.
