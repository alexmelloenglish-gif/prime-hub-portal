# All Authorized Learners — Longitudinal Reporting Completion

**Date:** 15 September 2026  
**Scope:** authorized learner-facing repository projections only.  
**Canonical phrase:** `complete longitudinal reporting` means complete relative to the **canonical evidence currently available for that learner**. It does not mean that every historical lesson in the learner's life has been recovered, and it does not permit missing evidence to be invented.

## Decision

The student-dashboard-v1.0 contract is the common projection contract for every authorized learner:

**STATE → PRIORITY → EVIDENCE → ACTION → HISTORY**

All **9 authorized learners** in the canonical registry now have a `canonical_longitudinal_profile` and an evidence-bounded learner-facing projection. Valéria remains correctly excluded because she is a prospect and has no activation authority.

## Authorized learner coverage

| Learner | Longitudinal source state | Projection status | Important evidence boundary |
|---|---|---|---|
| Rafael Copolillo | Canonical v1.0; 10 published historical reports plus 27 Aug attendance/report gap | Complete relative to canonical evidence | 27 Aug attendance is preserved without fabricating a detailed report |
| Louise D. Silva Nogueira | Canonical v1.0; 3 attended lessons | Complete relative to canonical evidence | Action execution / subsequent closed cycle not inferred |
| Italo Pires | Canonical portfolio; 1 confirmed lesson | Complete relative to canonical evidence | One lesson supports initial personalization, not cumulative progress |
| Eduarda Coelho Gabriel | Canonical longitudinal portfolio; 7 documented lessons + 3 Jul agenda-only encounter | Complete relative to canonical evidence | 3 Jul content remains unreconstructed; CEFR remains Not Assessed |
| Laura Maria Galvão Costa Stempniewski | Canonical v1.0; 3 documented lessons (28 Apr, 12 May, 22 May) | **Completed 15 Sep 2026** | Later August bookings are not promoted to attendance |
| Maria Fernanda Galvão Costa Stempniewski | Canonical v2.0 source-integrity reconstruction; 3 evidence-backed lessons (24 Apr, 6 Jun, 19 Jun) | **Completed 15 Sep 2026** | Old August bookings are not promoted to attendance; independent listening remains Not Assessed |
| Diego da Silva Rodrigues | Canonical v1.0; 4 published reports | Complete relative to canonical evidence | No current live-class schedule/link is invented |
| Cláudio Bittencourt | Canonical longitudinal portfolio; 3 attended lessons + undated historical memory | Complete relative to canonical evidence | Undated historical memory is not converted into a dated attendance event |
| Gustavo Drummond de Andrade Salgado | Canonical portfolio; 4 attended lessons and cumulative priorities | Complete relative to canonical evidence | Historical technical PipelineRuns do not prove Candidate/Review/E2E |

## Laura correction

The former Laura repository profile was a schedule-only onboarding snapshot. It contained two August calendar bookings, no `canonicalProjection`, no published longitudinal reports, no progress tracker and no current pedagogical action.

The corrected profile now uses Laura's canonical Portfolio v1.0 and projects:

- CEFR **B1 → B2**;
- three evidence-backed attended lessons: **28 Apr, 12 May, 22 May 2026**;
- current priorities: longer connected speaking, more independent authentic listening, and grammar/lexical precision;
- next action: **authentic listening + 2–3 minute retelling**;
- three published class reports;
- cumulative progress, vocabulary, grammar and teacher feedback;
- canonical portfolio and official live-class links.

The August 25/28 calendar bookings are no longer presented as attendance.

## Maria Fernanda correction

The former Maria Fernanda repository profile was also a schedule-only onboarding snapshot. It contained two August calendar bookings and no pedagogical longitudinal projection.

The corrected profile now uses the canonical Portfolio v2.0 source-integrity reconstruction and projects:

- teacher-authorized **B2 → C1**;
- three evidence-backed attended lessons: **24 Apr, 6 Jun, 19 Jun 2026**;
- current priorities: academic reading/discourse interpretation, advanced grammar precision, and independent advanced production;
- next action: **current-state update before any learner-facing state change**;
- three published class reports;
- cumulative progress, vocabulary, grammar and teacher feedback;
- independent listening retained as **Not Assessed** rather than inferred from one listening activity.

The August 28/29 calendar bookings are no longer presented as attendance.

## Registry normalization

The core registry now classifies all 9 authorized learners as `canonical_longitudinal_profile`. This registry label means the learner has a complete longitudinal projection **relative to the authorized evidence available**, not that every possible historical source has been recovered.

Valéria remains:

- `operatingEligibility: prospect`;
- `activationAuthority: null`;
- outside the authorized learner set.

## Validation

The all-learner update must pass the existing product gates before it is treated as released:

- Teacher Intelligence self-test;
- Pipeline-attempt self-test;
- Student Dashboard v1 contract test;
- canonical document → dashboard projection test;
- canonical student consistency audit;
- eligibility-boundary test;
- strict canonical consistency validator;
- production deployment.

The canonical consistency audit was also reconciled with the newer operational-attendance architecture: the pedagogical pipeline remains frozen, while the explicitly authorized `/api/cron/meet-attendance` operational reconciliation cron is allowed. This does **not** authorize automatic pedagogical decisions.

## Claim boundary

Safe claim after successful production validation:

> **All authorized PRIME learner dashboards now implement evidence-bounded complete longitudinal reporting: each projection presents the strongest authorized current state, priorities, evidence, next action and preserved history available for that learner without fabricating missing attendance, assessment or progress.**

This does **not** prove:

- universal recovery of all historical lessons;
- automated end-to-end Learning Intelligence;
- execution of every projected next action;
- a subsequent Candidate/review cycle for every learner;
- causal improvement in proficiency, motivation or retention.
