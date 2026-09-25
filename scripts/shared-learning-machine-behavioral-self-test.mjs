import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildSharedLearningMachineExecutionOptions,
  canonicalResumeStagesFrom,
} from '../lib/learning-machine/shared-run-contract.ts'

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
