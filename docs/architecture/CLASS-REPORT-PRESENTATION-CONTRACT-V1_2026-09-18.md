# PRIME Digital Hub — Frozen Class Report Presentation Contract v1.0

**Status:** FROZEN  
**Effective date:** 18 September 2026  
**Scope:** Every persisted attended lesson rendered in a Student Learning Portfolio  
**Authority:** PRIME Learning Machine canonical presentation contract  
**Change policy:** Any semantic change requires a new version. Existing historical reports are never silently deleted; they may be regenerated as versioned projections from verified source/canonical evidence.

## 1. Purpose

A Class Report is the learner/family-facing longitudinal record of one attended lesson. It is not a transcript dump, an AI summary, or a substitute for the Canonical Learning Record. It must preserve useful lesson evidence in a stable structure so that every lesson contributes comparably to persistent learning memory.

## 2. Non-negotiable rule

**CLASS REPORT SCHEMA IS NON-NEGOTIABLE.**

Every persisted attended lesson MUST render all mandatory blocks below. A block may explicitly state that no verified item is available, but it MUST NOT silently disappear.

The machine MUST NOT omit a required block merely because:
- no correction was observed;
- no vocabulary item deserves long-term promotion;
- no new grammar point was introduced;
- the lesson focused on school content;
- the evidence is thin.

Missing evidence is represented explicitly. It is never fabricated.

## 3. Mandatory Class Report blocks

### CR-01 — Class Identity
Must contain:
- class number or stable lesson label;
- lesson date;
- attendance status;
- source/reference statement;
- lesson focus.

### CR-02 — What We Worked On
Concise factual account of the instructional event:
- communicative/task context;
- language/content worked on;
- materials or activity types when relevant.

### CR-03 — Learning Evidence / What We Noticed
Must distinguish observation from interpretation.
Include only claims traceable to the lesson source or verified prior canonical state.

### CR-04 — Priority Corrections
Must always be rendered as a three-part comparison:
- **Original / Emerging Form**
- **Corrected / More Natural English**
- **Key Point**

Rules:
- only source-grounded or teacher-confirmed corrections may be persisted;
- ASR corruption must never be converted into a learner error;
- if no correction is safely verifiable, render: **No priority correction persisted from this lesson.**

### CR-05 — Vocabulary Bank — This Lesson
Must always be rendered.
Each retained item should include:
- term / phrase;
- learner-useful meaning or function;
- example or lesson context.

Rules:
- prefer reusable, pedagogically useful language;
- one-off words with no longitudinal value need not be promoted;
- if none qualify, render: **No new vocabulary promoted to long-term memory from this lesson.**

### CR-06 — Grammar Review — This Lesson
Must always be rendered.
For each relevant structure include:
- structure / pattern;
- observed use or lesson evidence;
- current learning note.

Rules:
- do not claim mastery from exposure alone;
- supported production must remain distinguishable from independent production;
- if no grammar claim is supported, render: **No new grammar claim persisted from this lesson.**

### CR-07 — Support / Independence Level
When production or retrieval is evaluated, use the common comparison scale:
- **Independent**
- **One clue**
- **Model**

The report must preserve the difference between independent retrieval and supported success. Correct answers with different levels of support are not treated as equivalent evidence.

### CR-08 — Teacher Feedback / Current Priority
Must state:
- the most useful pedagogical takeaway from this lesson;
- what should receive attention next;
- no personality, motivation, intelligence, discipline, or diagnostic claims unless separately authorized by an appropriate source and contract.

### CR-09 — Recommended Next Steps
Must contain concrete, executable next actions. Where possible include a success condition or observable comparison for the next lesson.

### CR-10 — Evidence Boundaries
Must explicitly retain important non-claims, including when relevant:
- unverified test results;
- unverified homework completion;
- access/logistics facts that are not learning evidence;
- pronunciation not assessable from ASR transcript alone;
- unsupported CEFR movement;
- ambiguous transcript fragments;
- any claim intentionally not persisted.

## 4. Incremental vs cumulative memory

Every lesson contributes an **incremental Class Report**. The Portfolio also maintains cumulative projections.

### Incremental lesson contribution
- Priority Corrections — this lesson
- Vocabulary Bank — this lesson
- Grammar Review — this lesson
- lesson evidence
- teacher priority
- next steps

### Cumulative Portfolio memory
- longitudinal Current Learning State;
- Learning Patterns;
- cumulative Vocabulary Bank;
- cumulative Grammar & Accuracy Overview;
- Teacher Feedback & Growth Priorities;
- Attendance & Class History;
- all versioned Class Reports.

A new lesson MUST update cumulative memory only where supported by new evidence. It MUST NOT erase older valid memory simply because the latest lesson had a different focus.

## 5. Longitudinal preservation

1. Class Reports are append-preserving historical memory.
2. Existing reports are never silently deleted.
3. A corrected/regenerated report must preserve lineage and source attribution.
4. A single lesson may add RECENT/DEVELOPING evidence but cannot by itself establish a long-term stable strength unless the applicable evidence rules are satisfied.
5. CEFR movement requires separate teacher-authorized evidence; it is never inferred automatically from a Class Report.
6. Recurrent patterns require comparison with verified prior evidence.

## 6. Source and ASR safety

- Transcript artifacts are not pronunciation errors.
- Unclear source fragments remain unclear.
- Operational facts such as scores, homework and portal access remain unverified unless resolved by source.
- A learner correction must come from observable learner production plus teacher correction/reformulation, or from an explicit teacher-confirmed record.
- The report may paraphrase evidence for readability but may not strengthen the claim beyond its source.

## 7. Rendering consistency

Every Class Report must preserve the same visible section order:

1. Class Identity  
2. What We Worked On  
3. Learning Evidence / What We Noticed  
4. Priority Corrections  
5. Vocabulary Bank — This Lesson  
6. Grammar Review — This Lesson  
7. Support / Independence Level  
8. Teacher Feedback / Current Priority  
9. Recommended Next Steps  
10. Evidence Boundaries

No report may omit a numbered section. Empty evidence is represented by the contract-approved explicit empty-state sentence.

## 8. Family-facing standard

The report should be understandable without exposing internal pipeline language. Do not render:
- evidence IDs;
- candidate confidence;
- G1–G6 names;
- hashes;
- repository/Firestore/runtime terminology;
- internal authority-state labels.

The family-facing report should explain:
- what was worked on;
- what the learner demonstrated;
- what remains developing;
- what is being corrected/recycled;
- useful vocabulary/grammar to retain;
- what comes next.

## 9. Contract test

A Class Report is **COMPLIANT** only if:
- all CR-01 through CR-10 are present;
- correction/vocabulary/grammar blocks use explicit empty states when needed;
- evidence boundaries are present;
- no unsupported CEFR/progress/mastery claim is introduced;
- longitudinal memory is preserved;
- source-grounded corrections are distinguishable from ASR artifacts.

Failure of any item is **NON-COMPLIANT** and must block canonical Portfolio projection until corrected.

## 10. Frozen decision

Effective 18 September 2026:

> Every persisted attended lesson in PRIME must render a complete, structurally stable Class Report. Priority Corrections, Vocabulary Bank — This Lesson, and Grammar Review — This Lesson are mandatory visible blocks, not optional editorial choices. A section may truthfully be empty; it may not disappear.

This contract is additive to the PRIME Learning Machine authority rules. It does not weaken teacher validation, canonicalization, read-back verification, or authorized projection requirements.
