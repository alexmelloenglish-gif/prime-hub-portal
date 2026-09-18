import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const route = readFileSync('app/api/g6/runtime-proof/preflight/route.ts', 'utf8')

assert(route.includes("process.env.VERCEL_ENV !== 'preview'"))
assert(route.includes("export async function GET()"))
assert(route.includes('G6_RUNTIME_PREFLIGHT_V1'))
assert(route.includes('accountLearnerRelation.findMany'))
assert(route.includes('accountLearnerRelationEvent.findMany'))
assert(route.includes('canonicalLearningIntelligenceProjection.findFirst'))
assert(route.includes('canonicalLearningRecord.findUnique'))
assert(route.includes('canonicalLearningRecordVerification.findUnique'))

for (const forbidden of [
  '.create(',
  '.createMany(',
  '.update(',
  '.updateMany(',
  '.upsert(',
  '.delete(',
  '.deleteMany(',
  '$transaction',
]) {
  assert(!route.includes(forbidden), 'Runtime preflight must remain read-only: ' + forbidden)
}

console.log('Phase 7 G6 runtime preflight instrumentation self-test: PASS')
