export type AttendanceStatus = 'attended' | 'missed' | 'cancelled' | 'rescheduled' | 'unknown'

export type LessonTranscriptInput = {
  lessonId: string
  studentEmail: string
  studentId?: string
  studentName?: string
  teacherId?: string
  teacherName?: string
  program?: string
  classDate?: string
  transcriptId?: string
  transcript: string
  source?: 'google_meet' | 'manual_upload' | 'api'
  effectiveAt?: string
  recordedAt?: string
  attendanceStatus?: AttendanceStatus
  attendanceSource?: string
  externalMeetingId?: string
  metadata?: Record<string, unknown>
}

export type LessonInputOutput = {
  lesson_id: string
  student_id: string
  student_name?: string
  teacher_id?: string
  teacher_name?: string
  transcript_id: string
  program?: string
  class_date?: string
  effective_at?: string
  recorded_at?: string
  attendance_status: AttendanceStatus
  attendance_source: string
}

export type LessonObservationOutput = {
  observation_id: string
  source_span: string
  observation: string
  observation_type: string
  evidence_candidate_ids: string[]
  confidence?: number
}

export type EvidenceCandidateOutput = {
  evidence_candidate_id: string
  student_id: string
  lesson_id: string
  source_transcript_id: string
  source_span: string
  content: string
  evidence_type: string
  provenance: {
    origin: string
    captured_at?: string
    source_reference: string
  }
  candidate_status: 'proposed'
  requires_human_review: true
  pedagogical_relevance_candidate: boolean
}

export type EvidenceReferenceOutput = {
  evidence_reference_id: string
  evidence_candidate_id: string
  relationship_type: string
}

export type LearningSignalProposalOutput = {
  proposal_id: string
  student_id: string
  signal_type: string
  signal: string
  evidence_reference_ids: string[]
  detection_rationale: string
  candidate_status: 'proposed'
  suggested_domain_transition?: {
    target_state: string
    requires_authorization: true
    authorized: false
  }
  is_official: false
  requires_human_review: true
  confidence?: number
}

export type TeacherInsightProposalOutput = {
  insight_proposal_id: string
  student_id: string
  lesson_id: string
  insight: string
  basis: string
  evidence_reference_ids: string[]
  is_official: false
  requires_human_review: true
  author_type: 'ai'
}

export type PromptOneOutput = {
  schema_version: 'phase-b-prompt-1.v3'
  artifact_status: 'draft'
  authority_status: 'non_authoritative'
  implementation_status: 'not_proven'
  lesson_input: LessonInputOutput
  lesson_observations: LessonObservationOutput[]
  evidence_candidates: EvidenceCandidateOutput[]
  evidence_references: EvidenceReferenceOutput[]
  learning_signal_proposals: LearningSignalProposalOutput[]
  teacher_insight_proposals: TeacherInsightProposalOutput[]
  presentation_candidates: {
    class_report_facts: string[]
    student_facing_summary?: string
    vocabulary_candidates: string[]
    grammar_focus_candidates: string[]
    homework_recommendation?: {
      mode: string
      task: string
      is_official: false
      requires_teacher_review: true
    }
  }
  domain_transition_requests: unknown[]
  official_actions: unknown[]
  ser_update: {
    requested: false
    reason: string
    new_ser_version_created: false
  }
  learning_journey_update: {
    requested: false
    reason: string
  }
  institutional_memory_update: {
    requested: false
    reason: string
  }
  traceability: {
    architecture_principles: string[]
    business_rules_candidates: string[]
    invariants_checked: string[]
  }
}

export type PromptTwoInput = {
  report_context: {
    lesson_id: string
    student_id: string
    student_name?: string
    teacher_id?: string
    teacher_name?: string
    program?: string
    class_date?: string
    attendance_status?: AttendanceStatus
    attendance_source?: string
    transcript_id?: string
    report_id: string
    effective_at?: string
    generated_at: string
  }
  source_status: {
    lesson_status: string
    evidence_status: string | null
    evidence_classification_status: string | null
    evidence_persistence_status: string | null
    teacher_insight_status: string | null
    pedagogical_decision_status: string | null
    educational_action_status: string | null
    ser_status: string | null
  }
  authorized_facts: string[]
  validated_evidence: Array<{ evidence_id: string; content: string; source_reference: string }>
  published_teacher_insight: {
    insight_id: string
    state: 'InsightPublished'
    event_that_confirmed_publication: string
    text: string
    evidence_ids: string[]
    author: { teacher_id?: string; teacher_name?: string; author_type: 'human_teacher' }
    published_at?: string
  } | null
  non_authoritative_proposals: {
    evidence_candidates: EvidenceCandidateOutput[]
    learning_signal_proposals: LearningSignalProposalOutput[]
    teacher_insight_proposals: TeacherInsightProposalOutput[]
  }
  validated_learning_content: {
    vocabulary: Array<{ category: string; item: string; type?: string; meaning: string; example?: string; source: string }>
    corrections: Array<{ type: string; original: string; improved: string; explanation: string; evidence_ids: string[]; status: string }>
    grammar_focus: string[]
    questions: string[]
  }
}

export type ClassReportOutput = {
  reportId: string
  lessonId: string
  studentId: string
  generatedAt: string
  promptVersion: 'prompt-2.v2.0'
  projectionVersion: string
  authorityStatus: 'non_authoritative'
  sourceReferences: string[]
  title: string
  markdown: string
  summary: string
  evidenceHighlights: string[]
  grammarFocus: string[]
  vocabulary: string[]
  corrections: Array<{ original: string; improved: string; explanation: string; evidenceIds: string[] }>
  homeworkRecommendation?: string
  teacherInsight: string | null
  teacherInsightStatus: 'published' | 'omitted' | 'non_official_observation'
  sourceEvidenceIds: string[]
  documentStatus: 'draft' | 'published'
  implementationStatus: 'not_proven'
}

export type ProjectionSourceReference = {
  source_type: string
  source_id: string
}

export type PortfolioPatchOperation = {
  operation_id: string
  type: 'upsert_attendance_projection' | 'append_unique_date' | 'append_class_report_reference' | 'merge_unique_vocabulary_item' | 'merge_unique_correction' | 'conditional_update_projection'
  target: string
  precondition?: string
  parameters: Record<string, unknown>
  idempotent: true
}

export type ExcludedProjectionOperation = {
  type: string
  status: 'rejected'
  reason: string
}

export type PortfolioPatchOutput = {
  patch_schema_version: 'portfolio-projection-patch.v3'
  patch_id: string
  operation_key: string
  portfolio_id: string
  student_id: string
  base_projection_version: number
  expected_projection_version: number
  idempotency: {
    strategy: 'operation_key'
    duplicate_behavior: 'return_noop_without_reapplying_operations'
  }
  source_references: ProjectionSourceReference[]
  operations: PortfolioPatchOperation[]
  excluded_operations: ExcludedProjectionOperation[]
  validation: {
    authorization: 'passed' | 'rejected'
    projection_version: 'checked'
    idempotency_key: 'checked'
    deduplication: 'checked'
    ordering: 'checked'
    history_preserved: 'checked'
    referential_integrity: 'checked'
  }
  documentStatus: 'draft'
  implementationStatus: 'not_proven'
}

export type CoachingSourceReference = {
  source_type: 'Evidence' | 'LearningSignal' | 'TeacherInsight' | 'ClassReportProjection' | 'PortfolioProjection'
  source_id: string
}

export type CoachingPriority = {
  priority_id: string
  text: string
  basis: string[]
  authority: 'recommendation_only'
}

export type CoachingProposedAction = {
  action_proposal_id: string
  text: string
  state: 'proposal_only'
  educational_action_created: false
  requires_teacher_decision: true
}

export type CoachingGuidanceOutput = {
  coaching_guidance_id: string
  student_id: string
  teacher_id?: string
  studentSnapshot: string[]
  topTeachingPriorities: CoachingPriority[]
  recurringErrorsToRecycle: Array<{ text: string; sourceIds: string[] }>
  vocabularyToRecycle: string[]
  recommendedNextClassStrategy: string
  suggestedHomeworkStrategy?: string
  teacherAlert?: string
  recommendationStatus: 'ai_proposed'
  is_pedagogical_decision: false
  requiresHumanReview: true
  source_references: CoachingSourceReference[]
  proposed_actions: CoachingProposedAction[]
  domain_events_emitted: []
  pedagogical_decision_created: false
  educational_action_created: false
  ser_changed: false
  learning_journey_changed: false
  institutional_memory_changed: false
  documentStatus: 'draft'
  implementationStatus: 'not_proven'
}

export type PipelineResult = {
  pipelineRunId: string
  status: string
  duplicate: boolean
  report: ClassReportOutput
  coaching: CoachingGuidanceOutput
}
