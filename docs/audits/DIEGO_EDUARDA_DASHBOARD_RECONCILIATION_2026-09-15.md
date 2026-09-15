# Diego / Eduarda dashboard reconciliation — 2026-09-15

**Status:** completed reconciliation against the current canonical student portfolios.  
**Scope:** student-facing repository snapshots and canonical learner projection. No school-grade inference, runtime retry or autonomous publication was authorized by this reconciliation.

## Sources used

The dashboard snapshots were confronted with the current canonical portfolio documents for:

- **Diego da Silva Rodrigues — Canonical Portfolio v1.0**;
- **Eduarda Coelho Gabriel — canonical longitudinal portfolio for episodic English and English-medium Geography support.**

Calendar/booking information was used only where the portfolio or current booking record explicitly authorized it. Event-specific historical Meet links were not promoted to current live-class links.

---

## Diego — defects found and corrected

### 1. Stale live-class link exposed as current

The previous repository snapshot exposed a Google Meet URL and described it as Diego's current live-class link. The canonical portfolio explicitly states that no current class link or current calendar event is verified.

**Correction:** the live-class shortcut was removed. The dashboard now retains only the canonical portfolio and Prime Support links until a current calendar source verifies a class link.

### 2. Missing canonical dashboard projection

The previous snapshot contained learning material, goals and reports but no `canonicalProjection`. As a result, the student dashboard could not present Diego's current state, priorities and next action through the canonical `STATE → PRIORITY → EVIDENCE → ACTION → HISTORY` contract.

**Correction:** `canonicalProjection` was added with:

- current level **CEFR A2** and target **CEFR B1**, both portfolio-confirmed;
- professional objective and focus grounded in the canonical portfolio;
- priorities for executive clarity, high-frequency accuracy and active business-language reuse;
- the portfolio-recorded **60–90 Second Executive Response** next action;
- schedule marked **unknown** because no current event/time is verified.

### 3. Class reports existed but were not publishable by the dashboard contract

The four report objects lacked `status: published` / `contentStatus: published`. The student dashboard only includes reports that cross that publication-status boundary, so valid portfolio history could disappear from the longitudinal view.

**Correction:** all four canonical portfolio reports are explicitly linked to lesson identities and marked published.

### 4. Progress vocabulary was inconsistent with the canonical status language

Legacy labels such as `Good / Improving` and `Active Growth` were present in the snapshot even though the current portfolio uses the canonical status vocabulary.

**Correction:** Diego's tracker now uses the canonical PRIME progress states.

### 5. Claim boundary preserved

The corrected dashboard does **not** infer a CEFR increase from A2, does not claim a future class date and does not turn four lessons into a causal learning-impact claim.

---

## Eduarda — defects found and corrected

### 1. Booking-only snapshot was being presented as if it were the learner record

The previous repository snapshot was centered on August calendar bookings and omitted the richer canonical portfolio covering July and August.

The current teacher-corrected portfolio identifies **seven lessons with pedagogical content documented**. An additional 3 July agenda record does not contain enough pedagogical detail to establish a lesson report.

**Learner-facing correction:** the dashboard projects **only the seven pedagogically documented lessons**. The 3 July agenda-only record is not promoted into a learner lesson and generates no class report.

### 2. Teacher-corrected level and target

The current canonical portfolio records:

- current level: **CEFR A1**;
- target level: **CEFR A2**;
- 6th grade, Colégio Notre Dame;
- episodic/on-demand school support;
- English + English-medium Geography.

**Correction:** the learner projection now carries A1 and A2 as **teacher-validated current/target state**. A2 remains a target, not a measured result or automatic promotion.

### 3. Pedagogical state, priorities and action

The canonical projection includes:

- objective: improve school performance in English and English-medium Geography while increasing complete, increasingly independent responses;
- priority 1: complete English responses with less support;
- priority 2: meaningful use of `can/can't` and `should/shouldn't`;
- priority 3: explain Geography concepts in English;
- next action: **Six-question independence check**;
- no future lesson claimed; support remains episodic/on demand.

### 4. Seven class reports and consistent transfer points

The learner projection contains seven published class reports for:

- 2 July;
- 6 July;
- 8 July;
- 17 August;
- 18 August;
- 19 August;
- 20 August.

Every projected class report uses the same transfer structure:

`Evidence → Boundary/Interpretation → Next verification`

This prevents the later reports from degrading into unstructured narrative and makes the longitudinal handoff usable for the next teaching decision.

### 5. No `pending` state in Eduarda's learner projection

The student-facing snapshot, immutable regression fixture and executable self-tests now require:

- exactly **7** projected lesson records;
- exactly **7** class reports;
- no 3 July learner lesson;
- no 3 July class report;
- no `pending` state anywhere in Eduarda's learner projection.

The incomplete 3 July source remains only an agenda fact in the portfolio source; it is outside the learner-facing projection rather than being converted into a lesson or report.

### 6. Stale event-specific Meet links removed

The old snapshot exposed an event-specific August Meet URL as a quick-access live-class link even though Eduarda's support is booked in episodic blocks.

**Correction:** event-specific Meet shortcuts were removed from quick access. The dashboard links to the canonical portfolio, the official PRIME booking flow and Prime Support.

### 7. Unsupported alias removed and core registry synchronized

The unsupported `Eduarda Jesus` alias was removed. The core record preserves the authorized identity aliases and episodic/on-demand support model.

### 8. Claim boundary preserved

The corrected dashboard does **not** infer:

- promotion from A1 to A2;
- a school grade/result;
- independent mastery from guided responses;
- pedagogical content for the 3 July agenda-only record;
- a future scheduled lesson;
- execution of the recommended next action.

---

## Result

The reconciliation fixes two different failure modes:

- **Diego:** valid canonical learning evidence existed, but the dashboard snapshot lacked the canonical projection contract, hid longitudinal reports behind legacy publication semantics, and exposed an unverified live-class link.
- **Eduarda:** the dashboard was an outdated booking/onboarding snapshot and omitted most of the canonical learning record; the corrected projection now contains the seven documented lessons, A1 → A2 teacher-validated state, seven reports and consistent transfer points, without exposing an unresolved agenda item as learner state.

Both repository records use `student-dashboard-v1.0`, preserve evidence boundaries and project the strongest current portfolio evidence without inventing missing authority.

## Current regression protection

Eduarda's current executable contract requires seven lessons, seven reports, CEFR A1 current, CEFR A2 target, three priorities, the `Six-question independence check`, distinct action from Diego, and zero `pending` state in her learner projection.

The dashboard contract remains part of the production build and GitHub CI contract.

## Files covered by this reconciliation

- `data/students/diegodasiro-gmail-com.firestore.json`
- `data/students/eduarda-coelho-gabriel-hotmail-com.firestore.json`
- `tests/fixtures/student-dashboard/eduarda.canonical.fixture.json`
- `scripts/student-dashboard-contract-self-test.mjs`
- `scripts/student-dashboard-contract-regression-self-test.mjs`
- `docs/governance/STUDENT_DASHBOARD_CONTRACT_FREEZE_v1.0.md`
