import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'
import { resolveAuthorizedLearnerRelation } from '../../lib/learner-account-resolution.ts'
import { getPrismaClient } from '../../lib/prisma.ts'

const prisma = getPrismaClient()
const suffix = randomUUID().replaceAll('-', '')
const learnerA = `synthetic-learner-a-${suffix}`
const learnerB = `synthetic-learner-b-${suffix}`
const sourceReference = `student-isolation-witness-${suffix}`

let admin: { id: string; email: string | null; role: string }
let studentA: { id: string; email: string | null; role: string }
let studentB: { id: string; email: string | null; role: string }
let guardian: { id: string; email: string | null; role: string }
let fixtureUserIds: string[] = []

before(async () => {
  ;[admin, studentA, studentB, guardian] = await Promise.all([
    prisma.user.create({ data: { name: 'Synthetic Admin', email: `admin-${suffix}@invalid.test`, role: 'admin' } }),
    prisma.user.create({ data: { name: 'Synthetic Student A', email: `student-a-${suffix}@invalid.test`, role: 'student' } }),
    prisma.user.create({ data: { name: 'Synthetic Student B', email: `student-b-${suffix}@invalid.test`, role: 'student' } }),
    prisma.user.create({ data: { name: 'Synthetic Guardian', email: `guardian-${suffix}@invalid.test`, role: 'guardian' } }),
  ])
  fixtureUserIds = [admin.id, studentA.id, studentB.id, guardian.id]
  const authorizedAt = new Date(Date.now() - 1_000)
  await prisma.accountLearnerRelation.createMany({
    data: [
      {
        userId: studentA.id,
        studentId: learnerA,
        status: 'ACTIVE',
        relationType: 'LEARNER_SELF',
        sourceType: 'synthetic_test_fixture',
        sourceReference,
        authorizedBy: admin.id,
        authorizedAt,
      },
      {
        userId: studentB.id,
        studentId: learnerB,
        status: 'ACTIVE',
        relationType: 'LEARNER_SELF',
        sourceType: 'synthetic_test_fixture',
        sourceReference,
        authorizedBy: admin.id,
        authorizedAt,
      },
      {
        userId: guardian.id,
        studentId: learnerA,
        status: 'ACTIVE',
        relationType: 'AUTHORIZED_ACCESS',
        sourceType: 'synthetic_test_fixture',
        sourceReference,
        authorizedBy: admin.id,
        authorizedAt,
      },
    ],
  })
})

after(async () => {
  if (fixtureUserIds.length) {
    await prisma.accountLearnerRelation.deleteMany({
      where: { userId: { in: fixtureUserIds } },
    })
    await prisma.user.deleteMany({ where: { id: { in: fixtureUserIds } } })
  }
  await prisma.$disconnect()
})

function account(user: { id: string; email: string | null; role: string }) {
  return { accountId: user.id, accountEmail: user.email, role: user.role }
}

test('student can resolve only the explicitly linked learner record', async () => {
  const own = await resolveAuthorizedLearnerRelation({
    account: account(studentA),
    requestedStudentId: learnerA,
  })
  assert.equal(own.status, 'AUTHORIZED')
  if (own.status === 'AUTHORIZED') assert.equal(own.studentId, learnerA)

  const crossLearner = await resolveAuthorizedLearnerRelation({
    account: account(studentA),
    requestedStudentId: learnerB,
  })
  assert.equal(crossLearner.status, 'ABSENT')
  if (crossLearner.status === 'ABSENT') {
    assert.equal(crossLearner.reason, 'REQUESTED_LEARNER_NOT_AUTHORIZED')
    assert.equal(crossLearner.studentId, null)
  }
})

test('guardian can resolve the authorized learner and is denied another learner', async () => {
  const authorized = await resolveAuthorizedLearnerRelation({
    account: account(guardian),
    requestedStudentId: learnerA,
  })
  assert.equal(authorized.status, 'AUTHORIZED')
  if (authorized.status === 'AUTHORIZED') assert.equal(authorized.studentId, learnerA)

  const denied = await resolveAuthorizedLearnerRelation({
    account: account(guardian),
    requestedStudentId: learnerB,
  })
  assert.equal(denied.status, 'ABSENT')
  if (denied.status === 'ABSENT') {
    assert.equal(denied.reason, 'REQUESTED_LEARNER_NOT_AUTHORIZED')
    assert.equal(denied.studentId, null)
  }
})

test('authorization outage and missing relation are never treated as permission', async () => {
  const noRelation = await resolveAuthorizedLearnerRelation({
    account: account(studentA),
    requestedStudentId: `unlinked-${suffix}`,
  })
  assert.equal(noRelation.status, 'ABSENT')
  if (noRelation.status === 'ABSENT') assert.equal(noRelation.studentId, null)
})

test('dashboard and mutation routes keep their current authentication/role guards explicit', () => {
  const dashboard = readFileSync('app/dashboard/page.tsx', 'utf8')
  const audio = readFileSync('app/api/dashboard/action/audio/route.ts', 'utf8')
  const vocabulary = readFileSync('app/api/student/vocabulary-reuse/route.ts', 'utf8')
  const retry = readFileSync('app/api/admin/pipeline/retry/route.ts', 'utf8')
  const machine = readFileSync('app/api/admin/learning-machine/run/route.ts', 'utf8')

  assert.match(dashboard, /getServerSession\(authOptions\)/)
  assert.match(dashboard, /if \(!session\?\.user\) redirect\('\/login'\)/)
  assert.match(audio, /if \(!session\?\.user\) return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\)/)
  assert.match(audio, /if \(!state\.hasAccess \|\| !state\.student\?\.studentId\)/)
  assert.match(vocabulary, /if \(!state\.hasAccess \|\| !state\.student\)/)
  assert.match(retry, /if \(!isAdminUser\(session\.user\)\)/)
  assert.match(machine, /if \(!isAdminUser\(session\.user\)\)/)
})
