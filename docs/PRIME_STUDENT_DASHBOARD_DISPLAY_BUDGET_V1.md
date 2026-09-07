# PRIME Student Dashboard — Display Budget & Vocabulary Reuse v1.0

**Status:** LOCKED — AUTHORIZED FOR IMPLEMENTATION  
**Effective date:** 7 September 2026  
**Authority:** Canonical addendum to the PRIME Student Dashboard v1.0 Locked Truth & Projection Contract.

## Governing principle

The dashboard is a projection, not a dump of the learner database. More stored learning memory must not produce an increasingly long student-facing page.

The full authorized history remains preserved in MEMORY / Portfolio. The dashboard exposes only the amount that is pedagogically useful now.

## v1 display budget

| Surface | Maximum visible items |
| --- | ---: |
| Current State | 4 governed fields |
| What Changed | 1 |
| Current priorities | 3 |
| Next authorized action | 1 |
| RECENT lessons | 3 |
| RECENT class reports | 3 |
| Focus tags inside a class report | 3 |
| Vocabulary terms inside a class report | 5 |
| Progress cards in MEMORY | 4 |
| Active vocabulary for reuse | 5 |
| Grammar practice patterns | 3 |
| Current teacher-feedback synthesis | 1 |

These are display limits, not storage limits. No historical record is deleted because it falls outside a display budget.

## Vocabulary doctrine: actionable reuse, not transcript exhaust

The cumulative vocabulary bank must not become a list of every incidental word that happened to occur in a lesson.

The student-facing vocabulary surface has a different purpose: **retrieval, ownership and reuse**.

### Active set

- A maximum of **5 vocabulary items** is displayed in the active reuse set.
- The full authorized vocabulary bank remains longitudinal MEMORY.
- In v1, the deterministic selector first uses vocabulary contained in the most recent published class report and matched to the cumulative bank.
- If fewer than five matching items exist, the remaining positions are filled with the newest authorized vocabulary-bank entries.
- Duplicate terms are removed.
- A future teacher-curation layer may replace this selection rule only through an explicit canonical contract update.

### Student-authored example rule

The reuse sentence shown under an active word must come from the student.

The dashboard must not present a system-written example as the student's reuse task.

For each active vocabulary item:

1. PRIME shows the word and its authorized meaning.
2. The student writes a sentence they personally create.
3. The student explicitly locks/saves the sentence.
4. A successfully locked sentence becomes persistent learner memory.
5. When that vocabulary term returns to the active review set, the student's previously locked sentences return underneath it.
6. v1 does not provide edit or delete controls for a locked sentence. A locked sentence is an immutable learning-memory record.
7. The system may not silently rewrite, autocomplete or substitute the student's sentence.
8. A failed persistence operation must be shown as a failure; the interface must never display an unsaved sentence as locked.

## Storage and identity

Vocabulary reuse memory is keyed by stable student identity plus normalized vocabulary term. It is separate from the source vocabulary-bank entry so that reordering, review cycles or later projections do not destroy the student's own sentence history.

Each locked sentence preserves:

- student identifier where available;
- student email / canonical access identity;
- normalized vocabulary key;
- vocabulary term at time of submission;
- exact student-authored sentence;
- lock timestamp;
- creation timestamp.

## Scale rule

The design must remain coherent whether the underlying learner memory contains 20 vocabulary items or 2,000. Growth belongs in MEMORY; the active dashboard remains bounded.
