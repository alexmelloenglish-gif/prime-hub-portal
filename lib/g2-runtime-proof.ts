import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import {
  canonicalizeLearningRecord,
  computeCanonicalRecordHash,
  type CanonicalAuthorityDraft,
  type CanonicalizationCommand,
} from '@/lib/canonicalization'
import {
  CANONICAL_LEARNING_RECORD_HASH_ALGORITHM,
  CANONICAL_LEARNING_RECORD_SCHEMA_VERSION,
} from '@/lib/canonical-learning-record-contract'

export type G2RuntimeProofResult = {
  taskId: string
  canonicalRecordId: string
  canonicalVersion: number
  canonicalHash: string
  provenanceId: string
  idempotencyKey: string
  replay: {
    sameRecordId: boolean
    sameVersion: boolean
    sameHash: boolean
    idempotentReplay: boolean
  }
  counts: {
    canonicalRecords: number
    provenanceRows: number
  }
  atomicity: {
    rollbackTriggered: boolean
    beforeCanonicalRecords: number
    afterCanonicalRecords: number
    beforeProvenanceRows: number
    afterProvenanceRows: number
    noPartialState: boolean
  }
}

function asDraft(value: Prisma.JsonValue | null): CanonicalAuthorityDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Approved ValidationTask does not contain a canonical authority draft')
  }
  return JSON.parse(JSON.stringify(value)) as CanonicalAuthorityDraft
}

async function buildCommandFromApprovedTask(taskId: string): Promise<CanonicalizationCommand> {
  const prisma = getPrismaClient()
  const task = await prisma.validationTask.findUnique({ where: { id: taskId } })

  if (!task) throw new Error('ValidationTask not found')
  if (
    task.type !== 'canonical_learning_record_authority' ||
    task.status !== 'approved' ||
    task.decision !== 'approved' ||
    !task.reviewerId ||
    !task.reviewedAt
  ) {
    throw new Error('ValidationTask is not an approved canonical-learning authority witness')
  }

  const reviewer = await prisma.user.findUnique({
    where: { id: task.reviewerId },
    select: { id: true, role: true },
  })

  if (!reviewer || !['admin', 'teacher'].includes(reviewer.role)) {
    throw new Error('ValidationTask reviewer does not resolve to a persisted teacher/admin')
  }

  const draft = asDraft(task.suggestedValue)

  return {
    ...draft,
    authoritySourceType: 'validation_task',
    teacherDecisionId: task.id,
    reviewerId: reviewer.id,
    reviewerRole: reviewer.role,
    decisionTimestamp: task.reviewedAt.toISOString(),
  }
}

async function countWitnessRows(command: CanonicalizationCommand) {
  const prisma = getPrismaClient()
  const [canonicalRecords, provenanceRows] = await Promise.all([
    prisma.canonicalLearningRecord.count({
      where: {
        studentId: command.studentId,
        scopeKey: command.scopeKey,
        teacherDecisionId: command.teacherDecisionId,
      },
    }),
    prisma.canonicalizationProvenance.count({
      where: {
        studentId: command.studentId,
        scopeKey: command.scopeKey,
        teacherDecisionId: command.teacherDecisionId,
      },
    }),
  ])

  return { canonicalRecords, provenanceRows }
}

async function proveControlledRollback(
  command: CanonicalizationCommand,
): Promise<G2RuntimeProofResult['atomicity']> {
  const prisma = getPrismaClient()
  const before = await countWitnessRows(command)
  const latest = await prisma.canonicalLearningRecord.findFirst({
    where: {
      studentId: command.studentId,
      scopeKey: command.scopeKey,
    },
    orderBy: { canonicalVersion: 'desc' },
    select: { canonicalRecordId: true, canonicalVersion: true },
  })

  if (!latest) throw new Error('Controlled rollback proof requires the committed canonical witness first')

  const rollbackVersion = latest.canonicalVersion + 1
  const rollbackHash = computeCanonicalRecordHash(command, rollbackVersion)
  let rollbackTriggered = false

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.canonicalLearningRecord.create({
          data: {
            schemaVersion: CANONICAL_LEARNING_RECORD_SCHEMA_VERSION,
            studentId: command.studentId,
            studentEmail: command.studentEmail?.trim().toLowerCase() || null,
            lessonId: command.lessonId ?? null,
            scopeType: command.scopeType,
            scopeKey: command.scopeKey,
            canonicalVersion: rollbackVersion,
            canonicalHash: rollbackHash,
            hashAlgorithm: CANONICAL_LEARNING_RECORD_HASH_ALGORITHM,
            sourceReferences: JSON.parse(JSON.stringify(command.sourceReferences)) as Prisma.InputJsonValue,
            sourceHash: command.sourceReferences.find((source) => source.sourceHash)?.sourceHash ?? null,
            transcriptId: command.transcriptId ?? null,
            pipelineRunId: command.pipelineRunId ?? null,
            proposalReferences: command.proposalReferences
              ? JSON.parse(JSON.stringify(command.proposalReferences)) as Prisma.InputJsonValue
              : Prisma.DbNull,
            teacherDecisionId: command.teacherDecisionId,
            reviewerId: command.reviewerId,
            reviewerRole: command.reviewerRole,
            decisionType: command.decisionType,
            authorityScope: command.authorityScope,
            decisionTimestamp: new Date(command.decisionTimestamp),
            canonicalizedAt: new Date(),
            pedagogicalPayload: JSON.parse(JSON.stringify(command.pedagogicalPayload)) as Prisma.InputJsonValue,
            supersedesRecordId: latest.canonicalRecordId,
          },
        })

        // Controlled failure point: canonical row has been created inside the
        // transaction, provenance has not. Throwing here must roll back the row.
        throw new Error('G2_CONTROLLED_ROLLBACK')
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'G2_CONTROLLED_ROLLBACK') {
      rollbackTriggered = true
    } else {
      throw error
    }
  }

  const after = await countWitnessRows(command)

  return {
    rollbackTriggered,
    beforeCanonicalRecords: before.canonicalRecords,
    afterCanonicalRecords: after.canonicalRecords,
    beforeProvenanceRows: before.provenanceRows,
    afterProvenanceRows: after.provenanceRows,
    noPartialState:
      rollbackTriggered &&
      before.canonicalRecords === after.canonicalRecords &&
      before.provenanceRows === after.provenanceRows,
  }
}

export async function runG2RuntimeProof(taskId: string): Promise<G2RuntimeProofResult> {
  const command = await buildCommandFromApprovedTask(taskId)

  const first = await canonicalizeLearningRecord(command)
  const second = await canonicalizeLearningRecord(command)
  const counts = await countWitnessRows(command)
  const atomicity = await proveControlledRollback(command)

  const replay = {
    sameRecordId: first.canonicalRecordId === second.canonicalRecordId,
    sameVersion: first.canonicalVersion === second.canonicalVersion,
    sameHash: first.canonicalHash === second.canonicalHash,
    idempotentReplay: second.idempotentReplay,
  }

  if (
    first.idempotentReplay ||
    !replay.sameRecordId ||
    !replay.sameVersion ||
    !replay.sameHash ||
    !replay.idempotentReplay ||
    counts.canonicalRecords !== 1 ||
    counts.provenanceRows !== 1 ||
    !atomicity.noPartialState
  ) {
    throw new Error('G2 runtime proof failed its acceptance criteria')
  }

  return {
    taskId,
    canonicalRecordId: first.canonicalRecordId,
    canonicalVersion: first.canonicalVersion,
    canonicalHash: first.canonicalHash,
    provenanceId: first.provenanceId,
    idempotencyKey: first.idempotencyKey,
    replay,
    counts,
    atomicity,
  }
}
