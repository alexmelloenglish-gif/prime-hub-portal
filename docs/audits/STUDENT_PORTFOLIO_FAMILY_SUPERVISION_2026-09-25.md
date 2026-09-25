# Student / Family Portfolio Supervision — 2026-09-25

**Status:** implementation candidate — repository regeneration complete; external Google Docs not yet rewritten/read back  
**Branch:** `fix/student-portfolio-family-supervision-2026-09-25`  
**Scope:** nine active authorized learners only

## Purpose

The new Learning Machine and canonical projection layers preserve technical provenance, hashes, verification state and internal authority metadata. Those fields are necessary for audit and machine safety, but they must not leak into the learner/family Portfolio.

This supervision lane creates a separate presentation step:

```text
verified learner state / class history / next action
        ↓
family-portfolio presentation generator
        ↓
plain-language nineteen-section edition
        ↓
student/family review surface
```

It does **not** rewrite G2–G5 canonical records, PipelineRun history, Teacher Authority or source evidence.

## Learners regenerated

- Rafael Copolillo
- Louise D. Silva Nogueira
- Italo Pires
- Eduarda Coelho Gabriel
- Laura Maria Galvão Costa Stempniewski
- Maria Fernanda Galvão Costa Stempniewski
- Diego da Silva Rodrigues
- Cláudio Bittencourt
- Gustavo Drummond de Andrade Salgado

Each edition is generated from the learner's current repository-backed supervised snapshot and preserves the complete currently represented Class Report history.

## Presentation rules enforced

- all nineteen family/student Portfolio sections are present;
- a concise first-read summary is included;
- internal machine vocabulary is blocked from the generated copy;
- progress labels are normalized to exactly:
  - Strong
  - Improving
  - Needs Focus
  - Not Assessed
- no Class Report is invented;
- missing information remains explicit;
- current level / target level are preserved rather than promoted automatically;
- next action is written as a learner-facing activity, not as an internal state transition;
- technical provenance remains in Teacher Intelligence / audit records, not in the family edition.

## Important findings

The existing repository snapshots contain internal control metadata such as `teacher-validated`, `portfolio-confirmed`, projection qualifiers and provenance notes. Those values are useful internally and are intentionally **not deleted**. The new presentation generator consumes only the pedagogically useful values and rewrites internal labels into readable learner/family language.

The older Markdown Portfolio register files for Rafael, Louise and Cláudio also contain implementation/governance language. They remain historical/internal register evidence and are not treated as the new family-facing copy.

## External Google Docs boundary

The core registry points to one external Google Doc Portfolio for each active learner. This branch does **not** claim those live Google Docs have been rewritten, because the current execution environment does not expose a writable Google Drive document connector/mount for those files.

Therefore:

- repository family editions: **generated and supervised**
- external Google Docs: **sync/read-back still required**
- dashboard / canonical learner state: **unchanged by this branch**

The next external publication step must copy/synchronize the supervised edition into each learner's canonical Google Doc and read it back before claiming that every live Portfolio is updated.

## Acceptance proof

`scripts/student-family-portfolio-supervision-self-test.mjs` verifies:

1. exactly one family edition for each active authorized learner;
2. required nineteen-section structure;
3. no forbidden internal implementation vocabulary;
4. only the four frozen learner-facing progress labels;
5. Class Report count matches the supervised source snapshot;
6. every edition retains its external canonical Portfolio destination reference.

