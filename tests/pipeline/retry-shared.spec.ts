import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const runner = readFileSync('lib/pipeline/run.ts', 'utf8')
const witness = readFileSync('scripts/pipeline-retry-state-witness.ts', 'utf8')
const behavioral = readFileSync('scripts/shared-learning-machine-behavioral-self-test.mjs', 'utf8')

test('shared retry retains the PipelineRun and its attempt number', () => {
  assert.match(
    runner,
    /sharedSameExecutionResume[\s\S]*?existing!\.attemptNumber/,
    'same-execution resume must retain the original attempt number',
  )
  assert.match(
    runner,
    /where: \{ normalizedRunIdentity: executionOptions\.normalizedRunIdentity \}/,
    'the shared run must be resolved by normalized identity',
  )
  assert.match(
    runner,
    /retryMode: 'same_execution_resume'/,
    'the retry result must declare same_execution_resume',
  )
})

test('shared retry claims the existing FAILED row with a conditional update and preserves resumePoint', () => {
  const start = runner.indexOf('const resumeClaim = await claimFailedSharedRun')
  const end = runner.indexOf('} else if (retryTranscript', start)
  assert.notEqual(start, -1, 'failed shared-run claim must exist')
  assert.notEqual(end, -1, 'shared claim block must terminate before legacy retry')
  const claim = runner.slice(start, end)

  assert.match(claim, /prisma\.pipelineRun\.updateMany/)
  assert.match(claim, /id: existing\.id/)
  assert.match(claim, /status: 'failed'/)
  assert.match(claim, /executionMode: SHARED_LEARNING_MACHINE_EXECUTION_MODE/)
  assert.match(claim, /status: 'processing'/)
  assert.doesNotMatch(claim, /resumePoint\s*:/, 'claim must not overwrite the persisted resume point')
  assert.match(claim, /if \(!resumeClaim\.claimed\)/, 'losing concurrent retries must return as duplicates')
})

test('runtime witness covers same-run identity, resume point and one concurrent winner', () => {
  assert.match(witness, /Shared FAILED -> concurrent retries contend in Postgres/)
  assert.match(witness, /normalizedRunIdentity/)
  assert.match(witness, /resumePoint/)
  assert.match(witness, /const sharedRetries = \[/)
  assert.match(witness, /sharedOutcomes\.filter\(\(item\) => item\.status === 'fulfilled' && item\.value\.duplicate\)/)
  assert.match(witness, /sharedRuns\[0\]\.normalizedRunIdentity, sharedOptions\.normalizedRunIdentity/)
  assert.match(witness, /sharedRuns\[0\]\.resumePoint, 'prompt_1'/)
  assert.match(runner, /retryMode: 'same_execution_resume'/)
  assert.match(behavioral, /Two concurrent retries must produce one and only one active resumer/)
  assert.match(behavioral, /protected continuation work must not execute twice/i)
})
