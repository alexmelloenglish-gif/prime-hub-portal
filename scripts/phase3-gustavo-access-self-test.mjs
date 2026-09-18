import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(
  readFileSync('data/access/gustavo-account-learner-authorizations.json', 'utf8')
)
const studentData = readFileSync('lib/student-data.ts', 'utf8')
const provision = readFileSync('scripts/provision-gustavo-dual-account-access.mjs', 'utf8')

assert.equal(manifest.learner.studentId, 'stu_4c4da6c04ac4')
assert.equal(manifest.accounts.length, 2)

const byEmail = new Map(manifest.accounts.map((entry) => [entry.email, entry]))
assert.equal(byEmail.get('gugasalgado7@gmail.com')?.relationType, 'LEARNER_SELF')
assert.equal(byEmail.get('carolvdrummond@gmail.com')?.relationType, 'AUTHORIZED_ACCESS')

for (const entry of manifest.accounts) {
  assert.equal(entry.email, entry.email.trim().toLowerCase())
}

assert(studentData.includes('gustavo-account-learner-authorizations.json'))
assert(studentData.includes('resolveAuthorizedLearnerRelation'))
assert(studentData.includes('accountIdentityFromSession'))
assert(studentData.includes('isPhase3RelationPilotAccount'))
assert(studentData.includes('buildRepositoryStudentByStudentId'))

assert(provision.includes("sourceType: manifest.decision.sourceType"))
assert(provision.includes("eventType: 'AUTHORIZED'"))
assert(provision.includes("role !== 'admin'"))
assert(provision.includes('Field comparison failed'))

console.log('Phase 3 Gustavo dual-account access structural self-test: PASS')
