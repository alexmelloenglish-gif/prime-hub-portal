# PRIME Learning Narrative Machine v1

**Status:** IMPLEMENTATION DRAFT / separate from PR #40 adoption  
**Base:** PR #40 head \`0b2b7d08d9391a2f29a6fe5297131970d3efee68\`  
**Purpose:** build the narrative-producing stage without changing canonical authority.

## 1. What the machine does

The machine receives an ordered set of already-authorized learning evidence, including evidence from earlier lessons, and constructs a factual narrative for the current learner-facing episode.

It does not summarize the current transcript in isolation.

Its unit of work is:

\`authorized evidence over time → connections/revisits/adjustments → evidence-linked narrative → teacher review → presentation\`

The narrative is a projection. It is not a new source of truth.

## 2. Required distinction

The machine keeps three things separate:

1. **Evidence:** what happened, with source and lesson provenance.
2. **Narrative:** the factual account that connects those events across time.
3. **State:** any separately authorized learner-state decision.

A narrative can exist when state does not change.

## 3. How evidence builds the story

The machine first orders authorized evidence chronologically. It then asks the language model to construct segments from the evidence:

- where the learning was;
- what happened now;
- what connection/revisit/adjustment became visible;
- what boundary is needed;
- what authorized continuation comes next.

Every narrative segment must cite one or more evidence IDs. No cited ID may be absent from the supplied evidence set.

This makes narrative generation inspectable: the prose can be reviewed against the evidence that caused it to exist.

## 4. Longitudinal examples

A sequence such as:

\`personal use → later use → explicit practice → return in a new context → adjustment\`

can become one factual story instead of five disconnected state records.

A content-through-English sequence such as:

\`study in English → later revisit → some recall → some reconstruction\`

is described as participation, recall and reconstruction under the observed conditions. It is not automatically converted into “retained” or “forgotten”.

## 5. What the machine must never do

It must not:

- invent an achievement because the lesson needs one;
- convert one error into a learner trait;
- convert one correct answer into mastery;
- treat a later recall attempt as a complete measure of prior learning;
- attribute difficulty to English without evidence separating language and task demands;
- call a response self-correction unless the evidence supports that sequence;
- invent practice history, motivation, awareness or transfer;
- invent a next step when no authorized next step exists;
- publish directly.

## 6. Human gate

The output remains:

\`draft + non_authoritative + requiresTeacherReview=true\`

The teacher validates the meaning and boundaries before student/family publication.

## 7. Implementation boundary

This draft deliberately does not wire the engine into the frozen legacy ingestion/publishing path. The integration point is after canonical teacher-validated evidence exists and before the student/family narrative renderer. Integration should reuse existing G3/G4/G5/G6 authority and lineage rather than create a parallel authority path.

## 8. Acceptance

The included self-test proves:

- chronological cross-lesson evidence is accepted;
- a documented adjustment can be told without an error-only narrative;
- content participation through English is kept separate from subject mastery/retention;
- every narrative segment is evidence-linked;
- unknown evidence references fail validation;
- the authorized next step is part of the narrative only when supplied.

This is an implementation foundation, not production compliance.


## 9. Learning movement is not state change

The machine does not ask whether every lesson changed the current state before deciding whether the lesson has a story.

Its primary question is:

**What happened in this learner's journey during this period?**

Only after the event history is assembled does the system ask whether any authorized observation justifies a separate Current State update.

This protects four invariants:

1. Evidence records events; it does not automatically declare states.
2. Repeated state does not mean no progress; stability can represent retention, consolidation or continued use.
3. Missing evidence does not mean regression; the behavior may not have been elicited, relevant or observed, or may no longer require the same visible correction.
4. Student-generated evidence belongs to the learning record. It can document noticing, reflection or a learner's own account, while teacher authority remains required for pedagogical interpretation and state decisions.

## 10. Error, pattern and state

An error is an event, not a learner state, and it is not inherently progress or regression. A self-correction is an event, not a state. A sequence of events may later support a bounded pattern, and a sufficiently supported pattern may contribute to an authorized state decision.

A historical note such as "needs to self-correct X" must therefore remain time- and context-bound. It must not become a permanent identity claim. Later absence of self-correction may be compatible with improved automaticity, lack of opportunity, or lack of observation; the machine does not choose among these without evidence.

The possible history error → noticing → prompted correction → self-correction → repeated accurate use → less need for correction is illustrative, not a developmental gate sequence. Learning may recur, reverse, skip or revisit these events.

## 11. Learner-generated evidence

The machine may accept teacher-validated evidence whose producer is the learner. A simple metacognitive record such as:

**What did I say/write? → What should it be? → Can I fix it? → What do I notice?**

can become part of the evidence available to future practice and narrative generation.

The machine must distinguish the fact that a learner recorded or noticed something from the teacher's interpretation of what that event means pedagogically. Learner-generated evidence does not bypass teacher authorization or create a state by itself.

This remains an implementation foundation; no student-facing Error Log is published by this change.