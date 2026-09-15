# PRIME Digital Hub — Corpus Reprocessing v2 Protocol

**Date:** 15 September 2026  
**Status:** ACTIVE SOURCE-LEVEL REPROCESSING — AUDIT LANE ONLY  
**Branch:** `audit/corpus-reprocessing-v2-2026-09-15`  
**Purpose:** rebuild lesson evidence from original transcript/source artifacts instead of trusting legacy Class Reports, portfolio prose, pipeline status, or learner-facing projections.

## Trigger for this reprocessing

A source-level inspection showed that some original lesson artifacts contain materially richer evidence than the current repository Class Reports and Dashboard projections expose: timestamped learner utterances, corrections, teacher interventions, vocabulary reuse, action recommendations, and raw transcript turns can exist in the source even when the current Class Report preserves only a short narrative teacher observation.

Therefore the current Class Report / Portfolio / Dashboard layer must not be used as a substitute for the source corpus when deciding what the lesson actually supports.

## Non-negotiable rule

```text
SOURCE FIRST.

Legacy Class Report != source evidence.
Portfolio statement != independent proof.
Dashboard projection != proof of upstream processing.
Pipeline completed != pedagogical completion.
```

The old artifacts remain historical records. They are not deleted or silently rewritten.

## Relationship to the legacy pipeline freeze

The legacy transcript automation remains frozen. This reprocessing is a new audit lane and MUST NOT reactivate or reuse legacy automatic publication.

```text
RAW SOURCE
  -> REPROCESSING V2 EXTRACTION
  -> CORPUS REPORT V2 (AUDIT / NON-AUTHORITATIVE)
  -> HUMAN SOURCE REVIEW
  -> CLAIM RECONCILIATION
  -> OPTIONAL CANONICAL UPDATE
  -> OPTIONAL LEARNER PROJECTION
```

No V2 corpus report changes learner-facing state by itself.

## Corpus inventory classes

Every discovered artifact receives exactly one primary source class:

- `RAW_TRANSCRIPT` — speaker/timestamp transcript or equivalent primary lesson record.
- `GEMINI_MEETING_NOTES` — Gemini meeting notes that may contain transcript, summary, speaker turns, or derived material; must be inspected before use as primary evidence.
- `TACTIQ_TRANSCRIPT` — Tactiq/raw meeting transcript with speaker turns.
- `DERIVED_CANONICAL_TEST` — synthetic/derived test artifact; never treated as an independent historical lesson.
- `LEGACY_CLASS_REPORT` — prior report/projection; comparison only.
- `PORTFOLIO` — longitudinal synthesis; comparison/authority layer, not independent source proof.
- `AGENDA_BOOKING` — scheduling source; not attendance or learning evidence by itself.
- `NON_LESSON` — technical check, meeting, or other artifact that is not a pedagogical lesson.
- `DUPLICATE` — same underlying lesson/source represented more than once.
- `PROSPECT_SOURCE` — source connected to a prospect without learner activation authority; may be audited but must not be promoted into an authorized learner record.
- `UNRESOLVED` — identity/date/lesson relationship cannot yet be established.

## Corpus Report v2 contract

Each real lesson is rebuilt chronologically from the best available source and produces a new audit artifact with these fields:

1. `source_identity`
   - stable source reference
   - source class
   - learner identity confidence
   - lesson date confidence
   - duplicate relationship
2. `attendance`
   - proven source and status, or `not_proven`
3. `primary_evidence`
   - timestamp/span
   - speaker
   - learner production / observed event
   - evidence type
   - verbatim excerpt only inside the private audit corpus
4. `teacher_interventions`
   - correction, prompt, explanation, model, recast, feedback
5. `learner_attempts`
   - first attempt
   - retry/self-correction/reuse when actually observed
6. `evidence_candidates`
   - source-backed candidate only; no authority transition
7. `signal_status`
   - `single_observation`, `repeated_within_lesson`, `longitudinal_candidate`, or `not_supported`
   - a Learning Signal is never manufactured from a priority label
8. `teacher_insight`
   - distinguish transcript-observable interpretation from later teacher-authorized synthesis
9. `boundary`
   - what the source does NOT establish
10. `next_verification`
   - concrete check justified by the source
11. `priority_status`
   - `source_supported_candidate`, `teacher_authorized`, or `not_proven`
12. `next_action_status`
   - `proposed`, `teacher_authorized`, `executed`, or `not_proven`
13. `legacy_comparison`
   - what the old Class Report kept, compressed, omitted, or overstated
14. `provenance`
   - source reference, extraction version, reviewer state, report version

## Evidence levels

Each material claim receives one of:

- `SOURCE_PROVEN` — directly supported by located primary source span(s).
- `SOURCE_PROVEN_TEACHER_OBSERVATION` — explicit teacher observation/feedback in the source.
- `SOURCE_SUPPORTED_INFERENCE` — conservative interpretation supported by source but not itself a direct observation.
- `PORTFOLIO_CONFIRMED` — present in authorized portfolio but primary source not yet re-authenticated in this pass.
- `INSUFFICIENT_EVIDENCE` — potentially plausible but source support is inadequate.
- `NOT_PROVEN` — required proof not found.
- `INCORRECT` — contradicted by the source.
- `DUPLICATE` — duplicate representation of the same source/lesson.
- `CONFLICTING` — sources disagree and teacher reconciliation is required.

## Longitudinal reconstruction

Longitudinal patterns are generated only AFTER the lesson corpus for a learner is source-reviewed in chronological order.

```text
Lesson evidence 1
   + Lesson evidence 2
   + ...
   -> recurrence check
   -> longitudinal signal candidate
   -> teacher review
   -> current priority / next action
```

A single lesson cannot prove recurrence. Repeated wording in legacy summaries does not prove recurrence either.

## Privacy rule

The public repository stores the protocol, schemas, anonymized status, counts, hashes, and claim classifications. It must NOT receive new raw learner transcript excerpts, private Drive links, private emails, or expanded student PII as part of this audit. Full source excerpts and source-to-learner mapping belong in the private Drive audit corpus.

## Publication freeze during rebuild

Until a learner's source corpus has been reconciled:

- legacy Class Reports stay visible only as legacy/current projection artifacts according to existing product rules;
- no V2 extraction auto-publishes;
- no V2 signal becomes canonical by generation alone;
- no V2 teacher insight becomes official by generation alone;
- no level change, progress claim, attendance claim, or closed-loop claim is inferred;
- missing evidence remains missing.

## Completion criteria

Corpus Reprocessing v2 is complete only when:

1. source inventory is globally deduplicated across all relevant Drive folders;
2. every candidate source has a source class and lesson identity status;
3. every real lesson has a Corpus Report v2 or explicit `NOT_PROCESSABLE` reason;
4. every legacy Class Report has a source-level comparison;
5. learner-level longitudinal patterns are rebuilt from chronological V2 evidence;
6. teacher-authority boundaries are preserved;
7. any canonical/dashboard changes are separate reviewed changes;
8. a final proof matrix distinguishes source proof, teacher observation, inference, authority, projection, execution, and closed-loop evidence.

## Current finding that justified the rebuild

The first source-level sample inspected in this lane demonstrated that an old narrative Class Report can materially underrepresent its underlying transcript: the source contains timestamped student production, explicit corrections, vocabulary examples, teacher interventions, action suggestions, and the full raw turn-by-turn transcript. This confirms that the source corpus must be reprocessed before judging historical evidence coverage from the Dashboard alone.
