import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const witness = readFileSync('scripts/golden-runtime-witness.ts', 'utf8')
const continuation = readFileSync('lib/learning-machine/canonical-continuation.ts', 'utf8')
const redaction = readFileSync('scripts/golden-runtime-witness-redaction-self-test.mjs', 'utf8')

test('synthetic GL-003 fixture retains source and provider provenance', () => {
  assert.match(witness, /source: 'google_meet'/)
  assert.match(witness, /SOURCE_FILE_ID/)
  assert.match(witness, /sourceProvenance/)
  assert.match(witness, /transcriptContentHash/)
  assert.match(witness, /rawTranscriptIncluded: false/)
  assert.match(witness, /generationProvenance/)
  assert.match(witness, /assert\.equal\(generationProvenance\.provider, 'gemini'\)/)
  assert.match(witness, /responseStatus, 200/)
  assert.match(witness, /artifactRef/)
})

test('synthetic Teacher Authority is an explicit persisted decision bound to a reviewer and payload hash', () => {
  assert.match(witness, /authorityTaskBeforeApproval\.type, 'canonical_learning_record_authority'/)
  assert.match(witness, /authorityTaskBeforeApproval\.status, 'pending'/)
  assert.match(witness, /status: 'approved'/)
  assert.match(witness, /decision: 'approved'/)
  assert.match(witness, /reviewerId: teacher\.id/)
  assert.match(witness, /authorityTask\.decision, 'approved'/)
  assert.match(witness, /authorityTask\.reviewerId, teacher\.id/)
  assert.match(witness, /authorityPayloadHash/)
  assert.match(witness, /runG2RuntimeProof\(authorityTask\.id\)/)
  assert.match(witness, /runG3RuntimeProof\(authorityTask\.id\)/)
  assert.match(witness, /runG4RuntimeProof\(authorityTask\.id\)/)
  assert.match(witness, /runG5RuntimeProof\(authorityTask\.id\)/)
})

test('canonical continuation revalidates the exact persisted human decision', () => {
  assert.match(continuation, /assertPersistedPublicationAuthority/)
  assert.match(continuation, /task\.decision !== 'approved'/)
  assert.match(continuation, /authorityPayloadHash/)
  assert.match(continuation, /assertTeacherAuthorityBinding/)
  assert.match(redaction, /teacherAuthority\.authenticatedTeacherSession, false/)
})
