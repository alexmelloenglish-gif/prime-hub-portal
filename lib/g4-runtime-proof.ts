import { CanonicalizationError } from '@/lib/canonicalization'
import { projectCanonicalPortfolio } from '@/lib/canonical-portfolio-projection'
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

  return projectCanonicalPortfolio({
    canonicalRecordId: provenance.canonicalRecordId,
    requiredG3VerificationId: g3.id,
  })
}
