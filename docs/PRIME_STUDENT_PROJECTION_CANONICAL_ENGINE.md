# PRIME Student Projection — Canonical Engine

**Status:** LOCKED FOR IMPLEMENTATION
**Purpose:** one generic mechanism for every student dashboard projection.

## Canonical rule

Student records are content. Projection code is mechanism. The UI is a generic renderer.

```text
Authorized Student Record
        ↓
Canonical Projection Builder
        ↓
StudentDashboardProjection
        ↓
Generic Student UI
```

No dashboard component may identify a student by email, name, or student ID to choose content, assets, level, action, report, vocabulary, grammar, or layout.

## Determinism

The projection builder is a pure function. The same authorized records plus the same projection version must produce the same semantic result.

Implementation: `lib/canonical-student-projection.ts`.

## Temporal model

- `NOW`: currently authorized state.
- `RECENT`: newly relevant evidence, bounded by the projection rule.
- `MEMORY`: longitudinal history.

A recent lesson does not become current state merely because it is recent. Historical attendance belongs in MEMORY unless an explicit projection rule places it in RECENT.

## Canonical lesson identity

`lessonId` is the canonical identity of a lesson. Derived reports, pipeline projections, and UI entries may reference that identity but must never create competing lesson identities.

One lesson → one canonical learning record → many permitted projections.

## Canonical action

A next action is a real domain object:

```text
Action
 ├── id
 ├── title
 ├── description
 ├── evidence
 ├── authorizationStatus
 ├── destination
 └── outcome
```

The destination is data, not inferred by the UI from the action title.

## Profile assets

Student profile assets are content and are registered in `data/students/student-profile-assets.json`. The UI must resolve them from student data. No `if studentEmail === ...` asset mapping is canonical.

## Golden certification sequence

1. **Ítalo — Truth:** one lesson, authorized current state, learner-model change, published report, explicit schedule state.
2. **Gustavo — Reproducibility:** same mechanism with different student content and no student-specific dashboard branch.
3. **Rafael — Scale:** longitudinal history, deduplication, bounded RECENT, growing MEMORY, multiple reports.

## Contract test

Run `scripts/validate-student-dashboard-contract.mjs` as the generic validator. It must validate every repository student record without student-specific assertions.

The test is structural by design. Student-specific certification fixtures belong in data, not in the validator's control flow.

## Migration rule

Existing portfolio content must not be rewritten merely to fit the engine. Preserve authorized content and migrate its representation toward the canonical record shape. Conflicts remain visible and require explicit canonical resolution.
