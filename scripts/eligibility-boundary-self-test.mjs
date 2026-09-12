import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/students/student-core-registry.json'), 'utf8'))
const eligibility = fs.readFileSync(path.join(root, 'lib/learner-eligibility.ts'), 'utf8')
const adminDashboard = fs.readFileSync(path.join(root, 'lib/admin-dashboard.ts'), 'utf8')
const dashboardLayout = fs.readFileSync(path.join(root, 'app/dashboard/layout.tsx'), 'utf8')

const valeria = registry.students.find((student) => student.canonicalEmail === 'vcrlima89@gmail.com')
assert.ok(valeria, 'Valéria must remain in the canonical person registry')
assert.equal(valeria.profileStatus, 'active')
assert.equal(valeria.operatingEligibility, 'prospect')
assert.equal(valeria.activationAuthority, null)

const learners = registry.students.filter((student) => student.canonicalEmail !== 'vcrlima89@gmail.com')
assert.equal(learners.length, 9, 'Nine existing authorized learners should remain in the learner boundary')
for (const learner of learners) {
  assert.equal(learner.operatingEligibility, 'learner', `${learner.canonicalEmail} must remain a learner`)
  assert.ok(learner.activationAuthority, `${learner.canonicalEmail} must retain an activation authority`)
}

assert.match(eligibility, /export type OperatingEligibility = 'prospect' \| 'learner'/)
assert.match(eligibility, /export function isAuthorizedLearner/)
assert.match(eligibility, /operatingEligibility === 'learner'/)
assert.match(eligibility, /activationAuthority !== null/)
assert.match(adminDashboard, /filter\(\(student\) => isAuthorizedLearner\(student\.studentEmail\)\)/)
assert.match(dashboardLayout, /isAuthorizedLearner\(activeStudentEmail\)/)
assert.match(dashboardLayout, /!adminUser && !eligibleLearner/)

console.log('Eligibility boundary self-test: PASS')
console.log('Valéria: prospect / no activation authority / not an authorized learner')
console.log(`Existing authorized learners preserved: ${learners.length}`)
