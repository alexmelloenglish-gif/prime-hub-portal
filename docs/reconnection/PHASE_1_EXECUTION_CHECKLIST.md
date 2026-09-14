# PHASE 1 — EXECUTION CHECKLIST

## Objective

Publish a clearer, lighter and more credible Prime Digital Hub landing page centered on the student experience.

**Public thesis:** Cada aula ajuda a orientar a próxima.

**Approved emotional subline:** Sua próxima aula não esquece o que importa sobre a sua aprendizagem.

**Human mechanism:** Você pratica → Seu professor observa e interpreta → O próximo foco fica mais claro.

The continuity section is locked in [`PHASE_1_CONTINUITY_COPY_LOCK.md`](./PHASE_1_CONTINUITY_COPY_LOCK.md).

The Phase 1 Design & Evidence Report remains the rationale. This checklist is the operational source of truth for implementation.

## Registration checkpoint

- **GitHub base / production reference:** `main` at `0a552a43dcc423d2a2b68f392015b1bf82e093c5`
- **Implementation branch:** `reconnection-phase1-landing-v2`
- **Current implemented Preview commit:** `fdf0870f9a7ed1511423c42c33361fc1aa3440b1`
- **Vercel Preview deployment:** `dpl_4fBk1S1SUt223ynTHSJTBG7dbWvS` — READY
- **Concept status:** LOCKED
- **Execution status:** IMPLEMENTED IN PREVIEW — VISUAL / FUNCTIONAL QA PENDING
- **Production:** UNCHANGED

## Locked page architecture

1. Hero
2. Continuity
3. Three-step model
4. Demonstration
5. Teacher
6. FAQ
7. Final CTA

## Execution checklist

### A. Baseline

- [x] Record the current production commit and deployment.
- [x] Create or confirm a dedicated Phase 1 feature branch and Vercel Preview; keep production unchanged.
- [x] Preserve the current copy, section order, approved images, metadata and destination links for comparison and recovery through the unchanged `main` baseline and Git history.

### B. Copy and section lock

- [x] Lock the hero as one offer, one short explanation and one primary action: **Agendar aula experimental grátis**.
- [x] Implement the continuity thesis and Section 2 from [`PHASE_1_CONTINUITY_COPY_LOCK.md`](./PHASE_1_CONTINUITY_COPY_LOCK.md), including the approved emotional subline as supporting language rather than a literal total-memory claim.
- [x] Use one student-facing mechanism only: **Você pratica → Seu professor observa e interpreta → O próximo foco fica mais claro**.
- [x] Keep fragmented signals, AI, pipelines, architecture and Learning Intelligence Engine language out of the student-facing page.
- [x] Label the demonstration **illustrative** until its source, wording and authorization are verified as a real case.
- [x] Keep Calendar as the primary CTA, WhatsApp as support and Portal as a utility for current students.

### C. Implementation

- [x] Implement the seven locked sections in their approved order; Continuity + three-step model share one coherent section while remaining distinct semantic stages.
- [x] Place the demonstration immediately after the three-step model.
- [x] Remove the “other methods vs PRIME” comparison from the rendered page and replace it with a positive demonstration of PRIME continuity. The historical component/assets remain in Git for recovery but are no longer rendered.
- [x] Merge or remove repeated explanations of memory, evidence, teacher authority, context and continuity from the rendered landing page.
- [x] Preserve the approved characters, brand identity and image continuity; do not restore older or lower-quality assets.
- [x] Reduce the FAQ to practical objections: online format, starting level, experimental lesson, learning follow-up, scheduling, plans and prices.

### D. Build / Preview validation

- [x] Vercel Preview build reached READY for commit `fdf0870f9a7ed1511423c42c33361fc1aa3440b1`.
- [x] Teacher Intelligence static regression self-test: PASS.
- [x] Student Dashboard v1 contract self-test: PASS.
- [x] Canonical document → dashboard projection: PASS.
- [x] Eligibility boundary self-test: PASS.
- [x] Canonical strict validator: **0 errors**; existing data warnings remain outside Phase 1 landing scope.
- [x] Next.js optimized production build: PASS.
- [ ] Verify desktop and mobile layout, hierarchy, readable text, image quality and CTA visibility on the final Preview.
- [ ] Verify navigation anchors, Calendar, WhatsApp, Portal and FAQ interactions on the final Preview.
- [ ] Run accessibility and technical QA: keyboard focus, contrast, target size, 320 px reflow, image alternatives, LCP, INP and CLS.

### E. Comprehension and release

- [ ] Run one short comprehension round with up to five people unfamiliar with the build; record only material misunderstandings about the offer, continuity, teacher role and next action.
- [ ] Correct the material misunderstandings, approve the verified Preview, deploy that exact version to production and record the production commit.

## Language guardrails

### Approved directions

- The teacher uses what the learner actually practiced to decide the next focus.
- What the learner practiced, managed to do and still needed help with continues to inform the teacher.
- Relevant learning information remains available to support future lessons.
- The experience connects what happened in one lesson to what happens next.
- Technology supports the experience; the teacher observes, interprets and decides.
- **Sua próxima aula não esquece o que importa sobre a sua aprendizagem** may appear as a supporting emotional subline after the concrete thesis and mechanism; it is not a claim that everything is captured or remembered.

### Do not publish

- PRIME predicts learning.
- PRIME remembers everything forever.
- Traditional classes start from zero.
- “A próxima aula não começa do zero” as the standalone thesis or sole explanation of PRIME continuity.
- Absolute capture claims such as “Nada importante do que acontece na sua aula se perde.”
- Unsupported claims of faster results, superior retention or guaranteed progress.
- Any illustrative example described as a real student case without verification.

## Definition of done

Phase 1 is complete when a new visitor can explain:

- what PRIME offers;
- why the experience is relevant;
- how one lesson helps prepare the next;
- why the teacher remains responsible for pedagogical decisions; and
- exactly what to do next.

The page must be verified in Preview on desktop and mobile, pass functional QA, preserve approved brand assets and links, and be published from the reviewed commit.
