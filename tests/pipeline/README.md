# PRIME Learning Engine regression tests

The *.spec.ts files are run by npm run test:prime-engine through the pinned ephemeral tsx runner. They are contract/regression checks; the disposable-Postgres behavioral evidence is executed separately in the Golden Runtime Witness workflow.

- retry-legacy.spec.ts: retry eligibility, attempt-number policy, and non-failed duplicate behavior.
- retry-shared.spec.ts: same-run resume, normalized identity, conditional claim, and resume-point preservation.
- gl003-teacher-authority.spec.ts: source/provider/artifact provenance and persisted synthetic Teacher Authority requirements.
- ../auth/student-isolation.spec.ts: G6 Account→Learner resolution against the workflow's disposable PostgreSQL database.
- ../integration/providers-health.spec.ts: provider fallback with mocked HTTP responses and explicit Meet/Gemini failure contracts.

The Golden Runtime Witness and Pipeline Retry State Witness remain the authoritative integration witnesses. A passing static spec alone is not a production runtime proof.
