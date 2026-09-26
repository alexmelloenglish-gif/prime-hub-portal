# PRIME — Canonical TODO & Handoff
**Checkpoint:** 2026-09-25 — reconciled from the 2026-09-21 baseline  
**Status:** ACTIVE OPERATIONAL BACKLOG / ISSUE #58 RECONCILED  
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

# C. P0/P1 — vNext / Portfolio / Awareness gap analysis against current main

- [ ] **Audit current `main` for still-missing vNext / Portfolio / Awareness capabilities**
  - PR #42 was closed on 2026-09-25 **without merge** as a stale/conflicting implementation path.
  - Do **not** reopen PR #42 or treat its branch as an active workstream.
  - Preserve its durable contracts as provenance, including:
    - `Portfolio = Lesson Archive + Cumulative Learning Memory`;
    - Projection and Communication are distinct concerns;
    - learner/family awareness must not silently alter canonical authority;
    - teacher authority remains required for protected transitions.
  - inspect current `main` and identify only concrete missing capabilities;
  - re-derive or narrowly port missing behavior from current `main`;
  - validate any new implementation through current exact-SHA release gates.

  Required proof to close:
  - current-main file/function evidence for each formerly required capability;
  - explicit gap list with `PRESENT / MISSING / SUPERSEDED`;
  - tests for any newly ported behavior;
  - exact-SHA CI/release evidence.

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

# E. P1 — Candidate / capture / non-lossy semantics gap analysis

- [ ] **Audit current `main` for durable semantics formerly carried by PRs #18 / #19 / #30**
  - PRs #18, #19 and #30 were closed on 2026-09-25 **without merge**.
  - Their branches are historical/provenance sources only; do **not** reopen or merge them.
  - Preserve and verify the following invariants against current `main`:
    - candidate output is not canonical state;
    - teacher review/authority is required before protected canonical transitions;
    - approval, canonicalization and publication are distinct transitions;
    - source provenance and identity uncertainty remain explicit;
    - diarization uncertainty must not fabricate speaker identity;
    - idempotency remains explicit;
    - `NO MATERIAL STATE CHANGE != NO PEDAGOGICAL INFORMATION`;
    - source-grounded pedagogical history must not be flattened when no state transition occurs;
    - rich extraction may preserve learner production, successful production, instability/errors, support/scaffolding, uptake, structured corrections, boundaries and next verification.
  - classify each invariant as `PRESENT / MISSING / SUPERSEDED`;
  - port only genuinely missing behavior into current `main`;
  - add regression coverage for any ported behavior.

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

# G. Repository cleanup / provenance status

- [x] **Legacy conflicting open-PR backlog cleared — Issue #58**
  - PRs #1, #18, #19, #30, #36, #42 and #46 closed without merge;
  - PR #55 closed as `SUPERSEDED / DO NOT MERGE`;
  - durable architectural/pedagogical rules remain provenance, not active branch implementations;
  - current `main` is the sole implementation baseline.

- [x] **Issue #44 superseded by this canonical TODO**
  - it must not remain a competing backlog.

- [ ] **Periodically verify this TODO against current main**
  - if a different agent closes an item, update this file instead of opening a parallel handoff;
  - never infer `DONE` from closed stale PRs alone.

---

# H. Items that require validation/authority before they can be ticked

These are not failures. They are the points where this workstream must stop instead of manufacturing proof.

| Item | What is missing |
|---|---|
| Shared runner | implementation + deterministic/idempotent execution proof |
| Durable run history | persistent final manifest + exact resume/retry/idempotency history |
| ObservationDebt | current-main durable persistence/reconciliation proof + regression self-test |
| vNext / Portfolio / Awareness | current-main gap audit; do not reopen PR #42 |
| Candidate/capture/non-lossy semantics | current-main gap audit against preserved invariants from #18/#19/#30 |
| G6 | authenticated runtime witness + controlled cutover authorization; do not reopen PR #36 |
| Attendance | real authoritative Meet → AttendanceRecord → downstream production trace |
| Repository protection | independent proof of branch protection / required status checks, if administrative enforcement is desired |
| LinkedIn | exact employment metadata + owner review before public profile publication |
| Reconnection map | current-role/contact-channel verification before individualized outreach |
| External legacy trigger | provider-side trigger evidence, only if decommission proof is required |

---

# I. Current next-action order — reconciled 2026-09-25

1. Build the **shared runner + durable run history** from current `main`.
2. Audit and implement **durable ObservationDebt** only where current-main proof is missing.
3. Run a **current-main gap audit** for vNext / Portfolio / Awareness contracts formerly carried by PR #42.
4. Run a **current-main gap audit** for candidate/capture/non-lossy semantics formerly carried by PRs #18/#19/#30.
5. Complete **G6 runtime proof / controlled cutover** from current `main`; do not resurrect PR #36.
6. Complete the **authoritative attendance production witness**.
7. Continue **Reconnection Phase 3–7** as the independent business workstream.
8. Verify repository branch-protection / required-check enforcement only if administrative enforcement is required beyond procedural exact-SHA discipline.

---

# J. Handoff sentence

> Start from the first unchecked item that matches your assigned workstream. Do not reconstruct closed architecture from chat. If you close something, update this file with the exact proof boundary.


---

# K. 2026-09-25 — Cross-agent reconciliation baseline B

**Status:** CURRENT RECONCILED PRIORITY BASELINE  
**Authority source:** Issue #58 + verified GitHub PR state + current `main`

## What changed from Baseline A

Baseline A is superseded by this section.

Verified on 2026-09-25:

- PR #56 merged: canonical CI/release gate remediation.
- PR #57 merged: Cláudio learner-facing language cleanup.
- PR #55 closed `SUPERSEDED / DO NOT MERGE`.
- PRs #1, #18, #19, #30, #36, #42 and #46 closed **without merge**.
- open-PR backlog verified empty at the cleanup proof boundary and again during reconciliation.
- Issue #58 is the operational audit record for that cleanup.
- the 22–23 Sep verification found **no verified implementation delta integrated into `main` on those dates**.
- absence of an integrated SHA does not prove no work occurred; it means no task may be promoted to `DONE` from those chats alone.

## Current main checkpoint

At this reconciliation checkpoint:

`main = 7d9ace990042933b5ae1531413a4651fed76876d`

This commit registered the 25 Sep cross-agent priority baseline. Always re-check current `main` before implementation because the branch may advance after this document update.

## Canonical carry-forward backlog

| Priority | Item | Status | Current interpretation |
|---|---|---|---|
| P0 | Shared PRIME Learning Machine runner | OPEN | No exact-main proof yet that manual + automatic initiation converge on the same normalized run and complete the same authority/canonicalization/projection path. |
| P0 | Durable run history / exact resume point | OPEN | Persist final manifest, versions, hashes, teacher decision, gate outcomes, unfinished stage and retry/idempotency history. |
| P0 | Durable ObservationDebt | OPEN / PARTIALLY SPECIFIED | Normative rules survive as provenance; closed PR #46 is not implementation proof. Verify current main, then implement only missing persistence/reconciliation behavior. |
| P1 | vNext / Portfolio / Awareness gaps | OPEN AS GAP AUDIT | PR #42 is closed/no-merge. Do not reopen it. Audit current main against preserved contracts and port only concrete gaps. |
| P1 | Candidate/capture/non-lossy semantics | OPEN AS GAP AUDIT | PRs #18/#19/#30 are closed/no-merge. Verify preserved invariants against current main and port only missing behavior. |
| P1 | G6 runtime authority proof / cutover | WAITING FOR RUNTIME/HUMAN VALIDATION | PR #36 is closed/no-merge. Runtime proof must be produced from current main with real authenticated witnesses and explicit cutover authority. |
| P1 | Authoritative attendance production trace | OPEN | Real Meet → authoritative AttendanceRecord → downstream consumer → audit trail remains unproven absent contrary runtime evidence. |
| P2 | Repository branch protection / required checks | NOT PROVEN ADMINISTRATIVELY | PR #56 provides the workflow gate; exact-SHA discipline remains mandatory unless GitHub protection is independently verified. |
| Business | Reconnection Phase 3 | OPEN / OWNER VALIDATION | Validate exact employment metadata and approve public wording/assets before LinkedIn publication. |
| Business | Reconnection Phases 4–7 | OPEN | Verify contacts/channels, draft individualized outreach, log responses, then bounded pilots where warranted. |
| Conditional | External legacy Google/Studio trigger | CONDITIONAL | Investigate only if calls still arrive or formal provider-side decommission evidence is required. |
| Operational | Carol / Gustavo rescheduling follow-up | CHECK REQUIRED | Confirm whether the Friday makeup lesson was answered/scheduled/completed; follow up only if still pending. |

## Closed / do-not-reopen items

- PR #51 — Ítalo Maritime Interview audio mission: merged; no new DB migration required by final implementation.
- PR #54 — Cláudio real dashboard mission workflow: merged / production-delivered at its proof boundary.
- PR #55 — superseded / do not merge.
- PRs #1/#18/#19/#30/#36/#42/#46 — closed without merge; provenance only.
- Previously completed learner mission work must not be reopened without evidence of regression.
- Cláudio's confirmed pedagogical audit must not be restarted absent contradictory evidence.

## Required proof boundary for first P0

The next implementation must prove:

```text
manual trigger ─┐
                ├→ same normalized run identity
auto trigger ───┘
                ↓
same machine stages
                ↓
explicit Teacher Authority
                ↓
canonicalization / verification / projections
                ↓
durable final manifest
                ↓
exact resume + retry/idempotency history
```

## Cross-agent operating rule

> Current `main` is the sole implementation baseline. Closed legacy PRs are provenance only. Do not create a competing roadmap, do not resurrect stale branches, and do not promote chat discussion to `DONE` without exact repository/runtime evidence.


## 2026-09-26 — Finalization queue after integrated proof

This section supersedes older pre-integration wording for the current finalization sequence.

### Core technical state now proven
- [x] PR #65 integrated candidate `1f704ab97ac858fbad54a01126f12293e6f39358` is the current pre-Production proof target.
- [x] Same-SHA Student Dashboard Contract, Agent Coordination Bus, Golden Runtime Witness and Coordination Runtime Witness all PASS.
- [x] Same-SHA Vercel Preview/deployment status is SUCCESS.
- [x] Disposable-Postgres rehearsal successfully applies the integrated post-baseline migrations in order and returns clean migration status.
- [x] PR #66 and #67 isolated witness lanes are superseded by the integrated #65 witnesses and preserved only as provenance.

### Required to finish the core platform
- [ ] Merge the validated #65 integration candidate into `main` with exact merge SHA recorded.
- [ ] Apply the three validated additive migrations to Production in recorded order with pre/post read-back.
- [ ] Deploy the merged exact `main` SHA to Vercel Production and verify runtime health on the official domain.
- [ ] Configure the real Production coordination wake/auth target while keeping automatic Learning Machine ingestion frozen for preflight.
- [ ] Execute one controlled Production activation witness through Teacher Authority and verify durable run, canonical record, G3/G4/G5 projections, dashboard read-back, coordination ACK and no duplicate protected write.
- [ ] Only after that witness passes, enable the intended automatic trigger path and immediately verify idempotency/freeze rollback behavior.
- [ ] Close component PRs #59/#60/#61/#63/#64 as superseded after the integrated merge is safely established.

### Product-completion work outside the core activation path
- [ ] Integrate PR #62 family-portfolio presentation layer after rebasing/revalidating it on the new main.
- [ ] Synchronize/read back the external learner/family Google Docs where still required.
- [ ] Complete real authenticated G6 sign-in witnesses for the named learner/guardian accounts.
- [ ] Complete the authoritative attendance Production trace.
- [ ] Resolve only genuinely missing ObservationDebt, vNext/Portfolio/Awareness and candidate/capture semantics after current-main gap audit.
- [ ] Verify/disable any legacy external Google/Studio trigger only if still operationally relevant.
- [ ] Add repository branch protection / required checks so exact-SHA discipline is enforced administratively.

### Scope note
Reconnection/LinkedIn phases remain business-development work, not a blocker for declaring the learning platform technically complete.
