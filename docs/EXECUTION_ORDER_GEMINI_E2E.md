# EXECUTION ORDER — PRIME Gemini E2E

## Objective
Make the canonical transcript pipeline operational without connecting invalid/placeholder data to the student dashboard.

## Non-negotiable rules
- Gemini is the only AI provider. No OpenAI-compatible path, `OPENAI_API_KEY`, `OPENAI_API_BASE`, or `/chat/completions` may be used by the pipeline.
- Do not reprocess Rafael as a test. Existing `sourceFileId` records are intentionally idempotent and `0 enviados / 3 já processados` is expected for already-ingested files.
- Do not use the dashboard as proof of AI execution. Runtime evidence must correlate Drive source -> reconciliation -> ingest -> Gemini -> prompts -> persistence -> projection.
- Do not publish placeholder/fallback Class Reports.
- Do not treat a Google Doc containing only Notes/meeting notes as a transcript.
- Do not delete or rewrite historical records to make the dashboard look correct.

## Agent 1 — code/pipeline
1. Work from current `main`; do not revive PR #1's OpenAI provider code.
2. Harden Drive triage so a file is eligible only when it has verifiable transcript structure (speaker/timestamp/dialogue evidence), not merely a student name plus >=800 characters.
3. Preserve sourceFileId idempotency.
4. Ensure a Gemini generation failure makes the pipeline fail; never substitute fallback content as a successful generation.
5. Add explicit persisted provenance for generated artifacts: provider=`gemini`, model, generation stage, and failure reason when applicable (sanitized; never store secrets).
6. Block publication/portfolio application when the Class Report is only placeholder/no substantive generated content. Persist such output as failed or draft according to the existing domain contract, never as published student-facing content.
7. Keep `PROCESSAR AGORA` as a trigger for reconciliation only; it must not be treated as a reprocessing/reset control.
8. Add/update tests for: notes-only document rejected/quarantined; valid transcript accepted; Gemini failure fails run; duplicate sourceFileId produces no new run; placeholder cannot publish.
9. Build/typecheck and open a focused PR. Do not merge or deploy without the E2E gate below.

## Agent 2 — runtime/integration
1. Do not duplicate Agent 1's code changes or reprocess Rafael.
2. Verify current Production is the Gemini-only deployment and confirm runtime calls to `generativelanguage.googleapis.com/...:generateContent` for a NEW eligible transcript only.
3. Verify the canonical Drive folder contains a genuinely new Google Meet transcript (not `Anotações`, Notes-only, or a previously ingested sourceFileId). If no new transcript exists, stop and report exactly that; do not manufacture a fixture and do not press `PROCESSAR AGORA` repeatedly.
4. For the new transcript, capture sanitized correlation evidence: sourceFileId hash/ref, ingest request, deployment, Gemini stages 1-4, pipelineRunId, persisted ClassReportProjection, portfolio projection, and final dashboard record.
5. Confirm the resulting report contains substantive Gemini-derived content and is not the placeholder `Class report pending authorized source records.`.
6. Confirm a second reconciliation produces zero duplicate submissions for the same sourceFileId.

## E2E acceptance gate
PASS only if one NEW eligible Google Meet transcript produces:
Drive source -> eligible triage -> ingest -> Prompt 1 Gemini -> Prompt 2 Gemini -> Prompt 3 Gemini -> Prompt 4 Gemini -> persisted run/report -> portfolio projection -> dashboard record,
with the same lesson/source identifiers correlated across the chain, no OpenAI call, no fallback publication, and no duplicate on the second reconciliation.

Until that gate passes, status is NOT DONE.
