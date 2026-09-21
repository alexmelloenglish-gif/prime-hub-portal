import type { LearningStageAssessment } from './pedagogical-semantics.ts'

export type SelfCorrectionManifestationType =
  | 'noticing'
  | 'self_repair'
  | 'reformulation'
  | 'response_correction'
  | 'tense_form_correction'
  | 'lexical_correction'
  | 'syntax_correction'
  | 'other_learner_initiated_repair'

export type SelfCorrectionManifestation = {
  evidenceId: string
  lessonId: string
  type: SelfCorrectionManifestationType
  learnerInitiated: boolean
  pedagogicallyRelevant: boolean
  condition: string
}

export type SelfCorrectionTrajectorySummary = {
  construct: 'learner_self_correction'
  credibleManifestations: number
  meaningfulManifestations: number
  lessonCount: number
  manifestationTypes: SelfCorrectionManifestationType[]
  conditions: string[]
  excludedEvidenceIds: string[]
}

export function summarizeSelfCorrectionTrajectory(
  manifestations: SelfCorrectionManifestation[],
): SelfCorrectionTrajectorySummary {
  const included = manifestations.filter(
    (item) => item.learnerInitiated && item.pedagogicallyRelevant,
  )
  const excluded = manifestations
    .filter((item) => !item.learnerInitiated || !item.pedagogicallyRelevant)
    .map((item) => item.evidenceId)

  return {
    construct: 'learner_self_correction',
    credibleManifestations: included.length,
    meaningfulManifestations: included.length,
    lessonCount: new Set(included.map((item) => item.lessonId)).size,
    manifestationTypes: [...new Set(included.map((item) => item.type))],
    conditions: [...new Set(included.map((item) => item.condition))],
    excludedEvidenceIds: excluded,
  }
}

export function buildSelfCorrectionStageAssessment(
  manifestations: SelfCorrectionManifestation[],
): LearningStageAssessment {
  const summary = summarizeSelfCorrectionTrajectory(manifestations)
  const condition =
    summary.conditions.length === 1
      ? summary.conditions[0]
      : summary.conditions.length > 1
        ? 'mixed learner-initiated repair conditions'
        : 'not yet observed'

  return {
    construct: summary.construct,
    condition,
    credibleManifestations: summary.credibleManifestations,
    meaningfulManifestations: summary.meaningfulManifestations,
    relativeReliability: false,
  }
}
