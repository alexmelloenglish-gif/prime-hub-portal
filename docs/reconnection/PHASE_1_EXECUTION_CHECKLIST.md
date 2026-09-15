# PHASE 1 — EXECUTION CHECKLIST

## Objective

Publish a clearer, lighter and more credible Prime Digital Hub landing page centered on the student experience.

**Public thesis:** Cada aula ajuda a orientar a próxima.

**Approved emotional subline:** Sua próxima aula não esquece o que importa sobre a sua aprendizagem.

**Human mechanism:** Você pratica → Seu professor observa e interpreta → O próximo foco fica mais claro.

The continuity section is locked in [`PHASE_1_CONTINUITY_COPY_LOCK.md`](./PHASE_1_CONTINUITY_COPY_LOCK.md).

The Phase 1 Design & Evidence Report remains the rationale. This checklist is the operational source of truth for implementation, QA and release.

## Registration checkpoint

- **Phase 1 status:** IMPLEMENTATION COMPLETE — FINAL PREVIEW QA AND RELEASE VALIDATION IN PROGRESS
- **Baseline Candidate:** `057dafc97c91e59e5ba7cfb99528cc25530a5175`
- **Baseline commit message:** `copy(faq): clarify level diagnosis in trial lesson`
- **Implementation branch:** `reconnection-phase1-landing-v2`
- **Documentation checkpoint before this update:** `366b9f04d376776aa2a9de8c86c9853acaf88876`
- **Current `main`:** `bf4f03f7f01378d9afcafe2ea18e3a4bda1c90d9`
- **Merge base:** `0a552a43dcc423d2a2b68f392015b1bf82e093c5`
- **Branch divergence before this documentation update:** 20 commits ahead / 2 commits behind `main` — intentionally diverged after temporary preview work was reverted from production.
- **Production:** UNCHANGED from the approved production state.
- **Concept status:** LOCKED
- **Copy/design status:** FROZEN AS BASELINE
- **New ideas:** BLOCKED until Phase 1 release decision.
- **Allowed pre-release changes:** only QA-proven corrections.

The Baseline Candidate is **not yet the Release Candidate**. Release Candidate status is earned only after G1, G2 and G3 pass and a single consolidated version is submitted to the Product Owner.

## Locked page architecture

1. Hero
2. Continuity
3. Three-step model
4. Demonstration
5. Teacher
6. FAQ
7. Final CTA

## Release gates

### G1 — Final Preview stable — PASS

- [x] Confirm the Vercel deployment corresponding to Baseline Candidate `057dafc97c91e59e5ba7cfb99528cc25530a5175` reaches READY.
- [x] Confirm the final Preview returns HTTP 200.
- [x] Confirm the rendered page corresponds to the Baseline Candidate before QA begins.

**Evidence:**

- Deployment: `dpl_AJaD7tNmZjSZzuPfXoCVi2ZQtDJU`
- Deployment state: `READY`
- Deployment commit metadata: `057dafc97c91e59e5ba7cfb99528cc25530a5175`
- Direct Preview fetch: HTTP `200 OK`
- Rendered FAQ contains the approved level-diagnosis copy from the Baseline Candidate.

### G2 — Independent QA — IN PROGRESS

The QA agent is read-only for this gate. It does **not** edit code, redesign the page, rewrite copy or propose taste-based improvements.

Current checkpoint from independent QA:

- Desktop visual review: PASS.
- Basic functional QA: PASS.
- Still pending: authenticated visual review at 320 px / 390 px, keyboard/focus verification and technical metrics where measurable.

Required coverage:

- [x] Desktop layout and hierarchy.
- [ ] Mobile layout and hierarchy.
- [ ] 320 px reflow.
- [ ] Keyboard navigation and visible focus.
- [x] Header navigation anchors — basic functional pass; final keyboard verification remains under the keyboard check.
- [x] Calendar CTA destination and behavior — basic functional pass.
- [x] WhatsApp CTA destination and behavior — basic functional pass.
- [x] Portal destination and authentication boundary — basic functional pass.
- [ ] FAQ interaction and keyboard accessibility.
- [x] Approved image quality, loading and alternatives — desktop/basic pass; mobile visual confirmation remains.
- [x] CTA visibility and readability — desktop pass; mobile visual confirmation remains.
- [ ] Contrast and target-size checks.
- [ ] LCP, INP and CLS review.

QA finding format must separate observed defects from design opinion:

`P0/P1/P2 — viewport/context — observed defect — evidence — recommended correction`

or

`PASS — check performed — result`

Examples:

- `P0 — Calendar CTA — wrong destination / non-working action — evidence — correction required.`
- `P1 — Mobile 390 px — overlap or clipping observed — screenshot/evidence — minimal correction.`
- `PASS — FAQ accordion — keyboard interaction and visible focus verified.`

### G3 — Controlled reconciliation with `main` — DRY-RUN COMPLETE / MERGE NOT STARTED

Do not perform an automatic blind merge and do not force-push.

- [x] Preserve Baseline Candidate `057dafc97c91e59e5ba7cfb99528cc25530a5175` as the pre-reconciliation reference.
- [x] Review the two commits present on `main` after the shared merge base and determine the minimal safe reconciliation path.
- [ ] Integrate the current `main` state into the Phase 1 branch in a controlled manner.
- [ ] Resolve conflicts without changing frozen copy/design unless a conflict requires a mechanical adaptation.
- [ ] Re-run build, canonical self-tests and final Preview validation after reconciliation.
- [ ] Re-run any QA checks affected by reconciliation.
- [ ] Only after successful revalidation designate the resulting commit as **Release Candidate**.

#### G3 dry-run finding

The two commits that exist only on `main` are:

1. `429cb742cc3614b0b6b3644f2e4ce831799b8000` — `feat(preview): expose public Phase 1 landing preview route`
   - Added `app/phase1-preview/page.tsx` as a temporary public Preview route.
2. `bf4f03f7f01378d9afcafe2ea18e3a4bda1c90d9` — `revert(preview): keep Phase 1 work out of main`
   - Removed that same temporary route.

A direct comparison from merge base `0a552a43dcc423d2a2b68f392015b1bf82e093c5` to current `main` `bf4f03f7f01378d9afcafe2ea18e3a4bda1c90d9` reports **zero changed files**. Therefore the two `main`-only commits have **zero net tree delta** relative to the shared base.

**Reconciliation conclusion:** this is a history reconciliation, not a product-content reconciliation. The minimal safe path, once G2 is complete, is an ordinary non-force merge of current `main` into `reconnection-phase1-landing-v2`, preserving `057dafc...` as the immutable product baseline reference. Because `main` has zero net tree delta from the merge base, no Phase 1 copy/design change is expected from the merge. The merge must still be followed by build/self-tests and Preview revalidation before Release Candidate designation.

**Explicitly prohibited:** rebase that rewrites the frozen baseline history, force-push, blind conflict acceptance, or production deployment during G3.

### G4 — Product Owner decision

The Product Owner receives one consolidated version only.

Decision states:

- **APPROVE → release the exact verified Release Candidate to production.**
- **RETURN → make only the explicitly requested correction, then revalidate the affected gates.**

No production release occurs without explicit Product Owner approval.

## Execution checklist

### A. Baseline

- [x] Record the current production history and branch relationship.
- [x] Create or confirm a dedicated Phase 1 feature branch and Vercel Preview; keep production separate from Phase 1 work.
- [x] Preserve the current copy, section order, approved images, metadata and destination links for comparison and recovery through Git history.
- [x] Freeze `057dafc97c91e59e5ba7cfb99528cc25530a5175` as the **Fase 1 Baseline Candidate**.

### B. Copy and section lock

- [x] Lock the hero as one offer, one short explanation and one primary action: **Agendar aula experimental grátis**.
- [x] Implement the continuity thesis and Section 2 from [`PHASE_1_CONTINUITY_COPY_LOCK.md`](./PHASE_1_CONTINUITY_COPY_LOCK.md), including the approved emotional subline as supporting language rather than a literal total-memory claim.
- [x] Use one student-facing mechanism only: **Você pratica → Seu professor observa e interpreta → O próximo foco fica mais claro**.
- [x] Keep fragmented signals, AI, pipelines, architecture and Learning Intelligence Engine language out of the student-facing page.
- [x] Label the demonstration **illustrative** until its source, wording and authorization are verified as a real case.
- [x] Keep Calendar as the primary CTA, WhatsApp as support and Portal as a utility for current students.
- [x] Keep the FAQ practical and include the approved clarification that the first session includes a diagnosis of the learner's English level and a personalized trial experience.

### C. Implementation

- [x] Implement the seven locked sections in their approved order; Continuity + three-step model share one coherent section while remaining distinct semantic stages.
- [x] Place the demonstration immediately after the three-step model.
- [x] Remove the “other methods vs PRIME” comparison from the rendered page and replace it with a positive demonstration of PRIME continuity. The historical component/assets remain in Git for recovery but are no longer rendered.
- [x] Merge or remove repeated explanations of memory, evidence, teacher authority, context and continuity from the rendered landing page.
- [x] Preserve the approved characters, brand identity and image continuity; do not restore older or lower-quality assets.
- [x] Reduce the FAQ to practical objections: online format, starting level, experimental lesson, learning follow-up, scheduling, plans and prices.

### D. Build / Preview validation already completed before final gate

- [x] Teacher Intelligence static regression self-test: PASS on the validated Phase 1 build path.
- [x] Student Dashboard v1 contract self-test: PASS.
- [x] Canonical document → dashboard projection: PASS.
- [x] Eligibility boundary self-test: PASS.
- [x] Canonical strict validator: **0 errors**; existing data warnings remain outside Phase 1 landing scope.
- [x] Next.js optimized production build: PASS on the corrected public landing path.
- [x] Complete G1 against the Baseline Candidate.
- [ ] Complete G2 independent QA.
- [ ] Complete G3 controlled reconciliation and revalidation.

### E. Comprehension and release

- [ ] If required after QA, run one short comprehension round with up to five people unfamiliar with the build; record only material misunderstandings about the offer, continuity, teacher role and next action.
- [ ] Correct only material misunderstandings or QA-proven defects.
- [ ] Obtain Product Owner approval under G4.
- [ ] Deploy the exact approved Release Candidate to production.
- [ ] Record the production commit and close Phase 1.

## Language guardrails

### Approved directions

- The teacher uses what the learner actually practiced to decide the next focus.
- What the learner practiced, managed to do and still needed help with continues to inform the teacher.
- Relevant learning information remains available to support future lessons.
- The experience connects what happened in one lesson to what happens next.
- Technology supports the experience; the teacher observes, interprets and decides.
- **Sua próxima aula não esquece o que importa sobre a sua aprendizagem** may appear as a supporting emotional subline after the concrete thesis and mechanism; it is not a claim that everything is captured or remembered.
- The first session may explain that it includes a diagnosis of the learner's English level, discussion of goals and a personalized trial experience.

### Do not publish

- PRIME predicts learning.
- PRIME remembers everything forever.
- Traditional classes start from zero.
- “A próxima aula não começa do zero” as the standalone thesis or sole explanation of PRIME continuity.
- Absolute capture claims such as “Nada importante do que acontece na sua aula se perde.”
- Unsupported claims of faster results, superior retention or guaranteed progress.
- Any illustrative example described as a real student case without verification.
- Any new landing-page idea introduced during QA without an observed defect or Product Owner request.

## Definition of done

Phase 1 is complete when a new visitor can explain:

- what PRIME offers;
- why the experience is relevant;
- how one lesson helps prepare the next;
- why the teacher remains responsible for pedagogical decisions; and
- exactly what to do next.

The page must pass G1, G2 and G3, receive explicit Product Owner approval under G4, preserve approved brand assets and links, and be published from the exact reviewed Release Candidate.
