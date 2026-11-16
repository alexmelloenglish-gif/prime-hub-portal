# GL-003 — Controlled Retry and Teacher Authority Acceptance Contract

**Canonical operational task:** [Issue #6](https://github.com/alexmelloenglish-gif/prime-hub-portal/issues/6)  
**Coordination record:** [Issue #58](https://github.com/alexmelloenglish-gif/prime-hub-portal/issues/58)

## Historical invariants

- Historical FAILED PipelineRuns are immutable.
- Historical Gemini HTTP 403 / `GeminiGenerationFailed` evidence remains intact.
- The same sourceFileId and persisted Transcript are reused.
- No duplicate Lesson or Transcript is created to bypass idempotency.
- GL-001 and GL-002 remain frozen; do not reprocess them.
- Do not manually insert Evidence, Signals, Insights, Reports, Portfolio records or events to create an appearance of success.
- The existing quality gate is never bypassed.
- Retry eligibility correction does not claim to fix a provider outage.

## GL-003 execution gates

Exactly one real retry is permitted, only after every gate below has independent evidence:

1. **Release:** Production is serving the merge SHA or a verified descendant containing the retry correction. Record deployment ID, target, READY state, source SHA and public alias read-back.
2. **Provider:** an authenticated Owner/Admin runs `/api/admin/gemini-healthcheck`. Record model, `keyPresent`, HTTP status, sanitized error code/reason, timestamp and deployment SHA. Never record the key/token itself.
3. **Fallback:** verify configured provider order and record each provider attempt. An alternate provider success must remain visible as provenance; it is not Gemini success.
4. **Freeze/governance:** `PIPELINE_AUTOMATION_FROZEN` remains unchanged until documented owner preflight and explicit release decision. A merge is not permission to enable ingestion.
5. **Source:** read-only preflight confirms the exact stored source and historical Transcript remain unchanged. No replacement Drive export or edited text is allowed between historical failure and retry.
6. **One-shot:** record the expected historical run ID and target it once. No loops, retry-on-retry or automatic replay.

If any gate fails, stop before touching the learner record.

## GL-003 classification

| First verified breakpoint | Required classification |
|---|---|
| Gemini invocation/configuration returns HTTP 403 | GL-003 FAIL — first breakpoint is Gemini invocation/configuration |
| Gemini succeeds but Prompt 1 output is invalid | GL-003 FAIL — Prompt 1 response/validation |
| Valid model output produces zero Evidence Candidates | GL-003 FAIL — Evidence generation |
| Evidence Candidates exist but are not persisted | GL-003 FAIL — Evidence persistence |
| Quality Gate blocks an invalid downstream result | Quality Gate PASS; cognitive trace FAIL at the actual breakpoint |
| Full post-gate path is traceable and every required artifact reads back | GL-003 PASS |

## Teacher Authority boundary

Machine output is a proposal. Teacher Authority is a separate persisted, human-controlled transition.

1. The Shared Machine stops at `awaiting_teacher_authority`; AI output alone cannot change canonical learner state.
2. One pending `ValidationTask` preserves the exact suggested pedagogical payload and `authorityPayloadHash`.
3. An authenticated teacher or administrator submits APPROVE or REJECT. The server independently resolves the persisted User role; client-provided role is not authority.
4. Approval is valid only when the preserved payload hash matches the evidence hash. A second conflicting decision is rejected; repeating the same decision by the same reviewer is idempotent.
5. The decision stores reviewer ID, persisted role, decision, timestamp and reason. `TeacherAuthorityDecisionRecorded` binds the decision to the run and payload hash.
6. Only an approved task authorizes G2. G2 commits the canonical record; G3 reads it back; G4 and G5 create independent verified projections.
7. Only after G2–G5 are verified may the communication continuation pass the existing quality gate, publish the Class Report/Portfolio projection, persist the final manifest and mark the PipelineRun completed.

Never equate:
- EvidenceCandidate with validated/canonical Evidence;
- LearningSignalProposal with a canonical Learning Signal;
- review-task status with an independently verified pedagogical decision;
- report publication with a learner-state transition.

## Required artifact chain

`source → immutable Transcript → PipelineRun → provider/prompt provenance → Evidence Candidates → Quality Gate → pending ValidationTask → exact-payload Teacher Authority decision → G2 canonical record → G3 read-back → G4 Portfolio projection → G5 Learning Intelligence projection → approved communication/publication → final manifest`

Each link requires a persisted ID/hash/status and read-back. Missing or mismatched links stop the chain.

## Witness boundary

The automated Golden Runtime Witness uses synthetic identities, a synthetic transcript and disposable PostgreSQL. Its Teacher Authority service test proves persisted-role enforcement, exact-payload binding, rejection of a student-role reviewer and durable decision-event creation. It is not an authenticated human browser session and is not the real GL-003 retry.

The real GL-003 run remains gated by Production provider health, owner freeze/preflight decision and the single controlled retry authorization in Issue #6.