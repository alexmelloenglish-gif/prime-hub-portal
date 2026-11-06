# Issue 58 — Closure Criteria

**Status:** ACTIVE closure gate  
**Scope:** PRIME Learning Engine, retry, Teacher Authority / GL-003, identity isolation, providers and dependency governance.

Issue 58 can be closed only when each required item has a concrete commit/PR, passing exact-head CI and the evidence artifact listed below. A code merge or Vercel READY status alone is insufficient.

## 1. Required code and documentation

- Retry policy and tests: `lib/pipeline/run.ts`, `scripts/pipeline-attempts-self-test.mjs`, `scripts/pipeline-retry-state-witness.ts`.
- Shared Machine and GL-003: `scripts/golden-runtime-witness.ts`, redaction self-test, provider provenance and Teacher Authority decision/read-back.
- Access isolation: `lib/learner-account-resolution.ts`, G6 relation schema/migration, `scripts/student-isolation-witness.ts`.
- Provider health/fallback: protected Gemini healthcheck, Meet attendance collector/cron, `scripts/providers-health-self-test.mjs`.
- Dependencies: `scripts/prime-dependency-audit.mjs`, audit workflow and `PRIME_DEPENDENCIES_LEDGER.md`.
- Canonical docs: `PRIME_LEARNING_ENGINE_SPEC.md`, `PRIME_EXECUTION_CLOSURE_LEDGER.md`, this file.

## 2. Exact CI gates

Required green checks on the exact PR head:
1. `Golden Runtime Witness` — retry-state witness, Golden synthetic class, G2/G3/G4/G5 read-back, student-isolation witness and artifact redaction.
2. `Student Dashboard Contract` and `Coordination Runtime Witness`.
3. Build and repository self-tests, including provider health, G6 and young-learner access.
4. `PRIME Production Dependency Audit` — report attached; no high/critical production findings unless a documented, approved, time-bounded exception is explicitly recorded.

## 3. Evidence required

**Retry:** `PipelineRun.id`, `transcriptId`, `attemptNumber`, `status`, `executionMode`, `normalizedRunIdentity`, `idempotencyKey`, `resumePoint`, and the persisted retry event with `retryMode`. For concurrency, the disposable database must show one claimed row for the same normalized identity and no second active run.

**GL-003 / Teacher Authority:** source reference/hash; provider/model/prompt version/request and artifact references; `PipelineRun` and resume point; pending Authority `ValidationTask`; explicit decision/status, reviewer id, reviewed timestamp and authority payload hash; canonical record hash/version; G2/G3 verification and G4/G5 projection read-back. Raw transcript and student PII must not be emitted in artifacts.

**Isolation:** synthetic test account/session IDs (hashed in artifact), explicit AccountLearnerRelation type/status/validity, own learner allow, cross-learner deny, revoked relation deny and ambiguous selection fail-closed.

**Providers:** Gemini health response/status without credential value; provider attempt outcomes and failure code; Meet organizer account/scope readiness and cron result. Staging/Production evidence must include environment/deployment, timestamp, response status and sanitized log correlation ID.

**Dependencies:** exact commit SHA, audit timestamp, package/advisory/severity/fix availability and stored audit artifact.

## 4. Evidence artifacts

- `pipeline-retry-state-witness.json`
- `golden-runtime-witness.json`
- `student-isolation-witness.json`
- `prime-dependency-audit.md`

Artifacts must originate from the same exact PR head and must be retained by GitHub Actions. Synthetic fixtures prove software contracts only; they do not prove a real Google OAuth login, a real teacher's authenticated action, live Meet scope, Production execution or learner read-back.

## 5. Production and operational closure

Before Issue 58 is closed:
- authenticated learner A→A and A→B negative acceptance is recorded using approved synthetic/staging accounts;
- a teacher-authenticated approval flow is proven end-to-end in staging, including canonical read-back;
- a synthetic source traverses Engine → Teacher Authority → canonical record → projections/read-back;
- provider operational health is checked without exposing secrets;
- the dependency ledger reflects the latest release audit;
- the canonical execution ledger lists no OPEN item in this scope, or names an approved and time-bounded exception.

Do not alter `PIPELINE_AUTOMATION_FROZEN`, run a real learner retry, mutate Production data, or execute a Production Teacher Authority action as part of these CI witnesses.
