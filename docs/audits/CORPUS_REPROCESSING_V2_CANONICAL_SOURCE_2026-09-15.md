# PRIME Digital Hub — Corpus Reprocessing V2 — Canonical Source Map

**Date:** 2026-09-15
**Branch:** `audit/corpus-reprocessing-v2-2026-09-15`
**Status:** ACTIVE REPROCESSING — DO NOT TREAT LEGACY CLASS REPORTS AS PRIMARY EVIDENCE

## Canonical storage boundary

Raw learner transcripts and transcript-bearing lesson documents remain in **Google Drive / Meet**. They must not be copied into GitHub.

Canonical Drive workspace created for this repair:

`/Google Drive/PRIME_CORPUS_CANONICO_V2`

Subfolders:

- `00_SOURCE_REGISTRY` — canonical source inventory and reprocessing tracker
- `01_RAW_SOURCE_REFERENCES` — source references / routing records only
- `02_CORPUS_REPORTS_V2` — regenerated source-grounded reports by learner
- `03_TEACHER_REVIEW` — teacher review stage
- `04_CANONICALIZED` — only teacher-authorized outputs eligible for canonical learner state
- `99_QUARANTINE` — ambiguous identity, technical duplicates, derived tests and unresolved artifacts

The source registry is maintained in the private Google Sheet `PRIME_CORPUS_SOURCE_REGISTRY_V2`.

## Source roots currently known

- `Meet Recordings` — Drive folder ID `1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw`
- `Processados` — Drive folder ID `1omPN8i31cwFeBLzEyQ5yOKnbmhMnhnO7`
- `antiga nao usar` — Drive folder ID `1Jpyqu8YkWyYfM1r_5zUQGM8sMgM_AfCO`
- learner recurring Meet folders and additional documents discovered through global Drive search

The historical folder name `antiga nao usar` is **not** a reason to discard its contents. Files there are source candidates and must be source-audited.

## Non-negotiable reprocessing order

For every candidate lesson:

`source artifact → identity/date → transcript body → direct learner production → evidence → bounded signal → teacher interpretation → boundary → next verification → teacher review → canonicalization`

Legacy Class Reports, AI summaries, `teacherInsight`, portfolio narrative and dashboard projection may be compared after source extraction, but they cannot prove their own claims.

## Corpus Report V2 contract

Every regenerated report must include:

1. source document ID + URL + date/lesson identity;
2. direct observed learner evidence, with timestamps or exact source anchors when available;
3. explicit distinction between learner production and teacher prompts/recasts;
4. signal classification with scope (`single-lesson` vs `longitudinal`);
5. teacher interpretation marked as a proposal until reviewed;
6. evidence boundary / what the source does not prove;
7. next verification task;
8. canonicalization status.

## Important semantic rules

- a transcript is not attendance proof by itself;
- a Class Report narrative is not automatically Evidence;
- a single observation is not automatically a longitudinal Signal;
- immediate repetition after teacher support is not independent mastery;
- a proposed next action is not an executed action;
- `Pipeline: completed` is not pedagogical completion;
- missing evidence remains missing;
- derived tests and technical duplicates must be quarantined, not counted as lessons;
- Valéria remains prospect-only unless activation authority changes.

## Current execution state

The canonical Drive workspace and source registry have been created.

The first source-level rebuild has started with Diego Dasiro, source document `1bYX2TF7iMbPkPU9hidPlcVxJ7t6xwwJRhCCw24JbH4A`. A new `Corpus Report V2` was generated from the raw transcript section only; the embedded legacy generated report was excluded as primary evidence. It remains **awaiting teacher review** and must not yet be pushed to the learner dashboard.

## Completion criterion

The reprocessing project is complete only when every discoverable source candidate has a terminal status:

- `REPROCESSED_V2`
- `DUPLICATE_CONFIRMED`
- `NOT_A_LESSON`
- `IDENTITY_UNRESOLVED`
- `UNREADABLE_SOURCE`
- `PROSPECT_SOURCE_ONLY`

and every learner-facing longitudinal claim has been rebuilt only from teacher-reviewed source-backed records.
