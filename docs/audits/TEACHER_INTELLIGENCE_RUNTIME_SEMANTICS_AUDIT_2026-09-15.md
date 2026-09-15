# PRIME — Teacher Intelligence Runtime Semantics Audit

**Audit date:** 2026-09-15  
**Status:** DATED RUNTIME/UI SEMANTICS AUDIT  
**Scope:** Teacher Intelligence cockpit and authorized student directory.  
**Boundary:** this document audits how runtime and repository state are represented in the admin UI. It is not a pedagogical-outcome claim and does not certify the Engine end-to-end.

## 1. Core conclusion

The current Teacher Intelligence implementation does something important correctly: it preserves uncertainty and technical failure instead of silently converting them into canonical pedagogical truth.

At the same time, two summary-level labels are semantically misleading:

1. the cockpit's **Recent lessons** count is actually a count of recent `PipelineRun` records, not unique lessons;
2. **Items needing attention** counts only teacher-review/proposal/report items and excludes failed runtime attempts.

The student directory also mixes canonical learner identity/profile data with runtime-enrichment labels. This is acceptable only if the runtime labels remain explicitly operational and are not read as pedagogical state.

---

## 2. Cockpit — recent activity semantics

The cockpit calls `getTeacherCommandCenter()`, which obtains `recentLessons` from `listTeacherLessons(12)`.

`listTeacherLessons(12)` queries the 12 most recent `PipelineRun` rows ordered by creation time. It does not deduplicate by `lessonId`.

The page then displays:

- `Recent learners` = number of unique student emails in those 12 runs;
- `Recent lessons` = `data.recentLessons.length`;
- `Items needing attention` = sum of review tasks, Evidence Candidates requiring review, Signal proposals, Insight proposals and draft reports.

### Supplied runtime state

The supplied cockpit showed 12 rows for the same learner, same lesson identity and same lesson date, all with:

- `0 evidence`;
- `0 signals`;
- `0 insights`;
- `FAILED`;
- `Report: no report`.

Therefore the supplied state is correctly interpreted as:

> **1 unique lesson → 12 processing attempts → 12 failed runs**

not:

> **12 recent lessons**.

### Required semantic correction

Recommended labels/aggregation:

| Current UI | Canonical interpretation / recommended label |
| --- | --- |
| Recent learners | Recent learners — acceptable |
| Recent lessons | **Unique recent lessons** or replace with `Processing attempts` if no deduplication is implemented |
| Items needing attention | **Teacher review items** |
| no separate failure summary | add **Runtime exceptions / failed attempts** |

A failed runtime attempt must not automatically become a teacher-review task, but the cockpit headline should not say there are zero items needing attention while repeated runtime failures are visible immediately below.

---

## 3. Cockpit — authority discipline is working

The page explicitly states that AI-supported states remain proposals until teacher validation and that Teacher Intelligence does not fabricate a canonical Learning State, Signal or Insight when the runtime cannot prove one.

The backend supports this boundary:

- AI is `VERIFIED` only when Gemini provenance is valid;
- otherwise AI state remains `NOT_PROVEN` or `FAILED`;
- `cognitiveStatus` becomes `EVIDENCE_BEARING` only when valid AI provenance and persisted evidence coexist;
- Evidence, Signal and Insight proposals remain separate reviewable entities.

This supports a narrow governance claim:

> PRIME Teacher Intelligence exposes runtime uncertainty and failure without automatically promoting them into pedagogical truth.

This is evidence of **authority discipline / runtime transparency**, not evidence of cumulative personalization or a closed learning loop.

---

## 4. Authorized student directory — identity boundary

The directory is generated from the repository student directory, then filtered through `isAuthorizedLearner(...)` before runtime enrichment.

`isAuthorizedLearner(...)` requires both:

- `operatingEligibility === 'learner'`;
- non-null `activationAuthority`.

The audited repository contains ten repository profiles in `lib/admin-dashboard.ts`, but the eligibility boundary preserves nine authorized learners and excludes the prospect with no activation authority.

The supplied directory also displayed nine learners and omitted the non-authorized prospect.

This is positive evidence that the **identity/activation boundary is functioning at the directory level**.

Safe claim:

> The authorized student directory is filtered by learner eligibility and activation authority rather than profile existence alone.

This does not prove every downstream learner-facing route or database operation independently enforces the same boundary; those controls require their own verification.

---

## 5. Directory runtime labels — exact meaning

For each authorized learner, `enrichWithPipelineState(...)` adds:

- `latestPipelineStatus` = status of the most recently created `PipelineRun` for that learner;
- `publishedReportCount` = count of `ClassReportProjection` rows for the learner where `documentStatus = 'published'`.

The Students page renders those values as:

- `Pipeline: ...`
- `Published reports: N`

### Consequence

These fields are **runtime/operational metadata**, not a summary of the learner's canonical longitudinal portfolio.

Examples visible in the supplied directory make this distinction concrete:

- some learners with rich longitudinal student projections show `Pipeline: failed` or `NO DATA`;
- a learner with many preserved historical class reports can show `Published reports: 1` because the field counts runtime `ClassReportProjection` rows, not every report preserved in the canonical repository snapshot;
- a learner with documented cumulative personalization can show `Pipeline: completed`, but that status only says the most recent technical run completed.

Therefore:

> `Pipeline: completed` ≠ teacher review complete ≠ canonicalization complete ≠ cumulative personalization ≠ closed loop.

and:

> `Published reports: N` ≠ N canonical lessons ≠ N teacher-validated evidence items ≠ full longitudinal report history.

### Recommended label corrections

- `Pipeline` → **Latest historical pipeline run** or **Latest processing status**.
- `Published reports` → **Runtime published report projections**.

The current short labels are too easy to read pedagogically.

---

## 6. Student-specific navigation issue

Each learner card offers `Runtime lessons`, but the current link points to the generic route:

`/dashboard/admin/intelligence/lessons`

rather than a learner-filtered view.

This is a UX/traceability weakness, not an authority failure. A card presented as learner-specific should ideally open that learner's runtime history directly, preserving context and reducing accidental cross-learner interpretation.

Recommended improvement:

> learner card → filtered runtime lessons for that learner → unique lesson grouping → expandable processing-attempt history.

---

## 7. Evidence classification

### Demonstrated by implementation + supplied UI state

- runtime uncertainty/failure can remain visible without being promoted into canonical Learning State/Signal/Insight;
- authorized student directory filters repository profiles through eligibility + activation authority;
- `Pipeline` is latest `PipelineRun.status`;
- `Published reports` counts published `ClassReportProjection` rows;
- cockpit recent activity is run-based rather than unique-lesson-based;
- cockpit attention total excludes runtime failures.

### Not demonstrated by this audit

- complete Engine E2E operation;
- teacher review/canonicalization/publication for the failed lesson runs;
- learner-facing closed loop;
- causal pedagogical impact;
- universal correctness of identity enforcement across every route/service;
- learner-authenticated action completion.

---

## 8. Priority classification

**P0 — before treating Teacher Intelligence as canonical operational truth**

- stop presenting 12 `PipelineRun` attempts as 12 `Recent lessons`;
- distinguish teacher review queue from runtime exceptions;
- rename ambiguous `Pipeline` and `Published reports` labels or add explicit explanatory text.

**P1 — canonical operational improvement**

- group runtime attempts by unique lesson identity;
- expose attempt count, success/failure summary and latest meaningful state per lesson;
- make `Runtime lessons` learner-filtered from each student card.

**P2 — later intelligence/polish**

- add drill-down relationships from runtime attempt → evidence → review → decision → canonicalization → projection where those transitions exist;
- add explicit provenance badges separating repository/canonical state from runtime enrichment.

---

## 9. Safe consolidated wording

> Teacher Intelligence currently preserves runtime uncertainty and failure rather than manufacturing pedagogical truth, and its authorized student directory respects the learner activation boundary. However, the cockpit still conflates processing attempts with lessons at summary level, and its short runtime labels can be mistaken for pedagogical state. These are semantic/operational UI issues, not evidence that the underlying longitudinal learner records are absent.

---

## 10. Change boundary

This audit records findings only. It does not modify production code, learner data, eligibility, activation authority, runtime records or pedagogical state. It does not close Gate E and does not upgrade any Engine E2E claim.