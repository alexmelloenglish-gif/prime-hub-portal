import { createHash } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import { computeCanonicalRecordHash, type CanonicalizationCommand, type CanonicalizationResult } from '@/lib/canonicalization'

type CanonicalRecordSnapshot = {
  canonicalRecordId: string
  canonicalVersion: number
  canonicalHash: string
  teacherDecisionId: string
  sourceReferences: Prisma.JsonValue
  pedagogicalPayload: Prisma.JsonValue
}

export type CanonicalReadBackComparison = {
  status: 'PASS' | 'FAIL'
  fieldResults: Record<string, boolean>
  mismatchFields: string[]
  expectedHashComputed: string
  actual: CanonicalRecordSnapshot | null
}

export type CanonicalReadBackVerificationInput = {
  command: CanonicalizationCommand
  writeResult: CanonicalizationResult
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

function jsonEqual(left: unknown, right: unknown) {
  return stableJson(left) === stableJson(right)
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function createVerificationKey(input: CanonicalReadBackVerificationInput) {
  const identity = [
    'canonical-readback-g3',
    input.writeResult.canonicalRecordId,
    String(input.writeResult.canonicalVersion),
    input.writeResult.canonicalHash,
    input.command.teacherDecisionId,
  ].join('|')
  return `g3:${createHash('sha256').update(identity).digest('hex')}`
}

export function compareCanonicalReadBack(input: CanonicalReadBackVerificationInput, actual: CanonicalRecordSnapshot | null): CanonicalReadBackComparison {
  const expectedHashComputed = computeCanonicalRecordHash(input.command, input.writeResult.canonicalVersion)
  const fieldResults = {
    readBackRecordExists: actual !== null,
    writeResultCanonicalRecordId: Boolean(actual && actual.canonicalRecordId === input.writeResult.canonicalRecordId),
    writeResultCanonicalVersion: Boolean(actual && actual.canonicalVersion === input.writeResult.canonicalVersion),
    writeResultCanonicalHash: input.writeResult.canonicalHash === expectedHashComputed,
    canonicalHashReadBack: Boolean(actual && actual.canonicalHash === input.writeResult.canonicalHash),
    teacherDecisionId: Boolean(actual && actual.teacherDecisionId === input.command.teacherDecisionId),
    sourceReferences: Boolean(actual && jsonEqual(actual.sourceReferences, input.command.sourceReferences)),
    pedagogicalPayload: Boolean(actual && jsonEqual(actual.pedagogicalPayload, input.command.pedagogicalPayload)),
  }
  const mismatchFields = Object.entries(fieldResults).filter(([, passed]) => !passed).map(([field]) => field)
  return {
    status: mismatchFields.length === 0 ? 'PASS' : 'FAIL',
    fieldResults,
    mismatchFields,
    expectedHashComputed,
    actual,
  }
}

/**
 * G3 reads the persisted canonical record from Neon, compares it with the
 * preserved G2 write result and authority input, and persists PASS or FAIL.
 * It does not canonicalize, replay canonicalization, or invoke projections.
 */
export async function verifyCanonicalLearningRecordReadBack(input: CanonicalReadBackVerificationInput) {
  const prisma = getPrismaClient()
  const actualRecord = await prisma.canonicalLearningRecord.findUnique({
    where: { canonicalRecordId: input.writeResult.canonicalRecordId },
    select: { canonicalRecordId: true, canonicalVersion: true, canonicalHash: true, teacherDecisionId: true, sourceReferences: true, pedagogicalPayload: true },
  })
  const actual = actualRecord ? {
    canonicalRecordId: actualRecord.canonicalRecordId,
    canonicalVersion: actualRecord.canonicalVersion,
    canonicalHash: actualRecord.canonicalHash,
    teacherDecisionId: actualRecord.teacherDecisionId,
    sourceReferences: actualRecord.sourceReferences,
    pedagogicalPayload: actualRecord.pedagogicalPayload,
  } : null
  const comparison = compareCanonicalReadBack(input, actual)
  const verificationKey = createVerificationKey(input)
  const now = new Date()
  const verification = await prisma.canonicalLearningRecordVerification.upsert({
    where: { verificationKey },
    create: {
      verificationKey,
      expectedCanonicalRecordId: input.writeResult.canonicalRecordId,
      observedCanonicalRecordId: actual?.canonicalRecordId ?? null,
      expectedCanonicalVersion: input.writeResult.canonicalVersion,
      observedCanonicalVersion: actual?.canonicalVersion ?? null,
      expectedCanonicalHash: input.writeResult.canonicalHash,
      observedCanonicalHash: actual?.canonicalHash ?? null,
      expectedTeacherDecisionId: input.command.teacherDecisionId,
      observedTeacherDecisionId: actual?.teacherDecisionId ?? null,
      expectedSourceReferences: asJson(input.command.sourceReferences),
      observedSourceReferences: actual ? asJson(actual.sourceReferences) : Prisma.DbNull,
      expectedPedagogicalPayload: asJson(input.command.pedagogicalPayload),
      observedPedagogicalPayload: actual ? asJson(actual.pedagogicalPayload) : Prisma.DbNull,
      fieldResults: asJson(comparison.fieldResults),
      mismatchFields: asJson(comparison.mismatchFields),
      verificationStatus: comparison.status,
      verifiedAt: now,
    },
    update: {
      observedCanonicalRecordId: actual?.canonicalRecordId ?? null,
      observedCanonicalVersion: actual?.canonicalVersion ?? null,
      observedCanonicalHash: actual?.canonicalHash ?? null,
      observedTeacherDecisionId: actual?.teacherDecisionId ?? null,
      observedSourceReferences: actual ? asJson(actual.sourceReferences) : Prisma.DbNull,
      observedPedagogicalPayload: actual ? asJson(actual.pedagogicalPayload) : Prisma.DbNull,
      fieldResults: asJson(comparison.fieldResults),
      mismatchFields: asJson(comparison.mismatchFields),
      verificationStatus: comparison.status,
      verifiedAt: now,
    },
  })
  return {
    verificationId: verification.id,
    verificationKey,
    status: comparison.status,
    mismatchFields: comparison.mismatchFields,
    fieldResults: comparison.fieldResults,
    expectedHashComputed: comparison.expectedHashComputed,
    canonicalRecordId: input.writeResult.canonicalRecordId,
    canonicalVersion: input.writeResult.canonicalVersion,
    canonicalHash: input.writeResult.canonicalHash,
  }
}