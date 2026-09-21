import type { LessonMode, ShowcaseOpportunity } from './contracts'

export type OpportunityExecution = {
  opportunityId: string
  created: boolean
  evidenceIds: string[]
  notes?: string | null
}

export type LessonObservabilityAssessment = {
  mode: LessonMode
  primaryTarget: string
  plannedOpportunityCount: number
  createdOpportunityCount: number
  evidenceLinkedOpportunityCount: number
  targetObservability: 'not_observable' | 'limited' | 'adequate'
  warnings: string[]
}

export function assessLessonObservability(input: {
  mode: LessonMode
  primaryTarget: string
  plannedOpportunities: ShowcaseOpportunity[]
  executions: OpportunityExecution[]
}): LessonObservabilityAssessment {
  const warnings: string[] = []
  const executionById = new Map(input.executions.map((item) => [item.opportunityId, item]))

  const plannedOpportunityCount = input.plannedOpportunities.length
  let createdOpportunityCount = 0
  let evidenceLinkedOpportunityCount = 0

  for (const planned of input.plannedOpportunities) {
    const execution = executionById.get(planned.opportunityId)
    if (!execution?.created) continue
    createdOpportunityCount += 1
    if (execution.evidenceIds.length > 0) evidenceLinkedOpportunityCount += 1
  }

  if ((input.mode === 'targeted' || input.mode === 'mixed') && plannedOpportunityCount === 0) {
    warnings.push(
      'A targeted or mixed lesson has no planned Showcase Opportunity; objective attainment may be difficult to interpret.',
    )
  }

  let targetObservability: LessonObservabilityAssessment['targetObservability']

  if (plannedOpportunityCount > 0 && createdOpportunityCount === 0) {
    targetObservability = 'not_observable'
    warnings.push(
      'The declared target was not given its planned observation opportunity. Do not infer learner inability from non-demonstration.',
    )
  } else if (createdOpportunityCount > 0 && evidenceLinkedOpportunityCount === 0) {
    targetObservability = 'limited'
    warnings.push(
      'A target opportunity was created but no evidence was linked to it; preserve uncertainty rather than claiming attainment or failure.',
    )
  } else if (evidenceLinkedOpportunityCount > 0) {
    targetObservability = 'adequate'
  } else {
    targetObservability = 'limited'
    warnings.push(
      'No explicit target opportunity was supplied. Treat the lesson as discovery-based for objective-attainment claims.',
    )
  }

  return {
    mode: input.mode,
    primaryTarget: input.primaryTarget,
    plannedOpportunityCount,
    createdOpportunityCount,
    evidenceLinkedOpportunityCount,
    targetObservability,
    warnings,
  }
}
