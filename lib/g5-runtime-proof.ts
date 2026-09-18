import { CanonicalizationError } from '@/lib/canonicalization'
import {
  CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_TARGET,
  CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_VERSION,
  projectCanonicalLearningIntelligence,
} from '@/lib/canonical-learning-intelligence-projection'
import { getPrismaClient } from '@/lib/prisma'

const GUSTAVO_CANONICAL_RECORD_ID = 'cmu6jv29k0001bf8kt45pl9ht'
const GUSTAVO_STUDENT_ID = 'stu_4c4da6c04ac4'

export async function runG5RuntimeProof(taskId: string) {
  const prisma = getPrismaClient()
  const task = await prisma.validationTask.findUnique({ where: { id: taskId } })
  if (!task) throw new CanonicalizationError('AUTHORITY_NOT_FOUND', 'ValidationTask was not found')
  if (task.type !== 'canonical_learning_record_authority' || task.status !== 'approved' || !task.reviewerId || !task.reviewedAt) {
    throw new CanonicalizationError('AUTHORITY_NOT_APPROVED', 'G5 requires approved canonical authority')
  }

  const provenance = await prisma.canonicalizationProvenance.findFirst({
    where: { teacherDecisionId: task.id },
    orderBy: { createdAt: 'desc' },
  })
  if (!provenance || provenance.canonicalRecordId !== GUSTAVO_CANONICAL_RECORD_ID || provenance.studentId !== GUSTAVO_STUDENT_ID) {
    throw new CanonicalizationError('AUTHORITY_NOT_FOUND', 'G5 runtime proof is intentionally limited to the frozen Gustavo witness')
  }

  const g3 = await prisma.canonicalLearningRecordVerification.findFirst({
    where: { expectedCanonicalRecordId: provenance.canonicalRecordId, verificationStatus: 'PASS' },
    orderBy: { verifiedAt: 'desc' },
  })
  if (!g3) throw new CanonicalizationError('AUTHORITY_NOT_APPROVED', 'G5 requires persisted G3 PASS for the same CLR')

  const input = { canonicalRecordId: provenance.canonicalRecordId, requiredG3VerificationId: g3.id }
  const first = await projectCanonicalLearningIntelligence(input)
  const replay = await projectCanonicalLearningIntelligence(input)

  const compositeCount = await prisma.canonicalLearningIntelligenceProjection.count({
    where: {
      canonicalRecordId: provenance.canonicalRecordId,
      targetType: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_TARGET,
      projectionVersion: CANONICAL_LEARNING_INTELLIGENCE_PROJECTION_VERSION,
    },
  })

  const mismatches: string[] = []
  if (first.projectionStatus !== 'VERIFIED') mismatches.push('first_projection_not_verified')
  if (replay.projectionStatus !== 'VERIFIED') mismatches.push('replay_projection_not_verified')
  if (!replay.idempotentReplay) mismatches.push('replay_not_idempotent')
  if (first.projectionId !== replay.projectionId) mismatches.push('projectionId')
  if (first.projectionKey !== replay.projectionKey) mismatches.push('projectionKey')
  if (first.projectionHash !== replay.projectionHash) mismatches.push('projectionHash')
  if (first.canonicalRecordId !== replay.canonicalRecordId) mismatches.push('canonicalRecordId')
  if (first.canonicalVersion !== replay.canonicalVersion) mismatches.push('canonicalVersion')
  if (first.canonicalHash !== replay.canonicalHash) mismatches.push('canonicalHash')
  if (compositeCount !== 1) mismatches.push('compositeCardinality')

  if (mismatches.length) throw new Error(`G5 runtime proof failed: ${mismatches.join(', ')}`)

  return { ...replay, proofCompositeCount: compositeCount, g3VerificationId: g3.id }
}
