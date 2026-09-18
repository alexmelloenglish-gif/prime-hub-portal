/**
 * Canonical Learning Record Contract v1
 *
 * Implementation Gate G1 only.
 *
 * This file defines the semantic contract for the durable post-authority record.
 * It does not perform canonicalization, persistence, read-back verification,
 * projection, migration, or historical backfill.
 *
 * Evidence baseline:
 * - Audit commit: 43b2de7f878201db16355ffde258a50a8524dcf4
 * - ADR-001 commit: 5b8ca3da92a89dc99abe8997a6139e5a9f6a1555
 * - Remediation Spec commit: 934e092f4941a74d2570f8bc3b140b0861996d90
 */

export const CANONICAL_LEARNING_RECORD_SCHEMA_VERSION =
  'canonical-learning-record-v1' as const

export const CANONICAL_LEARNING_RECORD_HASH_ALGORITHM = 'sha256' as const

export type CanonicalDecisionType = 'accepted' | 'edited' | 'bounded'

export type CanonicalScopeType = 'lesson' | 'longitudinal'

export type CanonicalRecordHashAlgorithm =
  typeof CANONICAL_LEARNING_RECORD_HASH_ALGORITHM

export type CanonicalSourceReference = {
  sourceType: string
  sourceRef: string
  sourceHash?: string | null
}

export type CanonicalProposalReferences = {
  evidenceCandidateIds?: string[]
  learningSignalProposalIds?: string[]
  teacherInsightProposalIds?: string[]
  reviewTaskIds?: string[]
  validationTaskIds?: string[]
}

export type CanonicalValidatedEvidence = {
  evidenceId?: string
  statement: string
  sourceRefs?: string[]
  sourceSpan?: string | null
}

export type CanonicalLearningSignal = {
  signalId?: string
  statement: string
  evidenceRefs?: string[]
}

export type CanonicalTeacherInsight = {
  statement: string
  evidenceRefs?: string[]
  signalRefs?: string[]
}

export type CanonicalVocabularyFact = {
  term: string
  meaning?: string | null
  evidenceRefs?: string[]
}

export type CanonicalGrammarCorrectionFact = {
  item: string
  correction?: string | null
  evidenceRefs?: string[]
}

export type CanonicalNextAction = {
  text: string
  evidenceRefs?: string[]
}

export type CanonicalLearningRecordPayload = {
  validatedEvidence?: CanonicalValidatedEvidence[]
  learningSignals?: CanonicalLearningSignal[]
  teacherInsight?: CanonicalTeacherInsight | null
  evidenceBoundaries?: string[]
  nextVerification?: string | null
  vocabulary?: CanonicalVocabularyFact[]
  grammarCorrections?: CanonicalGrammarCorrectionFact[]
  learnerStateChange?: Record<string, unknown> | null
  priorityChange?: Record<string, unknown> | null
  nextAction?: CanonicalNextAction | null
}

/**
 * Input whose human authority has already been established.
 *
 * G2 will be responsible for validating this authority transition,
 * computing the canonical version/hash, and persisting it atomically.
 */
export type AuthorizedCanonicalizationInput = {
  studentId: string
  studentEmail?: string | null

  scopeType: CanonicalScopeType
  scopeKey: string
  lessonId?: string | null

  sourceReferences: CanonicalSourceReference[]
  transcriptId?: string | null
  pipelineRunId?: string | null
  proposalReferences?: CanonicalProposalReferences | null

  teacherDecisionId: string
  reviewerId: string
  reviewerRole: string
  decisionType: CanonicalDecisionType
  authorityScope: string
  decisionTimestamp: string

  pedagogicalPayload: CanonicalLearningRecordPayload
}

/**
 * Durable immutable record shape after canonicalization.
 *
 * Presence of this object means canonical state exists only after G2 persists it.
 * Presence of a Teacher Decision alone must never be represented as this type.
 */
export type CanonicalLearningRecord = AuthorizedCanonicalizationInput & {
  canonicalRecordId: string
  schemaVersion: typeof CANONICAL_LEARNING_RECORD_SCHEMA_VERSION
  canonicalVersion: number
  canonicalHash: string
  hashAlgorithm: CanonicalRecordHashAlgorithm
  canonicalizedAt: string
  supersedesRecordId?: string | null
}

/**
 * Fields included in the deterministic hash envelope.
 *
 * Generated record IDs and persistence timestamps are deliberately excluded so
 * retries of the same authority transition can produce the same content hash.
 * G2 owns canonical JSON serialization and hash computation.
 */
export type CanonicalLearningRecordHashEnvelope = {
  schemaVersion: typeof CANONICAL_LEARNING_RECORD_SCHEMA_VERSION
  studentId: string
  scopeType: CanonicalScopeType
  scopeKey: string
  lessonId?: string | null
  canonicalVersion: number

  sourceReferences: CanonicalSourceReference[]
  transcriptId?: string | null
  pipelineRunId?: string | null
  proposalReferences?: CanonicalProposalReferences | null

  teacherDecisionId: string
  reviewerId: string
  reviewerRole: string
  decisionType: CanonicalDecisionType
  authorityScope: string
  decisionTimestamp: string

  pedagogicalPayload: CanonicalLearningRecordPayload
}

/**
 * G1 invariant: missing information remains missing.
 *
 * This helper removes only properties whose value is undefined. It does not
 * synthesize defaults for optional pedagogical content.
 */
export function omitUndefined<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}
