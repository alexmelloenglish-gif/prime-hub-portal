import fs from 'node:fs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const schema = fs.readFileSync('prisma/schema.prisma', 'utf8')
const migration = fs.readFileSync(
  'prisma/migrations/20260918073000_add_account_learner_relation/migration.sql',
  'utf8'
)
const service = fs.readFileSync('lib/account-learner-relation.ts', 'utf8')
const resolver = fs.readFileSync('lib/learner-account-resolution.ts', 'utf8')
const adr = fs.readFileSync(
  'docs/architecture/ADR-002-G6-ACCOUNT-LEARNER-AUTHORIZED-RELATION_2026-09-18.md',
  'utf8'
)

assert(schema.includes('model AccountLearnerRelation'), 'G6 schema must define AccountLearnerRelation')
assert(schema.includes('@@unique([userId, studentId])'), 'G6 relation must enforce userId+studentId uniqueness')
assert(schema.includes('model AccountLearnerRelationEvent'), 'G6 schema must preserve lifecycle events')
assert(schema.includes('user User @relation(fields: [userId], references: [id], onDelete: Restrict)'), 'G6 relation must be anchored to User.id')
assert(migration.includes('CREATE TABLE "account_learner_relations"'), 'G6 migration must create relation table')
assert(migration.includes('CREATE TABLE "account_learner_relation_events"'), 'G6 migration must create lifecycle audit table')
assert(migration.includes("CHECK (\"status\" IN ('ACTIVE', 'REVOKED'))"), 'G6 migration must constrain lifecycle')
assert(migration.includes("CHECK (\"relationType\" IN ('LEARNER_SELF', 'AUTHORIZED_ACCESS', 'OTHER_AUTHORIZED'))"), 'G6 migration must constrain access relation types')
assert(migration.includes('FOREIGN KEY ("userId")'), 'G6 relation must reference authenticated User')
assert(service.includes("Only an administrator may create or revoke AccountLearnerRelation"), 'G6 mutation service must be privileged')
assert(service.includes("Email equality cannot be used as AccountLearnerRelation authority"), 'G6 service must reject email-equality authority')
assert(service.includes('accountLearnerRelationEvent.create'), 'G6 mutations must preserve lifecycle provenance')
assert(service.includes("status: ACCOUNT_LEARNER_RELATION_STATUS.REVOKED"), 'G6 revoke must be explicit')
assert(resolver.includes("status: 'AUTHORIZED' | 'ABSENT' | 'NOT_OBSERVABLE'"), 'G6 resolver must be fail-closed')
assert(!resolver.includes('canonicalEmail'), 'G6 resolver must not resolve by canonicalEmail')
assert(!resolver.includes('studentEmail'), 'G6 resolver must not resolve by studentEmail')
assert(!resolver.includes('guardianEmail'), 'G6 resolver must not infer guardian semantics')
assert(resolver.includes('requestedStudentId'), 'G6 resolver must support explicit learner selection')
assert(resolver.includes('AMBIGUOUS_RELATION'), 'G6 resolver must fail closed on multiple active learners without explicit selection')
assert(adr.includes('Status:** ACCEPTED'), 'ADR-002 must remain accepted')
assert(adr.includes('Email equality, legacy routing, historical account behavior'), 'ADR-002 must prohibit email-based authority')

console.log('G6 AccountLearnerRelation implementation contract structural self-test: PASS')
