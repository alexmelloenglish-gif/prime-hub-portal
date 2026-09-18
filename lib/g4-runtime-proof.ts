import { CanonicalizationError } from '@/lib/canonicalization'
import {
  CANONICAL_PORTFOLIO_PROJECTION_TARGET,
  CANONICAL_PORTFOLIO_PROJECTION_VERSION,
  projectCanonicalPortfolio,
} from '@/lib/canonical-portfolio-projection'
import { getPrismaClient } from '@/lib/prisma'

export async function runG4RuntimeProof(taskId: string) {
  const prisma = getPrismaClient()
  const task = await prisma.validationTask.findUnique({ where: { id: taskId } })

  if (!task) {
    throw new CanonicalizationError('AUTHORITY_NOT_FOUND', 'ValidationTask was not found')
  }

  if (
    task.type !== 'canonical_learning_record_authority' ||
    task.status !== 'approved' ||
    !task.reviewerId ||
    !task.reviewedAt
  ) {
    throw new CanonicalizationError(
      'AUTHORITY_NOT_APPROVED',
      'G4 requires an approved canonical authority ValidationTask with reviewer and review timestamp',
    )
  }

  const provenance = await prisma.canonicalizationProvenance.findFirst({
    where: { teacherDecisionId: task.id },
    orderBy: { createdAt: 'desc' },
  })

  if (!provenance) {
    throw new CanonicalizationError(
      'AUTHORITY_NOT_FOUND',
      'G4 requires the existing G2 canonicalization provenance; G4 never creates canonical state',
    )
  }

  const g3 = await prisma.canonicalLearningRecordVerification.findFirst({
    where: {
      expectedCanonicalRecordId: provenance.canonicalRecordId,
      verificationStatus: 'PASS',
    },
    orderBy: { verifiedAt: 'desc' },
  })

  if (!g3) {
    throw new CanonicalizationError(
      'AUTHORITY_NOT_APPROVED',
      'G4 requires a persisted G3 PASS for the canonical record before projection',
    )
  }

  const input = {
    canonicalRecordId: provenance.canonicalRecordId,
    requiredG3VerificationId: g3.id,
  }

  const first = await projectCanonicalPortfolio(input)
  const replay = await projectCanonicalPortfolio(input)

  const projectionCount = await prisma.canonicalLearningRecordProjection.count({
    where: {
      canonicalRecordId: provenance.canonicalRecordId,
      targetType: CANONICAL_PORTFOLIO_PROJECTION_TARGET,
      projectionVersion: CANONICAL_PORTFOLIO_PROJECTION_VERSION,
    },
  })

  const proofMismatches: string[] = []
  if (first.projectionStatus !== 'VERIFIED') proofMismatches.push('first_projection_not_verified')
  if (replay.projectionStatus !== 'VERIFIED') proofMismatches.push('replay_projection_not_verified')
  if (!replay.idempotentReplay) proofMismatches.push('replay_not_idempotent')
  if (first.projectionId !== replay.projectionId) proofMismatches.push('projectionId')
  if (first.projectionKey !== replay.projectionKey) proofMismatches.push('projectionKey')
  if (first.projectionHash !== replay.projectionHash) proofMismatches.push('projectionHash')
  if (first.canonicalRecordId !== replay.canonicalRecordId) proofMismatches.push('canonicalRecordId')
  if (first.canonicalVersion !== replay.canonicalVersion) proofMismatches.push('canonicalVersion')
  if (first.canonicalHash !== replay.canonicalHash) proofMismatches.push('canonicalHash')
  if (projectionCount !== 1) proofMismatches.push('projectionCount')

  if (proofMismatches.length > 0) {
    throw new Error(`G4 runtime proof failed: ${proofMismatches.join(', ')}`)
  }

  return {
    ...replay,
    proofProjectionCount: projectionCount,
    firstWriteProjectionId: first.projectionId,
  }
}
