# PRIME Student Dashboard v1.0

## Locked Canonical Truth & Projection Contract

**Status:** LOCKED — AUTHORIZED FOR IMPLEMENTATION  
**Effective date:** 6 September 2026  
**First certification case:** Ítalo  
**Document authority:** This contract governs the behavior, semantics, provenance, projection, implementation, review, and certification of the PRIME student dashboard.

---

## 1. Purpose and governing rule

The dashboard is not the learner database and is not the learning-intelligence engine.

It is the **current student-facing projection of the learner model**.

Its primary question is:

> **Given everything PRIME currently knows about me, what matters to me now?**

The dashboard must preserve access to longitudinal memory without exposing the entire learner model at once.

The canonical relationship is:

```text
Deep learner memory
        ↓
Authorized current learner state
        ↓
Student dashboard projection
```

The template is fixed. The authorized content is dynamic.

No local implementation decision may redefine the meaning established by this contract.

---

## 2. First-screen hierarchy

The first screen must prioritize:

1. **Current State**
2. **What Changed**
3. **What Matters Now**
4. **What to Do Next**
5. **Supporting Evidence**
6. **Recent Learning Activity**
7. **Access to Deeper Memory and Portfolio**

The first screen must not prioritize database categories, pipeline labels, raw extraction output, implementation status, or technical counts without pedagogical meaning.

The entire dashboard—not merely a card called “Next Action”—must help the learner understand what matters now.

---

## 3. NOW, RECENT, and MEMORY

Every projected learning item must belong to a defined temporal layer.

### 3.1 NOW

NOW represents **what PRIME currently believes remains valid about the learner**, within the limits of available evidence and authorization.

NOW may include:

- current level;
- target level;
- current objective;
- active learning focus;
- current priorities;
- validated teacher direction;
- open student actions;
- relevant active blockers or risks.

NOW may be empty.

> **A required field means the projection must support the field, not that a value must always exist. Missing or unvalidated information must remain explicitly missing or appropriately qualified.**

The system must never manufacture a current state because the template expects a value.

### 3.2 RECENT

RECENT represents newly available or recently recorded information that may be relevant to the current state.

RECENT may include:

- latest lesson;
- recent class report;
- recently encountered vocabulary;
- recent grammar observations;
- recent teacher feedback;
- recent homework;
- recent performance evidence.

RECENT does not automatically become NOW.

### 3.3 MEMORY

MEMORY represents the longitudinal learning history.

MEMORY may include:

- previous lessons;
- historical vocabulary;
- repeated patterns;
- earlier objectives;
- attendance history;
- archived feedback;
- prior strengths and difficulties;
- portfolio records;
- earlier learning-state versions.

MEMORY must remain accessible without competing visually with NOW.

---

## 4. Current State and What Changed

### 4.1 Current State

**Current State = what PRIME currently believes is valid.**

A state is not current merely because it is recent. It must have sufficient provenance, qualification, and authorization for the semantic claim being made.

### 4.2 What Changed

**What Changed = evidence of movement since the previous relevant state.**

A recent observation does not automatically prove a state transition.

New information about the learner is not necessarily improvement in the learner.

“What Changed” must identify:

- the previous relevant state or baseline;
- the new authorized evidence;
- the nature of the difference;
- whether the difference represents performance change, model change, or both;
- the validation or qualification status.

---

## 5. Learner progress and learner-model progress

Learner progress and learner-model progress are distinct.

> **A lesson may produce valuable information about how a student learns, struggles, responds, or communicates even when measurable language performance has not improved.**

The dashboard must not convert increased knowledge about the learner into a false claim that the learner’s language performance improved.

### Learner progress

A supported change in the learner’s demonstrated knowledge, skill, performance, independence, accuracy, fluency, confidence, transfer, or consistency.

### Learner-model progress

An improvement in PRIME’s evidence-supported understanding of the learner, including newly identified patterns, preferences, difficulties, responses, contexts, or learning conditions.

Both may be valuable. They must never be conflated.

---

## 6. Semantic types

Every displayed learning item must have a defined semantic type.

| Type | Canonical meaning |
| --- | --- |
| Evidence | What was observed, produced, submitted, or reliably recorded |
| Signal | A structured pattern proposed or derived from evidence |
| Interpretation | Meaning assigned to evidence or a signal |
| Teacher validation | Human confirmation, rejection, correction, or qualification |
| Learning state | The currently authorized representation of the learner |
| Action | A concrete next step for the student or teacher |
| Outcome | Evidence about what happened after an action |

The interface must not present a draft AI inference as an established learning fact.

---

## 7. Teacher authority and epistemic status

PRIME may automatically identify and organize evidence.

PRIME may propose signals and interpretations.

The system must not present a pedagogical decision as teacher-authorized unless teacher validation actually occurred and its provenance is persisted.

Student-facing material must distinguish, when relevant:

- **Teacher validated**
- **System detected**
- **Pending teacher review**
- **Historical record**
- **Not currently available**

Teacher validation must preserve the actor, timestamp, transition, and provenance required to demonstrate that the validation occurred.

---

## 8. Supported dashboard fields

A supported field is part of the projection contract. It does not require an invented value.

### 8.1 Current Level

Must support:

- CEFR value or an explicitly qualified alternative;
- source;
- effective or assessment date;
- status or confidence where applicable;
- teacher-validation status.

### 8.2 Target Level

Must support:

- target;
- timeframe, when known;
- responsible context or program;
- status.

### 8.3 Objective

The current educational objective must be written in student-understandable language.

Vague values such as “improve English” are insufficient.

### 8.4 Focus

The active pedagogical focus must be connected to authorized evidence or teacher direction.

### 8.5 Priorities

Each current priority must support:

- description;
- reason;
- supporting evidence;
- epistemic and validation status;
- next action, when authorized.

### 8.6 Progress

Progress must describe meaningful change against an appropriate baseline.

Attendance, lesson count, vocabulary count, report count, and platform activity may support context. They do not independently prove learning progress.

### 8.7 Vocabulary

Where the evidence permits, vocabulary must distinguish:

- encountered;
- understood;
- practiced;
- reused;
- teacher confirmed;
- requiring recycling.

### 8.8 Grammar

Where the evidence permits, grammar must distinguish:

- observed difficulty;
- reviewed structure;
- successful use;
- recurring issue;
- current practice target.

### 8.9 Feedback

Feedback should identify:

- what the student did;
- what changed or was learned about the student;
- what improved, if supported;
- what still deserves attention;
- what should happen next.

---

## 9. Allowed claims

The dashboard may claim only what its provenance and authorization support.

Examples:

- “Your teacher identified past-tense narration as a current priority.”
- “This vocabulary was recorded in your recent lessons.”
- “You attended 11 of 11 recorded sessions.”
- “This recommendation is awaiting teacher review.”
- “Your next authorized practice task is…”
- “This lesson gave PRIME new information about how you respond to structured speaking support.”

---

## 10. Forbidden claims and behavior

The dashboard must never:

- claim mastery based solely on exposure;
- claim progress based solely on attendance or activity volume;
- display a percentage without a defined, reproducible calculation;
- claim teacher validation that did not occur;
- display one student’s data in another student’s projection;
- claim continuity when the underlying records are disconnected;
- treat a recent observation as current state without authorization;
- treat learner-model progress as learner progress;
- present an interface component as proof of pipeline operation;
- present AI interpretation as teacher judgment;
- use a silent source-of-truth fallback;
- replace missing values with hardcoded, demo, default, or cross-student content;
- expose raw transcript, prompt, draft extraction, or unvalidated pipeline material to the student;
- leak implementation or infrastructure language into the student experience.

---

## 11. Identity, provenance, and canonical source

Every projected field must be traceable to:

- stable student identifier;
- source record;
- source system;
- creation timestamp;
- update or effective timestamp;
- semantic type;
- validation status;
- temporal layer: NOW, RECENT, or MEMORY;
- projection version.

The dashboard must not invent truth locally.

The implementation must use the explicitly designated canonical source of truth for each governed record type. Firestore, Google Docs, Neon, or any other store must not silently substitute for another source because data is missing or unavailable.

A source conflict must be surfaced rather than resolved by an undocumented fallback.

---

## 12. Authorized projection path

```text
Transcript / lesson evidence
        ↓
Evidence
        ↓
Learning signals
        ↓
Interpretation / insight
        ↓
Teacher validation or explicit qualification
        ↓
Authorized learning state
        ↓
Student dashboard projection
```

The dashboard receives an authorized projection, not raw pipeline material.

An incomplete stage must remain incomplete or explicitly qualified. No downstream display may imply that an incomplete upstream transition occurred.

---

## 13. Deterministic projection

> **Given the same authorized source records and the same projection version, the student dashboard must produce the same semantic result.**

Visual presentation may evolve without changing the governed meaning.

Projection behavior must be deterministic enough to support regression testing, forensic comparison, and reproducible certification.

Sorting, recency boundaries, selection rules, state resolution, qualification rules, and field derivation must not depend on undocumented randomness or local component behavior.

---

## 14. Student-facing language and surface separation

The authenticated student dashboard must be entirely in English.

The student-facing experience must not expose:

- pipeline;
- prompt;
- extraction;
- Firestore;
- Neon;
- database fallback;
- raw transcript;
- internal AI confidence terminology;
- administrator preview details;
- internal project status;
- implementation terminology.

Administrative, diagnostic, teacher-review, and student surfaces must remain explicitly separated.

---

## 15. Canonical template and scale rule

Ítalo is the first certification case, not a unique architecture.

After certification:

- the same canonical structure must serve every pilot student;
- only authorized individualized content may vary;
- no student-specific redesign should be necessary;
- no identity, metric, link, state, or pedagogical claim may be hardcoded;
- the projection must remain coherent with one lesson or one thousand lessons.

---

## 16. Implementation-agent instruction

> **No implementation task may introduce a local semantic rule that contradicts this contract. If implementation reveals a conflict or missing definition, stop and escalate the conflict rather than silently inventing a rule.**

The required conflict process is:

```text
Contract conflict discovered
        ↓
Conflict and evidence surfaced
        ↓
Deliberate product decision
        ↓
Canonical contract updated, if authorized
        ↓
Implementation resumes
```

Neither implementation nor review may silently redefine the contract.

---

## 17. Ítalo certification tests

### Truth

- No Rafael, Laura, Gustavo, or other-student data appears.
- Ítalo’s identity is correct in every governed route, component, API response, and projection.
- Every displayed value traces to Ítalo’s authorized records.
- Missing values remain missing or explicitly qualified.

### Meaning

- NOW, RECENT, and MEMORY are semantically distinct.
- Current State and What Changed are not conflated.
- Learner progress and learner-model progress are not conflated.
- Every metric and status has a defined meaning.
- No pseudo-percentage or unsupported mastery claim appears.

### Pedagogy

- The first screen answers what matters now.
- Current priorities connect to evidence or teacher direction.
- The student can identify the next authorized useful action.
- Teacher authority and qualification status are represented accurately.

### Technical integrity

- No hidden fallback produces apparently valid data.
- The designated canonical source is used consistently.
- Source conflicts and missing data fail honestly.
- Raw or unvalidated pipeline material is not projected to the student.
- Student, teacher, administrative, and diagnostic surfaces remain separated.
- The same authorized records and projection version yield the same semantic projection.

### Reproducibility

- The same projection mechanism works for at least one second pilot student.
- No hardcoded Ítalo-specific value is required.
- The dashboard remains coherent as longitudinal history grows.
- Acceptance evidence is reproducible rather than asserted.

---

## 18. Verification ladder

Each requirement must be reported independently as:

```text
SPECIFIED
    ↓
IMPLEMENTED
    ↓
EXECUTED
    ↓
EXPECTED OUTPUT OBSERVED
    ↓
PERSISTED, where required
    ↓
TRACEABLE
    ↓
VERIFIED
```

Specified is not implemented. Implemented is not executed. Executed is not verified. A projection being visible does not prove that the reasoning or pipeline that supposedly produced it is verified.

---

## 19. Definition of v1 completion

The dashboard is not complete because it looks polished.

It is complete for v1 when:

> **A real student can open the dashboard, understand the currently authorized learning state, see what genuinely changed, distinguish learning progress from growth in PRIME’s knowledge about them, know what matters now, identify a truthful next action, and access deeper memory—without encountering another student’s data, unsupported claims, silent fallbacks, or pipeline language.**

The deeper Teacher Intelligence and cognitive-twin loop may continue evolving behind this contract. The student projection must already be truthful, useful, deterministic, reproducible, and faithful to PRIME doctrine.

---

## 20. Locked execution sequence

```text
Locked Contract
      ↓
Existing Implementation Audit
      ↓
Ítalo P0 Truth Corrections
      ↓
Canonical Projection Implementation
      ↓
Forensic Review
      ↓
Ítalo Certification
      ↓
Second-Student Reproducibility Test
      ↓
Pilot Propagation
      ↓
Landing-Page Alignment
      ↓
Pipeline Hardening
```

Until Ítalo is certified, the next implementation cycle must not prioritize animations, landing-page redesign, new dashboard sections, additional decorative metrics, full Teacher Intelligence completion, or visual sophistication unrelated to truth and projection integrity.
