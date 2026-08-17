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

export type ClassReportOutput = {
  title: string
  summary: string
  evidenceHighlights: string[]
  grammarFocus: string[]
  vocabulary: string[]
  homeworkRecommendation?: string
  teacherInsight: string | null
  sourceEvidenceIds: string[]
  documentStatus: 'draft'
  implementationStatus: 'not_proven'
}

export type PortfolioPatchOutput = {
  operations: Array<{
    op: 'append_class_report' | 'merge_vocabulary_item' | 'update_feedback_projection'
    key: string
    value: unknown
    sourceIds: string[]
  }>
  documentStatus: 'draft'
  implementationStatus: 'not_proven'
}

export type CoachingGuidanceOutput = {
  studentSnapshot: string[]
  topTeachingPriorities: Array<{ text: string; sourceIds: string[] }>
  recurringErrorsToRecycle: Array<{ text: string; sourceIds: string[] }>
  vocabularyToRecycle: string[]
  recommendedNextClassStrategy: string
  suggestedHomeworkStrategy?: string
  teacherAlert?: string
  recommendationStatus: 'ai_proposed'
  requiresHumanReview: true
}

export type PipelineResult = {
  pipelineRunId: string
  status: string
  duplicate: boolean
  report: ClassReportOutput
  coaching: CoachingGuidanceOutput
}
