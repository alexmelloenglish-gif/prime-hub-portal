import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const consumer = readFileSync('lib/g6-canonical-consumer.ts', 'utf8')
const directory = readFileSync('lib/canonical-learner-directory.ts', 'utf8')
const page = readFileSync('app/dashboard/page.tsx', 'utf8')
const layout = readFileSync('app/dashboard/layout.tsx', 'utf8')

assert(consumer.includes("G6_CANONICAL_CONSUMER_ENABLED === '1'"))
assert(consumer.includes('resolveAuthorizedLearnerRelation'))
assert(consumer.includes('canonicalLearningIntelligenceProjection.findFirst'))
assert(consumer.includes("projectionStatus: 'VERIFIED'"))
assert(consumer.includes("targetType: 'learning_intelligence'"))
assert(consumer.includes('canonicalLearningRecord.findUnique'))
assert(consumer.includes('canonicalLearningRecordVerification.findUnique'))
assert(consumer.includes("g3.verificationStatus !== 'PASS'"))
assert(consumer.includes('consumerProjectionHash'))
assert(consumer.includes("source: 'canonical-g6'"))

for (const forbidden of [
  'getFirebaseFirestore',
  'verifiedRepositoryProfiles',
  'buildRepositoryStudent',
  'mergePipelineProjection',
  'PortfolioProjection',
  'ClassReportProjection',
]) {
  assert(!consumer.includes(forbidden), 'G6 canonical consumer must not depend on ' + forbidden)
}

for (const forbidden of [
  'canonicalEmail',
  'emailAliases',
  'firestoreDocumentId',
  'dashboardPath',
]) {
  assert(!directory.includes(forbidden), 'Canonical learner directory must not route by ' + forbidden)
}

assert(page.includes('getG6CanonicalDashboardState'))
assert(page.includes('isG6CanonicalConsumerEnabled'))
assert(page.includes('G6CanonicalDashboardOverview'))
const pageCanonicalCall = page.indexOf('const canonicalState = await getG6CanonicalDashboardState')
const pageLegacyCall = page.indexOf('const studentState = await getStudentDashboardState')
assert(pageCanonicalCall >= 0 && pageLegacyCall >= 0)
assert(
  pageCanonicalCall < pageLegacyCall,
  'Canonical consumer execution must occur before legacy dashboard resolution'
)

assert(layout.includes('getG6CanonicalDashboardState'))
assert(layout.includes('isG6CanonicalConsumerEnabled'))
const layoutCanonicalCall = layout.indexOf('const canonicalState = await getG6CanonicalDashboardState')
const layoutLegacyCall = layout.indexOf('const studentState = await getStudentDashboardState')
assert(layoutCanonicalCall >= 0 && layoutLegacyCall >= 0)
assert(
  layoutCanonicalCall < layoutLegacyCall,
  'Layout must execute canonical authority resolution before legacy dashboard state'
)

console.log('G6 Consumer Authority Remediation structural self-test: PASS')
