import type { Session } from 'next-auth'
import { getPrismaClient } from '@/lib/prisma'

export type LearnerResolutionStatus =
  | 'AUTHORIZED'
  | 'ABSENT'
  | 'NOT_OBSERVABLE'

export type AuthenticatedAccountIdentity = {
  accountId: string
  accountEmail: string | null
  role: string
}

export type AuthorizedAccountLearnerRelation = {
  relationId: string
  accountId: string
  studentId: string
  relationStatus: 'ACTIVE'
  relationType: 'LEARNER_SELF' | 'AUTHORIZED_ACCESS' | 'OTHER_AUTHORIZED'
  sourceType: string
  sourceReference: string
  authorizationHash: string | null
  authorizedBy: string
  authorizedAt: string
  validFrom: string | null
  validUntil: string | null
}

export type LearnerAccountResolution =
  | {
      status: 'AUTHORIZED'
      account: AuthenticatedAccountIdentity
      studentId: string
      relation: AuthorizedAccountLearnerRelation
    }
  | {
      status: 'ABSENT'
      account: AuthenticatedAccountIdentity
      studentId: null
      relation: null
      reason: 'NO_ACTIVE_RELATION' | 'REQUESTED_LEARNER_NOT_AUTHORIZED'
    }
  | {
      status: 'NOT_OBSERVABLE'
      account: AuthenticatedAccountIdentity
      studentId: null
      relation: null
      reason: 'ACCOUNT_ID_MISSING' | 'SOURCE_UNAVAILABLE' | 'AMBIGUOUS_RELATION'
    }

export type LearnerAccountResolutionInput = {
  account: AuthenticatedAccountIdentity
  requestedStudentId?: string | null
}

export function normalizeAccountEmail(email?: string | null) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

export function accountIdentityFromSession(
  user: Session['user'] | null | undefined
): AuthenticatedAccountIdentity | null {
  const accountId = typeof user?.id === 'string' ? user.id.trim() : ''
  if (!accountId) return null

  return {
    accountId,
    accountEmail: normalizeAccountEmail(user?.email) || null,
    role: typeof user?.role === 'string' ? user.role : 'student',
  }
}

type AbsentReason = 'NO_ACTIVE_RELATION' | 'REQUESTED_LEARNER_NOT_AUTHORIZED'
type NotObservableReason = 'ACCOUNT_ID_MISSING' | 'SOURCE_UNAVAILABLE' | 'AMBIGUOUS_RELATION'

function unresolvedLearnerAccountResolution(
  account: AuthenticatedAccountIdentity,
  status: 'ABSENT',
  reason: AbsentReason
): LearnerAccountResolution
function unresolvedLearnerAccountResolution(
  account: AuthenticatedAccountIdentity,
  status: 'NOT_OBSERVABLE',
  reason: NotObservableReason
): LearnerAccountResolution
function unresolvedLearnerAccountResolution(
  account: AuthenticatedAccountIdentity,
  status: 'ABSENT' | 'NOT_OBSERVABLE',
  reason: AbsentReason | NotObservableReason
): LearnerAccountResolution {
  if (status === 'ABSENT') {
    return {
      status: 'ABSENT',
      account,
      studentId: null,
      relation: null,
      reason: reason as AbsentReason,
    }
  }

  return {
    status: 'NOT_OBSERVABLE',
    account,
    studentId: null,
    relation: null,
    reason: reason as NotObservableReason,
  }
}

export async function resolveAuthorizedLearnerRelation(
  input: LearnerAccountResolutionInput
): Promise<LearnerAccountResolution> {
  const account = input.account
  const requestedStudentId = typeof input.requestedStudentId === 'string'
    ? input.requestedStudentId.trim()
    : ''

  if (!account.accountId) {
    return unresolvedLearnerAccountResolution(account, 'NOT_OBSERVABLE', 'ACCOUNT_ID_MISSING')
  }

  const now = new Date()
  const validityFilter = {
    AND: [
      {
        OR: [
          { validFrom: null },
          { validFrom: { lte: now } },
        ],
      },
      {
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
    ],
  }

  try {
    const prisma = getPrismaClient()
    const relations = await prisma.accountLearnerRelation.findMany({
      where: {
        userId: account.accountId,
        status: 'ACTIVE',
        ...validityFilter,
        ...(requestedStudentId ? { studentId: requestedStudentId } : {}),
      },
      orderBy: { authorizedAt: 'desc' },
    })

    if (relations.length === 0) {
      return unresolvedLearnerAccountResolution(
        account,
        'ABSENT',
        requestedStudentId
          ? 'REQUESTED_LEARNER_NOT_AUTHORIZED'
          : 'NO_ACTIVE_RELATION'
      )
    }

    if (!requestedStudentId && relations.length > 1) {
      return unresolvedLearnerAccountResolution(
        account,
        'NOT_OBSERVABLE',
        'AMBIGUOUS_RELATION'
      )
    }

    if (relations.length !== 1) {
      return unresolvedLearnerAccountResolution(
        account,
        'NOT_OBSERVABLE',
        'AMBIGUOUS_RELATION'
      )
    }

    const relation = relations[0]

    return {
      status: 'AUTHORIZED',
      account,
      studentId: relation.studentId,
      relation: {
        relationId: relation.id,
        accountId: relation.userId,
        studentId: relation.studentId,
        relationStatus: 'ACTIVE',
        relationType: relation.relationType as AuthorizedAccountLearnerRelation['relationType'],
        sourceType: relation.sourceType,
        sourceReference: relation.sourceReference,
        authorizationHash: relation.authorizationHash,
        authorizedBy: relation.authorizedBy,
        authorizedAt: relation.authorizedAt.toISOString(),
        validFrom: relation.validFrom?.toISOString() ?? null,
        validUntil: relation.validUntil?.toISOString() ?? null,
      },
    }
  } catch {
    return unresolvedLearnerAccountResolution(
      account,
      'NOT_OBSERVABLE',
      'SOURCE_UNAVAILABLE'
    )
  }
}
