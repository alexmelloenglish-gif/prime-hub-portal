import { createHash } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import {
  CANONICAL_LEARNING_RECORD_HASH_ALGORITHM,
  CANONICAL_LEARNING_RECORD_SCHEMA_VERSION,
  type AuthorizedCanonicalizationInput,
  type CanonicalLearningRecordHashEnvelope,
} from '@/lib/canonical-learning-record-contract'

export type CanonicalizationAuthoritySourceType = 'review_task' | 'validation_task'

export type CanonicalizationCommand = AuthorizedCanonicalizationInput & {
  authoritySourceType: CanonicalizationAuthoritySourceType
}

export type CanonicalizationResult = {
  canonicalRecordId: string
  canonicalVersion: number
  canonicalHash: string
  provenanceId: string
  idempotencyKey: string
  idempotentReplay: boolean
}

export class CanonicalizationError extends Error {
  constructor(
    public readonly code:
      | 'INVALID_COMMAND'
      | 'AUTHORITY_NOT_FOUND'
      | 'AUTHORITY_NOT_APPROVED'
      | 'AUTHORITY_MISMATCH'
      | 'IDEMPOTENCY_CONFLICT'
      | 'CONCURRENCY_CONFLICT',
    message: string,
  ) {
    super(message)
    this.name = 'CanonicalizationError'
  }
}

function requireText(value: string | null | undefined, field: string): string {
  const normalized = value?.trim()
  if (!normalized) {
    throw new CanonicalizationError('INVALID_COMMAND', `${field} is required`)
  }
  return normalized
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function parseDecisionTimestamp(value: string) {
  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) {
    throw new CanonicalizationError('INVALID_COMMAND', 'decisionTimestamp must be a valid ISO timestamp')
  }
  return timestamp
}

function stableNormalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => stableNormalize(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableNormalize(item)]),
    )
  }
  return value
}

function stableJson(value: unknown) {
  return JSON.stringify(stableNormalize(value))
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

export function createCanonicalizationIdempotencyKey(
  input: Pick<CanonicalizationCommand, 'studentId' | 'teacherDecisionId' | 'scopeType' | 'scopeKey'>,
) {
  const identity = [
    'canonicalize',
    CANONICAL_LEARNING_RECORD_SCHEMA_VERSION,
    requireText(input.studentId, 'studentId'),
    requireText(input.teacherDecisionId, 'teacherDecisionId'),
    input.scopeType,
    requireText(input.scopeKey, 'scopeKey'),
  ].join('|')

  return `clr:${createHash('sha256').update(identity).digest('hex')}`
}

function buildHashEnvelope(
  input: CanonicalizationCommand,
  canonicalVersion: number,
): CanonicalLearningRecordHashEnvelope {
  return {
    schemaVersion: CANONICAL_LEARNING_RECORD_SCHEMA_VERSION,
    studentId: input.studentId,
    scopeType: input.scopeType,
    scopeKey: input.scopeKey,
    lessonId: input.lessonId ?? null,
    canonicalVersion,
    sourceReferences: input.sourceReferences,
    transcriptId: input.transcriptId ?? null,
    pipelineRunId: input.pipelineRunId ?? null,
    proposalReferences: input.proposalReferences ?? null,
    teacherDecisionId: input.teacherDecisionId,
    reviewerId: input.reviewerId,
    reviewerRole: input.reviewerRole,
    decisionType: input.decisionType,
    authorityScope: input.authorityScope,
    decisionTimestamp: input.decisionTimestamp,
    pedagogicalPayload: input.pedagogicalPayload,
  }
}

export function computeCanonicalRecordHash(
  input: CanonicalizationCommand,
  canonicalVersion: number,
) {
  const envelope = buildHashEnvelope(input, canonicalVersion)
  return createHash(CANONICAL_LEARNING_RECORD_HASH_ALGORITHM)
    .update(stableJson(envelope))
    .digest('hex')
}

function validateCommand(input: CanonicalizationCommand) {
  requireText(input.studentId, 'studentId')
  requireText(input.teacherDecisionId, 'teacherDecisionId')
  requireText(input.reviewerId, 'reviewerId')
  requireText(input.reviewerRole, 'reviewerRole')
  requireText(input.authorityScope, 'authorityScope')
  requireText(input.scopeKey, 'scopeKey')
  parseDecisionTimestamp(input.decisionTimestamp)

  if (!input.sourceReferences.length) {
    throw new CanonicalizationError('INVALID_COMMAND', 'At least one source reference is required')
  }

  for (const source of input.sourceReferences) {
    requireText(source.sourceType, 'sourceReferences.sourceType')
    requireText(source.sourceRef, 'sourceReferences.sourceRef')
  }

  if (input.scopeType === 'lesson' && !input.lessonId?.trim()) {
    throw new CanonicalizationError('INVALID_COMMAND', 'lessonId is required for lesson-scoped canonicalization')
  }
}

async function assertAuthorizedReviewer(
  tx: Prisma.TransactionClient,
  input: CanonicalizationCommand,
) {
  const reviewer = await tx.user.findUnique({
    where: { id: input.reviewerId },
    select: { role: true },
  })

  if (!reviewer || !['admin', 'teacher'].includes(reviewer.role)) {
    throw new CanonicalizationError(
      'AUTHORITY_MISMATCH',
      'Canonicalization reviewer must resolve to a persisted teacher or administrator',
    )
  }

  if (reviewer.role !== input.reviewerRole) {
    throw new CanonicalizationError(
      'AUTHORITY_MISMATCH',
      'reviewerRole does not match the persisted reviewer role',
    )
  }
}

async function assertTeacherDecision(
  tx: Prisma.TransactionClient,
  input: CanonicalizationCommand,
) {
  await assertAuthorizedReviewer(tx, input)
  const expectedDecisionTime = parseDecisionTimestamp(input.decisionTimestamp)

  if (input.authoritySourceType === 'review_task') {
    const task = await tx.reviewTask.findUnique({
      where: { id: input.teacherDecisionId },
    })

    if (!task) {
      throw new CanonicalizationError('AUTHORITY_NOT_FOUND', 'ReviewTask teacher decision was not found')
    }
    if (task.decision !== 'approved' || !task.reviewerId || !task.reviewedAt) {
      throw new CanonicalizationError('AUTHORITY_NOT_APPROVED', 'ReviewTask is not an approved human decision')
    }
    if (task.reviewerId !== input.reviewerId) {
      throw new CanonicalizationError('AUTHORITY_MISMATCH', 'ReviewTask reviewer does not match canonicalization input')
    }
    if (task.reviewedAt.getTime() !== expectedDecisionTime.getTime()) {
      throw new CanonicalizationError('AUTHORITY_MISMATCH', 'ReviewTask decision timestamp does not match canonicalization input')
    }
    if (input.studentEmail && normalizeEmail(task.studentEmail) !== normalizeEmail(input.studentEmail)) {
      throw new CanonicalizationError('AUTHORITY_MISMATCH', 'ReviewTask student does not match canonicalization input')
    }
    if (input.lessonId && task.lessonId !== input.lessonId) {
      throw new CanonicalizationError('AUTHORITY_MISMATCH', 'ReviewTask lesson does not match canonicalization input')
    }
    if (input.pipelineRunId && task.pipelineRunId !== input.pipelineRunId) {
      throw new CanonicalizationError('AUTHORITY_MISMATCH', 'ReviewTask pipeline run does not match canonicalization input')
    }

    // Identity review alone is insufficient pedagogical authority. The existing
    // pipeline persists this event only for the human publication decision.
    const publicationApproval = await tx.pipelineEvent.findFirst({
      where: {
        pipelineRunId: task.pipelineRunId,
        eventType: 'PublicationReviewApproved',
        aggregateId: task.id,
      },
      select: { id: true },
    })

    if (!publicationApproval) {
      throw new CanonicalizationError(
        'AUTHORITY_NOT_APPROVED',
        'ReviewTask does not have a persisted PublicationReviewApproved authority event',
      )
    }

    return
  }

  const task = await tx.validationTask.findUnique({
    where: { id: input.teacherDecisionId },
  })

  if (!task) {
    throw new CanonicalizationError('AUTHORITY_NOT_FOUND', 'ValidationTask teacher decision was not found')
  }
  if (
    task.type !== 'canonical_learning_record_authority' ||
    task.decision !== 'approved' ||
    task.status !== 'approved' ||
    !task.reviewerId ||
    !task.reviewedAt
  ) {
    throw new CanonicalizationError(
      'AUTHORITY_NOT_APPROVED',
      'ValidationTask is not an approved canonical-learning authority decision',
    )
  }
  if (task.reviewerId !== input.reviewerId) {
    throw new CanonicalizationError('AUTHORITY_MISMATCH', 'ValidationTask reviewer does not match canonicalization input')
  }
  if (task.reviewedAt.getTime() !== expectedDecisionTime.getTime()) {
    throw new CanonicalizationError('AUTHORITY_MISMATCH', 'ValidationTask decision timestamp does not match canonicalization input')
  }
  if (input.studentEmail && task.studentEmail && normalizeEmail(task.studentEmail) !== normalizeEmail(input.studentEmail)) {
    throw new CanonicalizationError('AUTHORITY_MISMATCH', 'ValidationTask student does not match canonicalization input')
  }
  if (input.lessonId && task.lessonId && task.lessonId !== input.lessonId) {
    throw new CanonicalizationError('AUTHORITY_MISMATCH', 'ValidationTask lesson does not match canonicalization input')
  }
}

function assertIdempotentPayloadMatches(
  input: CanonicalizationCommand,
  existing: {
    canonicalVersion: number
    canonicalHash: string
    studentId: string
    scopeType: string
    scopeKey: string
    teacherDecisionId: string
  },
) {
  if (
    existing.studentId !== input.studentId ||
    existing.scopeType !== input.scopeType ||
    existing.scopeKey !== input.scopeKey ||
    existing.teacherDecisionId !== input.teacherDecisionId
  ) {
    throw new CanonicalizationError(
      'IDEMPOTENCY_CONFLICT',
      'Existing idempotency record is bound to a different authority transition',
    )
  }

  const expectedHash = computeCanonicalRecordHash(input, existing.canonicalVersion)
  if (expectedHash !== existing.canonicalHash) {
    throw new CanonicalizationError(
      'IDEMPOTENCY_CONFLICT',
      'Same teacher decision and scope were replayed with different canonical content',
    )
  }
}

async function findExistingByIdempotencyKey(
  idempotencyKey: string,
  input: CanonicalizationCommand,
): Promise<CanonicalizationResult | null> {
  const prisma = getPrismaClient()
  const existing = await prisma.canonicalizationProvenance.findUnique({
    where: { idempotencyKey },
    include: { canonicalRecord: true },
  })
  if (!existing) return null

  assertIdempotentPayloadMatches(input, {
    canonicalVersion: existing.canonicalRecord.canonicalVersion,
    canonicalHash: existing.canonicalRecord.canonicalHash,
    studentId: existing.studentId,
    scopeType: existing.scopeType,
    scopeKey: existing.scopeKey,
    teacherDecisionId: existing.teacherDecisionId,
  })

  return {
    canonicalRecordId: existing.canonicalRecordId,
    canonicalVersion: existing.canonicalRecord.canonicalVersion,
    canonicalHash: existing.canonicalRecord.canonicalHash,
    provenanceId: existing.id,
    idempotencyKey,
    idempotentReplay: true,
  }
}

function isPrismaError(error: unknown, code: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
}

async function executeCanonicalizationTransaction(
  input: CanonicalizationCommand,
  idempotencyKey: string,
): Promise<CanonicalizationResult> {
  const prisma = getPrismaClient()

  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.canonicalizationProvenance.findUnique({
        where: { idempotencyKey },
        include: { canonicalRecord: true },
      })

      if (existing) {
        assertIdempotentPayloadMatches(input, {
          canonicalVersion: existing.canonicalRecord.canonicalVersion,
          canonicalHash: existing.canonicalRecord.canonicalHash,
          studentId: existing.studentId,
          scopeType: existing.scopeType,
          scopeKey: existing.scopeKey,
          teacherDecisionId: existing.teacherDecisionId,
        })

        return {
          canonicalRecordId: existing.canonicalRecordId,
          canonicalVersion: existing.canonicalRecord.canonicalVersion,
          canonicalHash: existing.canonicalRecord.canonicalHash,
          provenanceId: existing.id,
          idempotencyKey,
          idempotentReplay: true,
        }
      }

      await assertTeacherDecision(tx, input)

      const latest = await tx.canonicalLearningRecord.findFirst({
        where: {
          studentId: input.studentId,
          scopeKey: input.scopeKey,
        },
        orderBy: { canonicalVersion: 'desc' },
        select: { canonicalRecordId: true, canonicalVersion: true },
      })

      const canonicalVersion = (latest?.canonicalVersion ?? 0) + 1
      const canonicalHash = computeCanonicalRecordHash(input, canonicalVersion)
      const canonicalizedAt = new Date()

      const record = await tx.canonicalLearningRecord.create({
        data: {
          schemaVersion: CANONICAL_LEARNING_RECORD_SCHEMA_VERSION,
          studentId: input.studentId,
          studentEmail: input.studentEmail?.trim().toLowerCase() || null,
          lessonId: input.lessonId ?? null,
          scopeType: input.scopeType,
          scopeKey: input.scopeKey,
          canonicalVersion,
          canonicalHash,
          hashAlgorithm: CANONICAL_LEARNING_RECORD_HASH_ALGORITHM,
          sourceReferences: asJson(input.sourceReferences),
          sourceHash: input.sourceReferences.find((source) => source.sourceHash)?.sourceHash ?? null,
          transcriptId: input.transcriptId ?? null,
          pipelineRunId: input.pipelineRunId ?? null,
          proposalReferences: input.proposalReferences
            ? asJson(input.proposalReferences)
            : Prisma.DbNull,
          teacherDecisionId: input.teacherDecisionId,
          reviewerId: input.reviewerId,
          reviewerRole: input.reviewerRole,
          decisionType: input.decisionType,
          authorityScope: input.authorityScope,
          decisionTimestamp: parseDecisionTimestamp(input.decisionTimestamp),
          canonicalizedAt,
          pedagogicalPayload: asJson(input.pedagogicalPayload),
          supersedesRecordId: latest?.canonicalRecordId ?? null,
        },
      })

      // This create is deliberately inside the same database transaction as the
      // canonical record. Failure here rolls the record creation back.
      const provenance = await tx.canonicalizationProvenance.create({
        data: {
          idempotencyKey,
          canonicalRecordId: record.canonicalRecordId,
          studentId: input.studentId,
          scopeType: input.scopeType,
          scopeKey: input.scopeKey,
          teacherDecisionId: input.teacherDecisionId,
          authoritySourceType: input.authoritySourceType,
          reviewerId: input.reviewerId,
          decisionTimestamp: parseDecisionTimestamp(input.decisionTimestamp),
          canonicalVersion,
          canonicalHash,
          transactionStatus: 'committed',
        },
      })

      return {
        canonicalRecordId: record.canonicalRecordId,
        canonicalVersion,
        canonicalHash,
        provenanceId: provenance.id,
        idempotencyKey,
        idempotentReplay: false,
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  )
}

/**
 * G2 canonicalization command.
 *
 * This function stops at committed canonical state. It deliberately does not
 * perform G3 read-back verification and does not trigger any downstream
 * projection.
 */
export async function canonicalizeLearningRecord(
  input: CanonicalizationCommand,
): Promise<CanonicalizationResult> {
  validateCommand(input)
  const idempotencyKey = createCanonicalizationIdempotencyKey(input)

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await executeCanonicalizationTransaction(input, idempotencyKey)
    } catch (error) {
      if (error instanceof CanonicalizationError) throw error

      if (isPrismaError(error, 'P2002')) {
        const existing = await findExistingByIdempotencyKey(idempotencyKey, input)
        if (existing) return existing
      }

      const retryable =
        isPrismaError(error, 'P2034') ||
        isPrismaError(error, 'P2002')

      if (retryable && attempt < 3) continue

      if (retryable) {
        throw new CanonicalizationError(
          'CONCURRENCY_CONFLICT',
          'Canonicalization could not acquire a conflict-free canonical version after retries',
        )
      }

      throw error
    }
  }

  throw new CanonicalizationError(
    'CONCURRENCY_CONFLICT',
    'Canonicalization retry budget exhausted',
  )
}
