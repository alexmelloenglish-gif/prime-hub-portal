# PRIME Digital Hub — Portfolio / Class Report Truth Repair

**Date:** 15 September 2026
**Status:** REPAIR APPLIED — SOURCE-LEVEL REVIEW STILL REQUIRED FOR EXTERNAL ARTIFACTS

## Why this repair was necessary

The learner repository contains three different semantic layers that had been too easy to collapse:

1. a Class Report narrative;
2. concrete lesson evidence;
3. structured Evidence → Signal → Insight intended for longitudinal learning intelligence.

A Class Report can be valid and useful without being a structured Evidence → Signal → Insight record.

The dashboard projection previously promoted narrative `summary`, `focus`, and `teacherInsight` content into `learningIntelligence`. That was too permissive.

## Repair applied

`lib/canonical-student-projection.ts` now requires an explicit structured transfer-point contract before a Class Report can enter canonical `learningIntelligence`:

- `Evidence:` is required;
- `Interpretation:` is required;
- `Signal:` is used only when explicitly present;
- `Boundary:` and `Next verification:` remain optional and are preserved when present.

A narrative Class Report remains available in the Class Reports surface but is no longer silently promoted into Evidence/Signal/Insight.

## What this means

The system will no longer say, by projection alone:

> Class Report narrative = Evidence = Signal = Insight.

That equivalence is false unless the source explicitly establishes it.

## Portfolio truth categories

Every Class Report is now auditable as one of:

- `STRUCTURED_AND_SOURCE_BACKED`
- `SOURCE_BACKED_NARRATIVE`
- `SOURCE_AUTHORITY_NOT_PROVEN`
- `ORPHAN_REPORT`

The command `npm run portfolio:truth-audit` performs this repository-level audit across every learner profile.

## Current canonical registry

The registry contains 10 student records. Nine are authorized learners and Valéria is explicitly a prospect without learner activation authority. Missing data is required to remain missing rather than guessed.

The registry also explicitly preserves several source-integrity corrections already made, including:

- Cláudio: three confirmed lessons; undated 8K/World Cup material remains memory only;
- Diego: dashboard reconciled; missing operational links remain unavailable rather than guessed;
- Eduarda: seven-lesson longitudinal profile is preserved, but current event-specific attendance links are not invented;
- Italo: one confirmed lesson; no cumulative progress claim inferred;
- Laura: three evidence-backed lessons drive the current projection; later bookings are not promoted to attendance;
- Maria Fernanda: three evidence-backed lessons drive the current B2→C1 projection; old bookings are not treated as attendance;
- Rafael: ten published historical reports remain preserved and the 27 Aug attendance/report mismatch remains explicit;
- Valéria: prospect status prevents accidental learner activation.

## Important limitation

This repository audit does **not** by itself re-authenticate the original external Google Docs, transcripts, Meet records, or teacher source material. Therefore it must not be represented as independent source-level proof of every historical sentence.

The repair deliberately chooses the safer direction: when a Class Report does not carry the structured evidence contract, the Dashboard does not manufacture one.

## Next source-level review rule

For each learner, each report must be reconciled against its original artifact before being upgraded from `SOURCE_BACKED_NARRATIVE` to structured learning intelligence:

`source artifact → attendance/identity → lesson identity → observed production → evidence → signal → interpretation → teacher decision → next action`

No missing link may be filled by inference.
