export type LearningStage =
  | 'observed_signal'
  | 'emerging'
  | 'developing'
  | 'consistent'
  | 'stable_established'
  | 'mastery'

export type LearningStageAssessment = {
  construct: string
  condition: string
  credibleManifestations: number
  meaningfulManifestations: number
  relativeReliability: boolean
  previouslyConsistent?: boolean
  persistsOverTime?: boolean
  persistsAcrossContexts?: boolean
  autonomous?: boolean
  flexible?: boolean
  transferable?: boolean
  durable?: boolean
}

export type LearningStageProposal = {
  construct: string
  condition: string
  stage: LearningStage | null
  authorityStatus: 'candidate_non_authoritative'
  rationale: string[]
}

function deriveStage(assessment: LearningStageAssessment): LearningStage | null {
  const credible = Math.max(0, assessment.credibleManifestations)
  const meaningful = Math.max(0, assessment.meaningfulManifestations)

  const stable =
    assessment.previouslyConsistent === true &&
    (assessment.persistsOverTime === true || assessment.persistsAcrossContexts === true)

  if (
    stable &&
    assessment.autonomous === true &&
    assessment.flexible === true &&
    assessment.transferable === true &&
    assessment.durable === true
  ) {
    return 'mastery'
  }

  if (stable) return 'stable_established'
  if (meaningful >= 5 && assessment.relativeReliability === true) return 'consistent'
  if (meaningful >= 4) return 'developing'
  if (credible >= 2) return 'emerging'
  if (credible >= 1) return 'observed_signal'

  return null
}

export function proposeLearningStage(
  assessment: LearningStageAssessment,
): LearningStageProposal {
  const stage = deriveStage(assessment)
  const rationale: string[] = [
    `construct=${assessment.construct}`,
    `condition=${assessment.condition}`,
    `credibleManifestations=${assessment.credibleManifestations}`,
    `meaningfulManifestations=${assessment.meaningfulManifestations}`,
    `relativeReliability=${assessment.relativeReliability}`,
  ]

  if (assessment.previouslyConsistent) rationale.push('previouslyConsistent=true')
  if (assessment.persistsOverTime) rationale.push('persistsOverTime=true')
  if (assessment.persistsAcrossContexts) rationale.push('persistsAcrossContexts=true')
  if (stage === 'mastery') rationale.push('autonomous+flexible+transferable+durable=true')

  return {
    construct: assessment.construct,
    condition: assessment.condition,
    stage,
    authorityStatus: 'candidate_non_authoritative',
    rationale,
  }
}

export function validateLearningStageAssessment(
  assessment: LearningStageAssessment,
): string[] {
  const errors: string[] = []

  if (!assessment.construct.trim()) errors.push('construct is required.')
  if (!assessment.condition.trim()) errors.push('condition is required.')

  if (!Number.isFinite(assessment.credibleManifestations) || assessment.credibleManifestations < 0) {
    errors.push('credibleManifestations must be a non-negative finite number.')
  }

  if (!Number.isFinite(assessment.meaningfulManifestations) || assessment.meaningfulManifestations < 0) {
    errors.push('meaningfulManifestations must be a non-negative finite number.')
  }

  if (assessment.meaningfulManifestations > assessment.credibleManifestations) {
    errors.push('meaningfulManifestations cannot exceed credibleManifestations.')
  }

  if (
    assessment.previouslyConsistent !== true &&
    (assessment.persistsOverTime === true || assessment.persistsAcrossContexts === true) &&
    assessment.meaningfulManifestations < 5
  ) {
    errors.push('Stable/established persistence cannot bypass prior consistency.')
  }

  return errors
}
