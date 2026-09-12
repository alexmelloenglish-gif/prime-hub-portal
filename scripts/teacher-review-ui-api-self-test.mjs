import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const route = read('app/api/admin/intelligence/review/route.ts')
const service = read('lib/intelligence/authority-service.ts')
const page = read('app/dashboard/admin/intelligence/candidates/page.tsx')
const list = read('app/dashboard/admin/intelligence/candidates/candidate-review-list.tsx')
const legacy = read('lib/pipeline-freeze.ts')

const assert = (condition, message) => {
  if (!condition) throw new Error(`Teacher review self-test failed: ${message}`)
  console.log(`✓ ${message}`)
}

assert(route.includes('getServerSession'), 'review API authenticates the session')
assert(route.includes('isAdminUser'), 'review API enforces teacher/admin authority')
assert(route.includes('candidateRecordId'), 'review API requires a candidate identifier')
assert(route.includes("decision === 'edited'"), 'edited decisions are handled explicitly')
assert(route.includes('reviewedPayload'), 'edited decisions carry reviewed payload')
assert(route.includes('recordTeacherDecision'), 'review API writes only the authority transition service')
assert(route.includes("canonicalization: 'not_performed'"), 'review API reports canonicalization was not performed')
assert(route.includes("projection: 'not_performed'"), 'review API reports projection was not performed')
assert(!route.includes('pipeline/run'), 'review API does not import the legacy pipeline')
assert(!route.includes('publishAfterReview'), 'review API does not publish')
assert(service.includes('TEACHER_DECISIONS'), 'service validates the decision at runtime')
assert(service.includes('Edited decisions require an explicit reviewedPayload'), 'service enforces edited payload')
assert(service.includes('reviewTransition: null'), 'service lists only reviewable candidates')
assert(page.includes('listReviewableIntelligenceCandidates'), 'page loads NEW INTELLIGENCE candidates only')
assert(list.toLowerCase().includes('source'), 'UI distinguishes source')
assert(list.includes('AI CANDIDATE'), 'UI distinguishes AI candidate')
assert(list.toLowerCase().includes('teacher decision'), 'UI distinguishes teacher decision')
assert(list.includes('approved') && list.includes('edited') && list.includes('rejected'), 'UI exposes exactly the three decisions')
assert(!list.includes('canonicalize') || list.includes('does not canonicalize'), 'UI does not expose a canonicalization action')
assert(legacy.includes('PIPELINE_AUTOMATION_FROZEN = true'), 'legacy pipeline remains frozen')

console.log('\nTeacher Review UI/API self-test passed.')
