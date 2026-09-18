import { CanonicalizationError, type CanonicalizationCommand, type CanonicalizationResult } from '@/lib/canonicalization'
import { verifyCanonicalLearningRecordReadBack } from '@/lib/canonical-readback-verification'
import { getPrismaClient } from '@/lib/prisma'

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export async function runG3RuntimeProof(taskId: string) {
  const prisma = getPrismaClient()
  const task = await prisma.validationTask.findUnique({ where: { id: taskId } })
  if (!task) throw new CanonicalizationError('AUTHORITY_NOT_FOUND', 'ValidationTask was not found')
  if (task.type !== 'canonical_learning_record_authority' || task.status !== 'approved' || !task.reviewerId || !task.reviewedAt || !isJsonObject(task.suggestedValue)) {
    throw new CanonicalizationError('AUTHORITY_NOT_APPROVED', 'G3 requires an approved canonical authority ValidationTask with an exact suggestedValue and reviewer')
  }
  const reviewer = await prisma.user.findUnique({ where: { id: task.reviewerId }, select: { id: true, role: true } })
  if (!reviewer || !['admin', 'teacher'].includes(reviewer.role)) {
    throw new CanonicalizationError('AUTHORITY_MISMATCH', 'G3 reviewer must resolve to a persisted teacher or administrator')
  }
  const provenance = await prisma.canonicalizationProvenance.findFirst({ where: { teacherDecisionId: task.id }, orderBy: { createdAt: 'desc' } })
  if (!provenance) throw new CanonicalizationError('AUTHORITY_NOT_FOUND', 'G3 requires an existing G2 canonicalization provenance record; G3 does not create canonical state')
  const suggested = task.suggestedValue as Record<string, any>
  const command: CanonicalizationCommand = {
    ...suggested as any,
    teacherDecisionId: task.id,
    reviewerId: task.reviewerId,
    reviewerRole: reviewer.role,
    decisionTimestamp: task.reviewedAt.toISOString(),
    authoritySourceType: 'validation_task',
  }
  const writeResult: CanonicalizationResult = {
    canonicalRecordId: provenance.canonicalRecordId,
    canonicalVersion: provenance.canonicalVersion,
    canonicalHash: provenance.canonicalHash,
    provenanceId: provenance.id,
    idempotencyKey: provenance.idempotencyKey,
    idempotentReplay: true,
  }
  return verifyCanonicalLearningRecordReadBack({ command, writeResult })
}