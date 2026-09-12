import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')
const fail = (message) => {
  console.error(`✗ ${message}`)
  process.exitCode = 1
}
const pass = (message) => console.log(`✓ ${message}`)
const assert = (condition, message) => condition ? pass(message) : fail(message)

const contract = read('lib/intelligence/authority-contract.ts')
const service = read('lib/intelligence/authority-service.ts')
const schema = read('prisma/schema.prisma')
const migration = read('prisma/migrations/20260912031500_add_intelligence_authority_firewall/migration.sql')
const legacyFreeze = read('lib/pipeline-freeze.ts')

assert(contract.includes("AUTOMATIC_PUBLICATION_ALLOWED = false"), 'automatic publication is disabled in NEW INTELLIGENCE')
assert(contract.includes("CANDIDATE_AUTHORITY_STATUS = 'candidate'"), 'AI output is structurally typed as candidate authority only')
assert(contract.includes("CANDIDATE_REQUIRES_REVIEW = true"), 'candidate review cannot be disabled by model output')
assert(contract.includes('assertNoAutomaticPublication'), 'explicit automatic-publication blocker exists')
assert(contract.includes('assertExplicitProjectionAuthorization'), 'projection authorization has a dedicated authority guard')

assert(!service.includes("@/lib/pipeline/run"), 'NEW INTELLIGENCE does not import the frozen legacy pipeline runner')
assert(!service.includes('applyPortfolioPatch'), 'NEW INTELLIGENCE cannot reuse legacy portfolio patch application')
assert(!service.includes('publishAfterReview'), 'NEW INTELLIGENCE cannot reuse legacy publication')
assert(!service.includes('portfolioProjection.'), 'candidate/review service has no learner-facing PortfolioProjection writer')
assert(!service.includes('classReportProjection.'), 'candidate/review service has no ClassReportProjection writer')
assert(!service.includes('firebase'), 'candidate/review service has no Firestore/dashboard writer')
assert(service.includes("status: 'authorized_not_projected'"), 'projection authorization remains distinct from projection')

for (const model of [
  'model IntelligenceCandidateRecord',
  'model IntelligenceReviewTransition',
  'model IntelligenceCanonicalization',
  'model IntelligenceAuthorizedProjection',
]) {
  assert(schema.includes(model), `${model.replace('model ', '')} is persisted separately`)
}

assert(migration.includes('intelligence_candidate_authority_candidate_only'), 'database forces candidate authority status')
assert(migration.includes('intelligence_candidate_review_always_required'), 'database forces candidate review requirement')
assert(migration.includes('intelligence_review_authority_transition_consistent'), 'database binds teacher decision to authority transition')
assert(migration.includes('enforce_intelligence_canonicalization_authority'), 'database blocks canonicalization without teacher validation')
assert(migration.includes('enforce_intelligence_projection_authority'), 'database blocks projection authorization without canonical authority')
assert(migration.includes('prevent_intelligence_authority_history_mutation'), 'candidate/review/canonical authority history is append-only')

assert(legacyFreeze.includes('PIPELINE_AUTOMATION_FROZEN = true'), 'legacy pipeline remains frozen')

if (process.exitCode) {
  console.error('\nNEW INTELLIGENCE authority firewall self-test failed.')
  process.exit(process.exitCode)
}

console.log('\nNEW INTELLIGENCE authority firewall self-test passed.')
