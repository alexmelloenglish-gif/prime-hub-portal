# Architecture Handoff — 2026-09-20

Status: CHECKPOINT — contract work, not production certification.

## Purpose
The canonical audit established that Portfolio is the complete lesson archive plus cumulative longitudinal learning memory. Gustavo's five-lesson Young Learner implementation exposed an additional requirement: publishing accurate information is insufficient if the intended learner/family never becomes aware of it.

## Frozen invariants
1. Portfolio = Lesson Archive + Cumulative Learning Memory.
2. Evidence records events; narrative reconstructs the learning film.
3. Learning movement is not equivalent to canonical state change.
4. Error is an event, not a learner state.
5. Absence of recent evidence is not evidence of regression.
6. Reprocessing may improve interpretation but must never masquerade as new learner progress.
7. AI produces candidates/assistance; pedagogical authority remains human.
8. Teacher confirmation, publication and communication are distinct transitions.
9. Published projection is not proof the intended audience saw or understood it.
10. One learning history; multiple authorized awareness views.
11. Awareness makes information usable.
12. Complex underneath; human on top.

## Educational loop
Experience → Evidence → Interpretation → Memory → Projection → Awareness → Informed Action → next Experience.

## Projection families
### Teacher Operational Projection
Evidence, uncertainty, interpretation, planning and decisions. Hypotheses/questions must be explicitly typed.

### Learner Awareness Projection
Helps the learner notice trajectory, capability, challenge and direction in age-appropriate language. Learner self-perception is its own evidence type, not proficiency evidence or canonical authority.

### Family Journey Projection
Gives authorized guardians a truthful longitudinal view: where we are going, journey so far, evidence, teacher interpretation, what the learner can notice, and where we walk next. It is not a simplified copy of the teacher cockpit.

## Parent Awareness / Acknowledgement
For minors, authorization alone is insufficient evidence of awareness.

Lifecycle:
AVAILABLE → DELIVERED → VIEWED → ACKNOWLEDGED (when acknowledgement is requested)
Optional: FEEDBACK_RECEIVED.

These states do not alter pedagogical truth. Parent acknowledgement is not teacher validation and cannot block canonical updates.

## Projection ≠ Communication
Every confirmed lesson may update Portfolio/canonical memory and projections. It does not follow that every lesson generates email/WhatsApp/export.

Communication has its own scope and authority. The system may surface an Awareness Candidate from a milestone, concern, cycle completion, requested action or other meaningful signal. Human-controlled communication remains default where interpretation/timing matters.

## Gustavo as Golden Witness
Gustavo's first five lessons are the reference case for full archive + cumulative memory; Family Journey; Young Learner awareness; learner self-perception; evidence/support boundaries; and no artificial CEFR promotion.

The current artifact is a reference implementation, not proof of executor portability.

Portability test: another executor receives the same canonical input + contract and must generate a semantically equivalent Family Journey without copying the reference artifact. Exact wording/pixels are not required; evidence scope, boundaries, narrative truth and pedagogical meaning are.

## Checkpoint
DONE / demonstrated:
- Canonical audit and P0 corrections documented.
- Gustavo five-lesson reference experience exists.
- Family Journey and Young Learner Check-In demonstrated.
- Awareness Layer concept defined.

NOT YET PROVEN:
- Unified contract implemented end-to-end.
- Awareness lifecycle persisted in runtime.
- automated family delivery/view acknowledgement.
- executor-independent reproduction.
- generalized minor-learner implementation.
- historical pilot acceptance suite.

## Required next order
Identity, sources, states & authority → Unified Lesson & Portfolio Contract vNext → product/projection contracts → acceptance criteria → Gustavo historical Golden-Witness pilot → preview implementation → validation → release/generalization.

Do not generalize Gustavo's UI directly. Generalize the contract and projection families.
