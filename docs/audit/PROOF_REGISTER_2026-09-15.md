# PRIME DIGITAL HUB — PROOF REGISTER

## Canonical evidence register — 15 September 2026

**Repository:** `alexmelloenglish-gif/prime-hub-portal`  
**Purpose:** preserve, in one canonical place, the evidence actually demonstrated by the PRIME runtime, pilots, interfaces and audits, together with explicit limits on what the evidence does **not** prove.

---

## 1. Why this document exists

This document is the consolidated evidence record for PRIME Digital Hub's Learning Intelligence work.

Its purpose is to prevent repeated re-study of the same proof, prevent architectural claims from being mistaken for demonstrated runtime capability, and preserve the distinction between:

- architecture and implementation;
- implementation and runtime behavior;
- runtime behavior and pedagogical evidence;
- pedagogical evidence and educational impact.

This document is a **proof register**, not a product brochure and not a claim that the complete Learning Intelligence Engine is already proven end-to-end.

The governing principle is:

> **The system prepares. The teacher interprets, validates and decides.**

And, operationally:

> **AI proposes. Teacher validates.**

---

# 2. Evidence status taxonomy

### PROVADO
A concrete artifact, runtime state, trace, interface behavior or implementation has been directly observed and is sufficient for the specific claim stated.

### PROVADO NO PREVIEW
Demonstrated in an admin/preview/test surface, but not sufficient to claim that a real student experienced the complete behavior in production.

### RELATADO / PENDENTE DE VERIFICAÇÃO
The claim appears in a synthesis, report or pilot account, but the primary artifacts needed to independently verify it have not yet been checked.

### NÃO DEMONSTRADO
The available material does not establish the claim.

### KNOWN TECHNICAL ARTIFACT
A known implementation/runtime artifact that must not be counted as pedagogical evidence.

---

# 3. Core evidence matrix

| Claim | Evidence | Scope / limitation | Status |
|---|---|---|---|
| PRIME has a teacher-first intelligence workspace | Teacher Intelligence cockpit explicitly describes itself as a teacher-first workspace for reading lesson evidence, spotting patterns and deciding pedagogical action | Demonstrates product/runtime framing and surface | **PROVADO** |
| AI recommendations remain proposals | Cockpit and Actions explicitly show `AI proposes` / `Teacher validates` and `ai_proposed` states | Does not prove an actual teacher validation occurred | **PROVADO** |
| AI proposal is not Teacher Decision | Actions page explicitly states `CoachingRecommendation ≠ TeacherDecision`; four proposals show `human decision not proven` | Does not prove any decision was later recorded | **PROVADO** |
| AI proposal is not Educational Action | Actions page explicitly shows `action not proven`; runtime says no proven canonical EducationalAction entity | Does not prove any action was later executed | **PROVADO** |
| Runtime does not manufacture canonical Learning State, Signal or Insight | Cockpit explicitly says it does not fabricate these when runtime cannot prove them | Demonstrates containment/governance, not successful end-to-end completion | **PROVADO** |
| Source is not automatically Evidence | Laura failed trace has a persisted source but zero Evidence Candidates | Specific observed trace | **PROVADO** |
| Evidence Candidate is not validated Evidence or Assessment | Review/trace explicitly distinguishes `Candidate ≠ validated evidence ≠ assessment` | Demonstrates semantic boundary | **PROVADO** |
| Transcript existence is not Attendance | Laura and Rafael traces show that transcript/source existence is not treated as canonical attendance | Specific observed traces | **PROVADO** |
| Processing completion/failure is technical, not pedagogical | Laura and Rafael traces explicitly say processing state is technical only | Does not prove successful processing is pedagogically valid | **PROVADO** |
| Assessment requires canonical Assessment authority | Rafael trace has `Assessment = NOT PROVEN` and no canonical Assessment record despite completed processing | Specific observed successful-processing trace | **PROVADO** |
| Review absence is not teacher approval | Rafael trace has no ReviewTask and explicitly says this does not imply approval | Specific observed successful-processing trace | **PROVADO** |
| Report publication can be a non-pedagogical projection state | Rafael trace shows `documentStatus: published`, `authorityStatus: non_authoritative`, `teacherInsight: null`, `sourceEvidenceIds: []`, while explicitly stating report presence does not prove validated evidence or assessment | Demonstrates safe publication of a non-authoritative projection, not teacher-approved pedagogy | **PROVADO** |
| Portfolio projection can be applied without creating learner judgment | Rafael trace shows `portfolio apply: applied` while `Assessment`, Evidence Candidates and ReviewTask remain unproven/absent and the applied operation is a class-report projection | Demonstrates projection/application separation; does not prove a pedagogical state was updated | **PROVADO** |
| Failed AI generation is auditable | Laura trace persists `GeminiGenerationFailed` with timestamp, model, provider, requestId, artifactId, stage, HTTP 403 and prompt version | Demonstrates provenance of failure | **PROVADO** |
| Failed processing is not applied to Portfolio | Laura trace says `portfolio apply: not applied` and no PortfolioProjection sourced from the run | Specific failed trace | **PROVADO** |
| Technical failure is not converted into learner judgment | Failed Laura attempt produces no assessment, evidence, review approval, report authority or portfolio projection | Specific trace; does not prove all successful paths | **PROVADO** |
| Identity is a security boundary | Authorized student directory explicitly states `Identity remains a security boundary` | Demonstrates product rule and implementation surface | **PROVADO** |
| Canonical student directory exists | Students page explicitly says it reuses the existing canonical student directory rather than creating a parallel profile store | Directory behavior | **PROVADO** |
| Student projection and runtime lessons are separate surfaces | Students page exposes separate `Student projection` and `Runtime lessons` links | Surface separation | **PROVADO** |
| Identity, level/target, pipeline state and report count remain distinct dimensions | Student directory displays them as separate fields/states | Does not prove pedagogical provenance of every displayed level/target | **PROVADO** |
| Pipeline state can be completed, failed or no data independently of student identity | Current directory shows all three states across learners | Operational state only | **PROVADO** |
| Published report count is distinct from pipeline state | Rafael: completed/1; Gustavo: completed/2; Louise/Laura/Cláudio: failed/0; others: no data/0 | Counts do not prove learning quality | **PROVADO** |
| Longitudinal projection can contain validated state/priorities, evidence, action and memory | Louise pilot shows B1 current/B2 target validated by teacher, three attended lessons, reports, priorities, contextualized action and pedagogical memory | Does not prove action execution or a subsequent closed cycle | **PROVADO NO PREVIEW** |
| Cumulative personalization in Gustavo case | Reported use of prior lesson evidence to inform priorities/next actions | Primary Lessons 1–4 artifacts were not independently verified in the current audit | **RELATADO / PENDENTE DE VERIFICAÇÃO** |
| Valéria capture and Candidate creation | Assisted Preview test demonstrated source capture and persisted Candidate | Later stages were not demonstrated | **PROVADO NO PREVIEW** |
| Complete Valéria pipeline through authorized projection | Not demonstrated | Missing proof of later transitions and subsequent cycle | **NÃO DEMONSTRADO** |
| Second learning cycle with new Candidate and review | Not demonstrated | No proof of attempt → Candidate → review → updated state cycle | **NÃO DEMONSTRADO** |
| Educational impact in motivation, retention, proficiency or institutional outcomes | Not established by current audit | Context continuity is not causal impact evidence | **NÃO DEMONSTRADO** |

---

# 4. Runtime governance — consolidated proof

## 4.1 Teacher Intelligence cockpit

The current Teacher Intelligence cockpit states:

- `AI proposes`
- `Teacher validates`
- Start with the learner; use the pipeline as evidence.
- Review evidence before trusting an AI-supported interpretation.
- Inspect signals without treating proposals as canonical truth.
- Validate insights; the teacher decides what is pedagogically meaningful.
- Use validated information to guide feedback, practice and future teaching choices.

Current observed counters on 15 September 2026:

- Recent learners: **1**
- Recent lessons: **12**
- Items needing attention: **0**
- Teacher review queue: **0**
- Evidence to inspect: **0**
- Signal proposals: **0**
- Insight proposals: **0**
- Draft reports: **0**

The cockpit also explicitly states that it does not fabricate canonical Learning State, Signal or Insight when the runtime cannot prove them.

### What this proves

The runtime exposes a teacher-first governance model and keeps unproven states visible rather than manufacturing certainty.

### What this does not prove

It does not prove that teachers have actually validated every proposal, that teaching actions were executed, or that the complete Engine cycle has closed for all learners.

---

# 5. Actions — AI proposal containment

The Actions page explicitly states:

> `CoachingRecommendation ≠ TeacherDecision`

It further states that the current runtime has no proven canonical `PedagogicalDecision` or `EducationalAction` entity and that the view does not manufacture either one.

Four visible proposals were observed:

1. Rafael Copolillo — `ai_proposed` — human decision not proven — action not proven.
2. `carolvdrummond@gmail.com` — `ai_proposed` — human decision not proven — action not proven.
3. `carolvdrummond@gmail.com` — `ai_proposed` — human decision not proven — action not proven.
4. `order08-persistence-20260826@invalid.test` — `ai_proposed` — human decision not proven — action not proven.

Each proposal is traceable to an `Open lesson trace` surface.

### Proven claim

The runtime explicitly separates:

**AI recommendation → human decision → educational action**

and refuses to infer the latter two when they are not proven.

### Not proven

No actual teacher acceptance, PedagogicalDecision or EducationalAction is established for these four records by this screen.

---

# 6. Laura failed trace — concrete epistemic containment

Observed lesson:

- learner: `lauramgcstemp@gmail.com`
- lesson: `lesson_a3368991e6ba0c79`
- processing attempt: `cmtnuixhv0001xclqjwb24qz8`
- authority: `non_authoritative`
- source: Google Meet
- sourceFileId: `1gvkGGRuzn-cHz4rrRVG0sXU_-hND_QKgHnmj2qnL534`
- transcriptId: `cmtcqbiyy00026cqafg8r788w`
- recordedAt: 28/08/2026 08:54:15
- processing status: `failed`
- error: `GEMINI_HTTP_ERROR`
- Gemini HTTP status: **403**
- portfolio apply: **not applied**
- Evidence Candidates: **0**
- Assessment: **NOT PROVEN**
- ReviewTask: **none**
- ClassReportProjection: **none**
- PortfolioProjection: **none**
- persisted audit event: `GeminiGenerationFailed`

The persisted failure event includes model `gemini-3.7-flash`, provider `gemini`, stage `prompt-1`, requestId, artifactId, timestamps, HTTP status and prompt version.

### What this proves

A concrete failed processing attempt remains a technical failure. The runtime does not turn transcript existence or processing existence into attendance, evidence, assessment, review approval, report authority or portfolio state.

### Canonical rule extracted

> **A downstream artifact never proves that an upstream pedagogical state occurred.**

This is a core PRIME epistemic/governance rule and should remain preserved in future audits.

---

# 7. Rafael — successful processing with non-authoritative projection

The Rafael trace adds an important complementary case to the Laura failure trace. It demonstrates that a technically completed run can produce a published projection while still refusing to convert that processing result into pedagogical authority.

Observed trace:

- learner: `rafael.copolillo@gmail.com`
- lesson: `lesson_442b50078da7a21d`
- processing attempt: `cmtc7yq7m0000o4qwvlfwye6w`
- identity authority: `non_authoritative`
- source type: `google_meet`
- sourceFileId: `1_yQ0gyOncDsDj49YbS6_D9y8L1Rw811bJSl409jKjvA`
- transcriptId: `cmtc7yq8c0002o4qwk4b51nbc`
- effectiveAt: **NOT PROVEN**
- recordedAt: 27/08/2026 13:24:56
- processing status: `completed`
- processing error: none persisted
- portfolio apply: **applied**
- Evidence Candidates: **0**
- Assessment: **NOT PROVEN**
- ReviewTask: **none**
- Signal proposals: **0**
- TeacherInsightProposal: **none**
- AI generation provenance: `{}`

The trace contains a published Class Report projection, but the report itself is explicitly non-authoritative:

- `contentStatus: draft`
- `documentStatus: published`
- `teacherInsight: null`
- `teacherInsightStatus: omitted`
- `authorityStatus: non_authoritative`
- `sourceEvidenceIds: []`
- `evidenceHighlights: []`
- `implementationStatus: not_proven`

The report text itself states that it is pending authorized source records and that no validated Evidence was supplied for the projection.

The persisted audit events show:

1. `Prompt1ArtifactCreated` with `candidateCount: 0` and `authorityStatus: non_authoritative`;
2. `ClassReportProjectionDrafted` with `autoPublish: true`, `documentStatus: draft`, `requiresHumanReview: false`;
3. `PortfolioProjectionPatchProposed` with `applyStatus: pending_auto_publish` and an operation key tied to the class-report projection;
4. `AIRecommendationGenerated` with `requiresHumanReview: false`, `recommendationStatus: ai_proposed`, `isPedagogicalDecision: false`;
5. `ClassReportProjectionPublished` with reason `auto-publish: trusted source, non-pedagogical-decision`, reviewer `system`, `autoPublished: true`;
6. `PortfolioProjectionUpdated` with `applyStatus: applied`, reviewer `system`, and the same operation key.

### What this proves

This is significant evidence of a distinction that should remain explicit in the architecture:

**technical processing → non-authoritative projection** can occur without becoming:

**validated evidence → assessment → teacher decision → educational action**.

It also demonstrates that `published` does not mean `pedagogically validated`. A system-generated document can be published as a non-pedagogical projection while its authority remains explicitly `non_authoritative` and its evidence/assessment fields remain unproven.

The PortfolioProjection application in this trace is likewise an application of the class-report projection operation, not proof that Rafael's learner state, assessment or progress was updated.

### What this does not prove

This trace does **not** prove:

- attendance;
- validated Evidence;
- canonical Assessment;
- teacher Review or approval;
- PedagogicalDecision;
- EducationalAction;
- a valid learner-state update;
- causal learning progress;
- a closed Learning Intelligence Engine cycle.

Status: **PROVADO** for the specific runtime/governance claims above.

---

# 8. Authorized Student Directory — identity boundary

The current Students page is explicitly titled:

> **Authorized student directory**

and states:

> **Identity remains a security boundary.**

It also states that the view reuses the existing canonical student directory and pipeline enrichment rather than creating a parallel profile store.

Observed examples:

| Learner | Level | Target | Pipeline | Published reports |
|---|---|---|---|---:|
| Rafael Copolillo | CEFR B2 | CEFR C1 | completed | 1 |
| Louise D. Silva Nogueira | B1 | B2 | failed | 0 |
| Italo Pires | CEFR A2 | CEFR B1 | NO DATA | 0 |
| Eduarda Coelho Gabriel | Assessment pending | School-task performance target pending | NO DATA | 0 |
| Laura Maria Galvão Costa Stempniewski | CEFR B1 | CEFR B2 | failed | 0 |
| Maria Fernanda Galvão Costa Stempniewski | CEFR B2 | CEFR C1 | NO DATA | 0 |
| Diego da Silva Rodrigues | CEFR A2 | CEFR B1 | NO DATA | 0 |
| Cláudio Bittencourt | CEFR B1 | CEFR B2 | failed | 0 |
| Gustavo Drummond de Andrade Salgado | CEFR A1 — progressing toward A2 | CEFR A2 | completed | 2 |

### Important interpretation

The directory demonstrates that identity, level/target, pipeline status and report count are separate operational dimensions.

Examples such as Italo (`NO DATA` while a learner level/target exists) show that:

- `NO DATA` does not mean no learner;
- pipeline status is not learner level;
- pipeline completion is not assessment;
- published report count is not learning state.

### Limitation

This page alone does not establish the pedagogical provenance or teacher validation of every displayed level/target. Specific validation claims require their own evidence.

---

# 9. Louise — longitudinal projection evidence

The Louise pilot provides a stronger projection example than a simple runtime listing.

Observed elements include:

- three attended lessons;
- reports dated 2 Mar, 16 Mar and 10 Aug;
- current B1 and target B2 validated by the teacher;
- canonical objective/focus;
- priorities derived from history and latest transcript;
- contextualized action: `Current Affairs Precision Round`;
- pedagogical memory across fluency, communication, grammar and vocabulary;
- teacher feedback;
- visible chain:
  **STATE → PRIORITY → EVIDENCE → ACTION → HISTORY**.

### Safe claim

The pilot demonstrates a longitudinal projection with teacher-validated state/priorities, multiple lesson evidence, a contextualized action and pedagogical memory displayed in the interface.

### Limits

It does not, by itself, prove:

- that Louise saw the projection in her own production session;
- that a new action was executed;
- that Louise created a new Candidate;
- that a later Candidate was reviewed;
- that the action changed state;
- that the complete Engine cycle closed;
- causal gains in proficiency, motivation or retention.

The interface rule `Once locked, it becomes part of your learning memory` is an affordance/rule, not proof that a specific phrase was actually created and locked in this case.

Status: **PROVADO NO PREVIEW**.

---

# 10. Gustavo — cumulative personalization evidence boundary

The Gustavo case has been reported as demonstrating use of prior lesson information to inform subsequent pedagogical priorities/actions.

However, the current audit did **not** independently verify the primary artifacts for Gustavo Lessons 1–4.

Therefore the correct status is:

> **RELATADO / PENDENTE DE VERIFICAÇÃO**

This does not weaken the hypothesis. It prevents the hypothesis from being promoted to a verified case without checking the underlying artifacts.

---

# 11. Valéria — pipeline evidence boundary

The Valéria assisted Preview test demonstrated:

- capture of source evidence;
- persistence of an Evidence Candidate.

The following were **not demonstrated** in that case:

- complete pipeline through teacher decision;
- authorized projection;
- subsequent attempt;
- new Candidate;
- second review;
- updated learning state;
- closed Engine cycle.

Therefore:

**Capture + Candidate:** **PROVADO NO PREVIEW**  
**Complete pipeline:** **NÃO DEMONSTRADO**

The missing proof is about later transitions, not specifically about automation. A workflow can be manually operated and still be end-to-end; what is missing here is evidence that the later states actually occurred.

---

# 12. `order08-persistence-20260826@invalid.test` — technical artifact

This record is a known legacy implementation artifact from the early automation implementation.

The known situation is:

- an operational event was persisted;
- the runtime counter correctly counts it;
- the lifecycle cleanup/reconciliation path was never completed;
- the record therefore remains permanently pending/orphaned;
- it appears in multiple projections, including Actions.

### Correct classification

> **Legacy orphaned operational event — known implementation artifact.**

It must **not** be counted as evidence of a real student, real pedagogical action, teacher decision or learning event.

### Correct technical interpretation

The counter is not the primary defect. The counter is correctly counting the persisted event.

The defect is:

> **absence of the lifecycle path that should resolve/remove/reconcile the orphaned operational event.**

The remediation target is lifecycle cleanup/reconciliation, not counter suppression.

---

# 13. Canonical semantic boundaries

These distinctions are now part of the PRIME evidence discipline:

- attempt ≠ validated evidence;
- source ≠ evidence;
- evidence ≠ assessment;
- assessment ≠ progress;
- transcript ≠ attendance;
- AI interpretation ≠ pedagogical truth;
- AI proposal ≠ teacher decision;
- teacher decision ≠ educational action unless the action is actually recorded/executed;
- approval ≠ publication;
- processing completion ≠ assessment validity;
- report ≠ assessment authority;
- dashboard projection ≠ proof that an upstream event occurred;
- absence of ReviewTask ≠ teacher approval;
- `NO DATA` ≠ no learner;
- pipeline status ≠ learner level;
- published report count ≠ learning state.

These are not merely wording preferences. They are the semantic boundaries that prevent the runtime from manufacturing unsupported pedagogical meaning.

---

# 14. What is currently demonstrated about the Learning Intelligence architecture

The following architectural behavior is strongly supported:

**Source**  
↓  
**Candidate / processing output**  
↓  
**Review Required / human boundary**  
↓  
**Teacher Decision**  
↓  
**Canonical Record**  
↓  
**Authorized Projection**

However, the complete chain is **not demonstrated universally and end-to-end** across the current evidence set.

What is demonstrated is the existence and separation of important boundaries and several concrete projections/pilot states.

The strongest current claim is therefore:

> **PRIME is an operating learning-intelligence product being developed and validated inside a real educational environment. Its runtime preserves provenance, separates technical processing from pedagogical authority, keeps AI outputs subordinate to teacher validation, and prevents unsupported downstream states from being fabricated.**

---

# 15. What we must NOT claim from the current evidence

Do not claim that:

- the Learning Intelligence Engine is fully automated end-to-end in all cases;
- AI knows each learner;
- AI decides pedagogical state;
- the system stores or understands everything;
- every transcript becomes validated evidence;
- every Evidence Candidate becomes canonical Evidence;
- every AI proposal becomes a teacher decision;
- every recommendation becomes a teaching action;
- PRIME has proven causal improvement in motivation;
- PRIME has proven causal improvement in retention;
- PRIME has proven causal improvement in proficiency;
- PRIME has proven institutional learning outcomes;
- PRIME has been validated at institutional scale;
- the current runtime proves a universally closed Engine cycle.

---

# 16. Professional narrative supported by the evidence

The evidence supports the professional story already established in the canonical narrative:

> **Minha trajetória começou na educação linguística, não na tecnologia. Na Cultura Inglesa, trabalhei como professor e stand-by teacher. Depois, criei e operei minha própria escola física, a Prime Language School.**

The deeper problem identified through that trajectory was not simply the absence of content or lesson records. It was the loss and fragmentation of useful learning signals between interactions.

The product response is therefore not merely record-keeping. It is an attempt to make relevant evidence persist, remain interpretable and inform future pedagogical decisions while preserving teacher authority.

The central thesis remains:

> **Personalization without memory is temporary.**

And:

> **The challenge is not only to personalize learning. It is to make personalization cumulative.**

The evidence currently supports this as the product thesis and supports several concrete pieces of the mechanism. It does not yet establish causal educational impact.

---

# 17. Current evidence maturity

### Strongly demonstrated

- teacher-first intelligence workspace;
- AI proposal / teacher validation boundary;
- AI proposal ≠ Teacher Decision;
- AI proposal ≠ Educational Action;
- canonical student directory and identity boundary;
- separation of identity, pipeline status and report state;
- provenance of source and processing attempts;
- explicit technical failure handling;
- source ≠ Evidence;
- Candidate ≠ validated Evidence ≠ Assessment;
- transcript ≠ Attendance;
- processing status ≠ pedagogical judgment;
- non-authoritative report publication can occur without assessment authority;
- Portfolio projection application can be operational without becoming learner assessment;
- failed processing does not automatically reach Portfolio;
- runtime refusal to fabricate unproven Learning State, Signal or Insight;
- audit trail for AI generation failure.

### Demonstrated in preview / pilot scope

- longitudinal projection with teacher-validated state/priorities;
- contextualized teaching action displayed in projection;
- pedagogical memory displayed across lessons;
- source capture and Candidate persistence in assisted Preview.

### Still requiring primary-artifact verification

- Gustavo Lessons 1–4 as evidence of cumulative personalization;
- broader real-student closed cycles;
- subsequent Candidate/review/state-update cycles.

### Not demonstrated

- universal complete Engine cycle;
- causal educational impact;
- institutional-scale validation;
- universal automated end-to-end operation.

---

# 18. Audit rule for future evidence

Any new claim should be entered using this structure:

**CLAIM**  
What exactly is being claimed?

**EVIDENCE**  
Which runtime surface, artifact, trace, document or primary record demonstrates it?

**SCOPE**  
Which learner, lesson, pilot, environment or runtime path does it cover?

**LIMITATION**  
What does the evidence not establish?

**STATUS**  
PROVADO / PROVADO NO PREVIEW / RELATADO-PENDENTE / NÃO DEMONSTRADO / KNOWN TECHNICAL ARTIFACT.

No claim should be promoted solely because the architecture permits it.

---

# 19. Preservation note

This file is intended to be the durable reference point for the accumulated proof discussed during the September 2026 audit work.

The Git history preserves the evolution of implementation. This document preserves the **current evidence interpretation** so that future agents do not have to reconstruct it from scattered conversations, screenshots or temporary runtime states.

When new evidence is verified, update this register rather than creating another disconnected proof list.

**Last consolidated:** 15 September 2026.