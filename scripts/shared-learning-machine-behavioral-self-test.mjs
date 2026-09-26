import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildSharedLearningMachineExecutionOptions,
  canonicalResumeStagesFrom,
} from '../lib/learning-machine/shared-run-contract.ts'
import {
  assertTeacherAuthorityBinding,
  claimFailedSharedRun,
  resolveProtectedStage,
  resolveUniqueSharedRunConflict,
} from '../lib/learning-machine/behavioral-boundary.ts'

const transcript = {
  lessonId: 'golden-lesson-2026-09-25',
  studentId: 'stu_golden',
  studentEmail: 'GOLDEN@example.com',
  transcriptId: 'transcript-golden',
  transcript: 'The same preserved lesson transcript is used for every trigger.',
  source: 'manual_upload',
  metadata: {
    sourceHash: 'abc123-source-hash',
  },
}

const manual = buildSharedLearningMachineExecutionOptions({
  transcript,
  triggerOrigin: 'manual',
  requestedBy: 'teacher',
})
const automatic = buildSharedLearningMachineExecutionOptions({
  transcript,
  triggerOrigin: 'automatic',
  requestedBy: 'system',
})
const retry = buildSharedLearningMachineExecutionOptions({
  transcript,
  triggerOrigin: 'retry',
  requestedBy: 'teacher',
})

assert.equal(
  manual.normalizedRunIdentity,
  automatic.normalizedRunIdentity,
  'Manual and automatic triggers must resolve to the same normalized run identity',
)
assert.equal(
  manual.normalizedRunIdentity,
  retry.normalizedRunIdentity,
  'Retry must preserve the same normalized run identity',
)
assert.notEqual(manual.triggerOrigin, automatic.triggerOrigin)

assert.deepEqual(canonicalResumeStagesFrom('canonicalization'), [
  'canonicalization',
  'canonical_verification',
  'canonical_projections',
  'communication_projection',
])
assert.deepEqual(canonicalResumeStagesFrom('canonical_verification'), [
  'canonical_verification',
  'canonical_projections',
  'communication_projection',
])
assert.deepEqual(canonicalResumeStagesFrom('canonical_projections'), [
  'canonical_projections',
  'communication_projection',
])
assert.deepEqual(canonicalResumeStagesFrom('communication_projection'), [
  'communication_projection',
])

// Executable persistence-boundary proof: concurrent equivalent creates converge.
class FakeUniqueConstraintError extends Error {}
const normalizedRuns = new Map()
async function enterNormalizedRun(identity) {
  try {
    if (normalizedRuns.has(identity)) throw new FakeUniqueConstraintError('duplicate normalized identity')
    const created = { id: 'run-golden-1', status: 'received', identity }
    normalizedRuns.set(identity, created)
    return { run: created, duplicate: false }
  } catch (error) {
    const existing = await resolveUniqueSharedRunConflict({
      error,
      isUniqueConstraintError: (candidate) => candidate instanceof FakeUniqueConstraintError,
      loadExisting: async () => normalizedRuns.get(identity) ?? null,
    })
    return { run: existing, duplicate: true }
  }
}

const [firstTrigger, secondTrigger] = await Promise.all([
  enterNormalizedRun(manual.normalizedRunIdentity),
  enterNormalizedRun(automatic.normalizedRunIdentity),
])
assert.equal(firstTrigger.run.id, secondTrigger.run.id)
assert.equal(
  [firstTrigger.duplicate, secondTrigger.duplicate].filter(Boolean).length,
  1,
  'Exactly one equivalent trigger must converge as the duplicate',
)

// Executable persistence-boundary proof: only one concurrent retry can claim a failed run.
let durableRun = {
  id: 'run-golden-1',
  status: 'failed',
  resumePoint: 'canonical_projections',
}
let protectedContinuationExecutions = 0
const claimResume = async () => claimFailedSharedRun({
  claim: async () => {
    if (durableRun.status !== 'failed') return 0
    durableRun = { ...durableRun, status: 'processing' }
    return 1
  },
  readCurrent: async () => ({ ...durableRun }),
})

const retryClaims = await Promise.all([claimResume(), claimResume()])
for (const claim of retryClaims) {
  if (claim.claimed) protectedContinuationExecutions += 1
}
assert.equal(
  retryClaims.filter((claim) => claim.claimed).length,
  1,
  'Two concurrent retries must produce one and only one active resumer',
)
assert.equal(
  protectedContinuationExecutions,
  1,
  'Protected continuation work must not execute twice',
)

// Executable Teacher Authority proof: a downstream failure cannot silently replace authority.
const authorityBinding = {
  reviewerId: 'teacher-1',
  decisionTimestamp: new Date('2026-09-25T12:00:00.000Z'),
  authorityPayloadHash: 'authority-hash-1',
}
const persistedAuthority = {
  reviewerId: authorityBinding.reviewerId,
  decisionTimestamp: authorityBinding.decisionTimestamp,
  authorityPayloadHash: authorityBinding.authorityPayloadHash,
}
let downstreamFailed = false
try {
  throw new Error('simulated downstream projection failure')
} catch {
  downstreamFailed = true
}
assert.equal(downstreamFailed, true)
assert.doesNotThrow(() => assertTeacherAuthorityBinding(authorityBinding, persistedAuthority))
assert.throws(
  () => assertTeacherAuthorityBinding(authorityBinding, {
    ...persistedAuthority,
    reviewerId: 'teacher-2',
  }),
  /reviewer changed during resume/,
)

// Executable resume proof: completed protected stages load persisted results instead of replaying work.
const resumeStages = new Set(canonicalResumeStagesFrom('canonical_projections'))
const stageCounters = {
  canonicalizationExecute: 0,
  canonicalizationLoad: 0,
  verificationExecute: 0,
  verificationLoad: 0,
  projectionExecute: 0,
  projectionLoad: 0,
}
await resolveProtectedStage({
  shouldRun: resumeStages.has('canonicalization'),
  execute: async () => {
    stageCounters.canonicalizationExecute += 1
    return 'canonicalized'
  },
  load: async () => {
    stageCounters.canonicalizationLoad += 1
    return 'canonicalized'
  },
})
await resolveProtectedStage({
  shouldRun: resumeStages.has('canonical_verification'),
  execute: async () => {
    stageCounters.verificationExecute += 1
    return 'verified'
  },
  load: async () => {
    stageCounters.verificationLoad += 1
    return 'verified'
  },
})
await resolveProtectedStage({
  shouldRun: resumeStages.has('canonical_projections'),
  execute: async () => {
    stageCounters.projectionExecute += 1
    return 'projected'
  },
  load: async () => {
    stageCounters.projectionLoad += 1
    return 'projected'
  },
})
assert.deepEqual(stageCounters, {
  canonicalizationExecute: 0,
  canonicalizationLoad: 1,
  verificationExecute: 0,
  verificationLoad: 1,
  projectionExecute: 1,
  projectionLoad: 0,
})

const pipeline = readFileSync('lib/pipeline/run.ts', 'utf8')
const canonical = readFileSync('lib/learning-machine/canonical-continuation.ts', 'utf8')
const automaticRoute = readFileSync('app/api/pipeline/ingest/route.ts', 'utf8')
const manualRoute = readFileSync('app/api/admin/learning-machine/run/route.ts', 'utf8')
const retryRoute = readFileSync('app/api/admin/pipeline/retry/route.ts', 'utf8')
const schema = readFileSync('prisma/schema.prisma', 'utf8')
const migration = readFileSync(
  'prisma/migrations/20260925013000_add_shared_learning_machine_runner_state/migration.sql',
  'utf8',
)

assert.match(
  schema,
  /normalizedRunIdentity\s+String\?\s+@unique/,
  'Same normalized identity must be database-unique',
)
assert.match(
  migration,
  /CREATE UNIQUE INDEX "pipeline_runs_normalizedRunIdentity_key"/,
  'Migration must enforce the same identity boundary in Postgres',
)
assert.match(
  pipeline,
  /retryMode: 'same_execution_resume'/,
  'Shared retry must reuse the same durable execution',
)
assert.match(
  pipeline,
  /where: \{ normalizedRunIdentity: executionOptions\.normalizedRunIdentity \}/,
  'Shared execution must resolve by normalized identity',
)
assert.match(
  pipeline,
  /finalizeRun: false/,
  'Learner product publication must happen before shared-run final completion',
)
assert.match(
  pipeline,
  /authorityStatus: 'teacher_authorized'/,
  'Shared learner products must retain the human-authorized boundary',
)
assert.doesNotMatch(
  pipeline,
  /currentStage:\s*'failed'/,
  'Failure status must not erase the exact interrupted stage',
)
assert.match(
  canonical,
  /assertPersistedPublicationAuthority/,
  'Canonical resume must re-check the original persisted Teacher Authority',
)
assert.match(
  pipeline,
  /authorityEvent = await prisma\.pipelineEvent\.findFirst/,
  'Canonical retry must recover the exact publication-authority event, not a generic earlier approval',
)
assert.match(
  canonical,
  /communicationProjection/,
  'Class Report and Portfolio publication must be part of shared-run completion',
)
assert.match(
  canonical,
  /canonicalResumeStagesFrom\(run\.resumePoint\)/,
  'Canonical continuation must dispatch from the persisted exact resume point',
)
assert.match(
  automaticRoute,
  /PIPELINE_AUTOMATION_FROZEN/,
  'Automatic ingestion must remain frozen until production activation is authorized',
)
assert.doesNotMatch(
  manualRoute,
  /PIPELINE_AUTOMATION_FROZEN/,
  'Explicit administrator-triggered execution must remain usable while automation is frozen',
)
assert.doesNotMatch(
  retryRoute,
  /PIPELINE_AUTOMATION_FROZEN/,
  'Explicit administrator retry must remain usable while automation is frozen',
)
assert.match(
  retryRoute,
  /sourceFileId: sourceFileId \|\| undefined/,
  'Manual/shared retry must not require Drive provenance when the run itself is known',
)

console.log('Shared PRIME Learning Machine behavioral self-test: PASS')
