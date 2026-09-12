# Agent D — Lesson Intelligence boundary

This branch integrates the existing Teacher Intelligence lesson template without creating learner judgments.

## Authority chain shown by the UI

identity → attendance → source → processing → evidence → assessment → review → report → provenance

## Non-inference rules

- Lesson identity is distinct from a processing attempt.
- Repeated PipelineRuns for one lesson are shown as attempts, not as additional lessons.
- Transcript/source existence does not prove attendance.
- Pipeline completion does not prove evidence or assessment.
- Evidence Candidates remain candidates unless an upstream evidence authority validates them.
- No canonical Assessment record is inferred from evidence candidates, signal proposals, AI insights, reports, or processing status.
- ReviewTask absence does not imply approval.
- Report/document presence does not prove assessment.
- Provenance explains how an artifact appeared; it does not create a learner judgment.

## Explicitly out of scope

- No automation.
- No retry/process-drive controls.
- No database migration.
- No canonical learner judgment creation.
- No student projection writes.
- No resolution of Diego, Rafael 11/10, scheduled warnings, Maria v2 projection, Valéria eligibility, or diagnostic noise.
