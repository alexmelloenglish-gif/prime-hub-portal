import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { resolveExistingDriveTranscriptDisposition } from '../../lib/pipeline/retry-eligibility.ts'

test('legacy retry policy: FAILED creates a new attempt; COMPLETED and PROCESSING are duplicates', () => {
  assert.equal(
    resolveExistingDriveTranscriptDisposition({ transcriptExists: true, latestRunStatus: 'failed' }),
    'retry_failed_run',
  )
  assert.equal(
    resolveExistingDriveTranscriptDisposition({ transcriptExists: true, latestRunStatus: 'completed' }),
    'skip_existing_run',
  )
  assert.equal(
    resolveExistingDriveTranscriptDisposition({ transcriptExists: true, latestRunStatus: 'processing' }),
    'skip_existing_run',
  )
})

test('processLessonTranscript increments only the legacy failed attempt', () => {
  const source = readFileSync('lib/pipeline/run.ts', 'utf8')
  const policyStart = source.indexOf('const sharedSameExecutionResume')
  const policyEnd = source.indexOf('const idempotencyKey', policyStart)
  assert.notEqual(policyStart, -1, 'shared/legacy attempt policy must exist')
  assert.notEqual(policyEnd, -1, 'attempt policy must define the idempotency key')
  const policy = source.slice(policyStart, policyEnd)

  assert.match(
    policy,
    /existing\?\.status === 'failed'\s*\?\s*existing\.attemptNumber \+ 1/,
    'a failed legacy PipelineRun must advance attemptNumber',
  )
  assert.match(
    policy,
    /sharedSameExecutionResume\s*\?\s*existing!\.attemptNumber/,
    'shared retry must not use the legacy increment rule',
  )
  assert.match(
    source,
    /if \(existing && existing\.status !== 'failed'\)[\s\S]*?duplicate: true/,
    'any existing non-failed run, including PROCESSING, must return as duplicate',
  )
  assert.match(
    source,
    /if \(existing\?\.status === 'completed'\)[\s\S]*?duplicate: true/,
    'COMPLETED must return the persisted result without creating another attempt',
  )
})

test('disposable-Postgres witness asserts historical attempt preservation and attemptNumber + 1', () => {
  const witness = readFileSync('scripts/pipeline-retry-state-witness.ts', 'utf8')
  assert.match(witness, /Legacy FAILED -> new attempt/)
  assert.match(witness, /legacyRuns\.map\(\(run\) => run\.attemptNumber\), \[1, 2\]/)
  assert.match(witness, /legacyRuns\[0\]\.status, 'failed'/)
  assert.match(witness, /legacyRuns\[1\]\.status, 'failed'/)
  assert.match(witness, /scenario: 'legacy_failed_to_new_attempt'/)
})
