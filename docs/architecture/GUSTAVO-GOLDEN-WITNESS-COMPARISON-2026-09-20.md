# Gustavo Golden-Witness Comparison — Blind Replay vs Current Reference

Date: 2026-09-20
Status: COMPARISON COMPLETE / FULL CONTRACT CERTIFICATION NOT YET ACHIEVED

## Inputs

A1. Manus blind replay final output: PRIME Learning Machine v2.1, five lessons (18 Aug–15 Sep 2026), REFERENCE CERTIFICATION, five teacher decisions recorded as APPROVE EXACT PAYLOAD. Golden Witness was not available to that executor during replay.

A2. Perplexity blind replay: same PRIME-LM-v2.1 blind protocol; five chronological lessons; five APPROVE EXACT PAYLOAD decisions; final replay generated only after Lesson 5 approval; Golden Witness not consulted during blind processing.

B. Golden Witness/reference: current Gustavo repository profile on main, studentId stu_4c4da6c04ac4, containing five published Class Reports, canonical projection, progress tracker, cumulative impact and Young Learner journey configuration.

C. Contract: Unified Lesson & Portfolio Contract vNext on this architecture branch.

## Contamination check

PASS for the comparison design: the blind replay explicitly states Golden Witness was not supplied during processing. Comparison is therefore post-replay.

This does not independently prove every source-isolation property of the external execution; it records the supplied audit manifest and compares its final semantics.

## Cross-executor finding — Manus vs Perplexity

Both external executors preserve chronology, ASR limitations, baseline NONE, no CEFR inference, no regression inference, support-sensitive interpretation, no ESTABLISHED mastery, and REFERENCE CERTIFICATION separated from production.

The main difference is projection/state compression. Perplexity places some past-simple, health/science and base/past work in DEVELOPING and short present/past responses in RECENT. Manus more explicitly leaves independent past production UNRESOLVED and self-correction as a RECENT EVENT. This is a Class B pedagogical/projection-label difference, not a Class A contradiction in the lesson events.

Reconciliation: DEVELOPING may describe an area under development but must not imply independently demonstrated control. Independent past production remains UNRESOLVED until comparable low-support evidence exists. Self-correction remains event evidence until recurrence supports a longitudinal capability claim.

Perplexity also proposes extra next-lesson checks (weekly routine/calendar, should/shouldn't, spelling). These are planning candidates, not learner-state contradictions.

## Core semantic comparison

| Dimension | Blind replay | Golden Witness | Assessment |
|---|---|---|---|
| Five-lesson chronology | 18 Aug, 25 Aug, 1 Sep, 8 Sep, 15 Sep | same five dates | ALIGNED |
| Personal communication | DEVELOPING; recurrent participation with variable support | Real-life speaking = Strong; willingness/participation emphasized | PARTIALLY ALIGNED; labels are not semantically equivalent |
| Independent past production | UNRESOLVED | Improving; sometimes independent, sometimes supported | COMPATIBLE ONLY WITH BOUNDARY; GW must not imply stable independence |
| Present/past distinction | developing; requires comparable new-context tasks | Improving; consistency varies | ALIGNED |
| Self-correction | RECENT EVENT; one observed event | Improving, based on 15 Sep I don't → No, I didn't | EVENT ALIGNED; GW status label risks over-reading |
| Science through English | RECENT / SUPPORTED | Improving; mixed independent retrieval/support | ALIGNED WITH GW richer teacher interpretation |
| Nutrients/digestion | RECENT / SUPPORTED | preserved vocabulary/content; mixed retrieval | ALIGNED |
| Superlatives | RECENT / SUPPORTED; spontaneous use unconfirmed | language being built; check-in target | ALIGNED |
| Pronunciation | NOT ASSESSED | no pronunciation progress claim in canonical projection | ALIGNED |
| Regression | NOT CLAIMED | no regression claim | ALIGNED |
| CEFR | UNKNOWN because no verified prior state supplied | teacher-validated A1 progressing toward A2; no level change from five lessons | NOT A CONTRADICTION: different authorized input scope |
| CEFR movement | NOT CLAIMED | explicitly no CEFR change from five lessons | ALIGNED |
| Next direction | open past story, Do/Did, delayed Science retrieval, self-correction | new real past story, Do/Did, retrieve before help, awareness check-in | STRONGLY ALIGNED |

## Critical interpretation

The external blind replays and Golden Witness tell substantially the same learning film on the central claims:
- repeated personal communication;
- past language remains in development rather than mastered;
- support level matters;
- Science retrieval is mixed/supported;
- one self-correction is meaningful but not generalized;
- no regression;
- no CEFR movement from the five-lesson sequence;
- next lesson should create cleaner independent retrieval opportunities.

The most important differences are not evidence contradictions. They arise from projection vocabulary and input authority.

### 1. CEFR UNKNOWN vs A1 progressing toward A2
The blind replay correctly refused to reconstruct CEFR because its baseline was NONE. The Golden Witness has a separately teacher-validated prior/current CEFR state. Therefore the correct reconciliation is provenance, not choosing one output over the other:
- transcript-only replay: CEFR UNKNOWN;
- authorized teacher/canonical baseline: A1 progressing toward A2;
- five-lesson evidence: NO CEFR CHANGE CLAIM.

This is exactly why baseline provenance must remain explicit.

### 2. Strong / Improving labels are too compressed
The Golden Witness uses learner/family-friendly labels such as Strong and Improving. The blind replay is more precise about what the evidence proves.

Two specific projection risks:
- Real-life speaking = Strong can be read as strong speaking proficiency, while the evidence supports strong participation/willingness plus variable linguistic support.
- Self-correction = Improving can suggest a longitudinal capability trend when the strongest shared evidence is one recent self-correction event.

Required contract refinement: projection labels must declare their dimension. Example:
- Engagement/participation: STRONG;
- independent language performance: DEVELOPING/UNRESOLVED;
- self-correction evidence: RECENT EVENT / emerging observation.

Do not allow a generic positive label to collapse engagement, proficiency, independence and longitudinal change.

## Golden-Witness contract checks

### Demonstrated or supported by supplied replay
- chronology preserved;
- teacher model/support not automatically equated with independent production;
- uncertainty preserved;
- no pronunciation inference from transcript;
- no regression inferred from missing opportunity;
- planned next tasks kept as future verification;
- processor/replay output does not claim production publication;
- teacher authority represented by five exact-payload approvals.

### Not demonstrated by this replay
The following vNext acceptance cases require dedicated runtime/fixture tests:
1. same lesson reprocessed → no duplicates;
2. rejected teacher interpretation propagates removal through dependents;
3. corrected confirmed report creates versioned replacement;
4. late-arriving old lesson handling;
5. publication failure retry without reapproval;
6. stale-memory proposal conflict/reconciliation;
7. learner self-rating stored as self-perception, never proficiency;
8. Teacher/Learner/Family projection generation from one persisted authority graph;
9. published-but-unseen Family projection remains unacknowledged;
10. communication event cannot mutate pedagogical state.

Therefore REFERENCE CERTIFICATION is valid for the blind replay, but it is not equivalent to full Unified Contract certification.

## Required contract amendments exposed by comparison

1. Add typed projection dimensions so status labels cannot collapse participation, performance, independence, evidence recency and progress.
2. Add explicit baseline provenance rule:
   transcript-derived UNKNOWN may coexist with separately authorized teacher/canonical state; the projection must identify the authority source.
3. Add comparison rule:
   executor equivalence means semantic/evidentiary compatibility, not identical wording or identical amount of prior context.
4. Keep self-correction as event evidence until recurrence supports a longitudinal capability claim.
5. Family/Young Learner language may be encouraging, but cannot silently strengthen the underlying evidence claim.

## Decision

MANUS ↔ GOLDEN WITNESS: SEMANTIC CORE COMPATIBLE.

PERPLEXITY ↔ GOLDEN WITNESS: SEMANTIC CORE COMPATIBLE WITH PROJECTION-LABEL RECONCILIATION.

MANUS ↔ PERPLEXITY: NO MATERIAL CLASS-A FACTUAL CONTRADICTION FOUND; CLASS-B DIFFERENCES EXIST IN STATE COMPRESSION AND NEXT-LESSON EMPHASIS.

GOLDEN-WITNESS SEMANTIC CORE: CROSS-EXECUTOR COMPATIBLE.

FULL vNext ACCEPTANCE SUITE: NOT YET COMPLETE.

The two external replays pass the intended blind-reference comparison at the semantic/evidentiary core on the central pedagogical film, while exposing projection-label typing and baseline-provenance requirements that should be added to the contract before generalization.

## Next gate

Amend vNext contract with typed projection dimensions + baseline provenance, then create executable/fixture acceptance tests for the runtime cases not exercised by the external blind replay. No production mutation is authorized by this comparison.
