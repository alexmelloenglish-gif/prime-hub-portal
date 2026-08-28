import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const schema = readFileSync('prisma/schema.prisma', 'utf8')
const migration = readFileSync('prisma/migrations/20260828111500_add_pipeline_run_attempts/migration.sql', 'utf8')
const pipeline = readFileSync('lib/pipeline/run.ts', 'utf8')
const reconciliation = readFileSync('lib/drive-reconciliation.ts', 'utf8')

assert.match(schema, /pipelineRuns\s+PipelineRun\[\]/, 'Transcript must own multiple processing attempts')
assert.match(schema, /@@unique\(\[transcriptId, attemptNumber\]\)/, 'Attempt numbers must be unique per transcript')
assert.doesNotMatch(schema, /pipelineRunId\s+String\s+@unique[\s\S]*model EvidenceCandidate/, 'Transcript must not retain the legacy mandatory 1:1 run foreign key')
assert.match(migration, /SET "transcriptId" = transcript\."id"/, 'Migration must preserve the historical run-to-transcript association')
assert.match(migration, /RAISE EXCEPTION 'Cannot migrate pipeline attempts/, 'Migration must fail closed on incomplete historical data')
assert.match(pipeline, /existing\?\.status === 'failed' \? existing\.attemptNumber \+ 1 : 1/, 'Only a failed latest attempt may advance the attempt number')
assert.match(pipeline, /retryTranscript[\s\S]*rebuildInput/, 'A retry must rebuild input from the canonical stored transcript')
assert.doesNotMatch(pipeline, /transcript\.upsert/, 'Pipeline retries must never update or rewrite a canonical transcript')
assert.match(reconciliation, /latestAttempt\?\.status !== 'failed'/, 'Drive reconciliation must permit a failed source to retry')

console.log('Pipeline attempt model self-test passed.')
