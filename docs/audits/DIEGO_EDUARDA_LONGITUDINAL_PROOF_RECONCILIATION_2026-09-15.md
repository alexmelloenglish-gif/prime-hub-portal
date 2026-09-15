# PRIME — Diego / Eduarda Longitudinal Proof Reconciliation

**Date:** 2026-09-15  
**Purpose:** directly bind the Diego/Eduarda claim to executable repository witnesses.  
**Scope:** projection-level proof.  
**Upstream-source boundary:** the student snapshots declare the canonical portfolio as their source authority. This document does not pretend that GitHub independently re-authenticates the external Google Docs.

## 1. Exact claim

> **PRIME can project real longitudinal learner records into evidence-bounded current priorities and next actions without fabricating unsupported state.**

The earlier PR #20 audit could not certify this jointly because its inspected document set did not directly include the Diego/Eduarda student projection records. The repository now has a case-specific executable witness for both learners.

## 2. Diego — direct repository witness

Source file:

`data/students/diegodasiro-gmail-com.firestore.json`

The record identifies Diego as a `canonical_longitudinal_profile` sourced from `canonical_portfolio` and uses the `student-dashboard-v1.0` projection contract.

It contains:

- 4 present lesson records;
- 4 published class reports;
- current state **CEFR A2**;
- target **CEFR B1**;
- 3 current priorities;
- next action **60–90 Second Executive Response**;
- next-action `authorizationStatus = portfolio-confirmed`;
- explicit evidence tying the action to the canonical Portfolio v1.0.

The record does not claim that Diego has already advanced from A2 to B1.

## 3. Eduarda — direct repository witness

Source file:

`data/students/eduarda-coelho-gabriel-hotmail-com.firestore.json`

The record identifies Eduarda as a `canonical_longitudinal_profile` sourced from `canonical_portfolio` and uses the same `student-dashboard-v1.0` projection contract.

It contains:

- exactly **7 learner-facing lessons**, all with documented pedagogical content;
- exactly **7 published class reports**;
- current state **CEFR A1**, teacher-validated from the corrected canonical portfolio;
- target **CEFR A2**, teacher-validated and explicitly treated as a target;
- 3 current priorities;
- next action **Six-question independence check**;
- next-action `authorizationStatus = qualified`;
- explicit evidence tying the follow-up to the longitudinal portfolio evidence;
- consistent report transfer points using `Evidence → Boundary/Interpretation → Next verification`.

The canonical source also contains a 3 July agenda record. That fact is preserved in the repository as `sourceProvenance.nonProjectedRecords`, with `classification = source-only`. It is **not projected as a learner lesson**, generates **no class report**, and contributes no synthetic pedagogical state.

## 4. Same engine contract, different learner result

| Dimension | Diego | Eduarda |
|---|---|---|
| Longitudinal record | 4 lessons | 7 pedagogically documented lessons |
| Context | Professional English / global business | School support / English-medium Geography |
| Current state | CEFR A2 | CEFR A1 |
| Target | CEFR B1 | CEFR A2 |
| Priority set | Executive clarity / accuracy / business reuse | Complete responses / modals / Geography explanation |
| Next action | 60–90 Second Executive Response | Six-question independence check |

The two next-action IDs and the two current objectives are asserted to be different by the executable test.

## 5. Evidence-bounded behavior

Eduarda demonstrates the final clause of the claim through a deliberate source/projection separation:

- only the seven pedagogically documented lessons enter the learner-facing projection;
- the 3 July agenda fact remains preserved as source provenance;
- the source-only 3 July record is excluded from learner lesson history;
- no report is created for 3 July;
- A1 remains current while A2 remains a target;
- guided practice is not promoted to independent mastery;
- the recommended next action remains unexecuted until new evidence exists.

The required rule is:

`source provenance ≠ learner lesson ≠ pedagogical evidence ≠ learner-facing projection`

Diego's projection similarly preserves the boundary between current level and target level rather than claiming advancement.

## 6. Executable proof

The repository self-tests load the actual Diego and Eduarda student snapshots and assert the projection witness.

Files:

- `scripts/student-dashboard-contract-self-test.mjs`
- `scripts/student-dashboard-contract-regression-self-test.mjs`
- `tests/fixtures/student-dashboard/eduarda.canonical.fixture.json`

They now verify:

1. canonical longitudinal profile/source declarations;
2. `student-dashboard-v1.0` for both learners;
3. Diego's 4 lessons / 4 reports;
4. Eduarda's 7 learner-facing lessons / 7 reports;
5. priorities for both learners;
6. distinct next actions;
7. action authorization/status boundaries;
8. Diego A2/B1 without inferred advancement;
9. Eduarda A1/A2 with both states teacher-validated and A2 treated only as target;
10. absence of a 3 July learner lesson;
11. absence of a 3 July class report;
12. preservation of the 3 July source fact in `sourceProvenance.nonProjectedRecords`;
13. classification of that source record as `source-only`;
14. regression failure if that provenance is removed or promoted to learning evidence;
15. standardized transfer points across all seven Eduarda class reports;
16. distinct learner objectives.

Historical proof baseline:

`dc98ad11f9e1c3eaccc4b412674840f6cca8f3f5`

The current witness supersedes the older Eduarda learner-state details while preserving the same projection-level proof scope.

## 7. Proof status

### PROVED — repository projection

The actual repository records for Diego and Eduarda demonstrate that PRIME can take distinct longitudinal learner records and expose evidence-bounded current priorities and different next actions through the same canonical dashboard projection contract.

### PROVED — personalization at the projection level

The two learners do not receive the same current objective, priority set or next action. The test asserts this explicitly.

### PROVED — source truth is preserved without pedagogical promotion

Eduarda's 3 July agenda fact remains auditable as source provenance while being excluded from learner-facing lesson/report state. Her current A1 state is not silently promoted to target A2. Diego's target B1 is likewise not presented as achieved.

This is stronger than either erasing the source record or displaying it as an unresolved learner item: the provenance remains intact while the learner projection contains only authorized pedagogical material.

## 8. Still not proved by this witness

This proof does **not** establish:

- execution of either next action;
- an authenticated learner attempt after the action;
- a new Candidate;
- second teacher review;
- a closed Engine cycle;
- causal improvement in proficiency, motivation or retention;
- autonomous AI pedagogical decisions;
- independent re-authentication of the external Google Docs.

Those remain separate proof milestones.

## 9. Correct audit interpretation

The PR #20 auditor was correct that its own inspected source set did not establish the joint Diego/Eduarda claim. The correction is explicit: the claim is bound to the actual student projection records and executable tests, rather than to a prose synthesis alone.

The safe external formulation remains:

> **PRIME can project real longitudinal learner records into evidence-bounded current priorities and next actions without fabricating unsupported state.**

with the scope understood as **projection-level proof**, not proof of a closed learning loop or educational impact.
