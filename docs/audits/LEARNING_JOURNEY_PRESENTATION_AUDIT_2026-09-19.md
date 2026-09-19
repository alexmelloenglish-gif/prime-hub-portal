# Learning Journey Presentation Audit

**Date:** 19 September 2026
**Baseline:** `d69f16ccfc4b26e0bbf75fcffc5310012fd7a235`
**Method:** Read-only source/contract review against the proposed [System Governance Canon](../governance/PRIME-SYSTEM-GOVERNANCE-CANON.md).
**Scope:** Class Report, Portfolio and Dashboard narrative semantics. No authenticated production session, database, model execution or deployment was tested.

## Conclusion

The baseline already protects teacher authority, source integrity, historical reports and qualitative progress. Its presentation contracts still make status, correction and support classifications more central than the full learning journey. The amendment specifies a separate path for meaningful learning events and contextual teacher interpretation without requiring a state change.

The inspected paths did not establish a runtime rule that every lesson must change state, or that every retained state is rendered as no progress. That would be an unsupported finding. The concrete gaps below concern contract obligations and source behavior; production prevalence is not claimed.

## Findings and implementation priorities

Priorities apply before claiming compliance with the new canon, not as a retroactive invalidation of unrelated deployed functionality.

| ID / priority | Observed source | Consequence / required change |
|---|---|---|
| J-01 / P0 | `CLASS-REPORT-PRESENTATION-CONTRACT-V1_2026-09-18.md`, sections 3 and 7–10, requires ten visible blocks, a three-part correction table and standalone Support / Independence Level. Its JSON sets allRequiredSectionsMustRender. | Complete internal evidence is conflated with a mandatory family-facing audit layout. Adopt Class Report v1.1's semantic-to-narrative mapping and version the validator before activating it. |
| J-02 / P0 | `app/dashboard/page.tsx` progress-tracker conditional replaces item.insight with a generic sentence when normalized state is Not Assessed. `components/dashboard/progress-tracker.tsx` does the same for skill.insight; `lib/progress-states.ts` gates canDisplayProgressInsight on classification. | An authorized episode can disappear because stable-skill classification is unavailable. Preserve separately authorized narrative regardless of that label; do not expose an unvalidated raw insight as a shortcut. |
| J-03 / P0 | `lib/progress-states.ts` maps developing, on track and related legacy strings to Improving; the frozen tracker/template mandates this normalization. | Normalization can strengthen an ambiguous description into a directional progress claim. Keep safe legacy compatibility without treating a wording conversion as teacher authority. |
| J-04 / P0 | The inspected Class Report v1.0, Dashboard v1 and Template v1.0 protect claim accuracy, but do not require purpose, opportunities for use and task comparability before retrieval/state interpretations. | Add a contextual teacher-review obligation; separate language, subject and task claims. Do not infer equivalence between exam preparation and repeatedly used language. |
| J-05 / P1 | `app/dashboard/page.tsx` showWhatChanged accepts supported progress/priority types and hides other types. Recent attendance shows summaries; full reports render worked-on/noticed/next functions. | The change gate is useful and must stay. Add a positively specified route for authorized revisit/maintenance episodes in RECENT/MEMORY so narrative never relies on manufacturing What Changed. Existing prose may already carry such episodes; typed enforcement is not proven. |
| J-06 / P1 | `components/dashboard/student-dashboard-primitives.tsx` DevelopmentTrajectory shows Current → Learning in progress → Target. | Keep authorized current/target information while explaining a non-linear journey. This source is not evidence that numerical progress is calculated. |
| J-07 / P1 | `lib/canonical-learning-record-contract.ts` and `lib/canonical-portfolio-projection.ts` retain validatedEvidence, teacherInsight, learnerStateChange and evidenceBoundaries. | Useful foundation, but these types alone do not enforce context-rich event/interpretation/state separation. Design a versioned mapping; do not pretend that prose requirements have already changed the schema. |
| J-08 / P1 | `lib/pipeline/prompts.ts`, Prompt 1 and Prompt 2 contracts, protects proposals/teacher authority and prohibits inferred state mutation. | Preserve these controls; a prompt revision must also require supported continuity and contextual comparison. This audit does not reopen the legacy ingestion path or certify model behavior. |
| J-09 / P1 | `scripts/student-dashboard-contract-self-test.mjs` asserts current trajectory wording, label normalization and source fragments. | Existing checks protect important boundaries but do not prove non-destructive learning narratives. Add behavior-focused cases from the new contracts during implementation; retain identity/history protections. |
| J-10 / P2 | Family/student artifacts and the external Google master are separate publication targets. | Align their narrative and visual affordances after contract adoption, verify each result and preserve version history. This repository change does not update them automatically. |
| J-11 / P1 | Template v1.0 separates school commitments from continuous language goals, but the inspected contracts do not explicitly distinguish language-mediated task access, language appropriation and subject understanding as different claims. | Recognize teacher-validated access/participation through English within its conditions. Do not reduce the value of that task to subsequent recall or infer general subject mastery. |

## Existing strengths to preserve

- Dashboard v1 forbids fabricated What Changed, CEFR movement and progress percentages; NOW may be incomplete.
- Class Report v1.0 distinguishes observation from interpretation, protects against ASR-derived errors and preserves historical memory.
- Template v1.0 already separates external school commitments from continuous language goals and keeps teacher control tables private.
- Canonical payloads and projection code retain evidence, teacher insight and boundaries independently of learnerStateChange.
- Published report history already includes human-readable worked-on/noticed/next functions; the amendment strengthens their purpose rather than discarding them.

## Acceptance evidence needed next

Use the synthetic review scenarios in the [Learning Machine Canon](../governance/PRIME-LEARNING-MACHINE-CANON.md) and [Dashboard v1.1](../student-dashboard-presentation-contract-v1.1.md). The central check is a confirmed lesson with meaningful evidence and no state update: its story must survive extraction, teacher review, canonical representation and rendering.

A second check compares tasks with different purposes/opportunities: record each episode, preserve unknown conditions and prevent unsupported cross-domain judgments. A third checks that adjustment after a model is not narrated as spontaneous self-correction.

These are acceptance requirements, not tests already executed. This audit certifies only the inspected source findings. No named learner records, private transcript extracts or personal contact information are included.
