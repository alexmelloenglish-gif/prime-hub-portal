# Student Dashboard Contract Freeze v1.0

**Status:** FROZEN

**Contract:** `student-dashboard-v1.0`

**Purpose:** prevent silent regression of the canonical learner projection, its evidence boundaries, and the distinction between pedagogical state, runtime processing, proposed action, and executed action.

## Mandatory CI

The GitHub Actions job is named exactly:

`Student Dashboard Contract`

It runs on pull requests to `main` and pushes to `main` and executes:

1. `npm run student-dashboard:self-test`
2. `npm run canonical:validate:strict`

The same contract is also part of the production build.

## Structural contract

Every authorized repository snapshot must expose:

- `studentId`
- `studentName`
- `dashboardSourcePolicy = authorized_repository_snapshot`
- `profileCompleteness = canonical_longitudinal_profile`
- `profileSource.sourceAuthority`
- `canonicalProjection.version = student-dashboard-v1.0`
- `canonicalProjection.currentState`
- `canonicalProjection.priorities`
- `canonicalProjection.nextAction`

The structural schema is `data/contracts/student-dashboard-projection.schema.json`.

The schema intentionally does **not** require identical pedagogical maturity across learners. `Not Assessed`, qualified actions, portfolio-confirmed state, teacher-validated state, and justified absence of a future schedule remain valid states.

## Regression witnesses

Fixtures:

- `tests/fixtures/student-dashboard/diego.canonical.fixture.json`
- `tests/fixtures/student-dashboard/eduarda.canonical.fixture.json`

The executable regression test preserves:

### Diego

- four lesson witnesses;
- four report witnesses;
- current A2;
- target B1;
- three priorities;
- `60–90 Second Executive Response`;
- `portfolio-confirmed` authorization;
- no automatic B1 promotion.

### Eduarda

The witness was updated on 2026-09-15 after a **teacher-authorized correction in the canonical portfolio source**. This is a factual learner-state correction, not a breaking change to the `student-dashboard-v1.0` contract.

The current learner-facing witness preserves:

- seven pedagogically documented lesson witnesses;
- seven report witnesses;
- current `CEFR A1`, teacher-validated from the corrected source;
- target `CEFR A2`, teacher-validated and explicitly treated as a target rather than a result;
- three priorities;
- `Six-question independence check`;
- no automatic promotion from A1 to A2;
- only lessons with documented pedagogical evidence are projected;
- the 3 July agenda record is **not projected as a learner lesson** and generates **no class report**;
- no source-only/incomplete record is surfaced as learner-facing learning state;
- action remains distinct from Diego's.

The source truth is preserved separately:

- the canonical source contains an agenda record dated **3 July 2026**;
- that fact is retained in `sourceProvenance.nonProjectedRecords`;
- it remains classified as `source-only`;
- preserving provenance does **not** authorize promotion into attendance, a lesson, a class report, evidence or learning state.

This is the required separation:

```text
source provenance ≠ learner lesson ≠ pedagogical evidence ≠ learner-facing projection
```

## Negative regression protection

The regression suite must fail if a mutation:

- removes `dashboardSourcePolicy`;
- changes the contract version;
- weakens profile completeness;
- silently promotes Eduarda from current A1 to target A2;
- changes Eduarda's A2 target without a new teacher-authorized source correction;
- marks an unexecuted action as completed;
- projects the 3 July source-only record as a learner lesson;
- creates a report for the 3 July source-only record;
- removes the 3 July source provenance silently;
- promotes that source-only provenance into learning evidence;
- collapses the two learners into the same next action.

## Semantic boundaries

These relationships are contractual:

```text
Pipeline completed
≠ teacher review completed
≠ canonicalization completed
≠ cumulative personalization
≠ closed learning loop
```

and:

```text
Published reports: N
≠ N validated evidence items
≠ N complete canonical lessons
≠ N Engine cycles
```

A proposal is not a teacher decision. An authorized next action is not proof that the action was executed. A target is not a result. An incomplete or source-only record is not converted into a completed learner-facing report, lesson or learning claim. Source provenance must remain auditable even when it is intentionally excluded from the learner-facing projection. A teacher-authorized correction may update a learner's factual state without changing the projection contract version, but it must update the executable witness and regression assertions explicitly.

## Baseline

Historical proof baseline:

`dc98ad11f9e1c3eaccc4b412674840f6cca8f3f5`

This SHA remains a historical evidence baseline, **not** a permanent pin in executable code. The corrected Eduarda witness on 2026-09-15 supersedes the learner-state facts encoded in that earlier baseline while preserving the same v1.0 structural and semantic contract.

The contract version must not be silently changed. A future breaking contract requires:

1. a new contract version;
2. a new assertion matrix;
3. documented justification;
4. explicit migration;
5. updated evidence documentation.

## Branch protection requirement

GitHub repository settings must require the exact check name `Student Dashboard Contract` before merge to `main`, together with the project's chosen review and force-push restrictions.

The workflow itself cannot enforce branch protection. Branch protection is a repository-level control and must be verified in GitHub settings/API.
