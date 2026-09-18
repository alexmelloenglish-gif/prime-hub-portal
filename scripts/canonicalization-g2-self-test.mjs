import fs from 'node:fs'

const service = fs.readFileSync('lib/canonicalization.ts', 'utf8')
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8')
const migration = fs.readFileSync('prisma/migrations/20260918051500_add_canonical_learning_record/migration.sql', 'utf8')

function assert(condition, message) {
  if (!condition) throw new Error(`G2 self-test failed: ${message}`)
}

assert(service.includes("Prisma.TransactionIsolationLevel.Serializable"), 'canonicalization must use SERIALIZABLE transaction isolation')
assert(service.includes("tx.canonicalLearningRecord.create"), 'canonical record create must occur inside transaction callback')
assert(service.includes("tx.canonicalizationProvenance.create"), 'canonicalization provenance create must occur inside transaction callback')
assert(service.includes("createCanonicalizationIdempotencyKey"), 'deterministic idempotency-key builder must exist')
assert(service.includes("teacherDecisionId"), 'idempotency and provenance must reference teacher decision')
assert(service.includes("PublicationReviewApproved"), 'ReviewTask authority must require persisted publication-approval evidence')
assert(!service.includes("eventType: 'HumanReviewApproved'"), 'HumanReviewApproved must not be accepted as the G2 pedagogical authority event')
assert(service.includes("resolveReviewerIdentity"), 'reviewer identity must resolve through the persisted user directory')
assert(service.includes("normalized.includes('@')"), 'reviewer identity must support persisted email references')
assert(service.includes("persistedReviewer.id !== expectedReviewer.id"), 'reviewer references must be compared by resolved user identity')
assert(service.includes("canonical_learning_record_authority"), 'ValidationTask authority must be scoped to canonical learning authority')
assert(service.includes("'IDEMPOTENCY_CONFLICT'"), 'same identity with different content must fail closed')
assert(service.includes("P2034"), 'serializable transaction conflicts must be retryable')
assert(service.includes("P2002"), 'unique-constraint races must be handled')
assert(service.includes("idempotentReplay: true"), 'same decision/scope replay must return existing canonicalization')
assert(service.includes("This function stops at committed canonical state"), 'G2 boundary must explicitly stop before G3')
assert(!service.includes("buildLearningIntelligence("), 'G2 must not invoke Learning Intelligence')
assert(!service.includes("buildDashboardProjection("), 'G2 must not invoke Dashboard projection')
assert(!service.includes("ClassReportProjection"), 'G2 must not create Class Report projections')

assert(schema.includes("model CanonicalLearningRecord"), 'CanonicalLearningRecord model must exist')
assert(schema.includes("model CanonicalizationProvenance"), 'CanonicalizationProvenance model must exist')
assert(schema.includes("idempotencyKey      String   @unique"), 'idempotency key must be unique')
assert(schema.includes("@@unique([studentId, teacherDecisionId, scopeType, scopeKey])"), 'authority transition must have composite uniqueness')
assert(schema.includes("canonicalRecordId   String   @unique"), 'one provenance row per canonical record must be enforced')

assert(migration.includes('CREATE TABLE "canonical_learning_records"'), 'migration must materialize canonical records')
assert(migration.includes('CREATE TABLE "canonicalization_provenance"'), 'migration must materialize provenance')
assert(migration.includes('"canonicalization_provenance_idempotencyKey_key"'), 'migration must create idempotency uniqueness')
assert(migration.includes('"canonicalization_provenance_studentId_teacherDecisionId_scopeType_scopeKey_key"'), 'migration must create authority-transition uniqueness')
assert(migration.includes('FOREIGN KEY ("canonicalRecordId")'), 'provenance must reference canonical record')

console.log('G2 Atomic Canonicalization + Idempotency structural self-test: PASS')
