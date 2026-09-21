import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const gustavo = JSON.parse(
  readFileSync('data/access/gustavo-account-learner-authorizations.json', 'utf8')
)
const eduarda = JSON.parse(
  readFileSync('data/access/eduarda-account-learner-authorizations.json', 'utf8')
)
const eduardaProfile = JSON.parse(
  readFileSync('data/students/eduarda-coelho-gabriel-hotmail-com.firestore.json', 'utf8')
)
const registry = JSON.parse(
  readFileSync('data/students/student-core-registry.json', 'utf8')
)

const gustavoByEmail = new Map(gustavo.accounts.map((entry) => [entry.email, entry]))
assert.equal(gustavo.learner.studentId, 'stu_4c4da6c04ac4')
assert.equal(gustavo.learner.learnerEmail, 'gugasalgado7@gmail.com')
assert.equal(gustavoByEmail.get('gugasalgado7@gmail.com')?.relationType, 'LEARNER_SELF')
assert.equal(gustavoByEmail.get('gugasalgado7@gmail.com')?.viewerMode, 'LEARNER')
assert.equal(gustavoByEmail.get('carolvdrummond@gmail.com')?.relationType, 'AUTHORIZED_ACCESS')
assert.equal(gustavoByEmail.get('carolvdrummond@gmail.com')?.viewerMode, 'RESPONSIBLE_ADULT')

assert.equal(eduarda.learner.studentId, 'stu_e8661006824a')
assert.equal(eduarda.learner.learnerEmail, null)
assert.equal(eduarda.accounts.length, 1)
assert.equal(eduarda.accounts[0].email, 'midias83@hotmail.com')
assert.equal(eduarda.accounts[0].name, 'Michelle')
assert.equal(eduarda.accounts[0].relationType, 'AUTHORIZED_ACCESS')
assert.equal(eduarda.accounts[0].viewerMode, 'RESPONSIBLE_ADULT')
assert.equal(eduarda.identityBoundary.learnerOwnEmailStatus, 'NOT_PROVIDED')
assert.equal(eduarda.identityBoundary.legacyStudentEmailOwner, 'Michelle')

assert.equal(eduardaProfile.studentEmail, 'midias83@hotmail.com')
assert.equal(eduardaProfile.learnerEmail, null)
assert.equal(eduardaProfile.studentEmailOwnership, 'responsible_adult_account')
assert.equal(eduardaProfile.accountContactEmail, 'midias83@hotmail.com')
assert.equal(eduardaProfile.responsibleAdult?.name, 'Michelle')
assert.equal(eduardaProfile.responsibleAdult?.accessRelationType, 'AUTHORIZED_ACCESS')
assert.equal(eduardaProfile.identityBoundary?.legacyStudentEmailCompatibilityOnly, true)

const registryEduarda = registry.students.find((student) => student.studentId === 'stu_e8661006824a')
assert.ok(registryEduarda, 'Eduarda must remain in the canonical student registry.')
assert.equal(registryEduarda.learnerEmail, null)
assert.equal(
  registryEduarda.canonicalEmailSemantics,
  'legacy_account_contact_not_learner_owned'
)
assert.equal(registryEduarda.authorizedAccessAccounts?.[0]?.email, 'midias83@hotmail.com')
assert.equal(registryEduarda.authorizedAccessAccounts?.[0]?.relationType, 'AUTHORIZED_ACCESS')

// Fundamental Young Learner invariant: account identity != learner identity.
for (const manifest of [gustavo, eduarda]) {
  assert.ok(manifest.learner.studentId)
  for (const account of manifest.accounts) {
    assert.ok(account.email)
    assert.ok(['LEARNER_SELF', 'AUTHORIZED_ACCESS', 'OTHER_AUTHORIZED'].includes(account.relationType))
  }
}

console.log(
  'Young Learner access self-test: PASS — Gustavo/Carol and Eduarda/Michelle resolve by studentId without treating responsible-adult email as learner identity.'
)
