import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import {
  CANONICAL_AUTHORITY_STATUS,
  authorityTransitionForDecision,
  assertExplicitProjectionAuthorization,
  assertTeacherDecisionCanCanonicalize,
  normalizeCandidateRecord,
  resolveCanonicalPayload,
  type CandidateRecordInput,
  type CanonicalizationInput,
  type ProjectionAuthorizationInput,
  type TeacherDecisionInput,
} from './authority-contract'

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

export async function createIntelligenceCandidate(input: CandidateRecordInput) {
  const prisma = getPrismaClient()
  const candidate = normalizeCandidateRecord(input)
  const existing = await prisma.intelligenceCandidateRecord.findUnique({
    where: { candidateKey: candidate.candidateKey },
  })
  if (existing) return existing

  try {
    return await prisma.intelligenceCandidateRecord.create({
      data: {
        ...candidate,
        payload: asJson(candidate.payload),
        provenance: asJson(candidate.provenance),
      },
    })
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error
    const concurrent = await prisma.intelligenceCandidateRecord.findUnique({
      where: { candidateKey: candidate.candidateKey },
    })
    if (!concurrent) throw error
    return concurrent
  }
}

export async function recordTeacherDecision(input: TeacherDecisionInput) {
  const prisma = getPrismaClient()
  const reviewerId = input.reviewerId.trim()
  if (!reviewerId) throw new Error('reviewerId is required')

  const candidate = await prisma.intelligenceCandidateRecord.findUnique({
    where: { id: input.candidateRecordId },
    include: { reviewTransition: true },
  })
  if (!candidate) throw new Error('Candidate record not found')
  if (candidate.reviewTransition) {
    throw new Error('Candidate already has a final teacher decision; create a new candidate version instead of rewriting authority history')
  }

  const reviewedPayload = input.reviewedPayload === undefined
    ? undefined
    : asJson(input.reviewedPayload)

  return prisma.intelligenceReviewTransition.create({
    data: {
      candidateRecordId: candidate.id,
      decision: input.decision,
      authorityTransition: authorityTransitionForDecision(input.decision),
      reviewerId,
      reviewerRole: 'teacher',
      reason: input.reason?.trim() || null,
      ...(reviewedPayload === undefined ? {} : { reviewedPayload }),
    },
  })
}

export async function canonicalizeTeacherValidatedCandidate(input: CanonicalizationInput) {
  const prisma = getPrismaClient()
  const canonicalizedBy = input.canonicalizedBy.trim()
  const canonicalRecordKey = input.canonicalRecordKey.trim()
  if (!canonicalizedBy) throw new Error('canonicalizedBy is required')
  if (!canonicalRecordKey) throw new Error('canonicalRecordKey is required')

  const candidate = await prisma.intelligenceCandidateRecord.findUnique({
    where: { id: input.candidateRecordId },
  })
  if (!candidate) throw new Error('Candidate record not found')

  const review = await prisma.intelligenceReviewTransition.findUnique({
    where: { id: input.reviewTransitionId },
  })
  if (!review || review.candidateRecordId !== candidate.id) {
    throw new Error('Teacher review transition does not belong to this candidate')
  }

  assertTeacherDecisionCanCanonicalize(review.decision as 'approved' | 'edited' | 'rejected')
  const canonicalPayload = resolveCanonicalPayload({
    decision: review.decision as 'approved' | 'edited' | 'rejected',
    candidatePayload: candidate.payload,
    reviewedPayload: review.reviewedPayload,
  })

  return prisma.intelligenceCanonicalization.create({
    data: {
      candidateRecordId: candidate.id,
      reviewTransitionId: review.id,
      canonicalRecordKey,
      studentEmail: candidate.studentEmail,
      lessonId: candidate.lessonId,
      canonicalPayload: asJson(canonicalPayload),
      canonicalizedBy,
      authorityStatus: CANONICAL_AUTHORITY_STATUS,
    },
  })
}

export async function authorizeCanonicalProjection(input: ProjectionAuthorizationInput) {
  const prisma = getPrismaClient()
  const authorizedBy = input.authorizedBy.trim()
  const projectionKey = input.projectionKey.trim()
  if (!authorizedBy) throw new Error('authorizedBy is required')
  if (!projectionKey) throw new Error('projectionKey is required')

  const canonicalization = await prisma.intelligenceCanonicalization.findUnique({
    where: { id: input.canonicalizationId },
    include: { reviewTransition: true },
  })
  if (!canonicalization) throw new Error('Canonicalization record not found')

  assertExplicitProjectionAuthorization({
    canonicalAuthorityStatus: canonicalization.authorityStatus,
    reviewDecision: canonicalization.reviewTransition.decision,
    authorityTransition: canonicalization.reviewTransition.authorityTransition,
    requestedBy: authorizedBy,
  })

  return prisma.intelligenceAuthorizedProjection.create({
    data: {
      canonicalizationId: canonicalization.id,
      projectionKey,
      authorizedBy,
      status: 'authorized_not_projected',
    },
  })
}

/**
 * Intentionally absent from this service: any mutation of PortfolioProjection,
 * ClassReportProjection, Firestore student documents, or learner-facing dashboard data.
 *
 * NEW INTELLIGENCE stops at an explicit projection authorization record. A dedicated
 * projector may be added later, but it must accept a canonicalization/authorization
 * identifier — never an AI candidate or raw model output.
 */
