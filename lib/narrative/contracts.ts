export type NarrativeEvidenceType =
  | 'lesson_event'
  | 'language_use'
  | 'language_adjustment'
  | 'revisit'
  | 'content_participation'
  | 'continuity'
  | 'teacher_context'

export type EvidenceCondition =
  | 'independent'
  | 'self_corrected'
  | 'one_clue'
  | 'multiple_clues'
  | 'modeled'
  | 'reconstructed'
  | 'controlled_task'
  | 'open_communication'
  | 'unknown'

export type LessonMode = 'targeted' | 'exploratory' | 'mixed'

export type ShowcaseOpportunity = {
  opportunityId: string
  description: string
  constructObserved: string
  intendedCondition: EvidenceCondition
  boundary?: string | null
}

export type NarrativeLessonFrame = {
  mode: LessonMode
  primaryTarget: string
  expectedLearnerOutcome?: string | null
  showcaseOpportunities?: ShowcaseOpportunity[]
  secondaryRecycling?: string[]
  contextReason?: string | null
  teacherNotes?: string[]
}

export type UncertaintyReason =
  | 'not_tested'
  | 'not_observed'
  | 'insufficient_evidence'
  | 'ambiguous_or_mixed_evidence'
  | 'not_available'

export type InvestigationFlag = {
  trigger: string
  evidenceIds: string[]
  whyItMatters: string
  currentInterpretations: string[]
  remainingQuestion: string
  suggestedFutureObservation?: string | null
  teacherDecisionRequired: true
}

export type NarrativeEvidence = {
  evidenceId: string
  lessonId: string
  occurredAt: string
  type: NarrativeEvidenceType
  statement: string
  sourceRefs: string[]
  authorization: 'teacher_validated' | 'canonical'
  producer: 'student' | 'teacher' | 'system' | 'mixed' | 'unknown'
  domain: 'language' | 'content' | 'mixed' | 'unknown'
  support?: string | null
  condition?: EvidenceCondition | null
  relatedLessonIds?: string[]
}

export type NarrativeLessonContext = {
  lessonId: string
  occurredAt: string
  purpose: string
  description: string
  evidenceIds: string[]
}

export type NarrativeInput = {
  studentId: string
  studentName: string
  programme?: string
  lessonFrame?: NarrativeLessonFrame
  currentLesson: NarrativeLessonContext
  priorLessons: NarrativeLessonContext[]
  evidence: NarrativeEvidence[]
  authorizedCurrentState?: {
    level?: string
    target?: string
    focus?: string
  }
  authorizedNextStep?: {
    title: string
    description?: string
    sourceRefs: string[]
  } | null
}

export type NarrativeSegment = {
  segmentId: string
  role: 'opening' | 'event' | 'connection' | 'adjustment' | 'revisit' | 'boundary' | 'continuation'
  text: string
  evidenceIds: string[]
}

export type LearningNarrativeDraft = {
  schemaVersion: 'learning-narrative.v1'
  studentId: string
  currentLessonId: string
  narrativeStatus: 'draft'
  authorityStatus: 'non_authoritative'
  segments: NarrativeSegment[]
  narrativeText: string
  nextStepText?: string | null
  sourceEvidenceIds: string[]
  boundaryNotes: string[]
  requiresTeacherReview: true
  validation?: NarrativeValidation
  generationProvenance?: {
    provider: 'gemini'
    model?: string
    promptVersion: string
    requestId?: string
    startedAt: string
    completedAt: string
    artifactId?: string
  }
}

export type NarrativeValidation = {
  passed: boolean
  errors: string[]
  warnings: string[]
  referencedEvidenceIds: string[]
}
