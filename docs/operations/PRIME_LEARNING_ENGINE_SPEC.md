# PRIME Learning Engine — canonical execution specification

**Version:** 1.0  
**Date:** 2026-11-06  
**Status:** implementation contract; acceptance is governed by the tests and closure ledger below.

## 1. Pipeline execution contract

The authoritative implementation is the current shared runner in lib/pipeline/run.ts, with durable state in PipelineRun, Transcript, PipelineEvent, ValidationTask and canonical-learning models.

### 1.1 Legacy retry

Legacy retry is a new processing attempt over the existing immutable Transcript:

- The latest PipelineRun must have status failed.
- The new attempt uses attemptNumber = latest.attemptNumber + 1.
- The new run references the same transcriptId; the historical failed run remains intact.
- The source Transcript is not overwritten or recreated.
- completed, processing, received and review/authority-wait states are not permission to create a new legacy attempt. Existing non-failed runs return as duplicates or remain at their review boundary.

The disposition of Drive sources is explicit in lib/pipeline/retry-eligibility.ts: new source, failed retry, orphan Transcript processing, or skip existing run.

**Regression:** tests/pipeline/retry-legacy.spec.ts; database witness scripts/pipeline-retry-state-witness.ts.

### 1.2 Shared Learning Machine retry

A shared retry resumes the same durable execution:

- normalizedRunIdentity is the execution identity and idempotency key.
- retryMode is same_execution_resume.
- PipelineRun.id, attemptNumber, transcript association and normalized identity remain unchanged.
- The previously persisted resumePoint is retained; retry must not restart earlier stages or replace the original transcript.
- A retry may claim only a row still in failed state and in shared execution mode. The conditional updateMany changes the row to processing; exactly one concurrent claimant may update one row.
- A losing claimant returns the current execution as a duplicate and does not execute the continuation.
- completed, processing and other non-failed states cannot create a second active execution for the same identity.

**Regression:** tests/pipeline/retry-shared.spec.ts, scripts/shared-learning-machine-behavioral-self-test.mjs, and the disposable-Postgres scripts/pipeline-retry-state-witness.ts.

## 2. Source-to-Teacher-Authority flow (GL-003 minimum)

The expected lineage is:

1. **Source:** immutable synthetic/real source reference, source type, source hash and preserved Transcript identity.
2. **Runner:** a PipelineRun with execution mode, normalized identity, machine/contract version and durable resumePoint.
3. **Provider:** provider, model, prompt version, request/artifact references, response status, validation status and ordered provider-attempt history.
4. **Artifacts:** persisted prompt output, evidence candidates, learning-signal proposals and teacher-insight proposals with source references.
5. **Teacher Authority:** the shared runner creates the official ValidationTask for canonical_learning_record_authority; generated candidates remain non-authoritative while pending. Approval must be an explicit persisted decision with reviewer identity, decision timestamp and the exact authority payload hash.
6. **Canonical continuation:** continuation verifies that the durable approval is bound to the same run, reviewer, timestamp and payload hash before canonicalization.
7. **Read-back/projections:** G2 atomic canonicalization, G3 persisted read-back verification, G4 portfolio projection and G5 learning-intelligence projection must be evidenced by persisted IDs/hashes/statuses. Publication is not inferred from generation.

The Golden Runtime Witness exercises this contract using synthetic data in disposable PostgreSQL and mocked provider responses. Its Teacher Authority approval is an isolated database fixture, **not** proof of a Google-authenticated teacher session or Production permission flow. The artifact must say so explicitly.

**Regression:** tests/pipeline/gl003-teacher-authority.spec.ts; runtime evidence artifacts/golden-runtime-witness.json.

## 3. Authentication and learner isolation

AccountLearnerRelation is the explicit account-to-learner authorization relation. resolveAuthorizedLearnerRelation() returns one of:

- AUTHORIZED with the exact learner and relation;
- ABSENT when the account has no active relation to the requested learner;
- NOT_OBSERVABLE when the relation cannot be resolved safely, including missing account identity, unavailable source or ambiguous relations.

An absent or unobservable result is not permission. Email equality is not an authorization relation. Guardian access must be represented by an explicit authorized relation; the role label alone does not grant access to a learner record.

The admin retry, manual Machine and Gemini health routes separately require a session and isAdminUser. The existing dashboard still has legacy email/eligibility resolution paths; the G6 service test does not certify every dashboard/API route as G6-integrated. Full endpoint acceptance requires authenticated A→A, A→B, guardian→authorized learner and guardian→unrelated learner requests against approved synthetic identities.

**Regression:** tests/auth/student-isolation.spec.ts; structural and database proof in the Golden Runtime Witness workflow. Route-level authenticated acceptance remains OPEN until the dashboard's G6 integration is exercised end-to-end.

## 4. Provider health and safe fallback

generateStructuredJson() tries the configured provider order and records skipped, failed or success attempts. Exhausting configured providers throws ModelGenerationError with provider attempt details; the pipeline persists the failure event rather than silently accepting empty output.

- Gemini's admin healthcheck requires an authenticated administrator and returns explicit missing-key, upstream-failure or request-error results.
- Meet attendance cron requires CRON_SECRET; an unauthorized request returns 401. A reconciliation exception emits meet_attendance_cron_failed and returns 503.
- CI provider tests use synthetic keys and intercepted fetch; no external provider is contacted. Meet tests assert the fail-closed/visible failure contract without calling Google Meet.

**Regression:** tests/integration/providers-health.spec.ts and scripts/model-provider-pool-self-test.mjs.

## 5. Dependency governance

npm run audit:prime-engine runs npm audit --omit=dev --json, creates machine-readable and reviewer-readable artifacts, and returns non-zero if production advisories exist or npm audit fails. docs/operations/PRIME_DEPENDENCIES_LEDGER.md records critical runtime packages and release-by-release evidence.

No dependency is considered fixed by adding Dependabot alone. A vulnerability closes only after the affected package/range, reviewed lockfile correction, complete regression/build and a fresh production-only audit are recorded.

## 6. Test-to-contract map

| Contract | Regression | Runtime / CI witness |
|---|---|---|
| Legacy FAILED → new attempt; COMPLETED/PROCESSING → no new attempt | tests/pipeline/retry-legacy.spec.ts | scripts/pipeline-retry-state-witness.ts |
| Shared same-run resume, identity, resume point and one concurrent claim | tests/pipeline/retry-shared.spec.ts | scripts/pipeline-retry-state-witness.ts + behavioral self-test |
| Synthetic source → artifacts → explicit Teacher Authority → G2–G5 | tests/pipeline/gl003-teacher-authority.spec.ts | scripts/golden-runtime-witness.ts |
| G6 own learner / unauthorized cross-learner and guardian relation | tests/auth/student-isolation.spec.ts | Golden Runtime Witness disposable PostgreSQL service |
| Provider fallback and visible exhaustion; Meet/Gemini errors | tests/integration/providers-health.spec.ts | Mocked HTTP tests + existing model-provider self-test |
| Production dependency advisory report | npm run audit:prime-engine | PRIME Engine Dependency Audit workflow |

## 7. Non-negotiable production boundaries

- CI database fixtures are disposable and contain only synthetic identities and lesson content.
- No automated test may use real learner transcripts, contact details, Google Drive documents or real provider credentials.
- PIPELINE_AUTOMATION_FROZEN is not changed by tests or this specification.
- Synthetic witness success does not authorize a real learner retry, production migration, secret change, attendance mutation or production activation.
- A merged PR, green CI or READY deployment is not equivalent to real authenticated acceptance or a Production source-to-canonical read-back.
