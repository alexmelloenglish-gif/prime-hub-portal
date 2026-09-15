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

The schema intentionally does **not** require identical pedagogical maturity across learners. Pending assessment, qualified actions, portfolio-confirmed state, and justified absence of a future schedule remain valid states.

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

- seven pedagogical lesson witnesses;
- seven report witnesses;
- `Assessment pending`;
- `School-task performance target pending`;
- three priorities;
- `Six-question independence check`;
- no invented CEFR state;
- 3 July incomplete encounter remains pending with no report;
- action remains distinct from Diego's.

## Negative regression protection

The regression suite must fail if a mutation:

- removes `dashboardSourcePolicy`;
- changes the contract version;
- weakens profile completeness;
- injects CEFR into Eduarda's assessment-pending state;
- marks an unexecuted action as completed;
- creates a report for Eduarda's incomplete 3 July encounter;
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

A proposal is not a teacher decision. An authorized next action is not proof that the action was executed. A target is not a result. An incomplete source is not converted into a completed report.

## Baseline

Historical proof baseline:

`dc98ad11f9e1c3eaccc4b412674840f6cca8f3f5`

This SHA is a historical evidence baseline, **not** a permanent pin in executable code. The current branch may advance while preserving the v1.0 contract.

The contract version must not be silently changed. A future breaking contract requires:

1. a new contract version;
2. a new assertion matrix;
3. documented justification;
4. explicit migration;
5. updated evidence documentation.

## Branch protection requirement

GitHub repository settings must require the exact check name `Student Dashboard Contract` before merge to `main`, together with the project's chosen review and force-push restrictions.

The workflow itself cannot enforce branch protection. Branch protection is a repository-level control and must be verified in GitHub settings/API.
