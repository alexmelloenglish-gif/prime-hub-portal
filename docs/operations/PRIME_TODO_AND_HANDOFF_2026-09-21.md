# PRIME — Canonical TODO & Handoff
**Checkpoint:** 2026-09-21  
**Status:** ACTIVE OPERATIONAL BACKLOG  
**Purpose:** one place to see what is closed, what remains open, and what requires human/runtime validation.

## How to use this file

- `[x]` = closed at the stated proof boundary. Do not reopen without contradictory evidence.
- `[ ]` = genuinely open.
- `[~]` = implementation/specification exists, but runtime or human validation is still required.
- Do not infer that an open downstream proof invalidates a closed upstream implementation.
- Before promoting any item to DONE / PROVEN / DEPLOYED / VALIDATED / RESOLVED / COMPLETE, use `docs/governance/SOURCE_BOUND_PROOF_CHECKLIST_v1.md`.

---

# A. Closed in the 15–21 Sep closeout

- [x] **Current production re-verified after governance closeout**
  - main: `6b1f85f2974eadf5131cb0c402bd699c2bb90c80`
  - production deployment: `dpl_GLZ7tL77bZY1d8Sg4w9LgtAsgZvp`
  - Vercel state: `READY`
  - target: `production`
  - public domain: `https://www.primedigitalhub.com.br`
  - public landing still renders the approved Phase 1 hero and continuity thesis.

- [x] **System governance control layer adopted on current main**
  - PR #45 merged.
  - `PRIME_GOVERNANCE_CONTROL_CENTER_v1.md`
  - `PRIME_MASTER_GOVERNANCE_AUDITOR_PROMPT_v1.md`
  - `PRIME_SYSTEM_GOVERNANCE_CANON_v1.md`

- [x] **Source-bound proof discipline canonicalized**
  - `docs/governance/SOURCE_BOUND_PROOF_CHECKLIST_v1.md`
  - Issues #23 and #26 closed.

- [x] **Anti-rework guardrail refreshed**
  - old August Gemini/Billing checkpoint preserved as history, no longer treated as the present global blocker.
  - current return point is 2026-09-21.

- [x] **Canonical current-state override appended**
  - current production, open runtime gaps, and current reading order are now explicit.

- [x] **Pedagogical Processing Freeze amended**
  - State change is not a lesson objective.
  - retained state is normal.
  - CEFR cannot be changed from ordinary lesson accumulation.
  - CEFR transition requires formal assessment/testing + pedagogical authorization + explicit profile update.
  - self-correction is a broad learner-repair construct family.
  - state evidence accumulates longitudinally; no same-lesson quota.
  - ObservationDebt lifecycle is normatively specified.

- [x] **Reconnection landing Phase 1 closed**
  - G1 Preview stability: PASS.
  - G2 independent QA: PASS CONDITIONED / non-blocking P2 only.
  - G3 reconciliation: PASS.
  - G4 owner acceptance + production lineage: PASS.
  - Phase 1 is no longer an open landing-page workstream.

- [x] **Reconnection Network operating charter adopted**
  - `docs/strategy/RECONNECTION-NETWORK-OPERATING-CHARTER.md`

- [x] **Reconnection Phase 2 professional story closed**
  - canonical 30-second version frozen;
  - canonical 2-minute version frozen;
  - full narrative chapter map frozen;
  - next phase is LinkedIn Reconstruction.
  - source: `docs/reconnection/PHASE_2_CANONICAL_STORY_DEPTHS.md`

- [x] **PR #39 closed as superseded**
  - its useful governance layer was adopted through PR #45 on current main.

- [x] **PR #20 closed as historical / not current proof register**
  - it was not merged.
  - stronger Diego/Eduarda projection proof remains bound to PR #21/current-main evidence.

- [x] **Claim-governance incident cleanup closed**
  - Issues #22–#27 reconciled and closed.
  - historical incident remains preserved; prevention controls are now canonical.

- [x] **Gustavo five-lesson reference replay remains a completed checkpoint**
  - do not restart the five-lesson reasoning exercise merely because a new agent lacks chat context.

- [x] **Legacy repository-side automation remains contained**
  - do not revive the old ingestion/publishing path as a shortcut.

---

# B. P0 — Learning Machine work still genuinely open

- [ ] **Implement the complete shared PRIME Learning Machine runner**
  - one machine after initiation normalization;
  - manual trigger and automatic trigger converge on the same normalized run command;
  - same processing stages and authority gates;
  - same canonicalization / verification / projection path;
  - idempotent equivalent replays.

  Required proof to close:
  ```text
  manual trigger ─┐
                  ├→ same normalized run identity
  auto trigger ───┘
                  ↓
  full machine stages
                  ↓
  explicit Teacher Authority
                  ↓
  canonicalization / verification / projections
                  ↓
  final manifest
  ```

- [ ] **Materialize durable run history / exact resume point**
  - run identity;
  - source/version/scope;
  - machine/prompt/contract versions;
  - artifacts/intermediates and hashes;
  - exact Teacher Validation Package;
  - raw teacher decision + normalized decision;
  - approved payload/hash;
  - G2/G3/G4/G5/G6 outcomes where executed;
  - delivery outcome;
  - exact unfinished stage;
  - retry/idempotency result.

- [ ] **Implement ObservationDebt reconciliation in code + self-test**
  - normative contract is now frozen;
  - implementation is not yet proven.
  - required stage:
    ```text
    Evidence Bank
    → ObservationDebt Reconciliation
    → Signals / Longitudinal Cross-check
    ```
  - old debt must close/refine when its required opportunity occurs.
  - stale debt carried silently must equal zero.

- [ ] **Create regression tests for CEFR authority**
  - ordinary lesson/replay cannot mutate current or target CEFR;
  - only formal assessment authority may propose an authorized CEFR profile transition.

- [ ] **Create regression tests for broad self-correction semantics**
  - multiple learner-initiated repair types may contribute to the construct;
  - do not collapse all evidence into one tense-specific label;
  - do not require all manifestations in one lesson.

---

# C. P0/P1 — Active vNext workstream being handled by another agent

- [~] **PR #42 — Unified Lesson & Portfolio vNext + Awareness Layer**
  - ACTIVE — do not duplicate/restart while another agent is reprocessing source files.
  - this TODO is coordination only; do not modify that branch from this closeout workstream.
  - latest observed Preview failures belong to that branch and do not mean main production is down.

  Required before closure:
  - same-head Preview READY;
  - source-replay/teacher-review package complete at the intended scope;
  - no learner-facing internal validation language leakage;
  - explicit authority transition;
  - merge/release decision;
  - post-merge production verification if released.

---

# D. P1 — Runtime authority proofs

- [~] **Young Learner account access / G6 runtime witness**
  - production identity provisioning is now **COMPLETE** for:
    - Gustavo `gugasalgado7@gmail.com` → `LEARNER_SELF` → `stu_4c4da6c04ac4`;
    - Carol `carolvdrummond@gmail.com` → `AUTHORIZED_ACCESS` → same Gustavo studentId;
    - Michelle `midias83@hotmail.com` → `AUTHORIZED_ACCESS` → Eduarda `stu_e8661006824a`.
  - all three ACTIVE relations were read back with owner authorization hashes and AUTHORIZED lifecycle events.
  - PR #47 merged the Young Learner access contract / identity correction.
  - PR #48 merged a bounded legacy compatibility bridge so Gustavo's newly authorized self email can reach his existing Dashboard before the canonical G6 consumer cutover.
  - production deployment for PR #48: `dpl_BwreUJy4ALgKiVGBkVBdiSf2qtNt` — READY — main `295af31a43c1e7dc1396ef002ab64aa365855954`.
  - **remaining proof:** real Google/NextAuth sign-in by Gustavo, Carol and Michelle + authenticated Dashboard witness; this cannot be manufactured by an admin/agent.
  - PR #36 canonical consumer cutover remains separate.

  Required proof:
  ```text
  Gustavo account ─┐
                   ├→ authorized AccountLearnerRelation
  Carol account ───┘
                   ↓
  same studentId
                   ↓
  same verified canonical consumer state
                   ↓
  authenticated Dashboard runtime witness
  ```

- [~] **Authoritative attendance full production trace**
  - direct 2026-09-21 database read-back found `attendance_records = 0`; there is no production witness to promote.
  - implementation exists:
    - AttendanceRecord persistence;
    - Meet participant collector;
    - identity reconciliation;
    - AttendanceReconciled events;
    - unresolved Validation path.
  - complete real production witness still required.

  Required proof:
  ```text
  lesson
  → scheduled identity
  → Meet conference
  → signed-in participant identity
  → AttendanceRecord(authoritative)
  → attendance PROVEN
  → downstream consumer reads it
  → audit trail preserved
  ```

- [x] **PR #37 temporary Preview preflight instrumentation retired**
  - direct Neon access now provides the required read-only pre-provisioning state;
  - PR #37 closed without merge.

- [ ] **External legacy Google/Studio trigger verification — only if still operationally relevant**
  - repository-side old pipeline is contained;
  - external provider trigger deletion/disablement was not independently proven.
  - do not spend time on this unless calls are still arriving or the external trigger itself matters for final decommission proof.

---

# E. P1 — Prompt / extraction / candidate-lane reconciliation

- [ ] **PR #18 / #19 — reconcile the stacked NEW INTELLIGENCE lane with the current shared-runner/CLR architecture**
  - both drafts remain open;
  - exact CandidateRecord / ReviewTransition / Canonicalization / AuthorizedProjection entities are not present verbatim in current main;
  - PR #19 also contains useful source-capture, provenance, idempotency and diarization/identity-uncertainty protections;
  - do not merge the stacked branches directly;
  - map each invariant to current CLR/G1–G6/shared-runner contracts;
  - port only genuinely missing behavior;
  - then close both stale drafts with exact superseding commits.

- [ ] **PR #30 — reconcile unique non-lossy extraction work; do not blindly merge or close**
  - PR #30 is stale against current architecture, but it contains useful prompt/schema changes not found verbatim in current main:
    - learner production candidates;
    - successful production;
    - errors/instability;
    - support/scaffolding;
    - uptake;
    - structured correction candidates;
    - boundaries;
    - next verification;
    - “NO SILENT EMPTY PEDAGOGICAL OUTPUT”;
    - non-lossy Class Report behavior.
  - decide what current vNext/runner already covers;
  - port only missing semantics/fields to the current architecture;
  - add regression coverage;
  - then close PR #30 as superseded/reconciled.

---

# F. Reconnection Network — genuine next work

- [x] Phase 1 — public landing page.
- [x] Phase 2 — Professional Story Architecture + 30 sec / 2 min / full narrative.

- [~] **Phase 3 — LinkedIn Reconstruction**
  - content package prepared in `docs/reconnection/PHASE_3_LINKEDIN_RECONSTRUCTION_DRAFT.md`.
  - READY:
    - headline draft;
    - About draft;
    - Experience framing;
    - PRIME/product description;
    - Featured strategy;
    - first public post draft;
    - reconnect message patterns.
  - REQUIRED BEFORE PUBLICATION:
    - exact Cultura / Prime Language School employment titles and dates;
    - owner approval of headline/About/public founder wording;
    - approval of public Featured assets.
  - LinkedIn publication has **not** been executed.

- [~] **Phase 4 — Reconnection map**
  - initial map prepared in `docs/reconnection/PHASE_4_CONTACT_MAP_v1.md`.
  - first-wave / second-wave logic and per-contact record schema are defined.
  - REQUIRED BEFORE OUTREACH:
    - verify current roles for first-wave contacts;
    - verify preferred contact channels;
    - write individualized messages from the verified context.
  - no mass outreach.

- [ ] **Phase 5 — individualized first-contact messages**
  - reconnect through shared history first;
  - no immediate pitch;
  - reveal PRIME only when proportionate to the relationship.

- [ ] **Phase 6 — response / alignment log**
  - record reciprocity, curiosity, reliability, strategic overlap and follow-through;
  - no automatic promotion from nostalgia/enthusiasm to collaboration.

- [ ] **Phase 7 — bounded collaboration pilots where warranted**
  - explicit scope, deliverable, authority, deadline/review point and exit condition.

---

# G. Cleanup that no longer blocks the product

- [ ] **After PR #30 reconciliation, close its stale branch/PR with exact superseding evidence.**

- [x] **Issue #44 superseded by this canonical TODO**
  - close the issue after linking this file; it must not remain a competing backlog.

- [ ] **Periodically verify this TODO against current main**
  - if a different agent closes an item, update this file instead of opening a parallel handoff.

---

# H. Items that require validation/authority before they can be ticked

These are not failures. They are the points where this workstream must stop instead of manufacturing proof.

| Item | What is missing |
|---|---|
| PR #42 closure | active other-agent processing + Preview/runtime/authority proof |
| G6 | controlled provisioning, authenticated dual-account runtime witness, cutover authorization |
| Attendance | real authoritative Meet → AttendanceRecord → downstream production trace |
| Shared runner | implementation + deterministic/idempotent execution proof |
| ObservationDebt | code/materialization + regression self-test |
| PR #18 / #19 | map stacked candidate/capture lane to current CLR/shared-runner architecture |
| PR #30 | semantic reconciliation against current machine; safe port decision |
| LinkedIn | exact employment metadata + owner review before public profile publication |
| Reconnection map | current-role/contact-channel verification before individualized outreach |
| External legacy trigger | provider-side trigger evidence, only if decommission proof is required |

---

# I. Current next-action order

1. **Do not interrupt PR #42 source reprocessing.**
2. Build the **shared runner + durable run-history** on a separate non-conflicting workstream.
3. Implement **ObservationDebt reconciliation + tests**.
4. Reconcile **PR #18/#19 and PR #30** into the current machine instead of merging stale stacked branches.
5. **Reconnection Phase 3 content is prepared**; next action is owner metadata/wording validation, then profile publication.
6. Verify **Phase 4 first-wave current roles/channels**, then draft individualized outreach.
7. Complete **G6** and **attendance** runtime proofs when their required authority/runtime access is available.

---

# J. Handoff sentence

> Start from the first unchecked item that matches your assigned workstream. Do not reconstruct closed architecture from chat. If you close something, update this file with the exact proof boundary.


---

# K. 2026-09-25 — Cross-agent reconciliation baseline A

**Status:** REGISTERED / PENDING MERGE WITH 22–23 SEP OTHER-AGENT AUDIT

**Purpose:** preserve the current consolidated priority reading so another agent can inspect it directly in GitHub, compare it with work performed on 22–23 September, and return only evidence-backed deltas. This section does not replace earlier proof boundaries; it updates the carry-forward reading from the 2026-09-21 checkpoint.

## Reconciliation rule

- Treat this section as **Baseline A**.
- The other agent must compare its 22–23 Sep work against this baseline.
- Do not reopen closed work merely because it appears in an older chat.
- If the other agent has stronger evidence that changes an item below, report the exact PR / SHA / deployment / file / runtime witness.
- Final statuses after merge should be one of:
  - `DONE`
  - `OPEN`
  - `PARTIALLY DONE`
  - `BLOCKED`
  - `WAITING FOR HUMAN VALIDATION`
  - `SUPERSEDED`

## Current carry-forward priorities

1. **P0 — Shared PRIME Learning Machine runner + durable run history**
   - implement the complete shared runner;
   - manual and automatic initiation must converge on the same normalized run;
   - persist exact resume point, source/version/scope, machine/prompt/contract versions, artifacts/hashes, teacher package/decision, approved payload/hash, G2–G6 outcomes, delivery result, unfinished stage and retry/idempotency result.

2. **P0 — Finish/reconcile PR #46 + durable ObservationDebt**
   - PR #46 implements CEFR authority tests, broad self-correction semantics and ObservationDebt reconciliation guardrails;
   - exact-head Preview was observed READY;
   - PR #46 remains open;
   - its own non-claim says it does not persist ObservationDebt to the database and does not implement the complete shared runner;
   - next work: reconcile/rebase against current main, validate/merge the guardrails, then integrate durable ObservationDebt persistence into the shared runner.

3. **P0/P1 — Resume and close PR #42 vNext workstream**
   - do not reconstruct or restart it;
   - first determine whether the previously assigned other-agent work is still active;
   - closure still requires the intended source replay / Golden-Witness and teacher-review package, no learner-facing validation-language leakage, explicit authority transition, same-final-head Preview, merge/release decision, and production verification if released.

4. **P1 — Reconcile PR #18 / #19 / #30 into current architecture**
   - do not merge stale stacked branches wholesale;
   - map Candidate/Review/Canonicalization/Projection, capture/provenance/idempotency/diarization protections and non-lossy extraction semantics onto CLR + G1–G6 + shared runner;
   - port only genuinely missing behavior;
   - add regression coverage;
   - close stale PRs with exact superseding commits.

5. **P1 — Complete G6 runtime authority proof and controlled cutover**
   - PR #36 structural remediation exists and had exact-head Preview READY;
   - PRs #47/#48 completed Young Learner provisioning / bounded compatibility work;
   - remaining work is runtime authority proof, not architectural rediscovery;
   - obtain real authenticated witnesses for Gustavo / Carol / Michelle as applicable;
   - prove authorized account → relation → studentId → same verified canonical consumer state → Dashboard;
   - perform controlled cutover only with explicit authorization;
   - retire the temporary compatibility bridge after G6 becomes authoritative.

6. **P1 — Authoritative attendance production witness**
   - implementation exists but production witness remained unproven at the 21 Sep checkpoint;
   - require the real chain:
     `lesson → scheduled identity → Meet conference → signed-in participant → AttendanceRecord(authoritative) → downstream consumer → audit trail`.

7. **Cláudio — reconcile PR #55 against current main; do not blindly merge**
   - PR #54 real Cláudio dashboard mission workflow is merged and production-deployed;
   - current main subsequently gained a standard Cláudio learning-journey page and Action Workspace readability/contrast work;
   - PR #55 remains open and its standalone branch Preview was observed failed;
   - compare only unique value still absent from current main;
   - if none remains, close #55 as superseded rather than maintaining competing Journey implementations.

8. **Governance — refresh this canonical handoff after cross-agent reconciliation**
   - after the 22–23 Sep audit is merged, update this file with exact proof boundaries;
   - explicitly record later outcomes such as merged PR #51, merged PR #54, current production lineage, and the final disposition of #46/#42/#55;
   - do not create a parallel competing backlog.

9. **Reconnection Phase 3 — LinkedIn Reconstruction**
   - landing Phase 1 and professional-story Phase 2 are closed;
   - validate exact Cultura / Prime Language School titles and dates;
   - owner approves headline / About / public founder wording / Featured assets;
   - then publish the LinkedIn reconstruction;
   - do not reopen the landing-page workstream.

10. **Reconnection Phases 4–7 — controlled outreach**
    - verify current roles and preferred channels for first-wave contacts;
    - draft individualized first-contact messages from verified context;
    - maintain response/alignment log;
    - create bounded collaboration pilots only where warranted;
    - no mass outreach and no automatic promotion from enthusiasm to collaboration.

11. **Conditional cleanup — external legacy Google/Studio trigger**
    - investigate only if calls are still arriving or formal provider-side decommission proof is required;
    - repository-side legacy automation remains contained;
    - this must not displace higher-priority shared-runner / vNext / G6 work.

12. **Operational follow-up — Carol / Gustavo lesson rescheduling**
    - communication was prepared after the teacher's Tuesday medical emergency;
    - confirm whether Carol replied and whether the requested Friday makeup lesson was scheduled/completed;
    - if not, follow up;
    - this is an operational/student task, not a Learning Machine architecture item.

## Items already identified as no longer open

- **PR #51 — Ítalo Maritime Interview audio mission:** merged; final implementation states no new database migration is required.
- **PR #54 — Cláudio real dashboard mission workflow:** merged and production-deployed.
- Do not re-open either item unless contradictory production evidence exists.

## Current technical execution order

1. shared runner + durable run history;
2. PR #46 reconciliation / durable ObservationDebt;
3. PR #42 vNext closure;
4. PR #18/#19/#30 reconciliation;
5. G6 runtime proof / controlled cutover;
6. attendance production witness.

Reconnection proceeds as an independent business workstream.

## Other-agent merge package requested

The agent holding 22–23 Sep context should return, without starting new implementation:

| Item | Status | Evidence | Remaining action | Dependency | Supersedes/updates |
|---|---|---|---|---|---|

It should include:
- tasks actually completed on 22–23 Sep;
- tasks started but unfinished;
- tasks clearly decided but never started;
- obsolete/superseded tasks;
- human/runtime validation still required;
- new tasks absent from the 21 Sep handoff;
- the first concrete unfinished action from that agent's work.

> **Cross-agent handoff rule:** merge evidence into this canonical TODO. Do not create another competing roadmap.
