import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const contract = readFileSync('lib/learning-machine/shared-run-contract.ts', 'utf8')
const runner = readFileSync('lib/learning-machine/shared-runner.ts', 'utf8')
const history = readFileSync('lib/learning-machine/run-history.ts', 'utf8')
const canonical = readFileSync('lib/learning-machine/canonical-continuation.ts', 'utf8')
const pipeline = readFileSync('lib/pipeline/run.ts', 'utf8')
const automaticRoute = readFileSync('app/api/pipeline/ingest/route.ts', 'utf8')
const manualRoute = readFileSync('app/api/admin/learning-machine/run/route.ts', 'utf8')
const retryRoute = readFileSync('app/api/admin/pipeline/retry/route.ts', 'utf8')
const freeze = readFileSync('lib/pipeline-freeze.ts', 'utf8')
const schema = readFileSync('prisma/schema.prisma', 'utf8')
const migration = readFileSync(
  'prisma/migrations/20260925013000_add_shared_learning_machine_runner_state/migration.sql',
  'utf8',
)

assert.match(contract, /SHARED_LEARNING_MACHINE_VERSION = 'prime-learning-machine-v1'/)
assert.match(contract, /createNormalizedRunIdentity/)
assert.match(contract, /learnerIdentity: normalized\.studentId \|\| normalized\.studentEmail/)
assert.match(contract, /sourceHash/)
assert.match(contract, /lessonId: normalized\.lessonId/)
assert.doesNotMatch(
  contract.match(/const identityEnvelope = \{[\s\S]*?\n  \}/)?.[0] ?? '',
  /triggerOrigin/,
  'Trigger origin must not change normalized run identity',
)

assert.match(runner, /executeSharedLearningMachine/)
assert.match(runner, /processLessonTranscript\(transcript, options\)/)

assert.match(automaticRoute, /executeSharedLearningMachine/)
assert.match(automaticRoute, /triggerOrigin: 'automatic'/)
assert.match(manualRoute, /executeSharedLearningMachine/)
assert.match(manualRoute, /triggerOrigin: 'manual'/)
assert.match(retryRoute, /retryFailedPipelineRun/)

assert.match(schema, /executionMode\s+String\s+@default\("legacy"\)/)
assert.match(schema, /normalizedRunIdentity\s+String\?\s+@unique/)
assert.match(schema, /currentStage\s+String\?/)
assert.match(schema, /resumePoint\s+String\?/)
assert.match(schema, /finalManifest\s+Json\?/)
assert.match(migration, /ADD COLUMN "normalizedRunIdentity" TEXT/)
assert.match(migration, /ADD COLUMN "finalManifest" JSONB/)
assert.match(
  migration,
  /CREATE UNIQUE INDEX "pipeline_runs_normalizedRunIdentity_key"/,
)

assert.match(history, /LearningMachineTriggerReceived/)
assert.match(history, /LearningMachineCheckpoint/)
assert.match(history, /LearningMachineManifestPersisted/)
assert.match(history, /resumePoint/)

assert.match(
  pipeline,
  /Boolean\(executionOptions\) \|\| shouldRequirePublicationReview\(coaching\)/,
)
assert.match(pipeline, /canonicalAuthorityPayloadHash/)
assert.match(pipeline, /executeCanonicalContinuation/)
assert.match(pipeline, /triggerOrigin: 'retry'/)
assert.match(pipeline, /retryMode: 'same_execution_resume'/)
assert.match(pipeline, /finalizeRun: false/)
assert.doesNotMatch(
  pipeline,
  /currentStage:\s*'failed'/,
  'Failure status must not erase the exact interrupted stage',
)
assert.match(pipeline, /stage: 'awaiting_teacher_authority'/)

assert.match(canonical, /canonicalizeLearningRecord\(command\)/)
assert.match(canonical, /verifyCanonicalLearningRecordReadBack/)
assert.match(canonical, /projectCanonicalPortfolio/)
assert.match(canonical, /projectCanonicalLearningIntelligence/)
assert.match(canonical, /persistLearningMachineManifest/)
assert.match(canonical, /verification\.status !== 'PASS'/)
assert.match(canonical, /projectionStatus !== 'VERIFIED'/)
assert.match(canonical, /assertPersistedPublicationAuthority/)
assert.match(canonical, /communicationProjection/)
assert.match(canonical, /canonicalResumeStagesFrom\(run\.resumePoint\)/)

assert.match(
  freeze,
  /PIPELINE_AUTOMATION_FROZEN = true/,
  'Shared runner implementation must not silently reactivate legacy/production automation',
)

console.log('Shared PRIME Learning Machine runner structural self-test: PASS')
