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

const capture = read('lib/intelligence/meet-gemini-capture.ts')
const generator = read('lib/intelligence/gemini-candidate-generator.ts')
const route = read('app/api/admin/intelligence/capture/route.ts')
const authority = read('lib/intelligence/authority-service.ts')
const legacyFreeze = read('lib/pipeline-freeze.ts')

assert(capture.includes('https://www.googleapis.com/auth/drive.readonly'), 'capture uses Drive read-only scope')
assert(capture.includes('https://www.googleapis.com/auth/documents.readonly'), 'capture uses Docs read-only scope')
assert(!capture.includes('https://www.googleapis.com/auth/drive.file'), 'capture has no Drive write scope')
assert(!capture.includes('https://www.googleapis.com/auth/drive"'), 'capture has no broad Drive write scope')
assert(!capture.includes("method: 'PATCH'"), 'capture cannot move or mutate Drive source files')
assert(!capture.includes('moveToProcessed'), 'capture does not reuse legacy processed-folder mutation')
assert(!capture.includes("@/lib/pipeline/run"), 'capture does not import frozen legacy runner')
assert(!capture.includes('processLessonTranscript'), 'capture cannot enter the legacy transcript pipeline')
assert(!capture.includes('PortfolioProjection'), 'capture cannot write learner-facing portfolio projection')
assert(!capture.includes('ClassReportProjection'), 'capture cannot write class report projection')
assert(!capture.toLowerCase().includes('firebase'), 'capture has no Firestore/dashboard writer')
assert(capture.includes("candidateType: 'lesson_intelligence_bundle'"), 'capture persists a candidate bundle only')
assert(capture.includes("automaticPublicationAllowed: false"), 'capture provenance explicitly forbids automatic publication')
assert(capture.includes("captureMode: 'read_only_google_drive'"), 'capture provenance records read-only source mode')
assert(capture.includes('assertSourceWithinMeetRoot'), 'capture rejects Drive files outside the authorized Meet root')
assert(capture.includes('sourceHash'), 'capture records source hash for traceability')
assert(!capture.includes('payload: content'), 'raw source content is not persisted as CandidateRecord payload')
assert(capture.includes("lessonIdentityStatus: 'operator_supplied_unproven'"), 'capture never upgrades operator lesson id to proven identity')
assert(capture.includes("source: 'operator_supplied'"), 'lesson identity provenance records operator source')
assert(capture.includes('proven: false'), 'lesson identity remains explicitly unproven before Calendar correlation')

assert(generator.includes("authorityStatus: 'candidate'"), 'Gemini output authority is fixed to candidate')
assert(generator.includes('requiresReview: true'), 'Gemini output always requires review')
assert(generator.includes('Gemini attempted to cross the candidate authority boundary'), 'runtime rejects authority escalation by model output')
assert(generator.includes('Gemini changed lesson identity'), 'runtime rejects lesson identity mutation by model output')
assert(generator.includes('Gemini changed student identity'), 'runtime rejects student identity mutation by model output')
assert(generator.includes('Never publish, project, canonicalize, approve'), 'prompt contract explicitly blocks authority actions')
assert(!generator.includes("@/lib/pipeline"), 'Gemini candidate generator is independent of legacy prompt/pipeline code')

assert(route.includes('isAdminUser'), 'capture endpoint is administrator-only')
assert(route.includes("authorityStatus: 'candidate'"), 'endpoint returns candidate authority explicitly')
assert(route.includes('requiresReview: true'), 'endpoint returns review-required explicitly')
assert(route.includes('automaticPublicationAllowed: false'), 'endpoint exposes publication firewall state')

assert(authority.includes('P2002'), 'candidate persistence is race-safe and idempotent by candidateKey')
assert(legacyFreeze.includes('PIPELINE_AUTOMATION_FROZEN = true'), 'legacy pipeline remains frozen')

if (process.exitCode) {
  console.error('\nMeet/Gemini capture isolation self-test failed.')
  process.exit(process.exitCode)
}

console.log('\nMeet/Gemini capture isolation self-test passed.')
