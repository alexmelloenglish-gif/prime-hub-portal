import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const italo = JSON.parse(
  await readFile(new URL('data/students/italo-pires-gmail-com.firestore.json', root), 'utf8')
)
const dashboardSource = await readFile(new URL('app/dashboard/page.tsx', root), 'utf8')
const primitiveSource = await readFile(new URL('components/dashboard/student-dashboard-primitives.tsx', root), 'utf8')
const progressStateSource = await readFile(new URL('lib/progress-states.ts', root), 'utf8')
const progressBadgeSource = await readFile(new URL('components/dashboard/progress-state-badge.tsx', root), 'utf8')
const progressTrackerSource = await readFile(new URL('components/dashboard/progress-tracker.tsx', root), 'utf8')
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
assert.ok(!JSON.stringify(italo).includes('Rafael'))

assert.ok(dashboardSource.includes('What Matters Now'))
assert.ok(dashboardSource.includes('<NextActionCard'))
assert.ok(dashboardSource.includes('<DevelopmentTrajectory'))
assert.ok(dashboardSource.includes('<AttendanceSummary'))
assert.ok(dashboardSource.includes('<ProgressStateBadge'))
assert.ok(dashboardSource.includes('Published Class Reports — Full History'))
assert.ok(dashboardSource.includes('Learner Memory'))
assert.ok(dashboardSource.includes("lesson.status === 'present' ? 'attended'"))
assert.ok(!dashboardSource.includes('isRafael'))
assert.ok(!dashboardSource.includes('w-[68%]'))
assert.ok(!dashboardSource.includes('15 scheduled lessons'))
assert.ok(!dashboardSource.includes('scheduleLabel={scheduleLabel}\n      />'))

assert.ok(primitiveSource.includes('Teacher validated'))
assert.ok(primitiveSource.includes('Portfolio confirmed'))
assert.ok(primitiveSource.includes('Evidence-led progression'))
assert.ok(primitiveSource.includes('No artificial percentage or gamified score is inferred.'))
assert.ok(primitiveSource.includes('attended lesson'))
assert.ok(!primitiveSource.includes('CalendarDays'))
assert.ok(!primitiveSource.includes('Cláudio'))
assert.ok(!primitiveSource.includes('Rafael'))
assert.ok(!primitiveSource.includes('Gustavo'))
assert.ok(!primitiveSource.includes('Ítalo'))

// PRIME Progress Tracker is frozen to exactly four learner-facing states.
for (const state of ['Strong', 'Improving', 'Needs Focus', 'Not Assessed']) {
  assert.ok(progressStateSource.includes(`'${state}'`), `Missing canonical progress state: ${state}`)
  assert.ok(
    progressBadgeSource.includes(`${state}:`) || progressBadgeSource.includes(`'${state}':`),
    `Missing shared visual treatment for: ${state}`
  )
}
for (const legacy of ['very strong', 'secure', 'established', 'active growth', 'developing', 'progressing', 'needs attention', 'priority']) {
  assert.ok(progressStateSource.includes(`${legacy}:`) || progressStateSource.includes(`'${legacy}':`), `Missing legacy normalization: ${legacy}`)
}
// Decorated legacy states (for example Strong B1 / Developing toward B2)
// must normalize before learner-facing rendering, while unknown values remain neutral.
assert.ok(progressStateSource.includes("/^(very\\s+)?strong\\b/"))
assert.ok(progressStateSource.includes("key.includes('developing')"))
assert.ok(progressStateSource.includes("return 'Not Assessed'"))
assert.ok(progressStateSource.includes('canDisplayProgressInsight'))
assert.ok(!progressTrackerSource.includes('statusBarWidth'))
assert.ok(!progressTrackerSource.includes('w-[95%]'))
assert.ok(!progressTrackerSource.includes('Very Strong'))
assert.ok(!progressTrackerSource.includes('Active Growth'))
assert.ok(!progressTrackerSource.includes("statusConfig['Developing']"))

assert.ok(!studentDataSource.includes('AI Class Report Draft'))
assert.ok(!studentDataSource.includes('pipeline-draft-'))
assert.ok(studentDataSource.includes("asString(profile?.dashboardSourcePolicy) !== 'authorized_repository_snapshot'"))
assert.ok(studentDataSource.includes("reason: 'firestore_unavailable'"))

console.log('Student Dashboard v1 contract self-test passed: shared visual system + frozen four-state PRIME progress taxonomy.')
