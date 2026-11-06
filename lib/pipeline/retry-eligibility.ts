export type ExistingDriveTranscriptDisposition =
  | 'process_new_source'
  | 'retry_failed_run'
  | 'process_orphaned_transcript'
  | 'skip_existing_run'

export function resolveExistingDriveTranscriptDisposition(input: {
  transcriptExists: boolean
  latestRunStatus?: string | null
}): ExistingDriveTranscriptDisposition {
  if (!input.transcriptExists) return 'process_new_source'
  if (!input.latestRunStatus) return 'process_orphaned_transcript'
  if (input.latestRunStatus === 'failed') return 'retry_failed_run'
  return 'skip_existing_run'
}
