# PHASE 1 — EXECUTION CHECKLIST

## Objective

Publish a clearer, lighter and more credible Prime Digital Hub landing page centered on the student experience.

**Public thesis:** Cada aula ajuda a orientar a próxima.

**Approved emotional subline:** Sua próxima aula não esquece o que importa sobre a sua aprendizagem.

**Human mechanism:** Você pratica → Seu professor observa e interpreta → O próximo foco fica mais claro.

The continuity section is locked in [`PHASE_1_CONTINUITY_COPY_LOCK.md`](./PHASE_1_CONTINUITY_COPY_LOCK.md).

The Phase 1 Design & Evidence Report remains the rationale. This checklist is the operational source of truth for implementation, QA and release.

## Registration checkpoint

- **Phase 1 status:** RELEASE CANDIDATE READY — PRODUCT OWNER DECISION PENDING
- **Immutable product baseline:** `057dafc97c91e59e5ba7cfb99528cc25530a5175`
- **Release Candidate:** `28fc547f6043afc0f09e0be8ea8177f68fab7b6d`
- **Release Candidate message:** `merge(main): reconcile Phase 1 history after preview revert`
- **Implementation branch:** `reconnection-phase1-landing-v2`
- **Current `main`:** `bf4f03f7f01378d9afcafe2ea18e3a4bda1c90d9`
- **Current branch relationship after G3:** 23 commits ahead / 0 behind `main`
- **Production:** unchanged; Phase 1 has not been released.
- **Concept status:** LOCKED
- **Copy/design status:** FROZEN
- **New ideas:** BLOCKED until Phase 1 release decision.
- **Allowed pre-release changes:** only Product Owner-requested corrections or newly proven P0/P1 defects.

`057dafc...` remains the immutable reference for the product state that passed the original baseline review. `28fc547...` is the reconciled and revalidated Release Candidate. The reconciliation introduced no file-content changes relative to the pre-merge branch head.

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

- [x] Vercel deployment corresponding to Baseline Candidate `057dafc97c91e59e5ba7cfb99528cc25530a5175` reached READY.
- [x] Final Preview returned HTTP 200.
- [x] Rendered page corresponded to the Baseline Candidate before QA began.

**Evidence:**

- Deployment: `dpl_AJaD7tNmZjSZzuPfXoCVi2ZQtDJU`
- Deployment state: `READY`
- Deployment commit metadata: `057dafc97c91e59e5ba7cfb99528cc25530a5175`
- Direct Preview fetch: HTTP `200 OK`
- Rendered FAQ contained the approved level-diagnosis copy from the Baseline Candidate.

### G2 — Independent QA — PASS CONDITIONED / NON-BLOCKING P2 ONLY

The QA agent operated read-only. It did not edit code, redesign the page, rewrite copy or introduce taste-based changes.

**Result:** PASS conditioned — no P0/P1 observed.

**Only finding:**

- `P2 — textual navigation/footer link target height ~20 px`.
- Mobile menu items and principal CTAs already meet approximately 44–48 px or more.
- The P2 is explicitly accepted as non-blocking for G3/G4 and may be corrected later without reopening Phase 1 unless the Product Owner chooses otherwise.

**Coverage completed:**

- [x] Desktop layout and hierarchy.
- [x] Mobile layout and hierarchy at 390 px.
- [x] 320 px reflow.
- [x] No horizontal overflow observed.
- [x] Keyboard navigation and visible focus.
- [x] Header navigation anchors.
- [x] Calendar CTA destination and behavior.
- [x] WhatsApp CTA destination and behavior.
- [x] Portal destination / authentication boundary by destination.
- [x] FAQ interaction and keyboard accessibility.
- [x] Approved image quality, loading and alternatives.
- [x] CTA visibility and readability.
- [x] Representative contrast review.
- [x] Target-size review, with the single non-blocking P2 above.
- [x] CLS observed at `0` in the available test path.
- [x] Local FCP observed at approximately `396 ms`.

**Recorded limitations:** authenticated Portal flow, remote-deployment LCP and INP could not be fully confirmed because of the Preview authentication boundary. These limitations did not produce a P0/P1 defect and do not block release under the approved G2 result.

See [`G2_INDEPENDENT_QA_REPORT.md`](./G2_INDEPENDENT_QA_REPORT.md).

### G3 — Controlled reconciliation with `main` — PASS

Reconciliation was performed without rebase, force-push or blind conflict acceptance.

- [x] Preserved Baseline Candidate `057dafc97c91e59e5ba7cfb99528cc25530a5175` as the immutable pre-reconciliation product reference.
- [x] Reviewed the two `main`-only commits.
- [x] Confirmed they produce zero net tree delta from merge base `0a552a43dcc423d2a2b68f392015b1bf82e093c5` to current `main`.
- [x] Integrated `main` into the Phase 1 branch with a controlled merge commit.
- [x] No file-content conflicts occurred.
- [x] No frozen copy/design change occurred during reconciliation.
- [x] Verified pre-merge branch head `9fa7756787491f3e31e0d93cf4691351cf75ae44` versus merge commit `28fc547f6043afc0f09e0be8ea8177f68fab7b6d`: **zero changed files**.
- [x] Branch is now `23 ahead / 0 behind` `main`.
- [x] Re-ran the Vercel build path and canonical self-tests.
- [x] Reconciled Preview reached READY.
- [x] Reconciled Preview returned HTTP 200.
- [x] No QA area required re-testing due to content change, because reconciliation changed history only and produced zero file-content delta.
- [x] Designated `28fc547f6043afc0f09e0be8ea8177f68fab7b6d` as the **Release Candidate**.

#### G3 evidence

`main`-only commits reconciled:

1. `429cb742cc3614b0b6b3644f2e4ce831799b8000` — temporary `/phase1-preview` route added.
2. `bf4f03f7f01378d9afcafe2ea18e3a4bda1c90d9` — same temporary route removed.

Controlled merge commit:

- `28fc547f6043afc0f09e0be8ea8177f68fab7b6d`
- Message: `merge(main): reconcile Phase 1 history after preview revert`
- First parent: `9fa7756787491f3e31e0d93cf4691351cf75ae44`
- Additional parent: `bf4f03f7f01378d9afcafe2ea18e3a4bda1c90d9`

Revalidated Vercel Preview:

- Deployment: `dpl_J65FahkrBB3VRLPLoNk8irDKkag7`
- Deployment commit: `28fc547f6043afc0f09e0be8ea8177f68fab7b6d`
- State: `READY`
- Direct fetch: HTTP `200 OK`

Build/self-test results after reconciliation:

- Teacher Intelligence static regression self-test: **PASS**
- Pipeline attempt model self-test: **PASS**
- Student Dashboard v1 contract self-test: **PASS**
- Canonical document → dashboard projection: **PASS**
- Canonical student consistency audit: **PASS**
- Eligibility boundary self-test: **PASS**
- Canonical strict validator: **0 errors / 10 pre-existing warnings**
- Next.js optimized production build: **PASS**
- Prisma migrations: **no pending migrations**

Known build-environment notices remain outside Phase 1 landing scope: Node 22.x overrides the Vercel project 20.x setting; npm audit reports pre-existing dependency vulnerabilities. Neither was introduced by G3.

### G4 — Product Owner decision — PENDING

The Product Owner receives one consolidated version only.

**Release Candidate:** `28fc547f6043afc0f09e0be8ea8177f68fab7b6d`

Decision states:

- **APPROVE → release this exact verified Release Candidate to production.**
- **RETURN → make only the explicitly requested correction, then revalidate the affected gates.**

No production release occurs without explicit Product Owner approval.

## Execution checklist

### A. Baseline

- [x] Record the current production history and branch relationship.
- [x] Create or confirm a dedicated Phase 1 feature branch and Vercel Preview; keep production separate from Phase 1 work.
- [x] Preserve copy, section order, approved images, metadata and destination links through Git history.
- [x] Freeze `057dafc97c91e59e5ba7cfb99528cc25530a5175` as the immutable **Phase 1 Baseline Candidate**.

### B. Copy and section lock

- [x] Lock the hero as one offer, one short explanation and one primary action: **Agendar aula experimental grátis**.
- [x] Implement the continuity thesis and approved emotional subline as supporting language rather than an absolute memory claim.
- [x] Use one student-facing mechanism only: **Você pratica → Seu professor observa e interpreta → O próximo foco fica mais claro**.
- [x] Keep AI, pipelines, architecture and Learning Intelligence Engine language out of the student-facing page.
- [x] Label the demonstration **illustrative** until source/authorization permits a real-case claim.
- [x] Keep Calendar as primary CTA, WhatsApp as support and Portal as current-student utility.
- [x] Include the approved FAQ clarification that the first session includes diagnosis of the learner's English level and a personalized trial experience.

### C. Implementation

- [x] Implement the seven locked sections in approved order.
- [x] Place the demonstration immediately after the three-step model.
- [x] Remove the “other methods vs PRIME” comparison from the rendered page.
- [x] Remove repeated explanations that weakened hierarchy.
- [x] Preserve approved brand identity and image continuity.
- [x] Reduce FAQ to practical starting objections.

### D. Validation

- [x] G1 final Preview stability.
- [x] G2 independent QA — PASS conditioned, P2 only.
- [x] G3 controlled reconciliation.
- [x] Post-reconciliation build and self-tests.
- [x] Post-reconciliation Preview READY + HTTP 200.
- [x] Release Candidate designated.

### E. Release

- [ ] Obtain explicit Product Owner decision under G4.
- [ ] If APPROVE, move `main` to the exact verified Release Candidate without introducing additional product changes.
- [ ] Confirm production deployment is READY and returns HTTP 200.
- [ ] Record production commit/deployment and close Phase 1.

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
- Any new landing-page idea introduced during release QA without an observed defect or Product Owner request.

## Definition of done

Phase 1 is complete when a new visitor can explain:

- what PRIME offers;
- why the experience is relevant;
- how one lesson helps prepare the next;
- why the teacher remains responsible for pedagogical decisions; and
- exactly what to do next.

The page has passed G1, G2 and G3. Phase 1 now requires explicit Product Owner approval under G4, followed by production deployment of the exact verified Release Candidate and final production verification.
