# PRIME Status Color Contract v1

**Status:** CANONICAL / UI GOVERNANCE  
**Effective:** 2026-09-30

This contract separates **pedagogical authority** from **technical/operational status** and from **learner progress**.

Color is never the only carrier of meaning. The visible status label must always remain present.

## 1. Pedagogical authority states

| State | Canonical color | Meaning |
|---|---|---|
| **Teacher Confirmed** | **Blue** | Teacher has explicitly confirmed the pedagogical state or interpretation. |
| **Teacher Edited & Confirmed** | **Blue** | Teacher edited the proposed wording/state and then confirmed it. The edit is expressed by label/icon, not by changing the authority color. |
| **Teacher Note** | Violet | Teacher-authored or teacher-facing contextual note that is not itself a canonical confirmation. |
| **Learner Self-Perception** | Purple | Learner-reported perception. Never proficiency evidence or a CEFR decision by itself. |
| **Not Confirmed** | Amber | A relevant claim exists but has not received teacher confirmation. |
| **Not Observed** | Slate | The phenomenon was not observed in the available evidence/context. |
| **Not Applicable** | Violet | The state/dimension does not apply to this learner/task/context. |
| **Insufficient Evidence** | Orange | Evidence is too weak or incomplete to support a decision. |
| **Not Available** | Neutral gray | The information is unavailable. |

### Locked rule

```text
TEACHER CONFIRMED = BLUE
TEACHER EDITED & CONFIRMED = BLUE
```

Green/emerald must **never** be used to mean Teacher Confirmed.

## 2. Technical / operational states

These colors describe the system, not pedagogical authority.

| State | Canonical color |
|---|---|
| PASS / VERIFIED | Green / emerald |
| PRESENT / informational system state | Sky |
| PENDING / NEEDS REVIEW | Amber |
| BLOCKED | Orange |
| FAILED | Red |
| NOT PROVEN | Slate |

A green technical PASS does **not** mean a teacher confirmed a learner state.

## 3. Learner progress states

The frozen Progress Tracker palette remains separate:

| State | Canonical color |
|---|---|
| Strong | Green / emerald |
| Improving | Blue |
| Needs Focus | Amber |
| Not Assessed | Neutral gray |

Therefore blue can appear in two different systems only with explicit labels:
- **Teacher Confirmed** = authority;
- **Improving** = learner progress.

The label is mandatory and disambiguates the semantic layer.

## 4. Implementation authority

The shared implementation lives in:

`lib/status-color-contract.ts`

Student-facing evidence authority must consume this shared contract. Teacher Intelligence may use the same contract through `IntelligenceStatusBadge`.

The build self-test must fail if Teacher Confirmed is no longer blue or if student-facing teacher-confirmed statuses bypass the shared contract.
