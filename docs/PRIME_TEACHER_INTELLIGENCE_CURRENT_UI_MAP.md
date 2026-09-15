# PRIME Teacher Intelligence — Current UI Map

**Updated:** 2026-09-15  
**Canonical principle:** Intelligence prepares. Teacher decides.

## 1. Existing surfaces preserved

### Student-facing dashboard

Existing routes remain unchanged in purpose:

- `/dashboard`
- `/dashboard/aulas`
- `/dashboard/progresso`
- `/dashboard/goals`
- `/dashboard/metas`
- `/dashboard/conversacao`
- `/dashboard/configuracoes`

The student dashboard continues to consume authorized/legacy projections through the existing `student-data` layer.

### Existing admin surface

Existing routes/components reused rather than rebuilt:

- `/dashboard/admin`
- `/dashboard/admin/review`
- `ProcessDriveButton`
- `listStudentsForAdmin()`
- `listRecentPipelineActivity()`
- `reviewPipelineRun()`
- existing NextAuth/`isAdminUser()` authorization

### Existing runtime/domain persistence reused

Teacher Intelligence reads the existing Prisma models:

- `PipelineRun`
- `Transcript`
- `EvidenceCandidate`
- `LearningSignalProposal`
- `TeacherInsightProposal`
- `ClassReportProjection`
- `PortfolioProjection`
- `CoachingGuidance`
- `ReviewTask`
- `PipelineEvent`
- `ValidationTask`

Existing Drive ingestion, transcript persistence, Prompt 1–4 paths, quality gate, Class Report projection and Portfolio projection remain preserved.

## 2. Teacher Intelligence surfaces

Internal shell:

`/dashboard/admin/intelligence`

Navigation:

- Cockpit
- Learners
- Lessons
- Review
- Validation
- Signals
- Insights
- Teaching Actions
- Learning State
- Audit

Implemented read surfaces include persisted runtime counts, learner directory, lesson trace, transcript viewer, proposal views, validation, learning-state boundary and pipeline audit.

## 3. Exception-based human authority

Teacher review is **not** intended to become a click-per-evidence bottleneck.

The governing rule is:

> Human authority is required for pedagogical authority transitions, not for every extraction step.

Source-grounded facts may be extracted, persisted, compared longitudinally and retained as candidate memory without an individual teacher checkbox. Human review is required when a bounded package would materially change learner-facing state, priorities, next action, level/assessment status, or when source conflict/ambiguity requires professional judgment.

A teacher decision package therefore contains:

1. what materially changed;
2. source-grounded evidence supporting the change;
3. explicit boundary / what remains unproved;
4. proposed bounded state or priority update;
5. proposed next action when needed;
6. one teacher authority decision for the bounded package.

Legacy Portfolio and Class Report records are additive/versioned and are never deleted as part of V2 rebuilding.

## 4. Gustavo V2 teacher-authorized package

On 2026-09-15, Alexandre Mello explicitly authorized the Gustavo V2 bounded package produced from four reprocessed transcript-bearing sources:

- 2026-08-18
- 2026-08-25
- 2026-09-01
- 2026-09-08

Recorded decision:

- V2 current state / priority package: **accepted**;
- V2 proposed next action: **accepted**;
- CEFR: **no change**;
- bounded canonical projection: **authorized**.

Teacher Intelligence exposes this package under the learner record and Validation resolved-history surface. The package includes four V2 source-grounded Class Reports and accepted longitudinal signals, while preserving explicit evidence boundaries.

This authorization does **not** claim a separate canonical `LearningState` entity exists in the runtime. It is a teacher-authorized bounded projection package with traceable source lineage.

## 5. Evidence Candidate review boundary

Evidence Candidate review continues to support:

- ACCEPT
- REJECT
- RETURN FOR REVISION
- BLOCK

When used, the action persists reviewer provenance and explicitly records `canonicalEvidenceCreated=false`. Acceptance of an Evidence Candidate therefore does not silently create canonical Evidence.

Evidence review should be used for actual exceptions/ambiguities, not as a mandatory gate for every direct source-grounded extraction.

## 6. Deliberately not invented

The UI must not fabricate domain entities/lifecycles merely to appear complete. The following remain distinct from the teacher-authorized bounded package unless separately implemented and proven:

- canonical `Evidence` entity distinct from `EvidenceCandidate`;
- canonical `LearningSignal` state machine transitions;
- published human `TeacherInsight` domain transition;
- canonical `PedagogicalDecision` entity;
- canonical `EducationalAction` entity;
- standalone canonical `LearningState` transition store;
- longitudinal Outcome verification loop.

## 7. Verification boundary

Teacher Intelligence distinguishes:

- source file;
- transcript;
- source-grounded evidence;
- candidate longitudinal pattern;
- AI proposal;
- teacher authority decision;
- authorized bounded projection;
- learner-facing display.

One layer must never be used to prove another merely because both exist in the application.
