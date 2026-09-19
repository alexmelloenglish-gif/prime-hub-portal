# PRIME Learning Machine — execution handoff

Date: 19 September 2026. Audience: the implementing agent on PR #41 and the maintainers of PRs #39/#40.

## Start here: owner decision

Manual and automatic initiation must enter the same learning machine. The difference is how the source/run is initiated, not the pedagogical transformations, teacher decision, canonical authority or final output. Manual execution is a supported product operation. It is not inherently a bypass or a competing automation architecture.

The owner has asked engineering to stop expanding the architectural discussion without a new concrete trigger and to deliver the existing machine. Agent-to-agent continuation takes place in GitHub. Do not ask Alexandre to copy context or relay messages between agents.

This handoff restores an existing reference and assigns the next implementation work. It is not another audit programme or a claim that the runtime is complete.

## 1. The missing reference is now in GitHub

Read [PRIME Learning Machine v2.1 — source reference](../reference/PRIME_LEARNING_MACHINE_v2.1_SOURCE_REFERENCE.txt). It is the extracted text of the existing 23-page `PRIME_Learning_Machine_FINAL_v2.1_MERGED.pdf`, dated 18 September 2026. It was read in full for this handoff. Private pilot identity/date were redacted from this public copy.

The cover and repeated headers say v2.0. Sections 41–43 contain the strict v1.5 merge and final v2.1 override. Do not mistake that historical header inconsistency for a missing machine. Do not reconstruct the intermediate process by guessing backwards from a transcript and the final projected learner state. The reference already specifies those intermediates.

Read the source as historical specification, together with these later decisions:

- [PR #40](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/40): journey, contextual interpretation and versioned presentation contracts; a meaningful lesson does not require a state change.
- [PR #41](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/41): implementation of narrative synthesis, one component of that machine.
- [PR #39](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/39): operational governance/control-centre proposal. It and #40 must be connected as operational governance and pedagogical constitutional semantics, not developed as competing top-level systems.

Where historical language conflicts with the owner's later decisions, apply the scoped decisions in this handoff and #40. Preserve the source reference so the change is explicit.

## 2. One process, inspectable intermediates

| Stage | Required work and output | Authority |
|---|---|---|
| 01 | Ingest the untouched source; resolve lesson/learner identity and explicit metadata; record unknowns and source quality | Candidate context |
| 02 | Call Report: retain the observable instructional event, activities, learner language, teacher interventions and source limitations | Internal event record; not the final Class Report |
| 03 | Atomic Evidence Bank: immutable E-IDs with source locations, observations and limits | Candidate evidence |
| 04 | Signals linked to those evidence IDs; recurrence only when history supports it | Proposed |
| 05 | Pedagogical insights: bounded interpretations, distinct from observation | Proposed |
| 06 | Concrete teaching actions linked to evidence | Proposed |
| 07 | Candidate learner-state decision, including no justified update; this does not erase learning events | Proposed |
| 08 | Candidate Portfolio memory: lesson archive plus curated cumulative updates and explicit exclusions | Proposed |
| 09–10 | Candidate Dashboard and exact student/family wording, including the contextual learning narrative | Proposed and reviewable |
| 11 | One self-contained Teacher Validation Package: evidence, interpretation, intended persistence, exclusions, next actions and exact proposed learner output | Awaiting teacher decision |
| 12 | Teacher approves the exact package, edits it, returns it or rejects it; retain decision identity, scope and exact payload binding | Human authority transition |
| 13–14 | Validate eligibility and atomically canonicalize the approved payload into a versioned CLR, with idempotency and provenance | Canonical persistence |
| 15 | Independent read-back and field/hash comparison: G3 | Verified or failed |
| 16–17 | Portfolio G4 and Learning Intelligence G5 independently consume the verified CLR; verify their outputs | Independent projections, not G4-as-input-to-G5 |
| 18–19 | Resolve the authenticated account's explicit learner relation, verify same-learner lineage and render the authorized consumer/Dashboard: G6 | Authorized delivery |
| 20 | Next Lesson Brief derived from the reviewed learning record | Teacher-facing continuation |
| 21 | Run/audit manifest with the actual artifacts, decisions, exclusions and publication outcomes | Execution record; not a substitute for delivery |

The next real learner attempt begins the next cycle. The historical manual's high-level flow lists that loop as step 21, while its artifact package and master prompt use artifact 21 for the audit manifest; use the artifact list above for implementation and keep the learning loop explicit.

All intermediates must be inspectable by the teacher/operator. A final prose answer plus a projected state is not a substitute for the missing evidence/signal/insight/action package.

## 3. Manual, automatic and reference are different axes

| Dimension | Meaning |
|---|---|
| Manual initiation | An authenticated/authorized operator supplies or selects the source and starts/resumes the shared run. |
| Automatic initiation | A source event or scheduler supplies the equivalent input to the same shared run. |
| Manual execution of stages | An operator can execute the documented transformations and retain the same artifacts/decisions; the semantics do not change. |
| Reference execution | Local/simulated persistence or verification is explicitly recorded as reference evidence. |
| Persisted runtime execution | The real authority, canonicalization, verification and consumer services execute against their actual stores. This can be initiated manually. |

Do not equate manual initiation with simulation. Do not equate automatic initiation with authority. An operator-started persisted run can be a real production run; a local reference hash cannot prove production persistence.

The input adapter may record trigger provenance, but trigger mode must not alter pedagogical rules, approved payload meaning or create duplicate lesson/evidence/canonical records. A manual retry and an automatic retry for the same source/version/scope must converge through the same idempotency policy.

A scheduler, webhook or polished teacher UI is not a prerequisite for building and exercising the manually initiated path. A CLI/admin command can be the first operator surface. Approval applies to the reviewed package; it is not a demand for a click on every source observation.

## 4. Current implementation anchors — bounded code read, not a new audit

Snapshot inspected: main `630fdf0e255554c40d602abfd1cbd796d11a9745`; PR #40 head `24918fbb190bf708a5fd9c357e02bd97eaea3753`; PR #41 head `ad15cd43677a2ce84a80b37abcb0802bda2aff0c`; PR #39 head `5011a848604cea964ada0a2e81fae4bd2babe68b`. Branch heads may advance; read the PR conversation and diff before writing.

| Existing anchor | How to use it |
|---|---|
| `lib/pipeline/contracts.ts`, `lib/pipeline/prompts.ts`, `lib/pipeline/run.ts` | Existing source/stage contracts and execution code to map against the manual. Do not presume the frozen legacy orchestration is the completed unified runner. |
| `lib/canonical-authority-review.ts` | Existing teacher-package-to-authority-draft/validation-task adapter. Reuse its authority purpose; do not infer the whole candidate machine from its final package input. |
| `lib/canonical-learning-record-contract.ts` | Current canonical payload contract; preserve scoped evidence, signals, insight, boundaries and optional state-change fields. |
| `lib/canonicalization.ts` — `canonicalizeLearningRecord` | Existing atomic G2 service. Reuse the persisted, identity-bound approval and exact payload requirements. |
| `lib/canonical-readback-verification.ts` — `verifyCanonicalLearningRecordReadBack` | Existing G3 verification service. |
| `lib/canonical-portfolio-projection.ts` — `projectCanonicalPortfolio` | Existing independent G4 service. |
| `lib/canonical-learning-intelligence-projection.ts` — `projectCanonicalLearningIntelligence` | Existing independent G5 service. |
| PRs #35/#36/#37 | Existing access provisioning, G6 consumer and runtime-proof workstreams. Read their current evidence; do not reconstruct or duplicate them here. |
| PR #41: `lib/narrative/contracts.ts`, `engine.ts`, `prompts.ts`, `runNarrativeSynthesis` | Narrative module, not the complete source-to-authority machine. Reuse and integrate it at its declared authority boundary. |

The inspected `lib/pipeline-freeze.ts` explicitly freezes **legacy transcript automation**. `app/api/admin/process-drive/route.ts` currently returns 503, including after the freeze branch. This is a concrete unavailable legacy route, not a constitutional prohibition on manual operation. Removing a flag alone does not implement a working manual runner. Build/wire the shared governed entry point instead of using the freeze as a reason to defer the product.

This handoff changes no freeze flag, production data, relation or deployment.

## 5. The specific gap for PR #41

At the inspected head, `prepareNarrativeInput` accepts only evidence marked `teacher_validated` or `canonical`; `runNarrativeSynthesis` emits a non-authoritative draft requiring teacher review. That is a valid narrative component with a restricted input boundary. It is not stages 01–11 of the whole machine and does not reconstruct them.

The manual requires the exact proposed learner-facing consequence inside the consolidated review package. The implementation therefore needs an explicit candidate-preview integration as well as authorized projection handling:

1. Produce source-grounded candidate artifacts and the proposed narrative before the consolidated review.
2. If the existing narrative module is reused for candidate input, introduce an explicit candidate-aware interface and preserve proposal authority. **Never relabel unapproved evidence as teacher-validated just to pass its filter.**
3. Present the complete package once for teacher review, including its exact wording and proposed state/memory/actions. A revision after teacher edits belongs to that review.
4. Canonicalize/project the reviewed content. Do not silently run new interpretive generation after approval and publish a different meaning under the old decision. A material change needs a new scoped review/version, not a second approval for unchanged content.

If a rendering-only step runs after authority, it must preserve the approved claims and their boundaries. Evidence-ID existence checks assist traceability; they do not by themselves establish that prose is supported or that identity/authorization is correct.

## 6. Apply the already-decided pedagogical changes

- Learning movement, event, pattern and state decision are distinct; retained state is not stagnation.
- Interpret opportunity, purpose, task demands and support before comparing performance.
- Preserve participation in a content task through English, personal language use and subject understanding as different claims.
- Record the attempt/cue/adjustment sequence when evidenced; do not force a new success or a deficit verdict for each lesson.
- The manual's evidence-strength rubric is not a score of learner ability or an automatic state-transition formula. Budget ranges must never force padded evidence or invented insights.
- Keep all confirmed lessons in the archive; curate cumulative memory without erasing the journey.
- #40 already records the presentation direction. Do not reopen those principles to delay the shared runner.

## 7. Next delivery — implement, then demonstrate

**Primary implementation thread: PR #41.** Use that conversation for handoffs, questions with concrete blockers and completion evidence.

Deliver one manually initiated end-to-end run through the shared machine, using an authorized source and supplied history where available. First make artifacts 01–11 reproducible and inspectable; then resume from the persisted teacher decision through the existing canonical services. Absence of prior history does not prevent candidate processing: keep longitudinal claims unknown instead of inventing a baseline.

Minimum acceptance evidence:

- an actual invocation and a run manifest locating every intermediate artifact;
- the self-contained package and exact teacher-approved/edited payload;
- the matching canonical/projection identities and read-back results for stages actually executed;
- the delivered learner artifact or the precise unfinished stage, with one concrete recovery action;
- replay evidence that the same authorized command does not duplicate records;
- the same normalized command usable by the later automatic adapter.

Keep real learner data and artifacts in their authorized private store. Public GitHub holds the procedure, code, synthetic fixtures and safe completion references, not private transcripts.

A blocked downstream dependency does not erase completed upstream work or justify restarting the architecture. Continue every stage that is authorized and executable; report the specific dependency for the remaining stage. Do not claim simulated/database/UI outcomes that were not executed.

## 8. GitHub coordination rule

Before each continuation, read the latest PR #41 comments and head. Report: commit, work completed, remaining concrete task, verification result and exact next starting point. Link the implementing fix to the existing finding. Do not create another general audit to restate a known gap.

Use #40 for changes to the pedagogical contracts, #39 for operational governance integration, and #41 for this execution workstream. Do not overwrite another agent's newer commit; append or rebase with the reviewed current head. A GitHub handoff can be reported as posted; acknowledgement by the other agent can only be reported once their response exists.
