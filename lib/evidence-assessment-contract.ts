export const PROCESSING_STATES = ['NOT_STARTED', 'RUNNING', 'COMPLETED', 'FAILED'] as const
export const EVIDENCE_STATES = ['NONE', 'SOURCE_ONLY', 'CANDIDATES_FOUND', 'VALIDATED'] as const
export const ASSESSMENT_STATES = ['NOT_ASSESSED', 'REVIEW_REQUIRED', 'TEACHER_VALIDATED'] as const
export const REPORT_STATES = ['NONE', 'PLACEHOLDER', 'DRAFT', 'VALIDATED', 'PUBLISHED'] as const

export type ProcessingState = (typeof PROCESSING_STATES)[number]
export type EvidenceState = (typeof EVIDENCE_STATES)[number]
export type AssessmentState = (typeof ASSESSMENT_STATES)[number]
export type ReportState = (typeof REPORT_STATES)[number]

export type CanonicalLearningLifecycle = {
  processing: ProcessingState
  evidence: EvidenceState
  assessment: AssessmentState
  report: ReportState
}

export type LifecycleAxis = keyof CanonicalLearningLifecycle
export type LifecycleValue = CanonicalLearningLifecycle[LifecycleAxis]

export type LifecycleValidationIssue = {
  axis: LifecycleAxis | 'publication'
  code: string
  message: string
}

const normalizeToken = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const token = value.trim().toUpperCase().replace(/[\s-]+/g, '_')
  return token || null
}

const PROCESSING_ALIASES: Readonly<Record<string, ProcessingState>> = {
  NOT_STARTED: 'NOT_STARTED', RECEIVED: 'NOT_STARTED', PENDING: 'NOT_STARTED', QUEUED: 'NOT_STARTED',
  RUNNING: 'RUNNING', PROCESSING: 'RUNNING', IN_PROGRESS: 'RUNNING',
  COMPLETED: 'COMPLETED', COMPLETE: 'COMPLETED', SUCCEEDED: 'COMPLETED', SUCCESS: 'COMPLETED',
  FAILED: 'FAILED', ERROR: 'FAILED',
}

const EVIDENCE_ALIASES: Readonly<Record<string, EvidenceState>> = {
  NONE: 'NONE', SOURCE_ONLY: 'SOURCE_ONLY', SOURCE: 'SOURCE_ONLY',
  CANDIDATES_FOUND: 'CANDIDATES_FOUND', CANDIDATES: 'CANDIDATES_FOUND', PROPOSED: 'CANDIDATES_FOUND',
  VALIDATED: 'VALIDATED', ACCEPTED: 'VALIDATED', TEACHER_VALIDATED: 'VALIDATED',
}

const ASSESSMENT_ALIASES: Readonly<Record<string, AssessmentState>> = {
  NOT_ASSESSED: 'NOT_ASSESSED', REVIEW_REQUIRED: 'REVIEW_REQUIRED', NEEDS_REVIEW: 'REVIEW_REQUIRED',
  PENDING_REVIEW: 'REVIEW_REQUIRED', TEACHER_VALIDATED: 'TEACHER_VALIDATED',
  VALIDATED: 'TEACHER_VALIDATED', APPROVED: 'TEACHER_VALIDATED',
}

const REPORT_ALIASES: Readonly<Record<string, ReportState>> = {
  NONE: 'NONE', PLACEHOLDER: 'PLACEHOLDER', NOT_PROVEN: 'PLACEHOLDER',
  DRAFT: 'DRAFT', PROJECTION_DRAFT: 'DRAFT', VALIDATED: 'VALIDATED', APPROVED: 'VALIDATED',
  PUBLISHED: 'PUBLISHED', PROJECTION_PUBLISHED: 'PUBLISHED',
}

function normalizeWithAliases<T extends string>(value: unknown, aliases: Readonly<Record<string, T>>): T | null {
  const token = normalizeToken(value)
  return token ? aliases[token] ?? null : null
}

export const normalizeProcessingState = (value: unknown): ProcessingState | null =>
  normalizeWithAliases(value, PROCESSING_ALIASES)
export const normalizeEvidenceState = (value: unknown): EvidenceState | null =>
  normalizeWithAliases(value, EVIDENCE_ALIASES)
export const normalizeAssessmentState = (value: unknown): AssessmentState | null =>
  normalizeWithAliases(value, ASSESSMENT_ALIASES)
export const normalizeReportState = (value: unknown): ReportState | null =>
  normalizeWithAliases(value, REPORT_ALIASES)

export function normalizeLifecycle(input: {
  processing?: unknown
  evidence?: unknown
  assessment?: unknown
  report?: unknown
}): Partial<CanonicalLearningLifecycle> {
  const processing = normalizeProcessingState(input.processing)
  const evidence = normalizeEvidenceState(input.evidence)
  const assessment = normalizeAssessmentState(input.assessment)
  const report = normalizeReportState(input.report)

  return {
    ...(processing ? { processing } : {}),
    ...(evidence ? { evidence } : {}),
    ...(assessment ? { assessment } : {}),
    ...(report ? { report } : {}),
  }
}

const PROCESSING_TRANSITIONS: Readonly<Record<ProcessingState, readonly ProcessingState[]>> = {
  NOT_STARTED: ['RUNNING'], RUNNING: ['COMPLETED', 'FAILED'], COMPLETED: [], FAILED: ['RUNNING'],
}
const EVIDENCE_TRANSITIONS: Readonly<Record<EvidenceState, readonly EvidenceState[]>> = {
  NONE: ['SOURCE_ONLY'], SOURCE_ONLY: ['CANDIDATES_FOUND'],
  CANDIDATES_FOUND: ['VALIDATED', 'SOURCE_ONLY'], VALIDATED: ['CANDIDATES_FOUND'],
}
const ASSESSMENT_TRANSITIONS: Readonly<Record<AssessmentState, readonly AssessmentState[]>> = {
  NOT_ASSESSED: ['REVIEW_REQUIRED'], REVIEW_REQUIRED: ['TEACHER_VALIDATED', 'NOT_ASSESSED'],
  TEACHER_VALIDATED: ['REVIEW_REQUIRED'],
}
const REPORT_TRANSITIONS: Readonly<Record<ReportState, readonly ReportState[]>> = {
  NONE: ['PLACEHOLDER', 'DRAFT'], PLACEHOLDER: ['DRAFT', 'NONE'], DRAFT: ['VALIDATED', 'PLACEHOLDER'],
  VALIDATED: ['PUBLISHED', 'DRAFT'], PUBLISHED: ['VALIDATED'],
}

export function canTransition(axis: 'processing', from: ProcessingState, to: ProcessingState): boolean
export function canTransition(axis: 'evidence', from: EvidenceState, to: EvidenceState): boolean
export function canTransition(axis: 'assessment', from: AssessmentState, to: AssessmentState): boolean
export function canTransition(axis: 'report', from: ReportState, to: ReportState): boolean
export function canTransition(axis: LifecycleAxis, from: LifecycleValue, to: LifecycleValue): boolean {
  if (from === to) return true
  switch (axis) {
    case 'processing': return PROCESSING_TRANSITIONS[from as ProcessingState].includes(to as ProcessingState)
    case 'evidence': return EVIDENCE_TRANSITIONS[from as EvidenceState].includes(to as EvidenceState)
    case 'assessment': return ASSESSMENT_TRANSITIONS[from as AssessmentState].includes(to as AssessmentState)
    case 'report': return REPORT_TRANSITIONS[from as ReportState].includes(to as ReportState)
  }
}

export function validateTransition(axis: 'processing', from: ProcessingState, to: ProcessingState): LifecycleValidationIssue[]
export function validateTransition(axis: 'evidence', from: EvidenceState, to: EvidenceState): LifecycleValidationIssue[]
export function validateTransition(axis: 'assessment', from: AssessmentState, to: AssessmentState): LifecycleValidationIssue[]
export function validateTransition(axis: 'report', from: ReportState, to: ReportState): LifecycleValidationIssue[]
export function validateTransition(axis: LifecycleAxis, from: LifecycleValue, to: LifecycleValue): LifecycleValidationIssue[] {
  const allowed = (() => {
    switch (axis) {
      case 'processing': return canTransition('processing', from as ProcessingState, to as ProcessingState)
      case 'evidence': return canTransition('evidence', from as EvidenceState, to as EvidenceState)
      case 'assessment': return canTransition('assessment', from as AssessmentState, to as AssessmentState)
      case 'report': return canTransition('report', from as ReportState, to as ReportState)
    }
  })()

  return allowed ? [] : [{ axis, code: 'INVALID_TRANSITION', message: `${axis} cannot transition from ${from} to ${to}` }]
}

export function validateLifecycle(state: CanonicalLearningLifecycle): LifecycleValidationIssue[] {
  const issues: LifecycleValidationIssue[] = []
  if (!PROCESSING_STATES.includes(state.processing)) issues.push({ axis: 'processing', code: 'INVALID_PROCESSING_STATE', message: `Unknown processing state: ${state.processing}` })
  if (!EVIDENCE_STATES.includes(state.evidence)) issues.push({ axis: 'evidence', code: 'INVALID_EVIDENCE_STATE', message: `Unknown evidence state: ${state.evidence}` })
  if (!ASSESSMENT_STATES.includes(state.assessment)) issues.push({ axis: 'assessment', code: 'INVALID_ASSESSMENT_STATE', message: `Unknown assessment state: ${state.assessment}` })
  if (!REPORT_STATES.includes(state.report)) issues.push({ axis: 'report', code: 'INVALID_REPORT_STATE', message: `Unknown report state: ${state.report}` })
  return issues
}

export type PublicationReadiness = { ready: boolean; issues: LifecycleValidationIssue[] }

export function evaluatePublicationReadiness(state: CanonicalLearningLifecycle): PublicationReadiness {
  const issues = validateLifecycle(state)
  if (state.evidence !== 'VALIDATED') issues.push({ axis: 'publication', code: 'EVIDENCE_NOT_VALIDATED', message: 'A new canonical publication requires validated evidence.' })
  if (state.assessment !== 'TEACHER_VALIDATED') issues.push({ axis: 'publication', code: 'ASSESSMENT_NOT_TEACHER_VALIDATED', message: 'A new canonical publication requires teacher-validated assessment.' })
  if (state.report !== 'VALIDATED' && state.report !== 'PUBLISHED') issues.push({ axis: 'publication', code: 'REPORT_NOT_VALIDATED', message: 'A report must be validated before it can cross the publication boundary.' })
  return { ready: issues.length === 0, issues }
}

export const CANONICAL_LIFECYCLE_EXAMPLE: CanonicalLearningLifecycle = {
  processing: 'COMPLETED',
  evidence: 'NONE',
  assessment: 'NOT_ASSESSED',
  report: 'PLACEHOLDER',
}
