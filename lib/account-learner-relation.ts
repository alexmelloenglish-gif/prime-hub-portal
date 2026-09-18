import { Prisma } from '@prisma/client'
import registry from '@/data/students/student-core-registry.json'
import { getPrismaClient } from '@/lib/prisma'

export const ACCOUNT_LEARNER_RELATION_STATUS = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
} as const

export const ACCOUNT_LEARNER_RELATION_TYPES = {
  LEARNER_SELF: 'LEARNER_SELF',
  AUTHORIZED_ACCESS: 'AUTHORIZED_ACCESS',
  OTHER_AUTHORIZED: 'OTHER_AUTHORIZED',
} as const

type RelationType = typeof ACCOUNT_LEARNER_RELATION_TYPES[keyof typeof ACCOUNT_LEARNER_RELATION_TYPES]

export type AuthorizeAccountLearnerRelationInput = {
  actorUserId: string
  userId: string
  studentId: string
  relationType: RelationType
  sourceType: string
  sourceReference: string
  authorizationHash?: string | null
  authorizedAt?: Date
  validFrom?: Date | null
  validUntil?: Date | null
}

export type RevokeAccountLearnerRelationInput = {
  actorUserId: string
  relationId: string
  reason: string
  sourceType: string
  sourceReference: string
  authorizationHash?: string | null
  revokedAt?: Date
}

export class AccountLearnerRelationAuthorizationError extends Error {
  code:
    | 'AUTHORITY_REQUIRED'
    | 'ACCOUNT_NOT_FOUND'
    | 'RELATION_NOT_FOUND'
    | 'INVALID_INPUT'
    | 'RELATION_ALREADY_REVOKED'
    | 'RELATION_CONFLICT'

  constructor(
    code: AccountLearnerRelationAuthorizationError['code'],
    message: string
  ) {
    super(message)
    this.name = 'AccountLearnerRelationAuthorizationError'
    this.code = code
  }
}

function requireText(value: string | undefined | null, field: string) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) {
    throw new AccountLearnerRelationAuthorizationError(
      'INVALID_INPUT',
      `${field} is required`
    )
  }
  return normalized
}

async function requireIdentityAuthority(
  tx: Prisma.TransactionClient,
  actorUserId: string
) {
  const actor = await tx.user.findUnique({
    where: { id: requireText(actorUserId, 'actorUserId') },
    select: { id: true, role: true },
  })

  if (!actor) {
    throw new AccountLearnerRelationAuthorizationError(
      'AUTHORITY_REQUIRED',
      'Authorizing actor was not found'
    )
  }

  if (actor.role !== 'admin') {
    throw new AccountLearnerRelationAuthorizationError(
      'AUTHORITY_REQUIRED',
      'Only an administrator may create or revoke AccountLearnerRelation'
    )
  }

  return actor
}

function assertKnownLearner(studentId: string) {
  const student = (registry.students as Array<{
    studentId?: string
    profileStatus?: string
    operatingEligibility?: string
  }>).find((entry) => entry.studentId === studentId)

  if (!student || student.profileStatus !== 'active' || student.operatingEligibility !== 'learner') {
    throw new AccountLearnerRelationAuthorizationError(
      'INVALID_INPUT',
      'studentId must identify an active operational learner'
    )
  }
}

function validateRelationDates(validFrom?: Date | null, validUntil?: Date | null) {
  if (validFrom && validUntil && validFrom > validUntil) {
    throw new AccountLearnerRelationAuthorizationError(
      'INVALID_INPUT',
      'validFrom cannot be later than validUntil'
    )
  }
}

export async function authorizeAccountLearnerRelation(
  input: AuthorizeAccountLearnerRelationInput
) {
  const prisma = getPrismaClient()
  const userId = requireText(input.userId, 'userId')
  const studentId = requireText(input.studentId, 'studentId')
  const sourceType = requireText(input.sourceType, 'sourceType')
  const sourceReference = requireText(input.sourceReference, 'sourceReference')
  const relationType = input.relationType
  const authorizedAt = input.authorizedAt ?? new Date()

  assertKnownLearner(studentId)
  validateRelationDates(input.validFrom, input.validUntil)

  if (
    sourceType.toLowerCase() === 'email_equality' ||
    sourceType.toLowerCase() === 'legacy_email_match'
  ) {
    throw new AccountLearnerRelationAuthorizationError(
      'INVALID_INPUT',
      'Email equality cannot be used as AccountLearnerRelation authority'
    )
  }

  if (!Object.values(ACCOUNT_LEARNER_RELATION_TYPES).includes(relationType)) {
    throw new AccountLearnerRelationAuthorizationError(
      'INVALID_INPUT',
      'Invalid AccountLearnerRelation type'
    )
  }

  return prisma.$transaction(async (tx) => {
    const actor = await requireIdentityAuthority(tx, input.actorUserId)

    const targetAccount = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!targetAccount) {
      throw new AccountLearnerRelationAuthorizationError(
        'ACCOUNT_NOT_FOUND',
        'Target account was not found'
      )
    }

    const existing = await tx.accountLearnerRelation.findUnique({
      where: {
        userId_studentId: {
          userId,
          studentId,
        },
      },
    })

    if (existing?.status === ACCOUNT_LEARNER_RELATION_STATUS.ACTIVE) {
      throw new AccountLearnerRelationAuthorizationError(
        'RELATION_CONFLICT',
        'An active AccountLearnerRelation already exists for this account and learner'
      )
    }

    if (existing?.status === ACCOUNT_LEARNER_RELATION_STATUS.REVOKED) {
      throw new AccountLearnerRelationAuthorizationError(
        'RELATION_CONFLICT',
        'A revoked relation cannot be silently reactivated; create a new authorization lifecycle after an explicit domain decision'
      )
    }

    const relation = await tx.accountLearnerRelation.create({
      data: {
        userId,
        studentId,
        status: ACCOUNT_LEARNER_RELATION_STATUS.ACTIVE,
        relationType,
        sourceType,
        sourceReference,
        authorizationHash: input.authorizationHash ?? null,
        authorizedBy: actor.id,
        authorizedAt,
        validFrom: input.validFrom ?? null,
        validUntil: input.validUntil ?? null,
      },
    })

    await tx.accountLearnerRelationEvent.create({
      data: {
        relationId: relation.id,
        eventType: 'AUTHORIZED',
        actorUserId: actor.id,
        sourceType,
        sourceReference,
        authorizationHash: input.authorizationHash ?? null,
        occurredAt: authorizedAt,
      },
    })

    return relation
  })
}

export async function revokeAccountLearnerRelation(
  input: RevokeAccountLearnerRelationInput
) {
  const prisma = getPrismaClient()
  const relationId = requireText(input.relationId, 'relationId')
  const reason = requireText(input.reason, 'reason')
  const sourceType = requireText(input.sourceType, 'sourceType')
  const sourceReference = requireText(input.sourceReference, 'sourceReference')
  const revokedAt = input.revokedAt ?? new Date()

  return prisma.$transaction(async (tx) => {
    const actor = await requireIdentityAuthority(tx, input.actorUserId)

    const relation = await tx.accountLearnerRelation.findUnique({
      where: { id: relationId },
      select: { id: true, status: true },
    })

    if (!relation) {
      throw new AccountLearnerRelationAuthorizationError(
        'RELATION_NOT_FOUND',
        'AccountLearnerRelation was not found'
      )
    }

    if (relation.status === ACCOUNT_LEARNER_RELATION_STATUS.REVOKED) {
      return tx.accountLearnerRelation.findUniqueOrThrow({
        where: { id: relationId },
      })
    }

    const updated = await tx.accountLearnerRelation.update({
      where: { id: relationId },
      data: {
        status: ACCOUNT_LEARNER_RELATION_STATUS.REVOKED,
        revokedBy: actor.id,
        revokedAt,
        revocationReason: reason,
      },
    })

    await tx.accountLearnerRelationEvent.create({
      data: {
        relationId,
        eventType: 'REVOKED',
        actorUserId: actor.id,
        sourceType,
        sourceReference,
        authorizationHash: input.authorizationHash ?? null,
        reason,
        occurredAt: revokedAt,
      },
    })

    return updated
  })
}
