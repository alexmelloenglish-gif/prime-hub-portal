# PHASE 1 — EXECUTION CHECKLIST

## Objective

Publish a clearer, lighter and more credible Prime Digital Hub landing page centered on the student experience.

**Public thesis:** Cada aula ajuda a orientar a próxima.

**Human mechanism:** Você pratica → Seu professor observa e interpreta → O próximo foco fica mais claro.

The continuity section is locked in [`PHASE_1_CONTINUITY_COPY_LOCK.md`](./PHASE_1_CONTINUITY_COPY_LOCK.md).

The Phase 1 Design & Evidence Report remains the rationale. This checklist is the operational source of truth for implementation.

## Registration checkpoint

- **GitHub base:** `main` at `0a552a43dcc423d2a2b68f392015b1bf82e093c5`
- **Implementation branch:** `reconnection-phase1-landing-v2`
- **Concept status:** READY
- **Execution status:** NOT STARTED

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

- [ ] Record the current production commit and deployment.
- [ ] Create or confirm a dedicated Phase 1 feature branch and Vercel Preview; keep production unchanged.
- [ ] Preserve the current copy, section order, approved images, metadata and destination links for comparison and recovery.

### B. Copy and section lock

- [ ] Lock the hero as one offer, one short explanation and one primary action: **Agendar aula experimental grátis**.
- [ ] Implement the continuity thesis and Section 2 exactly from [`PHASE_1_CONTINUITY_COPY_LOCK.md`](./PHASE_1_CONTINUITY_COPY_LOCK.md).
- [ ] Use one student-facing mechanism only: **Você pratica → Seu professor observa e interpreta → O próximo foco fica mais claro**.
- [ ] Keep fragmented signals, AI, pipelines, architecture and Learning Intelligence Engine language out of the student-facing page.
- [ ] Label the demonstration **illustrative** until its source, wording and authorization are verified as a real case.
- [ ] Keep Calendar as the primary CTA, WhatsApp as support and Portal as a utility for current students.

### C. Implementation

- [ ] Implement the seven locked sections in their approved order.
- [ ] Place the demonstration immediately after the three-step model.
- [ ] Remove the “other methods vs PRIME” comparison and replace it with a positive demonstration of PRIME continuity.
- [ ] Merge or remove repeated explanations of memory, evidence, teacher authority, context and continuity.
- [ ] Preserve the approved characters, brand identity and image continuity; do not restore older or lower-quality assets.
- [ ] Reduce the FAQ to practical objections: online format, starting level, experimental lesson, learning follow-up, scheduling, plans and prices.

### D. Preview QA

- [ ] Verify desktop and mobile layout, hierarchy, readable text, image quality and CTA visibility.
- [ ] Verify navigation anchors, Calendar, WhatsApp, Portal, FAQ interactions and the accuracy of metadata.
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
