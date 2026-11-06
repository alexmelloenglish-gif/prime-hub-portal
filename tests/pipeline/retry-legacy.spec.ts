import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveExistingDriveTranscriptDisposition } from '../../lib/pipeline/retry-eligibility.ts'

test('legacy retry: failed latest run is eligible for retry', () => {
  const disposition = resolveExistingDriveTranscriptDisposition({
    transcriptExists: true,
    latestRunStatus: 'failed',
  })

  assert.equal(disposition, 'retry_failed_run')
})

test('legacy retry: completed latest run is not retried', () => {
  const disposition = resolveExistingDriveTranscriptDisposition({
    transcriptExists: true,
    latestRunStatus: 'completed',
  })

  assert.equal(disposition, 'skip_existing_run')
})

test('legacy retry: processing latest run is not retried', () => {
  const disposition = resolveExistingDriveTranscriptDisposition({
    transcriptExists: true,
    latestRunStatus: 'processing',
  })

  assert.equal(disposition, 'skip_existing_run')
})

test('legacy retry: missing transcript starts a new source run', () => {
  const disposition = resolveExistingDriveTranscriptDisposition({
    transcriptExists: false,
    latestRunStatus: 'failed',
  })

  assert.equal(disposition, 'process_new_source')
})

test('legacy retry: transcript without run is treated as orphaned', () => {
  const disposition = resolveExistingDriveTranscriptDisposition({
    transcriptExists: true,
    latestRunStatus: null,
  })

  assert.equal(disposition, 'process_orphaned_transcript')
})
