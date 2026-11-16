# Issue 58 — closure criteria

**Purpose:** objective evidence required before Issue 58 may be closed.  
**Rule:** any row without a linked artifact, exact commit and passing workflow remains OPEN.

## Required repository artifacts

- tests/pipeline/retry-legacy.spec.ts
- tests/pipeline/retry-shared.spec.ts
- tests/pipeline/gl003-teacher-authority.spec.ts
- tests/auth/student-isolation.spec.ts
- tests/integration/providers-health.spec.ts
- scripts/pipeline-retry-state-witness.ts
- scripts/golden-runtime-witness.ts
- scripts/audit-prime-engine.mjs
- docs/operations/PRIME_LEARNING_ENGINE_SPEC.md
- docs/operations/PRIME_DEPENDENCIES_LEDGER.md
- docs/operations/PRIME_EXECUTION_CLOSURE_LEDGER.md
- this document

## Required PASS gates

1. npm run test:prime-engine.
2. Golden Runtime Witness: synthetic source, persisted provider/artifact provenance, explicit approved Teacher Authority fixture, G2 atomicity, G3 read-back, G4/G5 projections and redaction self-test.
3. Pipeline Retry State Witness: legacy FAILED attempt increment; COMPLETED/PROCESSING no duplicate; shared retry same PipelineRun/identity/resumePoint; exactly one concurrent claim; orphan Transcript behavior.
4. Existing application build and canonical/dashboard/identity self-tests.
5. npm run audit:prime-engine with zero production advisories, or a separately reviewed, explicitly time-bounded risk acceptance recorded per advisory in the dependency ledger.

Every PASS must be attached to the exact PR head SHA and workflow run URL. A workflow run on an earlier commit does not certify a later head.

## Minimum persisted execution evidence

A sanitized witness artifact must preserve, at minimum:

- source type/reference hash and transcript-content hash (never raw transcript text);
- PipelineRun reference, normalized identity hash, execution mode, machine/contract version, attempt number, current status and resume point;
- provider/model/prompt version, response/validation status, request/artifact references and ordered provider attempts;
- evidence/proposal references and their source lineage;
- ValidationTask reference, explicit decision/status, reviewer reference/role, reviewed timestamp and exact authority payload hash;
- canonical record reference/version/hash, G3 verification status and G4/G5 projection references/statuses;
- final manifest presence/hash and the workflow run/commit that produced the artifact.

The Golden witness's fixture approval must be labelled synthetic and must not be described as an authenticated teacher login.

## Authenticated isolation acceptance

Using approved synthetic accounts only, retain HTTP status and stable error code for:
- unauthenticated dashboard/API access;
- student A requesting own learner A (allow);
- student A requesting learner B (deny);
- guardian explicitly linked to learner A (allow);
- the same guardian requesting unrelated learner B (deny);
- non-admin teacher/student/guardian attempting admin retry or Machine routes (deny);
- persisted admin executing the authorized admin route in the test environment (allow only where the route contract permits).

The G6 resolver database test is necessary but does not alone certify every dashboard or API endpoint. Route-level A→A/A→B and guardian read-back remain OPEN until exercised through the actual authenticated route.

## Provider and dependency acceptance

- Gemini/provider fallback tests must use mocked transport and prove attempt provenance plus explicit error after exhaustion.
- Meet test must prove missing/invalid cron authorization is denied and runtime failure is surfaced as 503/log event. A real Meet OAuth scope and scheduled reconciliation require a separate staging witness.
- Dependency evidence must include the generated JSON and Markdown audit artifacts, commit SHA, workflow run and advisory decisions.

## Issue 58 closure decision

Close only when all required tests pass on the final exact head, all documents match the implementation, the synthetic GL-003 witness records a clear Teacher Authority decision and G2–G5 read-back, authenticated route isolation is proven, and production dependency risk is zero or formally accepted with mitigation and expiry.

A synthetic fixture is not a Production witness. A CI PASS is not authenticated user acceptance. Keep the Issue OPEN while any one of these proof boundaries remains unresolved.
