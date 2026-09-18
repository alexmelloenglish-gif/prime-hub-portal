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
  assert.ok(entry.name?.trim(), `Expected explicit name for ${entry.email}`)
}

assert(studentData.includes('gustavo-account-learner-authorizations.json'))
assert(studentData.includes('resolveAuthorizedLearnerRelation'))
assert(studentData.includes('accountIdentityFromSession'))
assert(studentData.includes('isPhase3RelationPilotAccount'))
assert(studentData.includes('buildRepositoryStudentByStudentId'))

// Provisioning must be one all-or-nothing transaction for the whole pilot.
assert.equal(
  (provision.match(/prisma\.\$transaction\s*\(/g) ?? []).length,
  1,
  'Pilot provisioner must use exactly one top-level Prisma transaction'
)
assert.ok(
  !provision.includes('tx.$transaction'),
  'Nested/per-account transactions are forbidden in the Phase 3 pilot provisioner'
)
assert.ok(
  provision.includes("transactionScope: 'GUSTAVO_CAROL_ALL_OR_NOTHING'"),
  'Provisioner must declare the all-or-nothing transaction scope'
)

// Existing identities must be checked before relations are created.
assert(provision.includes('preflightExistingUsers(tx)'))
assert(provision.includes('assertExistingUserCompatible'))
assert(provision.includes("existing.role !== 'student'"))
assert(provision.includes('Existing User for ${expectedEmail} has no userId'))
assert(provision.includes('email mismatch'))
assert(provision.includes('incompatible name='))
assert(
  provision.indexOf('const existingByEmail = await preflightExistingUsers(tx)') <
    provision.indexOf('const relation = await ensureRelation(tx, actor, user, entry)'),
  'Identity preflight must occur before relation writes'
)

// Relation + lifecycle event and read-back must live inside the same transaction.
assert(provision.includes('tx.accountLearnerRelation.create'))
assert(provision.includes('tx.accountLearnerRelationEvent.create'))
assert(provision.includes("eventType: 'AUTHORIZED'"))
assert(provision.includes('READ-BACK BOTH USERS + BOTH RELATIONS INSIDE THE SAME TRANSACTION'))
assert(provision.includes('assertReadBackUser'))
assert(provision.includes('assertReadBackRelation'))
assert(provision.includes('Pilot read-back incomplete'))
assert(provision.includes('Field comparison failed'))

// The administrative actor remains mandatory and relations preserve explicit provenance.
assert(provision.includes("actor.role !== 'admin'"))
assert(provision.includes('sourceType: manifest.decision.sourceType'))
assert(provision.includes('sourceReference: manifest.decision.sourceReference'))
assert(provision.includes('authorizationHash'))

console.log('Phase 3 Gustavo dual-account access structural self-test: PASS')
