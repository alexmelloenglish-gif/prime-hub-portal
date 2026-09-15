# Diego / Eduarda dashboard reconciliation — 2026-09-15

**Status:** completed reconciliation against the current canonical student portfolios.  
**Scope:** student-facing repository snapshots only. No CEFR change, school-grade inference, runtime retry or autonomous publication was authorized by this reconciliation.

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

**Correction:** Diego's tracker now uses:

- Fluency — **Strong**;
- Professional Communication — **Strong**;
- Listening — **Improving**;
- Vocabulary — **Improving**;
- Grammar Accuracy — **Improving**.

### 5. Claim boundary preserved

The corrected dashboard does **not** infer a CEFR increase from A2, does not claim a future class date and does not turn four lessons into a causal learning-impact claim.

---

## Eduarda — defects found and corrected

### 1. Booking-only snapshot was being presented as if it were the learner record

The previous repository snapshot was still centered on four August calendar bookings. It treated attendance as pending, showed only scheduled records, and omitted the richer canonical portfolio covering July and August.

The canonical portfolio records **eight encounters in the history, seven with pedagogical content documented**. The 3 July encounter is deliberately preserved without reconstructed content.

**Correction:** the dashboard now presents:

- **7 documented lessons** as attended/pedagogically evidenced;
- **3 July** separately as a pending agenda encounter with no reconstructed lesson content;
- the complete July–August longitudinal context instead of a four-booking onboarding view.

### 2. School context was incomplete

The old snapshot said Eduarda's exact grade still needed confirmation. The canonical portfolio explicitly identifies:

- **6th grade**;
- **Colégio Notre Dame**;
- episodic/on-demand school support;
- **English + English-medium Geography**.

**Correction:** these values now drive the repository snapshot.

### 3. Missing pedagogical state, priorities and action

The previous snapshot had no `canonicalProjection`, no progress tracker, no teacher feedback and only one generic Geography goal. That materially understated the portfolio and made the dashboard look incomplete.

**Correction:** the canonical projection now includes:

- current level: **Assessment pending** — no CEFR invented;
- target: **school-task performance target pending** — no formal CEFR target invented;
- objective: support current school demands while increasing complete, increasingly independent responses;
- priority 1: complete English responses with less support;
- priority 2: meaningful use of `can/can't` and `should/shouldn't`;
- priority 3: explain Geography concepts in English;
- next action: the portfolio-recommended **six-question independence check**;
- no future lesson claimed; support remains episodic/on demand.

### 4. Seven valid class reports were absent from the dashboard snapshot

The canonical portfolio documents pedagogical content for:

- 2 July;
- 6 July;
- 8 July;
- 17 August;
- 18 August;
- 19 August;
- 20 August.

**Correction:** seven published class-report projections were added. The 3 July encounter remains without a report because there is not enough evidence to reconstruct one safely.

### 5. Stale event-specific Meet links removed

The old snapshot exposed an event-specific August Meet URL as a quick-access live-class link even though Eduarda's support is booked in episodic blocks and later lessons use their own event links.

**Correction:** event-specific Meet shortcuts were removed from quick access. The dashboard now links to:

- the canonical portfolio;
- the official PRIME booking flow;
- Prime Support.

### 6. Unsupported alias removed

`Eduarda Jesus` was present as an identity alias in the old snapshot. The reviewed sources support the fuller booking name and `Eduarda Dias`; they do not establish `Eduarda Jesus` as an authorized identity alias.

**Correction:** the unsupported alias was removed.

### 7. Claim boundary preserved

The corrected dashboard does **not** infer:

- a CEFR level;
- a school grade/result;
- independent mastery from guided responses;
- attendance/content for 3 July beyond the agenda record;
- a future scheduled lesson.

---

## Result

The reconciliation fixes two different failure modes:

- **Diego:** valid canonical learning evidence existed, but the dashboard snapshot lacked the canonical projection contract, hid longitudinal reports behind legacy publication semantics, and exposed an unverified live-class link.
- **Eduarda:** the dashboard was effectively an outdated booking/onboarding snapshot and omitted most of the canonical learning record.

After this reconciliation, both repository records use `student-dashboard-v1.0`, preserve evidence boundaries and project the strongest current portfolio evidence without inventing missing authority.

## Files changed

- `data/students/diegodasiro-gmail-com.firestore.json`
- `data/students/eduarda-coelho-gabriel-hotmail-com.firestore.json`
- `docs/audits/DIEGO_EDUARDA_DASHBOARD_RECONCILIATION_2026-09-15.md`
