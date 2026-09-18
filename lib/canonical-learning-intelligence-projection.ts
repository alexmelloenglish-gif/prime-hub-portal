import { createHash } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import type { CanonicalLearningRecordPayload } from '@/lib/canonical-learning-record-contract'

export const CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_VERSION = 'canonical-learning-intelligence-v1'
export const CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_TARGET = 'learning_intelligence'

type PersistedCanonicalRecord = {
  canonicalRecordId: string
  canonicalVersion: number
  canonicalHash: string
  studentId: string
  studentEmail: string | null
  lessonId: string | null
  scopeType: string
  scopeKey: string
  sourceReferences: Prisma.JsonValue
  teacherDecisionId: string
  authorityScope: string
  pedagogicalPayload: Prisma.JsonValue
}

type CanonicalLearningIntelligencePayload = {
  projectionType: 'canonical-learning-intelligence'
  projectionVersion: typeof CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_VERSION
  scope: {
    scopeType: string
    scopeKey: string
    lessonId: string | null
  }
  currentState: CanonicalLearningRecordPayload['learnerStateChange']
  priorities: CanonicalLearningRecordPayload['priorityChange']
  teacherInsight: CanonicalLearningRecordPayload['teacherInsight']
  learningSignals: CanonicalLearningRecordPayload['learningSignals']
  validatedEvidence: CanonicalLearningRecordPayload['validatedEvidence']
  evidenceBoundaries: CanonicalLearningRecordPayload['evidenceBoundaries']
  nextAction: CanonicalLearningRecordPayload['nextAction']
  nextVerification: CanonicalLearningRecordPayload['nextVerification']
  vocabulary: CanonicalLearningRecordPayload['vocabulary']
  grammarCorrections: CanonicalLearningRecordPayload['grammarCorrections']
}

function stableNormalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableNormalize)
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

function hashEnvelope(value: unknown) {
  return createHash('sha256').update(stableJson(value)).digest('hex')
}

function packageIdFromScopeKey(scopeKey: string) {
  const prefix = 'teacher-decision-package:'
  return scopeKey.startsWith(prefix) ? scopeKey.slice(prefix.length) : null
}

function buildProjectionKey(record: PersistedCanonicalRecord) {
  return hashEnvelope({
    canonicalRecordId: record.canonicalRecordId,
    targetType: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_TARGET,
    projectionVersion: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_VERSION,
  })
}

function buildPayload(record: PersistedCanonicalRecord): CanonicalLearningIntelligencePayload {
  const payload = record.pedagogicalPayload as CanonicalLearningRecordPayload
  return {
    projectionType: 'canonical-learning-intelligence',
    projectionVersion: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_VERSION,
    scope: {
      scopeType: record.scopeType,
      scopeKey: record.scopeKey,
      lessonId: record.lessonId,
    },
    currentState: payload.learnerStateChange ?? null,
    priorities: payload.priorityChange ?? null,
    teacherInsight: payload.teacherInsight ?? null,
    learningSignals: payload.learningSignals ?? [],
    validatedEvidence: payload.validatedEvidence ?? [],
    evidenceBoundaries: payload.evidenceBoundaries ?? [],
    nextAction: payload.nextAction ?? null,
    nextVerification: payload.nextVerification ?? null,
    vocabulary: payload.vocabulary ?? [],
    grammarCorrections: payload.grammarCorrections ?? [],
  }
}

function compareProjection(
  row: {
    canonicalRecordId: string
    canonicalVersion: number
    canonicalHash: string
    targetType: string
    projectionVersion: string
    projectionHash: string
    teacherDecisionId: string
    validationTaskId: string | null
    teacherDecisionPackageId: string | null
    authorityScope: string
    sourceReferences: Prisma.JsonValue
    g3VerificationId: string
    projection: Prisma.JsonValue
  } | null,
  expected: Record<string, unknown>,
) {
  const fieldResults = {
    projectionExists: row !== null,
    canonicalRecordId: row?.canonicalRecordId === expected.canonicalRecordId,
    canonicalVersion: row?.canonicalVersion === expected.canonicalVersion,
    canonicalHash: row?.canonicalHash === expected.canonicalHash,
    targetType: row?.targetType === expected.targetType,
    projectionVersion: row?.projectionVersion === expected.projectionVersion,
    projectionHash: row?.projectionHash === expected.projectionHash,
    teacherDecisionId: row?.teacherDecisionId === expected.teacherDecisionId,
    validationTaskId: row?.validationTaskId === expected.validationTaskId,
    teacherDecisionPackageId: row?.teacherDecisionPackageId === expected.teacherDecisionPackageId,
    authorityScope: row?.authorityScope === expected.authorityScope,
    sourceReferences: row ? stableJson(row.sourceReferences) === stableJson(expected.sourceReferences) : false,
    g3VerificationId: row?.g3VerificationId === expected.g3VerificationId,
    projection: row ? stableJson(row.projection) === stableJson(expected.projection) : false,
  }
  const mismatchFields = Object.entries(fieldResults).filter(([, ok]) => !ok).map(([field]) => field)
  return { status: mismatchFields.length === 0 ? 'VERIFIED' : 'FAILED', fieldResults, mismatchFields } as const
}

export async function projectCanonicalLearningIntelligence(input: {
  canonicalRecordId: string
  requiredG3VerificationId: string
}) {
  const prisma = getPrismaClient()

  const g3 = await prisma.canonicalLearningRecordVerification.findUnique({
    where: { id: input.requiredG3VerificationId },
    select: { id: true, expectedCanonicalRecordId: true, verificationStatus: true },
  })
  if (!g3 || g3.verificationStatus !== 'PASS' || g3.expectedCanonicalRecordId !== input.canonicalRecordId) {
    throw new Error('G5 requires a matching persisted G3 PASS witness')
  }

  const record = await prisma.canonicalLearningRecord.findUnique({
    where: { canonicalRecordId: input.canonicalRecordId },
    select: {
      canonicalRecordId: true,
      canonicalVersion: true,
      canonicalHash: true,
      studentId: true,
      studentEmail: true,
      lessonId: true,
      scopeType: true,
      scopeKey: true,
      sourceReferences: true,
      teacherDecisionId: true,
      authorityScope: true,
      pedagogicalPayload: true,
    },
  })
  if (!record) throw new Error('Canonical Learning Record was not found')

  const authorityTask = await prisma.validationTask.findUnique({
    where: { id: record.teacherDecisionId },
    select: { id: true, entityType: true, entityId: true },
  })
  const validationTaskId = authorityTask?.id ?? null
  const teacherDecisionPackageId =
    authorityTask?.entityType === 'TeacherDecisionPackage'
      ? authorityTask.entityId
      : packageIdFromScopeKey(record.scopeKey)

  const sourceReferences = {
    canonicalSource: {
      sourceType: 'CanonicalLearningRecord',
      sourceRef: record.canonicalRecordId,
      canonicalVersion: record.canonicalVersion,
      canonicalHash: record.canonicalHash,
    },
    originalSourceReferences: record.sourceReferences,
    unresolvedBoundary: ['legacy_learning_intelligence_not_used_as_canonical_source'],
  }
  const projection = buildPayload(record)
  const projectionKey = buildProjectionKey(record)
  const projectionHash = hashEnvelope({
    canonicalRecordId: record.canonicalRecordId,
    canonicalVersion: record.canonicalVersion,
    canonicalHash: record.canonicalHash,
    targetType: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_TARGET,
    projectionVersion: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_VERSION,
    teacherDecisionId: record.teacherDecisionId,
    validationTaskId,
    teacherDecisionPackageId,
    authorityScope: record.authorityScope,
    sourceReferences,
    g3VerificationId: g3.id,
    projection,
  })

  const expected = {
    canonicalRecordId: record.canonicalRecordId,
    canonicalVersion: record.canonicalVersion,
    canonicalHash: record.canonicalHash,
    targetType: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_TARGET,
    projectionVersion: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_VERSION,
    projectionHash,
    teacherDecisionId: record.teacherDecisionId,
    validationTaskId,
    teacherDecisionPackageId,
    authorityScope: record.authorityScope,
    sourceReferences,
    g3VerificationId: g3.id,
    projection,
  }

  const existing = await prisma.canonicalLearningIntelligenceProjection.findUnique({
    where: { projectionKey },
  })

  if (existing) {
    const comparison = compareProjection(existing, expected)
    if (comparison.status === 'VERIFIED' && existing.projectionStatus === 'VERIFIED') {
      return {
        projectionId: existing.projectionId,
        projectionKey,
        projectionHash,
        projectionStatus: 'VERIFIED' as const,
        idempotentReplay: true,
        canonicalRecordId: record.canonicalRecordId,
        canonicalVersion: record.canonicalVersion,
        canonicalHash: record.canonicalHash,
        mismatchFields: [] as string[],
      }
    }
    await prisma.canonicalLearningIntelligenceProjection.update({
      where: { projectionKey },
      data: { projectionStatus: 'WRITTEN', verifiedAt: null, mismatchFields: [] },
    })
  } else {
    await prisma.canonicalLearningIntelligenceProjection.create({
      data: {
        projectionKey,
        targetType: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_TARGET,
        projectionVersion: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_VERSION,
        projectionHash,
        canonicalRecordId: record.canonicalRecordId,
        canonicalVersion: record.canonicalVersion,
        canonicalHash: record.canonicalHash,
        studentId: record.studentId,
        studentEmail: record.studentEmail,
        scopeType: record.scopeType,
        scopeKey: record.scopeKey,
        lessonId: record.lessonId,
        teacherDecisionId: record.teacherDecisionId,
        validationTaskId,
        teacherDecisionPackageId,
        authorityScope: record.authorityScope,
        sourceReferences: asJson(sourceReferences),
        g3VerificationId: g3.id,
        projection: asJson(projection),
        projectionStatus: 'WRITTEN',
      },
    })
  }

  const readBack = await prisma.canonicalLearningIntelligenceProjection.findUnique({ where: { projectionKey } })
  const comparison = compareProjection(readBack, expected)

  const persisted = await prisma.canonicalLearningIntelligenceProjection.update({
    where: { projectionKey },
    data: {
      projectionStatus: comparison.status,
      mismatchFields: asJson(comparison.mismatchFields),
      verifiedAt: comparison.status === 'VERIFIED' ? new Date() : null,
    },
  })

  return {
    projectionId: persisted.projectionId,
    projectionKey,
    projectionHash,
    projectionStatus: comparison.status,
    idempotentReplay: false,
    canonicalRecordId: record.canonicalRecordId,
    canonicalVersion: record.canonicalVersion,
    canonicalHash: record.canonicalHash,
    mismatchFields: comparison.mismatchFields,
  }
}
