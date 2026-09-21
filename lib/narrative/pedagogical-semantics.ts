export type LearningStage =
  | 'observed_signal'
  | 'emerging'
  | 'developing'
  | 'consistent'
  | 'stable_established'
  | 'mastery'

export type LearningStageAssessment = {
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

export function classifyLearningStage(
  assessment: LearningStageAssessment,
): LearningStage | null {
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

  if (meaningful >= 5 && assessment.relativeReliability === true) {
    return 'consistent'
  }

  if (meaningful >= 4) return 'developing'
  if (credible >= 2) return 'emerging'
  if (credible >= 1) return 'observed_signal'

  return null
}

export function validateLearningStageAssessment(
  assessment: LearningStageAssessment,
): string[] {
  const errors: string[] = []

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
