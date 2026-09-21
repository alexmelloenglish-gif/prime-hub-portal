# PRIME Pedagogical Processing Freeze v1.0

**Status:** FROZEN FOR CALIBRATION / implementation candidate  
**Date:** 2026-09-20  
**Scope:** post-lesson processing semantics, lesson intent, learning movement, state semantics, uncertainty and teacher-facing investigation.  
**Important:** this freeze does not grant new publication or canonical learner-state authority.

## 1. Machine boundary

The PRIME Learning Machine is a **post-lesson processor**.

It is not a person, autonomous agent, classroom voice or real-time observer. It does not conduct the lesson and does not independently create classroom interventions.

```text
LESSON HAPPENS
→ Lesson Frame + transcript/materials/evidence
→ post-lesson processing
→ evidence organization
→ learning movement
→ state interpretation
→ uncertainty / anomaly detection
→ teacher-facing implications
→ authorized projections
```

**Canonical principle:** The machine processes the lesson. It does not conduct the lesson.

## 2. Lesson Frame

Whenever possible, each lesson enters processing with a declared frame:

- mode: TARGETED / EXPLORATORY / MIXED;
- primary target;
- expected learner outcome;
- planned Showcase Opportunities;
- intended observation condition;
- secondary/recycling focus;
- context/reason;
- optional teacher notes.

If no frame exists, the lesson may still be processed, but the result is discovery-based and must not claim objective attainment.

The declared frame must not be rewritten after the lesson to fit the result.

## 3. Intended / enacted / emergent

Post-lesson processing keeps three questions separate:

1. **INTENDED** — What was the lesson trying to develop or investigate?
2. **ENACTED** — What actually happened and which opportunities were actually created?
3. **EMERGENT** — What meaningful learning appeared beyond the declared plan?

Emergent evidence remains valid even when it was not planned.

## 4. Learning Movement before State

The processor preserves movement before demanding classification.

Examples include:

```text
repeat
reconstruct
retrieve
retrieve with less support
repair
self-correct
transfer
generalize
fail to retrieve
recover after a clue
use spontaneously
```

**Invariant:** No state change does not mean no learning movement.

A rich lesson must not collapse to `NO CHANGE` merely because a state threshold was not crossed.

## 5. Frozen state semantics

These thresholds produce a **candidate, condition-scoped semantic proposal** for teacher review. They do not bypass teacher authority or automatically write canonical learner state.

### OBSERVED / SIGNAL
- **Operational rule:** 1 pedagogically relevant occurrence.
- **Meaning:** something relevant happened once.
- **Does not mean:** a capability has begun to emerge.

### EMERGING
- **Operational rule:** minimum 2 credible manifestations.
- **Meaning:** the capability has begun to emerge.
- **Does not mean:** sustained recurrence, consistency, stability or mastery.

### DEVELOPING
- **Operational rule:** minimum 4 meaningful manifestations.
- **Meaning:** the capability is clearly present and developing.
- **Does not mean:** reliable consistency across opportunities.
- Performance may still vary by correctness, support, task, context and independence.

### CONSISTENT
- **Operational rule:** minimum 5 meaningful manifestations **plus relative reliability under the stated condition**.
- **Meaning:** the target behavior reappears reliably enough under the observed condition.
- **Does not mean:** always correct, independent in every context or stable across time.

The condition is part of the claim, for example:

```text
CONSISTENT under immediate modeling
CONSISTENT with one lexical clue
CONSISTENT in controlled tasks
CONSISTENT independently in short answers
```

### STABLE / ESTABLISHED
- **Prerequisite:** the capability must previously have reached CONSISTENT.
- **Additional requirement:** persistence over time and/or across relevant context variation.
- **Does not mean:** perfect performance or unlimited transfer.

### MASTERY
- Broadly autonomous, flexible, transferable and durable use.
- Occasional error and successful repair remain compatible with mastery.
- Mastery does not mean 100% accuracy.

### PERFECTION
**Removed from the model.** Perfection is not a realistic pedagogical state, threshold or destination.

## 6. Counts never replace construct meaning

Thresholds do not erase task conditions.

Before interpreting frequency, the processor asks:

```text
WHAT EXACTLY IS THE CONSTRUCT?
UNDER WHAT CONDITION WAS IT OBSERVED?
```

Five accurate repetitions after teacher modeling can support **CONSISTENT under modeled pronunciation** when modeled pronunciation is the construct being observed. The same five repetitions do not automatically establish spontaneous pronunciation.

Likewise, repeating `went` after a model may support accurate modeled reproduction, but not independent past-time retrieval.

**Canonical principle:** Evidence is construct-sensitive.

## 7. Support is context, not automatic penalty

Support must be recorded rather than used as an automatic downgrade.

Possible conditions include:

```text
INDEPENDENT
SELF_CORRECTED
ONE_CLUE
MULTIPLE_CLUES
MODELED
RECONSTRUCTED
CONTROLLED_TASK
OPEN_COMMUNICATION
```

**Invariant:** Support describes the conditions under which performance occurred. It does not erase the performance.

## 8. Showcase Opportunities

A declared target should normally receive a legitimate opportunity to become observable.

This is instructional design, not evidence farming.

A Showcase Opportunity specifies:
- construct to observe;
- legitimate learning activity;
- first-attempt condition;
- possible support path;
- boundary on what the opportunity can establish.

The processor must distinguish:
- learner did not demonstrate the target; from
- the lesson did not create an adequate opportunity to observe the target.

## 9. Established evidence is not endlessly retested

An established capability is carried forward unless a meaningful reason reopens the question, such as:
- contradictory new evidence;
- a transfer question;
- meaningful context change;
- a significant delay when retention matters;
- explicit teacher reassessment;
- a previously conditional state.

## 10. Evidence-grounded uncertainty

`UNKNOWN` must always state why.

Allowed reasons:

```text
NOT_TESTED
NOT_OBSERVED
INSUFFICIENT_EVIDENCE
AMBIGUOUS_OR_MIXED_EVIDENCE
NOT_AVAILABLE
```

The processor must say not only that it does not know, but why it does not know.

## 11. Investigation and anomaly flags

The processor may identify uncertainty, paradox, contradiction, semantic conflict, possible implementation bug or missing evidence.

It may produce a teacher-facing **CLARIFICATION / INVESTIGATION FLAG** containing:
- trigger;
- evidence involved;
- why it matters;
- plausible interpretations;
- remaining question;
- suggested future observation.

It does **not** execute the investigation itself.

A contradiction must never be silently normalized.

Possible anomaly classes:

```text
SOURCE_ISSUE
SEMANTIC_MODEL_ISSUE
LIFECYCLE_CONTRADICTION
IMPLEMENTATION_BUG
TEACHER_INTERPRETATION_CONFLICT
UNEXPLAINED_ANOMALY
```

## 12. Same truth, multiple projections

One lesson has one evidence base. Different authorized projections may ask different questions of that same evidence:

- Learner State;
- Lesson Digest;
- Teaching Practice Signals;
- learner Goal / Motivation projection;
- B2B quality / professional-development projection.

They must not create contradictory truths.

## 13. Next Lesson Brief hierarchy

The processor must not return an unranked pile of everything observed.

Required hierarchy:

1. **PRIMARY TRAJECTORY** — what is deliberately being developed next;
2. **SECONDARY RECYCLING** — what is worth revisiting naturally;
3. **EMERGENT SIGNALS** — what newly became worth watching;
4. **OPEN QUESTIONS** — uncertainty that may matter later;
5. **SUGGESTED SHOWCASE OPPORTUNITIES** — legitimate opportunities the teacher may accept, edit, postpone or reject.

## 14. Calibration mode

Architecture calibration is separate from real learner records.

```text
runType: ARCHITECTURE_CALIBRATION
participantType: TEST_PARTICIPANT
learnerStateWrites: PROHIBITED
portfolioWrites: PROHIBITED
dashboardWrites: PROHIBITED
purpose: MACHINE_BEHAVIOR_VALIDATION
```

Calibration may deliberately expose observed, emerging, developing, consistent, modeled, independent, repair, self-correction, contradiction, NOT_TESTED, ambiguity, transfer and stability scenarios.

## 15. Freeze protocol

Do not change semantics during a replay.

```text
FREEZE
→ RUN
→ ANOMALY LOG
→ DISCUSSION
→ AMENDMENT
→ NEW FREEZE
→ RE-RUN
```

## 16. Core constitutional statements

> The machine processes the lesson. It does not conduct the lesson.

> The learner model serves teaching. Teaching does not serve the learner model.

> The machine must preserve movement before demanding classification.

> Planned targets should have legitimate evidence opportunities. Emergent learning remains valid even when unplanned.

> Support describes the conditions of performance; it does not automatically invalidate performance.

> State change is a consequence of learning evidence, never the objective of the lesson.

> Uncertainty must be evidence-grounded.

> A paradox must be surfaced, not silently normalized.

> One lesson produces one evidence base and multiple authorized projections.

> Every lesson should help us understand the learner better and teach the next lesson better.


## 17. Materialized Lesson / Teacher Digest

The post-lesson processor may produce a **candidate Lesson Digest** from the same evidence base.

The digest is not a teacher score. It compares:

```text
DECLARED TARGET
→ OPPORTUNITIES PLANNED
→ OPPORTUNITIES ACTUALLY CREATED
→ LEARNER RESPONSE
→ LEARNING MOVEMENT
→ TEACHER MOVES
→ TARGET ATTAINMENT
→ PRODUCTIVE DIVERGENCE
→ NEXT TEACHING IMPLICATION
```

Required protections:
- every learner-response, movement and teacher-move statement is evidence-linked;
- if the planned target opportunity was not created, attainment becomes `NOT_OBSERVABLE`, not learner failure;
- limited observability cannot be inflated to `CLEARLY_DEMONSTRATED`;
- the digest remains `candidate_non_authoritative` and `requiresTeacherReview=true`;
- no numerical teacher score is generated by this contract.

This creates a shared truth surface for learner, teacher and institutional projections without creating competing versions of the lesson.
