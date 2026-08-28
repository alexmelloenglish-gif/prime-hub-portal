# PRIME Teacher Intelligence — Current UI Map

**Date:** 2026-08-28  
**Implementation branch:** `feat/teacher-intelligence-dashboard`  
**Discovery baseline:** `7dc9dfe333b841bfa38d07aad3b5700e72fd8a13`  
**Canonical brief:** Teacher Intelligence Dashboard — Canonical Execution Brief

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

No parallel runtime database was introduced. Teacher Intelligence reads the existing Prisma models:

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

Existing pipeline implementation is preserved:

- Drive reconciliation/ingestion
- transcript persistence
- Prompt 1–4 paths
- quality gate
- Class Report projection
- Portfolio projection

## 2. New Teacher Intelligence surfaces

The first implementation slice adds an internal teacher shell under:

`/dashboard/admin/intelligence`

Navigation:

- Home
- Students
- Lessons
- Review Queue
- Signals
- Insights
- Actions
- Learning State
- System / Audit

### Implemented read surfaces

- Teacher command center backed by persisted runtime counts.
- Authorized student directory backed by the existing admin directory.
- Lesson list backed by `PipelineRun` and related persisted state.
- Lesson trace page showing source, runtime IDs, AI provenance, Evidence Candidates, proposals, reports, projections and events.
- Dedicated transcript viewer so large transcripts are not loaded on the lesson list/detail read path.
- Signal Proposal view explicitly separated from canonical Learning Signal.
- Teacher Insight Proposal view explicitly separated from published Teacher Insight.
- Coaching view explicitly separated from TeacherDecision/EducationalAction.
- Learning State view that displays `NOT PROVEN` rather than synthesizing state.
- Pipeline audit/event view.

### Implemented human review behavior

Evidence Candidate review supports:

- ACCEPT
- REJECT
- RETURN FOR REVISION
- BLOCK

The action:

1. requires an authenticated admin/teacher-authorized user through the existing authorization boundary;
2. updates the existing `EvidenceCandidate` review state;
3. persists an `EvidenceCandidateReviewDecision` `PipelineEvent` with reviewer, role, timestamp, previous/new state, reason, run/transcript IDs and target candidate ID;
4. explicitly records `canonicalEvidenceCreated=false`.

Therefore an accepted Evidence Candidate is **not** silently converted into canonical validated Evidence.

## 3. Deliberately not implemented

The following are not invented by this UI because the current runtime does not prove the corresponding canonical domain entity/lifecycle:

- canonical `Evidence` entity distinct from `EvidenceCandidate`;
- canonical `LearningSignal` state machine transitions;
- published human `TeacherInsight` transition;
- canonical `PedagogicalDecision` entity;
- canonical `EducationalAction` entity;
- canonical `LearningState` transition store;
- longitudinal Outcome verification loop.

The UI exposes the proposals/gaps as `NOT PROVEN` instead.

## 4. Runtime truth preserved

This implementation does not change:

- GL-001 Rafael;
- GL-002 Gustavo;
- historical Golden Trace artifacts;
- `4b1df7c` quality-gate semantics;
- current Gemini provider path;
- Drive ingestion architecture;
- Firestore/Postgres source-of-truth boundaries.

## 5. Verification boundary

This UI can prove that a persisted runtime object/event exists when it reads it from the canonical store. It does not turn object presence into cognitive verification.

The lesson trace intentionally distinguishes:

- source file;
- pipeline run;
- transcript;
- Gemini provenance;
- Prompt 1 artifact;
- Evidence Candidates;
- Quality Gate rejection/pass evidence;
- Class Report;
- Portfolio projection;
- dashboard consistency.

Where no explicit proof exists, the UI shows `NOT PROVEN`.

## 6. Next implementation boundary

Do not add canonical Signal/Insight/Decision/Action/LearningState entities merely to make the Teacher Dashboard look complete.

The next domain/runtime implementation must be separately authorized by evidence from GL-003 or another explicit canonical decision.
