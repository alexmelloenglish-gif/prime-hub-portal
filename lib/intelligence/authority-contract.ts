export const CANDIDATE_AUTHORITY_STATUS = 'candidate' as const
export const CANDIDATE_REQUIRES_REVIEW = true as const
export const CANONICAL_AUTHORITY_STATUS = 'canonical' as const
export const AUTOMATIC_PUBLICATION_ALLOWED = false as const

export const TEACHER_DECISIONS = ['approved', 'edited', 'rejected'] as const
export type TeacherDecision = (typeof TEACHER_DECISIONS)[number]

export const AUTHORITY_TRANSITIONS = ['teacher_validated', 'teacher_rejected'] as const
export type AuthorityTransition = (typeof AUTHORITY_TRANSITIONS)[number]

export const PROJECTION_STATUSES = ['authorized_not_projected', 'projected', 'failed'] as const
export type ProjectionStatus = (typeof PROJECTION_STATUSES)[number]

export type CandidateRecordInput = {
  candidateKey: string
  lessonId: string
  studentEmail: string
  sourceType: string
  sourceRef: string
  sourceHash: string
  sourceOccurredAt?: Date | null
  candidateType: string
  payload: unknown
  provenance: unknown
  promptVersion?: string | null
  processorVersion?: string | null
}

export type TeacherDecisionInput = {
  candidateRecordId: string
  decision: TeacherDecision
  reviewerId: string
  reason?: string | null
  reviewedPayload?: unknown
}

export type CanonicalizationInput = {
  candidateRecordId: string
  reviewTransitionId: string
  canonicalRecordKey: string
  canonicalizedBy: string
}

export type ProjectionAuthorizationInput = {
  canonicalizationId: string
  projectionKey: string
  authorizedBy: string
}

export class AuthorityFirewallError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'AuthorityFirewallError'
    this.code = code
  }
}

function required(value: string, field: string): string {
  const normalized = value.trim()
  if (!normalized) throw new AuthorityFirewallError('INVALID_AUTHORITY_INPUT', `${field} is required`)
  return normalized
}

export function normalizeCandidateRecord(input: CandidateRecordInput) {
  return {
    candidateKey: required(input.candidateKey, 'candidateKey'),
    lessonId: required(input.lessonId, 'lessonId'),
    studentEmail: required(input.studentEmail, 'studentEmail').toLowerCase(),
    sourceType: required(input.sourceType, 'sourceType'),
    sourceRef: required(input.sourceRef, 'sourceRef'),
    sourceHash: required(input.sourceHash, 'sourceHash'),
    sourceOccurredAt: input.sourceOccurredAt ?? null,
    candidateType: required(input.candidateType, 'candidateType'),
    payload: input.payload,
    provenance: input.provenance,
    promptVersion: input.promptVersion?.trim() || null,
    processorVersion: input.processorVersion?.trim() || null,
    authorityStatus: CANDIDATE_AUTHORITY_STATUS,
    requiresReview: CANDIDATE_REQUIRES_REVIEW,
    generatedBy: 'ai',
  }
}

export function authorityTransitionForDecision(decision: TeacherDecision): AuthorityTransition {
  return decision === 'rejected' ? 'teacher_rejected' : 'teacher_validated'
}

export function assertTeacherDecisionCanCanonicalize(decision: TeacherDecision): void {
  if (decision === 'rejected') {
    throw new AuthorityFirewallError(
      'REJECTED_CANDIDATE_CANNOT_CANONICALIZE',
      'A rejected candidate cannot cross the canonical authority boundary.',
    )
  }
}

export function resolveCanonicalPayload(input: {
  decision: TeacherDecision
  candidatePayload: unknown
  reviewedPayload?: unknown | null
}): unknown {
  assertTeacherDecisionCanCanonicalize(input.decision)
  if (input.decision === 'edited') {
    if (input.reviewedPayload === undefined || input.reviewedPayload === null) {
      throw new AuthorityFirewallError(
        'EDITED_DECISION_REQUIRES_REVIEWED_PAYLOAD',
        'An edited teacher decision requires an explicit reviewed payload.',
      )
    }
    return input.reviewedPayload
  }
  return input.candidatePayload
}

export function assertExplicitProjectionAuthorization(input: {
  canonicalAuthorityStatus: string
  reviewDecision: string
  authorityTransition: string
  requestedBy: string
}): void {
  if (AUTOMATIC_PUBLICATION_ALLOWED) {
    throw new AuthorityFirewallError('FIREWALL_CONFIGURATION_INVALID', 'Automatic publication must remain disabled.')
  }
  if (input.canonicalAuthorityStatus !== CANONICAL_AUTHORITY_STATUS) {
    throw new AuthorityFirewallError('CANONICAL_AUTHORITY_REQUIRED', 'Projection requires a canonicalized record.')
  }
  if (input.reviewDecision !== 'approved' && input.reviewDecision !== 'edited') {
    throw new AuthorityFirewallError('TEACHER_APPROVAL_REQUIRED', 'Projection requires a teacher-approved decision.')
  }
  if (input.authorityTransition !== 'teacher_validated') {
    throw new AuthorityFirewallError('TEACHER_AUTHORITY_TRANSITION_REQUIRED', 'Projection requires a teacher authority transition.')
  }
  required(input.requestedBy, 'requestedBy')
}

export function assertNoAutomaticPublication(trigger: string): never {
  throw new AuthorityFirewallError(
    'AUTOMATIC_PUBLICATION_BLOCKED',
    `Automatic publication is structurally blocked for NEW INTELLIGENCE (${required(trigger, 'trigger')}).`,
  )
}
