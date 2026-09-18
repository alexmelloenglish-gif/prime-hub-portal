import { createHash } from 'node:crypto'
import { cache } from 'react'
import type { Session } from 'next-auth'
import { getPrismaClient } from '@/lib/prisma'
import {
  accountIdentityFromSession,
  resolveAuthorizedLearnerRelation,
  type AuthorizedAccountLearnerRelation,
} from '@/lib/learner-account-resolution'
import { resolveCanonicalLearnerIdentity } from '@/lib/canonical-learner-directory'

export const G6_CANONICAL_CONSUMER_VERSION = 'g6-dashboard-consumer-v1'

type AuthenticatedUser = Session['user'] | null | undefined

type JsonObject = Record<string, unknown>

export type G6CanonicalPresentedPayload = {
  currentState: unknown
  priorities: unknown
  teacherInsight: unknown
  learningSignals: unknown
  validatedEvidence: unknown
  evidenceBoundaries: unknown
  nextAction: unknown
  nextVerification: unknown
  vocabulary: unknown
  grammarCorrections: unknown
}

export type G6CanonicalDashboardAuthorizedState = {
  status: 'AUTHORIZED'
  source: 'canonical-g6'
  learnerId: string
  learnerName: string
  profileStatus: string
  learnerEmail: string | null
  guardianName: null
  guardianEmail: null
  accountContactEmail: string | null
  relation: AuthorizedAccountLearnerRelation
  canonicalRecordId: string
  canonicalVersion: number
  canonicalHash: string
  upstreamProjectionId: string
  upstreamProjectionKey: string
  upstreamProjectionHash: string
  upstreamProjectionVersion: string
  authorityScope: string
  teacherDecisionId: string
  sourceReferences: unknown
  consumerProjectionVersion: typeof G6_CANONICAL_CONSUMER_VERSION
  consumerProjectionHash: string
  verificationStatus: 'VERIFIED'
  payload: G6CanonicalPresentedPayload
}

export type G6CanonicalDashboardState =
  | G6CanonicalDashboardAuthorizedState
  | {
      status: 'DISABLED'
      source: 'canonical-g6'
      reason: 'FEATURE_DISABLED'
    }
  | {
      status: 'ABSENT' | 'NOT_OBSERVABLE'
      source: 'canonical-g6'
      reason:
        | 'ACCOUNT_IDENTITY_UNAVAILABLE'
        | 'NO_AUTHORIZED_LEARNER_RELATION'
        | 'AMBIGUOUS_OR_UNOBSERVABLE_RELATION'
        | 'LEARNER_DIRECTORY_NOT_FOUND'
        | 'VERIFIED_G5_NOT_FOUND'
        | 'CANONICAL_RECORD_NOT_FOUND'
        | 'CANONICAL_LINEAGE_MISMATCH'
        | 'G3_VERIFICATION_NOT_PROVEN'
    }

export function isG6CanonicalConsumerEnabled() {
  return process.env.G6_CANONICAL_CONSUMER_ENABLED === '1'
}

function stableNormalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableNormalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as JsonObject)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableNormalize(item)])
    )
  }
  return value
}

function stableJson(value: unknown) {
  return JSON.stringify(stableNormalize(value))
}

function hashConsumerProjection(value: unknown) {
  return createHash('sha256').update(stableJson(value)).digest('hex')
}

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {}
}

function pickPresentedPayload(value: unknown): G6CanonicalPresentedPayload {
  const projection = asObject(value)
  return {
    currentState: projection.currentState ?? null,
    priorities: projection.priorities ?? null,
    teacherInsight: projection.teacherInsight ?? null,
    learningSignals: projection.learningSignals ?? [],
    validatedEvidence: projection.validatedEvidence ?? [],
    evidenceBoundaries: projection.evidenceBoundaries ?? [],
    nextAction: projection.nextAction ?? null,
    nextVerification: projection.nextVerification ?? null,
    vocabulary: projection.vocabulary ?? [],
    grammarCorrections: projection.grammarCorrections ?? [],
  }
}

export const getG6CanonicalDashboardState = cache(
  async (user: AuthenticatedUser): Promise<G6CanonicalDashboardState> => {
    if (!isG6CanonicalConsumerEnabled()) {
      return {
        status: 'DISABLED',
        source: 'canonical-g6',
        reason: 'FEATURE_DISABLED',
      }
    }

    const account = accountIdentityFromSession(user)
    if (!account) {
      return {
        status: 'NOT_OBSERVABLE',
        source: 'canonical-g6',
        reason: 'ACCOUNT_IDENTITY_UNAVAILABLE',
      }
    }

    const learnerResolution = await resolveAuthorizedLearnerRelation({ account })
    if (learnerResolution.status === 'ABSENT') {
      return {
        status: 'ABSENT',
        source: 'canonical-g6',
        reason: 'NO_AUTHORIZED_LEARNER_RELATION',
      }
    }
    if (learnerResolution.status !== 'AUTHORIZED') {
      return {
        status: 'NOT_OBSERVABLE',
        source: 'canonical-g6',
        reason: 'AMBIGUOUS_OR_UNOBSERVABLE_RELATION',
      }
    }

    const learnerIdentity = resolveCanonicalLearnerIdentity(learnerResolution.studentId)
    if (!learnerIdentity) {
      return {
        status: 'NOT_OBSERVABLE',
        source: 'canonical-g6',
        reason: 'LEARNER_DIRECTORY_NOT_FOUND',
      }
    }

    const prisma = getPrismaClient()
    const upstream = await prisma.canonicalLearningIntelligenceProjection.findFirst({
      where: {
        studentId: learnerResolution.studentId,
        targetType: 'learning_intelligence',
        projectionStatus: 'VERIFIED',
      },
      orderBy: [
        { canonicalVersion: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    if (!upstream) {
      return {
        status: 'NOT_OBSERVABLE',
        source: 'canonical-g6',
        reason: 'VERIFIED_G5_NOT_FOUND',
      }
    }

    const canonicalRecord = await prisma.canonicalLearningRecord.findUnique({
      where: { canonicalRecordId: upstream.canonicalRecordId },
      select: {
        canonicalRecordId: true,
        canonicalVersion: true,
        canonicalHash: true,
        studentId: true,
        teacherDecisionId: true,
        authorityScope: true,
      },
    })

    if (!canonicalRecord) {
      return {
        status: 'NOT_OBSERVABLE',
        source: 'canonical-g6',
        reason: 'CANONICAL_RECORD_NOT_FOUND',
      }
    }

    const lineageMatches =
      canonicalRecord.studentId === learnerResolution.studentId &&
      canonicalRecord.canonicalRecordId === upstream.canonicalRecordId &&
      canonicalRecord.canonicalVersion === upstream.canonicalVersion &&
      canonicalRecord.canonicalHash === upstream.canonicalHash &&
      canonicalRecord.teacherDecisionId === upstream.teacherDecisionId &&
      canonicalRecord.authorityScope === upstream.authorityScope

    if (!lineageMatches) {
      return {
        status: 'NOT_OBSERVABLE',
        source: 'canonical-g6',
        reason: 'CANONICAL_LINEAGE_MISMATCH',
      }
    }

    const g3 = await prisma.canonicalLearningRecordVerification.findUnique({
      where: { id: upstream.g3VerificationId },
      select: {
        verificationStatus: true,
        expectedCanonicalRecordId: true,
        expectedCanonicalVersion: true,
        expectedCanonicalHash: true,
      },
    })

    if (
      !g3 ||
      g3.verificationStatus !== 'PASS' ||
      g3.expectedCanonicalRecordId !== canonicalRecord.canonicalRecordId ||
      g3.expectedCanonicalVersion !== canonicalRecord.canonicalVersion ||
      g3.expectedCanonicalHash !== canonicalRecord.canonicalHash
    ) {
      return {
        status: 'NOT_OBSERVABLE',
        source: 'canonical-g6',
        reason: 'G3_VERIFICATION_NOT_PROVEN',
      }
    }

    const payload = pickPresentedPayload(upstream.projection)
    const learnerEmail =
      learnerResolution.relation.relationType === 'LEARNER_SELF'
        ? account.accountEmail
        : null
    const accountContactEmail = account.accountEmail

    const consumerEnvelope = {
      learnerId: learnerResolution.studentId,
      canonicalRecordId: canonicalRecord.canonicalRecordId,
      canonicalVersion: canonicalRecord.canonicalVersion,
      canonicalHash: canonicalRecord.canonicalHash,
      upstreamProjectionId: upstream.projectionId,
      upstreamProjectionKey: upstream.projectionKey,
      upstreamProjectionHash: upstream.projectionHash,
      upstreamProjectionVersion: upstream.projectionVersion,
      authorityScope: upstream.authorityScope,
      teacherDecisionId: upstream.teacherDecisionId,
      sourceReferences: upstream.sourceReferences,
      relationId: learnerResolution.relation.relationId,
      relationType: learnerResolution.relation.relationType,
      consumerProjectionVersion: G6_CANONICAL_CONSUMER_VERSION,
      payload,
    }

    return {
      status: 'AUTHORIZED',
      source: 'canonical-g6',
      learnerId: learnerResolution.studentId,
      learnerName: learnerIdentity.learnerName,
      profileStatus: learnerIdentity.profileStatus,
      learnerEmail,
      guardianName: null,
      guardianEmail: null,
      accountContactEmail,
      relation: learnerResolution.relation,
      canonicalRecordId: canonicalRecord.canonicalRecordId,
      canonicalVersion: canonicalRecord.canonicalVersion,
      canonicalHash: canonicalRecord.canonicalHash,
      upstreamProjectionId: upstream.projectionId,
      upstreamProjectionKey: upstream.projectionKey,
      upstreamProjectionHash: upstream.projectionHash,
      upstreamProjectionVersion: upstream.projectionVersion,
      authorityScope: upstream.authorityScope,
      teacherDecisionId: upstream.teacherDecisionId,
      sourceReferences: upstream.sourceReferences,
      consumerProjectionVersion: G6_CANONICAL_CONSUMER_VERSION,
      consumerProjectionHash: hashConsumerProjection(consumerEnvelope),
      verificationStatus: 'VERIFIED',
      payload,
    }
  }
)
