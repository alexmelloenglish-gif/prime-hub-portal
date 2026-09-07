import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const italo = JSON.parse(
  await readFile(new URL('data/students/italo-pires-gmail-com.firestore.json', root), 'utf8')
)
const dashboardSource = await readFile(new URL('app/dashboard/page.tsx', root), 'utf8')
const studentDataSource = await readFile(new URL('lib/student-data.ts', root), 'utf8')

assert.equal(italo.studentId, 'stu_fb5b64e3437e')
assert.equal(italo.studentEmail, 'itallopires17@gmail.com')
assert.equal(italo.dashboardSourcePolicy, 'authorized_repository_snapshot')
assert.equal(italo.attendanceOverview.length, 1)
assert.equal(italo.attendanceOverview[0].status, 'present')
assert.equal(italo.attendanceRate, '1/1 confirmed')
assert.equal(italo.classFrequency, 'No recurring schedule confirmed')
assert.equal(italo.canonicalProjection.version, 'student-dashboard-v1.0')
assert.equal(italo.canonicalProjection.schedule.status, 'not-scheduled')
assert.equal(italo.canonicalProjection.currentState.targetLevel.value, 'CEFR B1')
assert.equal(italo.canonicalProjection.currentState.targetLevel.status, 'teacher-validated')
assert.equal(italo.canonicalProjection.whatChanged.changeType, 'learner-model')
assert.equal(italo.canonicalProjection.priorities.length, 2)
assert.equal(italo.vocabularyBank.length, 4)
assert.equal(italo.grammarOverview.focusPoints.length, 3)
assert.equal(italo.classReports.length, 1)
assert.equal(italo.classReports[0].contentStatus, 'published')
assert.ok(italo.classReports[0].vocabulary.length > italo.vocabularyBank.length)

const manageIds = new Set(italo.manageSpace.map((item) => item.id))
assert.deepEqual([...manageIds].sort(), ['portfolio', 'support'])
assert.ok(!italo.attendanceOverview.some((item) => item.status === 'scheduled'))
assert.ok(!italo.progressTracker.some((item) => /active growth|improving|developing/i.test(item.status)))
assert.ok(!JSON.stringify(italo).includes('Rafael'))

assert.ok(dashboardSource.includes('What Matters Now'))
assert.ok(dashboardSource.includes('Canonical action'))
assert.ok(dashboardSource.includes('Learner Memory'))
assert.ok(!dashboardSource.includes('isRafael'))
assert.ok(!dashboardSource.includes('w-[68%]'))
assert.ok(!dashboardSource.includes('15 scheduled lessons'))
assert.ok(!studentDataSource.includes('AI Class Report Draft'))
assert.ok(!studentDataSource.includes('pipeline-draft-'))

assert.ok(studentDataSource.includes("asString(profile?.dashboardSourcePolicy) !== 'authorized_repository_snapshot'"))
assert.ok(studentDataSource.includes("reason: 'firestore_unavailable'"))

console.log('Student Dashboard v1 contract self-test passed for Italo Pires.')
