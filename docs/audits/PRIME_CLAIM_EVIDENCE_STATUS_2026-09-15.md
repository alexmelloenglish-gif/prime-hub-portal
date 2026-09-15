# PRIME — Claim Evidence Status

**Audit date:** 2026-09-15  
**Status:** DATED AUDIT RECORD — evidence scope, not product-wide certification  
**Repository baseline:** `bdd76e2d387259f3fc5f33858d8f8549a92f2b01`  
**Scope:** cumulative personalization, longitudinal memory, Pilot V Preview witness, Pilot R supplied dashboard evidence, authority chain and impact claims.

**Start here:** [Current evidence summary](../PRIME_EVIDENCE_STATUS.md).

## 1. Conclusion and interpretation

The Pilot G follow-up audit inspected the canonical portfolio, the four source lesson documents and repository snapshots before and after Lesson 4. These artifacts demonstrate **documented cumulative personalization in this controlled pilot**: earlier evidence is retained, informs the current learning representation, and is explicitly connected to subsequent priorities and a planned next action. This is an artifact-level finding about the teacher-mediated pilot, not proof of a complete Engine authority chain or causal impact.

For Pilot V, inspected deployment logs confirm real-source capture and a persisted assisted Candidate in Preview. The successful witness uses a predefined artifact in code; it does not demonstrate Gemini generation. No subsequent teacher review, decision, canonicalization, projection authorization, learner-facing publication or second learning cycle was established by the examined evidence.

Absence of demonstration in this audit is not proof that the capability is absent from the product. Conversely, a narrative report is not a substitute for its supporting artifacts. This record does not demote independently established findings or reopen frozen historical traces.

## 2. Repository and deployment anchors

At the audit cutoff:

| Reference | Observed state |
| --- | --- |
| main | `bdd76e2d387259f3fc5f33858d8f8549a92f2b01` |
| [PR #18](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/18) | Open, unmerged; head `c16ba2407d80f6f63b15abcb1222096a3d14712f`; base main |
| [PR #19](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/19) | Open, unmerged; head `d08ee8cccad3e23188c1bbb50c9cd096feb83e2c`; base codex/candidate-review-firewall |
| Preview deployment | `dpl_2fpKZLtCt8i8ZscoqcYWmpMsUbA5`, READY, associated with PR #19 head |

The PR #19 branch diverged from main at `511bc27a4b187b685d906519f4ce2c32c9b8740d` (39 commits ahead, 28 behind). The new authority/capture implementation had not reached main. Preview execution does not imply a main merge or a Production rollout.

Sources: [main baseline](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/bdd76e2d387259f3fc5f33858d8f8549a92f2b01), [direct witness introduction](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/ec9c33d6e781d2cb837df92386b7b0888824896a), [successful witness head](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/d08ee8cccad3e23188c1bbb50c9cd096feb83e2c), [deployment and build logs](https://vercel.com/prime-digital-hun-dasboard/prime-hub-portal/2fpKZLtCt8i8ZscoqcYWmpMsUbA5). Deployment logs may require authorized Vercel access.

## 3. Observed execution — 2026-09-12, 15:19:24 UTC

Two different witness results appeared in the inspected build logs:

- Normal capture witness: `BUILD_WITNESS_ERROR (marker abbreviated) Source identity is not uniquely resolved (0 registry matches)`.
- Assisted direct witness: `DIRECT_WITNESS_RESULT (marker abbreviated)`, authority `candidate`, `requiresReview=true`, status `review_required`, lesson identity `operator_supplied_unproven`, automatic publication disabled, generator `chatgpt_assisted_preview_witness`, Gemini status `blocked_missing_preview_credential`.

The [direct witness source](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/d08ee8cccad3e23188c1bbb50c9cd096feb83e2c) reads the real Drive source, hashes it and passes a predefined artifact to Candidate persistence. It runs during Preview static page generation. Its successful log follows the persistence service return; the service can create or reuse an existing Candidate, so that log does not distinguish a new insertion from idempotent retrieval.

The source preserves unreliable speaker attribution and unproven lesson identity. No proficiency conclusion follows from this witness.

The historical PR #19 description still referred to an earlier WIF access failure and an older head. The later successful direct witness advances that narrow capture/persistence finding; it does not establish the downstream authority chain.

This audit read code, repository metadata and existing deployment logs. It did not query the current database, trigger capture, execute a learner flow or reproduce the witness. Thus, use “recorded as review_required in the audited execution,” not “still pending review today.”

## 4. Stage-by-stage evidence matrix

| Stage | Pilot V finding |
| --- | --- |
| Capture | Real-source read demonstrated by assisted Preview witness |
| Candidate | Persistence demonstrated for assisted predefined artifact; Gemini generation not demonstrated |
| Teacher review | Not demonstrated for this Candidate |
| Teacher decision | Service implemented on branch; no linked executed decision established |
| Canonicalization | Service implemented on branch; no linked executed canonicalization established |
| Projection authorization | Service implemented on branch; no linked authorization established |
| Learner-facing projection/dashboard | Not demonstrated; new authority service intentionally lacks a learner-facing writer |
| Authorized next action | Not demonstrated from this Candidate |
| Learner action/attempt | No linked learner attempt established |
| New evidence/Candidate | No second Candidate derived from a subsequent learner attempt established |
| Second teacher review | Not demonstrated |

The [authority service](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/d08ee8cccad3e23188c1bbb50c9cd096feb83e2c/lib/intelligence/authority-service.ts) separates transitions and ends projection authorization at `authorized_not_projected`.

The [registry at the audited main](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/bdd76e2d387259f3fc5f33858d8f8549a92f2b01) records Pilot V as prospect with null activation authority. Profile existence or an active profile flag is not learner activation authority.

## 5. Tests and existing checkpoints

The inspected build passed capture/authority self-tests, Teacher Intelligence and dashboard checks, eligibility checks, canonical validation and compilation. The [authority test](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/d08ee8cccad3e23188c1bbb50c9cd096feb83e2c/scripts/intelligence-authority-firewall-self-test.mjs) and [capture test](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/d08ee8cccad3e23188c1bbb50c9cd096feb83e2c/scripts/meet-gemini-capture-self-test.mjs) primarily inspect source patterns. They are not executed full-cycle tests with human decisions and learner-facing publication. Witness errors are caught, so READY alone is not witness success.

The existing pipeline-attempts test concerns processing retries, not learner attempts.

The [migration checkpoint](../PRIME_CANONICAL_MIGRATION_ARCHITECTURE_CHECKPOINT_2026-09-11.md) retains Gate E as open. The [Product Thesis](../product/PRIME-LEARNING-OS-PRODUCT-THESIS.md), introduced by `de72c022cad39d4b60f1083b2e509972af8a24c1` at 15:45 UTC on September 12, was recorded after the 15:19 witness and explicitly distinguishes Pilot V capture/Candidate from the complete closed loop.

The [Runtime Verification Register](../PRIME_RUNTIME_VERIFICATION_REGISTER.md) separately preserves Pilot G GL-002 as a historical rejected E2E trace. Do not conflate that historical processing run with the reported Lessons 1–4 longitudinal portfolio case. Neither substitutes for auditing the other's artifacts.

## 6. Claim status

| Claim | Status within this audit |
| --- | --- |
| Pilot G cumulative personalization and longitudinal memory | Demonstrated at the documented, teacher-mediated pilot level; primary artifacts and before/after repository states inspected |
| Qualitative engagement and specific skill changes | Participation and supported responses documented; magnitude of improvement and causal attribution not established |
| Pilot V real-source capture and assisted Candidate persistence | Demonstrated in controlled Preview execution |
| Pilot V full pipeline through learner-facing publication | Not demonstrated |
| Pilot V subsequent attempt → new Candidate → second review | Not demonstrated |
| Pilot R longitudinal state → priority → activity | Supported by user-supplied dashboard text; not independently browser-verified |
| Pilot R displayed locked-sentence entries | Present in supplied text; authorship, durability and downstream review unverified |
| General or universal cumulative personalization capability | Not established by these audited cases |
| Complete Engine E2E operation | Not demonstrated by the examined evidence |
| Causal improvement in motivation, retention or proficiency | Not demonstrated by the material presented |
| Institutional outcomes attributable to PRIME | Not demonstrated by the material presented |

## 7. Evidence needed to advance claims

### Pilot G — follow-up primary-artifact verification

The initial synthesis-only classification is superseded by this follow-up inspection on 2026-09-15.

**Primary source register:** Private documents were inspected through the connected Drive on 2026-09-15. Direct links, document IDs, personal contacts and transcript content are omitted from this public record. Case labels are anonymized; existing public code/commit references provide repository traceability.

Four lesson-source documents and a canonical portfolio were inspected privately. They establish interest reuse, supported language practice, a previous-session recap and supported retrieval. Source identifiers, dates, timestamps and transcript excerpts are not reproduced in this public summary.

The lesson documents contain machine-generated transcripts and, for several lessons, generated notes. They are primary records of the interaction available to this audit, not verified verbatim audio. Transcription noise limits interpretation of isolated utterances. The audit did not listen to recordings.

**Versioned evidence chain:**

- [Lesson 3 update, 8d75cf9](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/8d75cf9e437da42ad63ca078c25e5b8ff8c94368) preserves three reports and cumulative priorities. Its level fields were subsequently corrected; do not interpret those corrections as learner regression.
- [Corrected pre-Lesson-4 snapshot, 7b7cd1c](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/7b7cd1c161e5946ef07c68d851b66ac7490004e6) sets the next action to prepare for the September 8 school-content lesson.
- [Lesson 4 update, 79dfb7a](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/79dfb7a5cb8329ae4e10bc50ade2e59ab6a95121) preserves prior reports, adds report 4, creates priority-retrieval (retrieval with decreasing support) and changes the next action to post-science-test-follow-up. The new action explicitly compares later independent recall with supported Lesson 4 performance. The corrected level remains unchanged across these two snapshots.
- [Audited main profile](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/bdd76e2d387259f3fc5f33858d8f8549a92f2b01) retains this four-lesson state. [Student data code](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/bdd76e2d387259f3fc5f33858d8f8549a92f2b01/lib/student-data.ts) imports the profile and supports its authorized repository snapshot.

**What is demonstrated:** preserved cross-session memory, repeated use of learner-relevant context, explicit cumulative state/priorities and a next action derived from the documented evidence. This goes beyond an unverified summary.

**Limits:** the next post-test action is recorded, not proven completed. No test result, second review or independent mastery follows from its existence. The portfolio attributes teacher responsibility and the repository marks relevant fields teacher-validated. These are documentary authority indications, not a separately authenticated review-transition trace. The audit did not observe the current authenticated learner dashboard or establish that the teacher consulted this specific portfolio during the later lesson. Repeated interests alone do not prove software-caused personalization. The combined artifact chain supports the narrow documented-pilot claim, not a software causal claim or full Engine certification.

The historical GL-002 failure remains unchanged. It concerns a processing run, while the current finding concerns the preserved and subsequently updated pedagogical artifacts.

### Pilot V: two separate milestones

1. **Pipeline through publication:** Source → Candidate → Teacher Review → Teacher Decision → Canonicalization → Projection Authorization → Learner-facing Projection.
2. **Subsequent learning loop:** Authorized Next Action → Learner Attempt → New Candidate → Second Teacher Review.

Each transition needs linked artifacts, environment/commit, timestamps and responsible authority. A rejection demonstrates a decision, but does not prove the positive path through canonicalization and publication. Approval or a validated edit is required for that path. Idempotency and audit lineage should be verified where relevant.

Manual or assisted operation can be end-to-end. The missing proof is the chain of transitions, not automation by itself. A predefined Candidate also cannot establish successful model generation.

Impact claims additionally require suitable outcome measures, baseline/time window and a comparison or other defensible attribution design. Context continuity alone establishes no causal educational effect.

## 7A. Pilot R — longitudinal dashboard and action-memory evidence

**Added:** 2026-09-15. **Evidence type:** user-supplied text copied from the displayed dashboard. Browser inspection failed; this is not an independently observed browser session or a database persistence audit. Personal identifiers, contact details and submitted sentences are omitted.

### What this case adds

| Link | Evidence in the supplied dashboard text | Supported finding |
| --- | --- | --- |
| History → current state | Reports across multiple months inform the current fluency/precision interpretation | Longitudinal learning context is presented as current state |
| Evidence → priority | Specific earlier reports are cited for tense selection, sentence framing and vocabulary reuse | Priorities have explicit historical grounding |
| Priority → action | Repeated vocabulary-recycling recommendations become a five-item personal-sentence activity | A concrete practice action is connected to the documented priority |
| Action → displayed memory | The activity displays entries under “Your locked sentences” | Supplied interface text shows populated action-memory entries; durability and authorship remain unverified |
| Missing evidence → explicit limit | Attendance without a detailed report does not generate a new learning-development claim | The projection preserves a visible evidence gap |

**Contribution:** Pilot R adds interface-level evidence of longitudinal personalization connected to an actionable practice surface and displayed memory entries. It is not merely a generic dashboard layout. It complements Pilot G's primary-artifact chain and Pilot V's Preview capture witness; it does not inherit either case's verification level.

**Authorship limit:** The supplied text explicitly identifies an administrator preview. Entries may have been created during administrative testing. No learner-authored attempt, authenticated submitting actor, submission timestamp or current database state was independently established.

**Reporting limit:** The text presents eleven attended lessons and ten detailed reports, with the missing report explicitly acknowledged. Use “all available published reports preserved, with explicit gaps,” not “a complete report for every attended lesson.”

**Still not demonstrated:** a displayed entry becoming a new Candidate, a subsequent teacher review, a linked decision updating learning state, or later learner action. The projection's teacher-validation labels are documentary indications, not an independently verified authority-transition trace.

### Evidence required to close the subsequent loop

Record a linked chain: prior evidence → teacher-authorized activity → actual learner submission (actor/date/activity ID) → new Candidate → teacher review and decision → maintained or revised state/next action. A justified decision to retain the current focus also counts as a decision; a visible sentence alone does not.

### Safe claim for this case

The supplied Pilot R dashboard text presents longitudinal evidence linked to current priorities, a concrete practice activity and displayed personal-memory entries. Learner authorship, durable persistence and subsequent teacher review have not been independently verified.

## 8. Safe professional wording

### Português

No piloto G auditado, o PRIME demonstra personalização cumulativa documentada: evidências de quatro aulas permanecem preservadas, informam o estado atual e orientam prioridades e uma próxima ação pedagógica registrada. A demonstração se refere a um caso controlado, mediado pelo professor; não comprova execução do ciclo fechado completo pelo Engine nem impacto causal educacional. No caso Pilot V, a evidência verificada permanece limitada à captura de fonte real e persistência de Candidate assistido em Preview, registrado como review_required em 12/09/2026, sem transições posteriores demonstradas nesta auditoria.

### English

In the audited Pilot G case, PRIME demonstrates documented cumulative personalization: evidence from four lessons is preserved, informs current learning state and guides priorities and a recorded next pedagogical action. This is a controlled, teacher-mediated case; it does not establish the Engine's complete closed-loop execution or causal educational impact. For Pilot V, verified evidence remains limited to real-source capture and assisted Candidate persistence in Preview, recorded as review_required on September 12, 2026, with no subsequent transitions demonstrated in this audit.

## 9. Change boundary

This is an evidence-status update, not a new product thesis. It preserves the architecture and historical checkpoints. It does not close Gate E, authorize retries, activate learners, change pedagogical data or authorize autonomous publication. Future upgrades should append dated primary evidence and identify exactly which claim and transition changed.
