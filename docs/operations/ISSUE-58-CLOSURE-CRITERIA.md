# Issue #58 — PRIME Learning Engine Closure Criteria

**Authority:** Issue #58 is the operational record. This document is the closure gate; it does not create a parallel backlog. The canonical handoff and execution ledger remain the historical/current state records.  
**Rule:** Issue #58 stays OPEN until every criterion below has its own exact-SHA or production/runtime evidence.

## 1. Shared Engine and retry

**Required evidence:**
- Retry API contract is explicit for request, authorization, result envelope, allowed retry state, stale target and error mapping.
- Disposable PostgreSQL witness passes legacy FAILED, Shared FAILED concurrency, COMPLETED skip, PROCESSING no-duplicate and orphan Transcript first-attempt preservation.
- Same-source and same-lesson invariants are read back; old attempts remain unchanged.
- G5-approved Shared Machine continuation publishes the allowed communication projection, persists the final manifest and completes the run exactly once.
- GitHub Actions and Vercel Preview pass on exact SHA; post-merge Production deployment is READY and read back.

**Current candidate work:** retry contract, request validation, Teacher Authority finalizer and expanded witnesses are in the execution branch for review. PR #105 already integrated the orphan retry fix to main at `c7b63aad7f16b506d5856791dd2a83ce840ece46`; that integration is not equivalent to completion of the new API/authority-finalization extension.

## 2. Teacher Authority and GL-003

**Required evidence:**
- GL-003 classification and one-shot gates follow [Issue #6](https://github.com/alexmelloenglish-gif/prime-hub-portal/issues/6).
- Exact payload hash, persisted reviewer ID/role, decision timestamp, reason and durable run event are read back.
- G2 canonicalization, G3 verification, G4 Portfolio projection and G5 Learning Intelligence projection are each verified.
- Approved communication/publication is read back; final manifest binds source, provider provenance, teacher decision, canonical record, projections and final run status.
- The real GL-003 source is retried exactly once only after Production release, Gemini health, source preflight and explicit freeze/governance release.

**Current status:** criteria are written in `docs/architecture/GL-003-TEACHER-AUTHORITY-CONTRACT.md`. Candidate code adds a persisted-role, exact-payload Teacher Authority service and finalization after G2–G5. The automated witness is synthetic/disposable; it is not a real teacher browser session and does not complete GL-003. Real GL-003 remains BLOCKED by provider/owner gates.

## 3. Provider health and integrations

**Required evidence:**
- Admin-only Gemini and Google Meet health probes expose sanitized status only.
- Provider attempts are recorded and provider failover is bounded to configured providers.
- Provider exhaustion produces no false learner output and a supervised retry path.
- Meet organizer scope is present, the bounded Meet API probe passes, and a bounded attendance reconciliation/read-back is idempotent.
- Runtime failure alerts reach an actively monitored channel, not merely an undocumented log.

**Current status:** Gemini healthcheck exists with the corrected model precedence; candidate code adds a Meet healthcheck route and provider-health regression assertions. The model gateway already records sequential provider attempts and failure provenance. Candidate UI explains a safe provider-failure state to the teacher and leaves learner output unchanged. Vercel/external alert delivery and real Meet organizer re-consent/runtime reconciliation remain OPEN/BLOCKED.

## 4. Authentication and learner isolation

**Required evidence:**
- Anonymous dashboard/API request returns 401/redirect.
- Authenticated learner A resolves only learner A; an A→B request returns ABSENT/403 and cannot override authenticated identity.
- Explicit guardian/responsible-account relation resolves only the linked learner; absent, ambiguous or unobservable relations fail closed.
- Teacher and administrator permissions are verified independently from student/responsible-account permissions.
- Login, role resolution and negative cross-learner cases pass in a real authorized Production/Preview session in addition to synthetic database tests.

**Current status:** candidate code centralizes fail-closed dashboard target selection; a route-boundary self-test verifies non-admin target substitution is ignored; a disposable PostgreSQL G6 witness verifies AUTHORIZED, cross-learner ABSENT and ambiguous NOT_OBSERVABLE results. The dashboard is still in a legacy identity-compatibility transition; this witness alone does not prove that every Production read path is consuming `AccountLearnerRelation`. Real Google login and two approved learner test accounts remain NOT VERIFIED.

## 5. Dependencies and vulnerabilities

**Required evidence:**
- Full and production-only npm audit reports are generated from current main.
- Each advisory has installed version, dependency path, runtime/dev classification, severity, fix version, reachability, decision and reviewer.
- Compatible updates are made selectively and pass regression/build/Preview gates.
- Exceptions have an owner, mitigation and expiry.

**Current status:** Dependabot automation is in PR #106; candidate code adds a weekly audit workflow and machine-readable full/production-only report generator; the policy is in `docs/operations/PRIME_DEPENDENCY_SECURITY_POLICY.md`. No advisory is considered fixed until the current report and a tested package upgrade say so. The package-by-package matrix and selective updates remain OPEN.

## 6. Canonical documentation

The canonical documents are:
- `docs/architecture/SHARED-LEARNING-MACHINE-RETRY-CONTRACT.md` — retry request/result/idempotency and Definition of Done;
- `docs/architecture/GL-003-TEACHER-AUTHORITY-CONTRACT.md` — GL-003 and human authority gates;
- `docs/architecture/PRIME-PROVIDER-RESILIENCE-CONTRACT.md` — health probes, fallback and safe-failure semantics;
- `docs/operations/PRIME_DEPENDENCY_SECURITY_POLICY.md` — dependency risk/maintenance policy;
- this file — Issue #58 closure gates;
- `docs/operations/PRIME_AGENT_HANDOFF_2026-11-05.md` — chronological operational handoff;
- `docs/operations/PRIME_EXECUTION_CLOSURE_LEDGER.md` — execution evidence and current status;
- `docs/operations/PRIME_TODO_AND_HANDOFF_2026-09-21.md` — canonical operational backlog.

Every release checkpoint must update the handoff/ledger with closed items, unresolved items, exact SHA/deployment, evidence and the next gated action. Historical sections are appended/superseded explicitly; they are not silently rewritten.

## 7. Issue closure procedure

Issue #58 may be closed only when:

1. all six technical criteria above are marked PASS with exact code/test/runtime evidence;
2. the Production alias is read back to a READY deployment built from the merged SHA or descendant;
3. provider health and Meet OAuth scope/attendance reconciliation are independently proven;
4. the Shared Learning Machine has a real authorized Teacher Authority path, persisted final manifest and final projection read-back;
5. the one controlled GL-003 retry has a complete trace and final classification;
6. the dependency advisory matrix has no unapproved critical/high production findings, and any accepted mitigations have named owners/expiry;
7. no unresolved item is represented as closed because a synthetic witness, static test or Preview-only result passed.

**Closure evidence format:** action executed | exact SHA/deployment | owner/actor | timestamp | test/runtime read-back | PASS/FAIL/BLOCKED. Any missing proof keeps the Issue OPEN.

## Safety invariants

- No retry of a real learner while the provider/governance gates are closed.
- No mutation to historical GL-003/GL-001/GL-002 records to make a test pass.
- No production migration, secret rotation, OAuth re-consent, learner-data mutation or freeze change without the separately documented authority and preflight.
- Synthetic/disposable witnesses must state `productionTouched=false` and `externalProviderContacted=false` where applicable.
