# PRIME — Diego / Eduarda Longitudinal Proof Reconciliation

**Date:** 2026-09-15  
**Purpose:** directly bind the Diego/Eduarda claim to the repository witnesses that were missing from the PR #20 audit path.  
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
- explicit evidence tying the action to the canonical Portfolio v1.0;
- longitudinal evidence describing the four dated lessons.

The record does not claim that Diego has already advanced from A2 to B1.

## 3. Eduarda — direct repository witness

Source file:

`data/students/eduarda-coelho-gabriel-hotmail-com.firestore.json`

The record identifies Eduarda as a `canonical_longitudinal_profile` sourced from `canonical_portfolio` and uses the same `student-dashboard-v1.0` projection contract.

It contains:

- 7 present lessons with pedagogical content;
- 7 published class reports;
- one additional 3 July agenda encounter retained as `pending`;
- no reconstructed content for that unresolved encounter;
- current state **Assessment pending**;
- target **School-task performance target pending**;
- 3 current priorities;
- next action **Six-question independence check**;
- next-action `authorizationStatus = qualified`;
- explicit evidence tying the follow-up to the canonical portfolio.

The record does not infer a CEFR level from the seven lessons.

## 4. Same engine contract, different learner result

| Dimension | Diego | Eduarda |
|---|---|---|
| Longitudinal record | 4 lessons | 7 documented lessons + 1 unresolved agenda encounter |
| Context | Professional English / global business | School support / English-medium Geography |
| Current state | CEFR A2 | Assessment pending |
| Target | CEFR B1 | School-task performance target pending |
| Priority set | Executive clarity / accuracy / business reuse | Complete responses / modals / Geography explanation |
| Next action | 60–90 Second Executive Response | Six-question independence check |

The two next-action IDs and the two current objectives are asserted to be different by the executable test.

## 5. Evidence-bounded behavior

The strongest direct witness for the final clause of the claim is Eduarda's unresolved 3 July encounter:

- the agenda encounter remains `pending`;
- the summary explicitly says the lesson content is not reconstructed;
- no class report is generated for `eduarda-2026-07-03`;
- no CEFR is inferred from lesson count;
- guided practice is not promoted to independent mastery.

Diego's projection similarly preserves the boundary between current level and target level rather than claiming advancement.

## 6. Executable proof

The repository self-test was extended to load the actual Diego and Eduarda student snapshots and assert the complete projection witness.

File:

`scripts/student-dashboard-contract-self-test.mjs`

It now verifies:

1. canonical longitudinal profile/source declarations;
2. `student-dashboard-v1.0` for both learners;
3. Diego's 4 lessons / 4 reports;
4. Eduarda's 7 lessons / 7 reports;
5. priorities for both learners;
6. distinct next actions;
7. action authorization/status boundaries;
8. Diego A2/B1 without inferred advancement;
9. Eduarda Assessment pending without invented CEFR;
10. preservation of the unresolved 3 July encounter;
11. absence of a fabricated 3 July report;
12. distinct learner objectives.

Test commit:

`b00db85cf7a5e610d8d4b4203bf142b2edc8ecf5`

## 7. Proof status

### PROVED — repository projection

The actual repository records for Diego and Eduarda demonstrate that PRIME can take distinct longitudinal learner records and expose evidence-bounded current priorities and different next actions through the same canonical dashboard projection contract.

### PROVED — personalization at the projection level

The two learners do not receive the same current objective, priority set or next action. The test asserts this explicitly.

### PROVED — unsupported state is preserved

Eduarda's unresolved 3 July encounter is not reconstructed, and her CEFR state remains unassessed. Diego's target level is not presented as an achieved level.

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

The PR #20 auditor was correct that its own inspected source set did not establish the joint Diego/Eduarda claim. The correction is now explicit: the claim is bound to the actual student projection records and an executable test, rather than to a prose synthesis alone.

The safe external formulation is:

> **PRIME can project real longitudinal learner records into evidence-bounded current priorities and next actions without fabricating unsupported state.**

with the scope understood as **projection-level proof**, not proof of a closed learning loop or educational impact.
