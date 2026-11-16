// Synthetic, disposable-Postgres witness for session-to-learner authorization.
// No OAuth calls, real learner identifiers, or Production databases are used.
import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import { accountIdentityFromSession, resolveAuthorizedLearnerRelation } from '../lib/learner-account-resolution.ts'
import { getPrismaClient } from '../lib/prisma.ts'

function ref(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16)
}

async function main() {
  const prisma = getPrismaClient()
  const nonce = randomUUID().replace(/-/g, '').slice(0, 16)
  const createdUserIds: string[] = []
  const learnerA = 'synthetic-learner-a-' + nonce
  const learnerB = 'synthetic-learner-b-' + nonce
  const now = new Date()

  const dashboardLayout = fs.readFileSync('app/dashboard/layout.tsx', 'utf8')
  const studentDataSource = fs.readFileSync('lib/student-data.ts', 'utf8')
  const retryRoute = fs.readFileSync('app/api/admin/pipeline/retry/route.ts', 'utf8')
  const resolverSource = fs.readFileSync('lib/learner-account-resolution.ts', 'utf8')

  assert.match(dashboardLayout, /getServerSession\(authOptions\)/, 'Dashboard must derive access from NextAuth session')
  assert.match(dashboardLayout, /if \(!activeUser\)\s*\{\s*redirect\('\/login'\)/, 'Anonymous dashboard access must redirect to login')
  assert.match(dashboardLayout, /isAuthorizedLearner\(activeStudentEmail\)/, 'Learner dashboard must require an eligible learner identity')
  assert.match(studentDataSource, /user\?\.role === 'admin'/, 'Admin preview must depend on the admin role')
  assert.match(studentDataSource, /return isAdminUser\(user\)/, 'Cross-learner preview must be admin-only')
  assert.match(retryRoute, /if \(!session\?\.user\)[\s\S]*status: 401/, 'Admin retry must reject unauthenticated requests')
  assert.match(retryRoute, /if \(!isAdminUser\(session\.user\)\)[\s\S]*status: 403/, 'Admin retry must reject non-admin sessions')
  assert.match(resolverSource, /userId: account\.accountId[\s\S]*status: 'ACTIVE'/, 'G6 must scope the active relation to the authenticated account id')
  assert.match(resolverSource, /studentId: requestedStudentId/, 'G6 must resolve the explicitly requested learner id')
  assert.doesNotMatch(resolverSource, /guardianEmail|canonicalEmail|studentEmail/, 'G6 must not infer authority from email equality')

  async function createUser(identity: string, role: string) {
    const user = await prisma.user.create({
      data: { name: 'Synthetic ' + identity, email: identity + '.' + nonce + '@invalid.test', role },
    })
    createdUserIds.push(user.id)
    return user
  }

  async function addRelation(input: {
    userId: string
    studentId: string
    relationType: 'LEARNER_SELF' | 'AUTHORIZED_ACCESS' | 'OTHER_AUTHORIZED'
    status?: 'ACTIVE' | 'REVOKED'
    authorizedBy: string
  }) {
    return prisma.accountLearnerRelation.create({
      data: {
        userId: input.userId,
        studentId: input.studentId,
        status: input.status ?? 'ACTIVE',
        relationType: input.relationType,
        sourceType: 'synthetic_ci_fixture',
        sourceReference: 'student-isolation-witness:' + nonce,
        authorizedBy: input.authorizedBy,
        authorizedAt: now,
        validFrom: null,
        validUntil: null,
      },
    })
  }

  function identity(user: { id: string; email: string | null; role: string }) {
    const value = accountIdentityFromSession({ id: user.id, email: user.email, role: user.role } as never)
    assert.ok(value, 'A session with a persisted account id must resolve to an account identity')
    return value
  }

  try {
    const admin = await createUser('admin', 'admin')
    const studentA = await createUser('student-a', 'student')
    const studentB = await createUser('student-b', 'student')
    const guardian = await createUser('guardian', 'guardian')
    const teacher = await createUser('teacher', 'teacher')

    await addRelation({ userId: studentA.id, studentId: learnerA, relationType: 'LEARNER_SELF', authorizedBy: admin.id })
    await addRelation({ userId: studentB.id, studentId: learnerB, relationType: 'LEARNER_SELF', authorizedBy: admin.id })
    await addRelation({ userId: guardian.id, studentId: learnerA, relationType: 'AUTHORIZED_ACCESS', authorizedBy: admin.id })
    await addRelation({ userId: guardian.id, studentId: learnerB, relationType: 'AUTHORIZED_ACCESS', status: 'REVOKED', authorizedBy: admin.id })
    await addRelation({ userId: teacher.id, studentId: learnerA, relationType: 'OTHER_AUTHORIZED', authorizedBy: admin.id })
    await addRelation({ userId: teacher.id, studentId: learnerB, relationType: 'OTHER_AUTHORIZED', authorizedBy: admin.id })

    const studentOwn = await resolveAuthorizedLearnerRelation({ account: identity(studentA), requestedStudentId: learnerA })
    assert.equal(studentOwn.status, 'AUTHORIZED')
    if (studentOwn.status !== 'AUTHORIZED') throw new Error('Student own-learner relation did not authorize')
    assert.equal(studentOwn.studentId, learnerA)
    assert.equal(studentOwn.relation.relationType, 'LEARNER_SELF')

    const studentCross = await resolveAuthorizedLearnerRelation({ account: identity(studentA), requestedStudentId: learnerB })
    assert.equal(studentCross.status, 'ABSENT')
    if (studentCross.status !== 'ABSENT') throw new Error('Cross-learner request was not denied')
    assert.equal(studentCross.reason, 'REQUESTED_LEARNER_NOT_AUTHORIZED')

    const guardianOwn = await resolveAuthorizedLearnerRelation({ account: identity(guardian), requestedStudentId: learnerA })
    assert.equal(guardianOwn.status, 'AUTHORIZED')
    if (guardianOwn.status !== 'AUTHORIZED') throw new Error('Guardian authorization fixture did not resolve')
    assert.equal(guardianOwn.relation.relationType, 'AUTHORIZED_ACCESS')

    const guardianRevoked = await resolveAuthorizedLearnerRelation({ account: identity(guardian), requestedStudentId: learnerB })
    assert.equal(guardianRevoked.status, 'ABSENT')
    if (guardianRevoked.status !== 'ABSENT') throw new Error('Revoked guardian relation was not denied')
    assert.equal(guardianRevoked.reason, 'REQUESTED_LEARNER_NOT_AUTHORIZED')

    const teacherOwn = await resolveAuthorizedLearnerRelation({ account: identity(teacher), requestedStudentId: learnerA })
    assert.equal(teacherOwn.status, 'AUTHORIZED')
    if (teacherOwn.status !== 'AUTHORIZED') throw new Error('Teacher authorization fixture did not resolve')
    assert.equal(teacherOwn.relation.relationType, 'OTHER_AUTHORIZED')

    const teacherAmbiguous = await resolveAuthorizedLearnerRelation({ account: identity(teacher) })
    assert.equal(teacherAmbiguous.status, 'NOT_OBSERVABLE')
    if (teacherAmbiguous.status !== 'NOT_OBSERVABLE') throw new Error('Ambiguous teacher relation was not rejected')
    assert.equal(teacherAmbiguous.reason, 'AMBIGUOUS_RELATION')

    const evidence = {
      verdict: 'STUDENT ISOLATION WITNESS PASS',
      database: 'GitHub Actions disposable PostgreSQL service',
      productionTouched: false,
      oauthProviderContacted: false,
      fixtures: 'synthetic.invalid.test',
      cases: [
        { scenario: 'student_A_reads_own_learner_A', verdict: 'PASS', relationType: 'LEARNER_SELF' },
        { scenario: 'student_A_cannot_read_learner_B', verdict: 'PASS', denial: 'ABSENT / REQUESTED_LEARNER_NOT_AUTHORIZED' },
        { scenario: 'guardian_reads_explicitly_authorized_learner_A', verdict: 'PASS', relationType: 'AUTHORIZED_ACCESS' },
        { scenario: 'guardian_cannot_read_revoked_learner_B', verdict: 'PASS', denial: 'ABSENT / REQUESTED_LEARNER_NOT_AUTHORIZED' },
        { scenario: 'teacher_reads_explicitly_authorized_learner_A', verdict: 'PASS', relationType: 'OTHER_AUTHORIZED' },
        { scenario: 'teacher_multiple_learners_requires_explicit_selection', verdict: 'PASS', denial: 'NOT_OBSERVABLE / AMBIGUOUS_RELATION' },
      ],
      fixtureRefs: {
        accountA: ref(studentA.id),
        accountB: ref(studentB.id),
        guardian: ref(guardian.id),
        teacher: ref(teacher.id),
        learnerA: ref(learnerA),
        learnerB: ref(learnerB),
      },
      limitation: 'Session shape is synthetic; Google OAuth login and authenticated Production browser access are not exercised.',
    }
    fs.mkdirSync('artifacts', { recursive: true })
    fs.writeFileSync('artifacts/student-isolation-witness.json', JSON.stringify(evidence, null, 2) + String.fromCharCode(10))
    console.log(JSON.stringify(evidence, null, 2))
  } finally {
    if (createdUserIds.length) {
      await prisma.accountLearnerRelation.deleteMany({ where: { userId: { in: createdUserIds } } })
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } })
    }
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
