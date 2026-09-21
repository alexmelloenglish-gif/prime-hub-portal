import type {
  NarrativeEvidence,
  NarrativeLessonFrame,
} from './contracts.ts'
import type {
  LessonObservabilityAssessment,
  OpportunityExecution,
} from './lesson-observability.ts'
import { assessLessonObservability } from './lesson-observability'

export type TargetAttainment =
  | 'not_observable'
  | 'partially_addressed'
  | 'substantially_addressed'
  | 'clearly_demonstrated'

export type EvidenceLinkedStatement = {
  text: string
  evidenceIds: string[]
}

export type LessonDigestCandidate = {
  schemaVersion: 'lesson-digest.v1'
  authorityStatus: 'candidate_non_authoritative'
  lessonId: string
  declaredTarget: string
  observability: LessonObservabilityAssessment
  learnerResponses: EvidenceLinkedStatement[]
  learningMovement: EvidenceLinkedStatement[]
  teacherMoves: EvidenceLinkedStatement[]
  productiveDivergence?: EvidenceLinkedStatement | null
  targetAttainment: TargetAttainment
  nextTeachingImplications: string[]
  warnings: string[]
  requiresTeacherReview: true
}

export type LessonDigestInput = {
  lessonId: string
  lessonFrame: NarrativeLessonFrame
  evidence: NarrativeEvidence[]
  opportunityExecutions: OpportunityExecution[]
  learnerResponses: EvidenceLinkedStatement[]
  learningMovement: EvidenceLinkedStatement[]
  teacherMoves: EvidenceLinkedStatement[]
  productiveDivergence?: EvidenceLinkedStatement | null
  proposedTargetAttainment: TargetAttainment
  nextTeachingImplications?: string[]
}

function validateEvidenceLinks(
  label: string,
  items: EvidenceLinkedStatement[],
  allowedEvidenceIds: Set<string>,
): string[] {
  const errors: string[] = []

  for (const [index, item] of items.entries()) {
    if (!item.text.trim()) errors.push(`${label}[${index}] has empty text.`)
    if (!item.evidenceIds.length) {
      errors.push(`${label}[${index}] has no evidence references.`)
      continue
    }
    for (const id of item.evidenceIds) {
      if (!allowedEvidenceIds.has(id)) {
        errors.push(`${label}[${index}] references unknown evidence ${id}.`)
      }
    }
  }

  return errors
}

export function buildLessonDigestCandidate(
  input: LessonDigestInput,
): LessonDigestCandidate {
  const allowedEvidenceIds = new Set(input.evidence.map((item) => item.evidenceId))
  const observability = assessLessonObservability({
    mode: input.lessonFrame.mode,
    primaryTarget: input.lessonFrame.primaryTarget,
    plannedOpportunities: input.lessonFrame.showcaseOpportunities ?? [],
    executions: input.opportunityExecutions,
  })

  const warnings = [...observability.warnings]

  const linkErrors = [
    ...validateEvidenceLinks('learnerResponses', input.learnerResponses, allowedEvidenceIds),
    ...validateEvidenceLinks('learningMovement', input.learningMovement, allowedEvidenceIds),
    ...validateEvidenceLinks('teacherMoves', input.teacherMoves, allowedEvidenceIds),
    ...(input.productiveDivergence
      ? validateEvidenceLinks('productiveDivergence', [input.productiveDivergence], allowedEvidenceIds)
      : []),
  ]

  warnings.push(...linkErrors)

  let targetAttainment = input.proposedTargetAttainment

  if (observability.targetObservability === 'not_observable') {
    if (targetAttainment !== 'not_observable') {
      warnings.push(
        'Target attainment was forced to not_observable because the planned target opportunity was not created.',
      )
    }
    targetAttainment = 'not_observable'
  }

  if (
    observability.targetObservability === 'limited' &&
    targetAttainment === 'clearly_demonstrated'
  ) {
    warnings.push(
      'CLEARLY_DEMONSTRATED is not compatible with limited target observability; target attainment was reduced to partially_addressed.',
    )
    targetAttainment = 'partially_addressed'
  }

  return {
    schemaVersion: 'lesson-digest.v1',
    authorityStatus: 'candidate_non_authoritative',
    lessonId: input.lessonId,
    declaredTarget: input.lessonFrame.primaryTarget,
    observability,
    learnerResponses: input.learnerResponses,
    learningMovement: input.learningMovement,
    teacherMoves: input.teacherMoves,
    productiveDivergence: input.productiveDivergence ?? null,
    targetAttainment,
    nextTeachingImplications: input.nextTeachingImplications ?? [],
    warnings,
    requiresTeacherReview: true,
  }
}
