# PRIME — Diego / Eduarda Longitudinal Proof Reconciliation

**Date:** 2026-09-15  
**Purpose:** close the specific proof gap identified by the audit of PR #20 by making the Diego and Eduarda repository witnesses directly auditable from the claim itself.  
**Scope:** projection-level proof from the canonical student snapshots committed in the repository.  
**Important boundary:** this document does not claim that the external Google Docs are independently re-authenticated by GitHub. The repository snapshots explicitly declare their source authority as the canonical portfolio; the claim proved here is the behavior and evidence-bounded content of the resulting PRIME projection.

## 1. The exact claim under reconciliation

> **PRIME can project real longitudinal learner records into evidence-bounded current priorities and next actions without fabricating unsupported state.**

The earlier PR #20 audit correctly rejected this as a jointly demonstrated claim because the auditor did not directly inspect the Diego/Eduarda repository witnesses or a case-specific executable test. This document closes that documentation/proof gap at the repository-projection level.

## 2. Primary repository witnesses

### Diego

Primary repository witness:

`data/students/diegodasiro-gmail-com.firestore.json`

The record declares:

- `profileCompleteness = canonical_longitudinal_profile`;
- `dashboardSourcePolicy = authorized_repository_snapshot`;
- `profileSource.sourceAuthority = canonical_portfolio`;
- four present lesson records;
- four published class reports;
- `canonicalProjection.version = student-dashboard-v1.0`.

The projection contains three current priorities:

1. Executive clarity in professional answers;
2. High-frequency grammar accuracy;
3. Active business-language reuse.

The projection then contains the distinct next action:

**60–90 Second Executive Response**

with `authorizationStatus = portfolio-confirmed`, `status = portfolio-confirmed`, and explicit evidence text stating that the action is recorded in the canonical Portfolio v1.0.

The same record preserves the current state as **CEFR A2 → CEFR B1** without claiming that the level has already changed. Both level fields are `portfolio-confirmed`.

The longitudinal record explicitly connects four dated lessons (6 June, 27 June, 12 July, 25 July) to the current learner model.

### Eduarda

Primary repository witness:

`data/students/eduarda-coelho-gabriel-hotmail-com.firestore.json`

The record declares:

- `profileCompleteness = canonical_longitudinal_profile`;
- `dashboardSourcePolicy = authorized_repository_snapshot`;
- `profileSource.sourceAuthority = canonical_portfolio`;
- seven present lessons with pedagogical content;
- seven published class reports;
- one additional 3 July agenda encounter deliberately retained as `pending` without reconstructed lesson content;
- `canonicalProjection.version = student-dashboard-v1.0`.

The projection contains three current priorities:

1. Build complete English responses with less support;
2. Use `can/can't` and `should/shouldn't` with meaning;
3. Explain Geography concepts in English.

The projection then contains the distinct next action:

**Six-question independence check**

with `authorizationStatus = qualified`, `status = qualified`, and explicit evidence text stating that the follow-up is recommended in Eduarda's canonical portfolio.

The current state deliberately remains:

- `Assessment pending`;
- `School-task performance target pending`.

Neither is converted into a CEFR level.

The incomplete 3 July encounter is not converted into a fabricated report. The repository contains no class report for `eduarda-2026-07-03`.

## 3. The two learners are demonstrably different

The projection is not a shared hard-coded template with one universal action.

| Proof dimension | Diego | Eduarda |
|---|---|---|
| Longitudinal lessons | 4 | 7 pedagogically documented |
| Current context | Professional English / global business | School support / English-medium Geography |
| Current state | CEFR A2, target B1 | Assessment pending, school-task target pending |
| Priority set | Executive clarity, accuracy, business reuse | Complete responses, modals, Geography explanation |
| Next action | 60–90 Second Executive Response | Six-question independence check |
| Unsupported state preserved | Yes | Yes |

The self-test explicitly asserts that the two next-action IDs and current objectives are different.

## 4. Evidence-bounded behavior

The claim's final clause — **without fabricating unsupported state** — is directly witnessed in Eduarda's record:

- seven pedagogically documented lessons are represented;
- the 3 July agenda-only encounter remains `pending`;
- its lesson content is explicitly not reconstructed;
- no class report is created for that encounter;
- no CEFR level is inferred from lesson volume;
- independent mastery is not promoted from guided practice.

Diego's record applies the same boundary in a different context:

- A2 is recorded as the current portfolio-confirmed level;
- B1 is recorded as the target;
- no new CEFR change is inferred from the dashboard;
- schedule remains `unknown` because no current calendar event is verified.

## 5. Executable proof added to the repository

The existing Student Dashboard v1 contract self-test previously covered Ítalo but did not directly assert the Diego/Eduarda witnesses. That was an avoidable proof gap.

The test now loads both repository records and asserts:

- canonical longitudinal profile status;
- canonical portfolio source authority declaration;
- `student-dashboard-v1.0` projection version;
- Diego's 4 lesson / 4 report longitudinal record;
- Eduarda's 7 lesson / 7 report longitudinal record;
- current priorities for each learner;
- distinct next actions;
- authorization/status boundaries on the next actions;
- Diego's A2/B1 state without inferred advancement;
- Eduarda's `Assessment pending` state without invented CEFR;
- preservation of Eduarda's unresolved 3 July encounter;
- absence of a fabricated 3 July class report;
- distinct learner objectives and action IDs.

File:

`scripts/student-dashboard-contract-self-test.mjs`

Proof commit on this branch:

`52eda508395b63f19e8d8d13473188418bfe9efa`

## 6. What is now proved

### PROVED — repository projection mechanism

For both Diego and Eduarda, the repository contains distinct real-learner records represented through the same `student-dashboard-v1.0` projection contract, with:

`LONGITUDINAL RECORD → CURRENT CONTEXT/STATE → EVIDENCE-BOUNDED PRIORITIES → DISTINCT NEXT ACTION → LEARNER PROJECTION`

The records preserve uncertainty instead of manufacturing unsupported state.

### PROVED — learner-specific differentiation

Diego and Eduarda have different historical contexts, priorities, objectives and next actions. The executable contract test asserts those differences.

### PROVED — evidence boundaries in the projection

The projections do not infer CEFR advancement for Diego or CEFR status for Eduarda, and Eduarda's incomplete 3 July encounter is not reconstructed into a report.

## 7. What remains outside this proof

This reconciliation does **not** prove:

- that either learner executed the displayed next action;
- an authenticated learner attempt after the action;
- a new Candidate generated from that attempt;
- a second teacher review;
- a closed Engine learning cycle;
- causal improvement in proficiency, motivation or retention;
- autonomous AI pedagogical decision-making;
- independent re-authentication of the external Google Docs from GitHub alone.

Those are separate claims with separate proof thresholds.

## 8. Correct final wording

The strong claim is now safe **with the projection-level scope stated above**:

> **PRIME can project real longitudinal learner records into evidence-bounded current priorities and next actions without fabricating unsupported state.**

For an external audit, the supporting witnesses are the two repository student records plus the executable Student Dashboard v1 contract self-test. The external canonical portfolio documents remain the declared upstream source authority and should be supplied if the auditor requires independent source-document inspection.

## 9. Audit correction

The earlier PR #20 audit was correct about one thing: its inspected document set did not contain a directly audited Diego/Eduarda case witness. It therefore could not certify the joint claim from that document set.

The correction is not to weaken the product claim. The correction is to **bind the claim to the actual repository witnesses and executable test that already exist in the product's canonical student projection layer**.
