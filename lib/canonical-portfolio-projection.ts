import { createHash } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import type { CanonicalLearningRecordPayload } from '@/lib/canonical-learning-record-contract'

export const CANONICAL_PORTFOLIO_PROJECTION_VERSION = 'canonical-portfolio-v1'
export const CANONICAL_PORTFOLIO_PROJECTION_TARGET = 'portfolio'

export type CanonicalPortfolioProjectionStatus =
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'WRITTEN'
  | 'VERIFIED'
  | 'FAILED'

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

type CanonicalPortfolioProjectionPayload = {
  projectionType: 'canonical-portfolio-memory'
  projectionVersion: typeof CANONICAL_PORTFOLIO_PROJECTION_VERSION
  scope: {
    scopeType: string
    scopeKey: string
    lessonId: string | null
  }
  learnerStateChange: CanonicalLearningRecordPayload['learnerStateChange']
  priorityChange: CanonicalLearningRecordPayload['priorityChange']
  nextAction: CanonicalLearningRecordPayload['nextAction']
  teacherInsight: CanonicalLearningRecordPayload['teacherInsight']
  learningSignals: CanonicalLearningRecordPayload['learningSignals']
  validatedEvidence: CanonicalLearningRecordPayload['validatedEvidence']
  evidenceBoundaries: CanonicalLearningRecordPayload['evidenceBoundaries']
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

function hashProjectionEnvelope(value: unknown) {
  return createHash('sha256').update(stableJson(value)).digest('hex')
}

function buildProjectionKey(record: PersistedCanonicalRecord) {
  return hashProjectionEnvelope({
    canonicalRecordId: record.canonicalRecordId,
    canonicalVersion: record.canonicalVersion,
    canonicalHash: record.canonicalHash,
    projectionVersion: CANONICAL_PORTFOLIO_PROJECTION_VERSION,
    targetType: CANONICAL_PORTFOLIO_PROJECTION_TARGET,
  })
}

function teacherDecisionPackageIdFromScopeKey(scopeKey: string) {
  const prefix = 'teacher-decision-package:'
  return scopeKey.startsWith(prefix) ? scopeKey.slice(prefix.length) : null
}

function buildPayload(record: PersistedCanonicalRecord): CanonicalPortfolioProjectionPayload {
  const payload = record.pedagogicalPayload as CanonicalLearningRecordPayload

  return {
    projectionType: 'canonical-portfolio-memory',
    projectionVersion: CANONICAL_PORTFOLIO_PROJECTION_VERSION,
    scope: {
      scopeType: record.scopeType,
      scopeKey: record.scopeKey,
      lessonId: record.lessonId,
    },
    learnerStateChange: payload.learnerStateChange ?? null,
    priorityChange: payload.priorityChange ?? null,
    nextAction: payload.nextAction ?? null,
    teacherInsight: payload.teacherInsight ?? null,
    learningSignals: payload.learningSignals ?? [],
    validatedEvidence: payload.validatedEvidence ?? [],
    evidenceBoundaries: payload.evidenceBoundaries ?? [],
    nextVerification: payload.nextVerification ?? null,
    vocabulary: payload.vocabulary ?? [],
    grammarCorrections: payload.grammarCorrections ?? [],
  }
}

function compareProjection(
  row: {
    projectionId: string
    canonicalRecordId: string
    canonicalVersion: number
    canonicalHash: string
    projectionVersion: string
    targetType: string
    projectionHash: string
    sourceReferences: Prisma.JsonValue
    projection: Prisma.JsonValue
  } | null,
  expected: {
    canonicalRecordId: string
    canonicalVersion: number
    canonicalHash: string
    projectionVersion: string
    targetType: string
    projectionHash: string
    sourceReferences: unknown
    projection: unknown
  },
) {
  const fieldResults = {
    projectionExists: row !== null,
    canonicalRecordId: row?.canonicalRecordId === expected.canonicalRecordId,
    canonicalVersion: row?.canonicalVersion === expected.canonicalVersion,
    canonicalHash: row?.canonicalHash === expected.canonicalHash,
    projectionVersion: row?.projectionVersion === expected.projectionVersion,
    targetType: row?.targetType === expected.targetType,
    projectionHash: row?.projectionHash === expected.projectionHash,
    sourceReferences: row ? stableJson(row.sourceReferences) === stableJson(expected.sourceReferences) : false,
    projection: row ? stableJson(row.projection) === stableJson(expected.projection) : false,
  }

  const mismatchFields = Object.entries(fieldResults)
    .filter(([, passed]) => !passed)
    .map(([field]) => field)

  return {
    status: mismatchFields.length === 0 ? 'VERIFIED' : 'FAILED',
    fieldResults,
    mismatchFields,
  } as const
}

export async function projectCanonicalPortfolio(input: {
  canonicalRecordId: string
  requiredG3VerificationId: string
}) {
  const prisma = getPrismaClient()

  const g3 = await prisma.canonicalLearningRecordVerification.findUnique({
    where: { id: input.requiredG3VerificationId },
    select: {
      id: true,
      expectedCanonicalRecordId: true,
      verificationStatus: true,
    },
  })

  if (
    !g3 ||
    g3.verificationStatus !== 'PASS' ||
    g3.expectedCanonicalRecordId !== input.canonicalRecordId
  ) {
    throw new Error('G4 requires a matching persisted G3 PASS witness')
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

  if (!record) {
    throw new Error('Canonical Learning Record was not found')
  }

  const projection = buildPayload(record)
  const authorityTask = await prisma.validationTask.findUnique({
    where: { id: record.teacherDecisionId },
    select: { id: true, entityType: true, entityId: true },
  })
  const teacherDecisionPackageId =
    authorityTask?.entityType === 'TeacherDecisionPackage'
      ? authorityTask.entityId
      : teacherDecisionPackageIdFromScopeKey(record.scopeKey)
  const sourceReferences = [
    {
      sourceType: 'CanonicalLearningRecord',
      sourceRef: record.canonicalRecordId,
      canonicalVersion: record.canonicalVersion,
      canonicalHash: record.canonicalHash,
      originalSourceReferences: record.sourceReferences,
      teacherDecisionId: record.teacherDecisionId,
      validationTaskId: authorityTask?.id ?? null,
      teacherDecisionPackageId,
      authorityScope: record.authorityScope,
      g3VerificationId: g3.id,
      legacySourceId: null,
      unresolvedBoundary: ['legacy_identity_not_inferred_from_canonical_projection'],
    },
  ]
  const projectionHash = hashProjectionEnvelope({
    canonicalRecordId: record.canonicalRecordId,
    canonicalVersion: record.canonicalVersion,
    canonicalHash: record.canonicalHash,
    projectionVersion: CANONICAL_PORTFOLIO_PROJECTION_VERSION,
    targetType: CANONICAL_PORTFOLIO_PROJECTION_TARGET,
    sourceReferences,
    projection,
  })
  const projectionKey = buildProjectionKey(record)

  const existing = await prisma.canonicalLearningRecordProjection.findUnique({
    where: { projectionKey },
    select: {
      projectionId: true,
      canonicalRecordId: true,
      canonicalVersion: true,
      canonicalHash: true,
      projectionVersion: true,
      targetType: true,
      projectionHash: true,
      sourceReferences: true,
      projection: true,
      projectionStatus: true,
    },
  })

  const expected = {
    canonicalRecordId: record.canonicalRecordId,
    canonicalVersion: record.canonicalVersion,
    canonicalHash: record.canonicalHash,
    projectionVersion: CANONICAL_PORTFOLIO_PROJECTION_VERSION,
    targetType: CANONICAL_PORTFOLIO_PROJECTION_TARGET,
    projectionHash,
    sourceReferences,
    projection,
  }

  let projectionId: string
  let idempotentReplay = false

  if (existing) {
    const comparison = compareProjection(existing, expected)
    if (comparison.status === 'VERIFIED' && existing.projectionStatus === 'VERIFIED') {
      projectionId = existing.projectionId
      idempotentReplay = true
      return {
        projectionId,
        projectionKey,
        projectionHash,
        projectionStatus: 'VERIFIED' as const,
        idempotentReplay,
        canonicalRecordId: record.canonicalRecordId,
        canonicalVersion: record.canonicalVersion,
        canonicalHash: record.canonicalHash,
        g3VerificationId: g3.id,
        mismatchFields: [] as string[],
        fieldResults: comparison.fieldResults,
      }
    }

    await prisma.canonicalLearningRecordProjection.update({
      where: { projectionKey },
      data: { projectionStatus: 'WRITTEN', verifiedAt: null, mismatchFields: [] },
    })
    projectionId = existing.projectionId
  } else {
    const created = await prisma.canonicalLearningRecordProjection.create({
      data: {
        projectionKey,
        targetType: CANONICAL_PORTFOLIO_PROJECTION_TARGET,
        projectionVersion: CANONICAL_PORTFOLIO_PROJECTION_VERSION,
        canonicalRecordId: record.canonicalRecordId,
        canonicalVersion: record.canonicalVersion,
        canonicalHash: record.canonicalHash,
        studentId: record.studentId,
        studentEmail: record.studentEmail,
        lessonId: record.lessonId,
        sourceReferences: asJson(sourceReferences),
        projection: asJson(projection),
        projectionHash,
        projectionStatus: 'WRITTEN',
      },
      select: { projectionId: true },
    })
    projectionId = created.projectionId
  }

  const readBack = await prisma.canonicalLearningRecordProjection.findUnique({
    where: { projectionKey },
    select: {
      projectionId: true,
      canonicalRecordId: true,
      canonicalVersion: true,
      canonicalHash: true,
      projectionVersion: true,
      targetType: true,
      projectionHash: true,
      sourceReferences: true,
      projection: true,
    },
  })

  const comparison = compareProjection(readBack, expected)

  await prisma.canonicalLearningRecordProjection.update({
    where: { projectionKey },
    data: {
      projectionStatus: comparison.status,
      mismatchFields: asJson(comparison.mismatchFields),
      verifiedAt: comparison.status === 'VERIFIED' ? new Date() : null,
    },
  })

  return {
    projectionId,
    projectionKey,
    projectionHash,
    projectionStatus: comparison.status,
    idempotentReplay,
    canonicalRecordId: record.canonicalRecordId,
    canonicalVersion: record.canonicalVersion,
    canonicalHash: record.canonicalHash,
    g3VerificationId: g3.id,
    mismatchFields: comparison.mismatchFields,
    fieldResults: comparison.fieldResults,
  }
}
