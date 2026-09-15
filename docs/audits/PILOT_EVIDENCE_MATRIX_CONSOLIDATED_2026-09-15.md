# PRIME — Pilot Evidence Matrix Consolidated

**Audit date:** 2026-09-15  
**Status:** DATED EVIDENCE RECORD — claim governance, not product-wide certification  
**Purpose:** consolidate the current evidence status across the seven pilot cases discussed and audited on 15/09/2026 without inflating claims, erasing limitations or conflating technical processing with pedagogical evidence.

## Governance rule

**Evidence not located ≠ capability absent.** It means the capability cannot yet be presented as demonstrated.

**Technical completion ≠ pedagogical completion.** A `PipelineRun` marked `completed`, a published report, a dashboard projection or a visible interface affordance does not by itself prove teacher review, canonicalization, cumulative personalization, learner authorship, a closed learning loop or causal educational impact.

The evidence classes used here are:

- **DEMONSTRATED** — supported by inspected artifacts or a directly supplied interface state with explicit boundaries.
- **DEMONSTRATED IN CONTROLLED / TEACHER-MEDIATED PILOT** — demonstrated at the artifact/pedagogical level, without certifying the complete Engine authority chain.
- **SUPPORTED BY ADMIN PREVIEW** — visible in user-supplied administrator-preview text; not an independently authenticated learner session or database audit.
- **NOT DEMONSTRATED** — the required linked transition or outcome was not established by the examined evidence.

---

## 1. Pilot G — cumulative personalization plus historical-run boundary

### Pedagogical / longitudinal finding

**Cumulative personalization: DEMONSTRATED IN A CONTROLLED, TEACHER-MEDIATED PILOT.**

The primary-artifact audit already inspected the canonical portfolio, four lesson-source documents and repository snapshots before and after Lesson 4. Earlier evidence is preserved, informs the current learner representation, changes priorities and is connected to a recorded next pedagogical action.

This supports the narrow claim:

> PRIME demonstrates documented cumulative personalization in a controlled, teacher-mediated learner case.

It does **not** establish software causality, a complete authority chain or causal improvement in learning outcomes.

### Historical operational traces supplied later

Three historical lesson traces were supplied for this same learner context. Across the supplied runs, the relevant fields are consistent:

- `processing completed`;
- `evidence 0`;
- `0 persisted candidate refs`;
- `review no_pending_review`;
- `report published/not_proven`;
- attendance explicitly **NOT PROVEN at the operational run layer**.

These traces therefore demonstrate only that historical technical processing completed. They do **not** demonstrate:

`Source → Candidate → Teacher Review → Teacher Decision → Canonicalization → Projection Authorization → Learner-facing Projection`.

They also do not invalidate the independently established pedagogical artifact chain. The correct distinction is:

> Pilot G has documented cumulative personalization at the pedagogical/canonical artifact level, while the supplied historical `PipelineRun` traces do not demonstrate the new Candidate/Review/Canonicalization Engine chain.

---

## 2. Pilot V — real source to assisted Candidate

**Real-source capture → assisted Candidate persistence: DEMONSTRATED IN CONTROLLED PREVIEW EXECUTION.**

The audited Preview witness read a real source, preserved provenance and persisted/reused an assisted Candidate with `review_required`. The successful witness used a predefined artifact and therefore does not demonstrate Gemini generation.

### Not demonstrated in this case

- teacher review;
- teacher decision;
- executed canonicalization;
- projection authorization;
- learner-facing publication from this Candidate;
- authorized next action from this Candidate;
- learner attempt;
- new Candidate from a subsequent attempt;
- second teacher review;
- complete Engine closed loop.

Automation is not the criterion. A manual flow can be end-to-end if the linked transitions are actually executed and verified. What is missing here is evidence after Candidate persistence.

Safe claim:

> An assisted Preview test demonstrated real-source capture and Candidate persistence. The downstream authority chain was not demonstrated in this case.

---

## 3. Pilot L — longitudinal contextualized projection with explicit teacher validation

**Longitudinal contextualized projection: DEMONSTRATED AT THE CANONICAL SNAPSHOT / ADMIN-PREVIEW LEVEL.**

The supplied projection presents three attended lessons, a teacher-validated current CEFR level and target, a portfolio-confirmed objective/focus, evidence-grounded priorities, a contextualized next action, learner memory and teacher feedback in the shared `STATE → PRIORITY → EVIDENCE → ACTION → HISTORY` presentation.

Repository evidence independently supports the teacher-validation sync and canonical longitudinal profile. Relevant public commits include:

- `75b377ef220d9cea6a4fa6672780281c441ddb26` — canonicalize longitudinal learning profile;
- `7d711ad85d1574b8a67068726a4fee18969eb84e` — sync teacher-validated profile and shared support links;
- `d3e23ede91b4a4c7d25ef5bf5ad8ccebd03a3197` — record teacher validation in canonical current-state documentation.

### What this case supports

`MULTI-LESSON HISTORY → TEACHER-VALIDATED STATE → PRIORITIES → CONTEXTUALIZED NEXT ACTION → DISPLAYED LEARNER MEMORY`

### Limits

Admin Preview does not by itself prove:

- that the learner viewed the projection in an authenticated learner session;
- execution of the next action;
- authorship of vocabulary sentences;
- that a sentence was actually locked/persisted;
- a new Candidate;
- a subsequent teacher review;
- an updated state after the action;
- a closed Engine cycle;
- causal impact on proficiency, motivation or retention.

The interface statement that a locked sentence becomes part of learning memory is a product rule/affordance, not proof that such an action occurred in this pilot.

Safe claim:

> Pilot L demonstrates a longitudinal projection connecting teacher-validated state, evidence from multiple lessons, pedagogical priorities, a contextualized next action and displayed learner memory. It does not by itself demonstrate execution of the next learning cycle.

---

## 4. Pilot I — initial contextualized personalization

**Initial contextualized personalization: SUPPORTED BY ADMIN PREVIEW.**

The supplied projection shows one attended lesson converted into:

- teacher-validated current and target CEFR levels;
- a professional objective tied to maritime interview/offshore contexts;
- a focused learning priority;
- a structured 60-second professional-introduction task;
- a small vocabulary-reuse set;
- explicit `Not Assessed` states where evidence is insufficient.

This case demonstrates an actionable baseline:

`LESSON EVIDENCE → INITIAL STATE → PRIORITY → NEXT ACTION → INITIAL MEMORY`

It does **not** demonstrate cross-session accumulation because only one attended lesson is represented. The requested recording is not evidence that a learner attempt was submitted.

Safe claim:

> Pilot I demonstrates initial contextualized personalization: one real lesson is organized into an evidence-bounded starting state, focused priorities and a next action aligned to the learner's professional objective.

---

## 5. Pilot C — cumulative longitudinal representation and context-linked action

**Cumulative longitudinal representation: SUPPORTED BY ADMIN PREVIEW.**

The supplied projection integrates three confirmed attended lessons across March, July and August into a current B1→B2 trajectory, with priorities for precision in extended answers, technical-vocabulary retrieval and B2 discourse tools. It also preserves a historical undated lesson memory without converting it into a fabricated attended lesson or dated report.

The next action — a scuba-diving destinations decision project — is explicitly connected to the documented interest/domain context from the latest lesson.

This supports:

`HISTORY → CURRENT STATE → PRIORITY → CONTEXT-LINKED NEXT ACTION → MEMORY`

A particularly important governance finding is:

> Preserving learning memory does not require manufacturing attendance, dates or evidence that are not established.

### Limit

This case demonstrates cumulative longitudinal representation and evidence-informed personalization of the next action, but it is not the strongest standalone proof of successive-cycle cumulative personalization because the audit does not establish:

`earlier decision/action → later lesson execution → new evidence → updated state`.

It also does not prove the next project was completed, a new Candidate was created, a second teacher review occurred or a closed loop was completed.

Safe claim:

> Pilot C demonstrates a longitudinal representation that synthesizes evidence from multiple lessons into current state, priorities, memory and a context-linked next action, while preserving uncertain historical memory without fabricating attendance.

---

## 6. Pilot R — longitudinal evidence to action to displayed memory

**Longitudinal state → priority → action → displayed memory entries: SUPPORTED BY ADMIN PREVIEW.**

The supplied projection shows eleven attended lessons and preserves ten detailed historical reports while explicitly acknowledging that a later confirmed attendance does not have a detailed class report. No language-development claim is manufactured from that evidence gap.

The current state and priorities are grounded in the longitudinal record. A recurring recommendation to recycle vocabulary becomes a concrete five-item personal-sentence activity. The interface then displays populated entries under `Your locked sentences` for part of that activity.

This supports the interface-level chain:

`HISTORY → CURRENT STATE → PRIORITY → ACTION → DISPLAYED MEMORY`

### Evidence-boundary strengths

- attendance without detailed lesson content is preserved as attendance only;
- missing detailed evidence does not produce a fabricated development claim;
- cumulative vocabulary is reduced to a small actionable reuse set rather than exposed as an undifferentiated archive.

### Authorship and persistence limits

Because the supplied material is explicitly **Admin Preview**, the visible entries do not independently prove:

- learner-authenticated authorship;
- submission timestamp;
- durable database persistence;
- that the entries were created outside administrative testing;
- a new Candidate;
- subsequent teacher review;
- a linked teacher decision updating state or next action;
- a second learning cycle.

Do not reproduce submitted learner sentences in public evidence documentation.

Safe claim:

> Pilot R demonstrates longitudinal evidence connected to current priorities, a concrete practice activity and displayed action-memory entries. Learner authorship, persistence and downstream review remain unverified.

---

## 7. Pilot D — partial projection with explicit authority gaps

**Partial contextualized projection: RETAINED FROM THE PRIOR AUDIT.**

The supplied Admin Preview contains multi-session context, vocabulary and teacher feedback while designated validated objective/current-priority/next-action fields remain incomplete. Teacher feedback must not be silently promoted into an authorized priority or action.

This case is useful because it demonstrates that the shared projection can preserve authority gaps instead of manufacturing completion.

Pending reconciliation remains:

- compare teacher feedback with the designated authorized priority/action surfaces;
- inspect the complete report-history surface before concluding that reports are absent;
- do not infer authority from narrative guidance alone.

---

# Cross-pilot interpretation

The pilots demonstrate different parts of the Learning Intelligence thesis at different verification levels:

| Pilot | Strongest supported contribution | What it does not prove |
| --- | --- | --- |
| G | documented cumulative personalization in a controlled, teacher-mediated case | new Engine authority chain, complete E2E, causal impact |
| V | real-source capture and assisted Candidate persistence | downstream review/canonicalization/publication/second cycle |
| L | longitudinal contextualized projection with explicit teacher validation | action execution or subsequent learning cycle |
| I | initial contextualized personalization from one lesson | accumulation across lessons |
| C | cumulative longitudinal representation plus context-linked action | successive-cycle execution |
| R | longitudinal evidence → priority → action → displayed memory entries | authenticated authorship, new Candidate, subsequent review |
| D | partial projection that preserves explicit authority gaps | complete state-to-action chain |

Together, these cases support that PRIME already operates meaningful components of a Learning Intelligence model across real learner artifacts and projections. They do **not** yet establish universal operation or a complete Engine closed loop.

# Claims allowed after this audit

The following formulations are defensible:

> PRIME already demonstrates documented cumulative personalization in a controlled, teacher-mediated learner case.

> Across current pilots, PRIME demonstrates longitudinal learner representations that preserve selected evidence, connect history to current priorities and produce contextualized next actions with explicit teacher authority and evidence boundaries.

> In one Preview witness, PRIME demonstrated real-source capture and assisted Candidate persistence under review gating.

> Some learner projections already connect longitudinal evidence to concrete practice activities and displayed memory entries, while learner authorship and downstream review remain to be verified.

# Claims not authorized by this audit

Do **not** claim as proven:

- universal cumulative personalization across all learners;
- complete Engine E2E execution;
- automated full-loop operation;
- learner-authenticated action completion unless independently verified;
- causal improvement in motivation;
- causal improvement in retention;
- causal improvement in proficiency;
- institutional outcomes attributable to PRIME;
- predictive accuracy at scale.

# Proof threshold for the next milestone

To demonstrate the complete positive path, preserve linked artifacts for:

`Source → Candidate → Teacher Review → Teacher Decision → Canonicalization → Projection Authorization → Learner-facing Projection`

Then demonstrate the subsequent learning cycle:

`Authorized Next Action → Authenticated Learner Attempt → New Candidate → Second Teacher Review → Maintained or Updated Canonical State / Next Action`

Each transition should carry actor/authority, timestamp, source/provenance and stable linkage. Manual or assisted execution is acceptable; what matters is verified continuity of the chain.

# Change boundary

This document updates evidence status only. It does not change the product thesis, close Gate E, merge PR #18/#19, activate a learner, authorize retries, alter learner data, authorize autonomous publication or claim causal educational impact.
