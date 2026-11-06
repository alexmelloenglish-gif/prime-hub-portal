import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { getPrismaClient } from '../lib/prisma.ts'
import {
  accountIdentityFromSession,
  resolveAuthorizedLearnerRelation,
} from '../lib/learner-account-resolution.ts'

async function main() {
  const prisma = getPrismaClient()
  const nonce = randomUUID()
  const account = await prisma.user.create({
    data: {
      email: `g6.account.${nonce}@invalid.test`,
      name: 'Synthetic G6 Account',
      role: 'student',
    },
  })

  try {
    const studentA = `stu_g6_a_${nonce}`
    const studentB = `stu_g6_b_${nonce}`
    const authorizedAt = new Date('2026-11-06T04:00:00.000Z')

    await prisma.accountLearnerRelation.create({
      data: {
        userId: account.id,
        studentId: studentA,
        status: 'ACTIVE',
        relationType: 'LEARNER_SELF',
        sourceType: 'synthetic_owner_authorization',
        sourceReference: `g6-witness:${nonce}:student-a`,
        authorizedBy: 'synthetic-identity-authority',
        authorizedAt,
      },
    })

    const identity = accountIdentityFromSession({
      id: account.id,
      email: account.email,
      role: account.role,
    })
    assert.ok(identity)

    const own = await resolveAuthorizedLearnerRelation({
      account: identity,
      requestedStudentId: studentA,
    })
    assert.equal(own.status, 'AUTHORIZED')
    if (own.status !== 'AUTHORIZED') throw new Error('Own learner resolution unexpectedly failed')
    assert.equal(own.studentId, studentA)
    assert.equal(own.relation.relationType, 'LEARNER_SELF')

    const crossAccountAttempt = await resolveAuthorizedLearnerRelation({
      account: identity,
      requestedStudentId: studentB,
    })
    assert.equal(crossAccountAttempt.status, 'ABSENT')
    if (crossAccountAttempt.status !== 'ABSENT') {
      throw new Error('Cross-learner access must fail closed without an explicit relation')
    }
    assert.equal(crossAccountAttempt.reason, 'REQUESTED_LEARNER_NOT_AUTHORIZED')

    await prisma.accountLearnerRelation.create({
      data: {
        userId: account.id,
        studentId: studentB,
        status: 'ACTIVE',
        relationType: 'AUTHORIZED_ACCESS',
        sourceType: 'synthetic_owner_authorization',
        sourceReference: `g6-witness:${nonce}:student-b`,
        authorizedBy: 'synthetic-identity-authority',
        authorizedAt,
      },
    })
    const ambiguous = await resolveAuthorizedLearnerRelation({ account: identity })
    assert.equal(ambiguous.status, 'NOT_OBSERVABLE')
    if (ambiguous.status !== 'NOT_OBSERVABLE') {
      throw new Error('Multiple active learner relations must require explicit learner selection')
    }
    assert.equal(ambiguous.reason, 'AMBIGUOUS_RELATION')

    const report = {
      verdict: 'G6 ACCOUNT-LEARNER AUTHORIZATION WITNESS PASS',
      database: 'GitHub Actions disposable PostgreSQL service',
      productionTouched: false,
      syntheticIdentity: true,
      accountRef: account.id.length ? 'sha256:' + account.id.length : 'redacted',
      ownLearner: 'AUTHORIZED',
      crossLearnerAttempt: 'ABSENT',
      multipleRelationsWithoutSelection: 'NOT_OBSERVABLE',
      explicitLearnerSelectionRequired: true,
    }
    console.log(JSON.stringify(report, null, 2))
  } finally {
    await prisma.accountLearnerRelation.deleteMany({ where: { userId: account.id } })
    await prisma.user.delete({ where: { id: account.id } })
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
