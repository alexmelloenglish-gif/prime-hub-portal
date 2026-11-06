import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const artifactPath = process.argv[2] || path.join(process.cwd(), 'artifacts', 'golden-runtime-witness.json')
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))
const serialized = JSON.stringify(artifact)
const source = fs.readFileSync(path.join(process.cwd(), 'scripts/golden-runtime-witness.ts'), 'utf8')

assert.equal(artifact.verdict, 'GOLDEN RUNTIME WITNESS PASS')
assert.equal(artifact.productionTouched, false)
assert.equal(artifact.fixture.type, 'synthetic_disposable_fixture')
assert.equal(artifact.sourceProvenance.rawTranscriptIncluded, false)
assert.equal(artifact.providerProvenance.externalProviderContacted, false)
assert.equal(artifact.providerProvenance.transport, 'in_process_mocked_fetch')
assert.equal(artifact.providerProvenance.responseStatus, 200)
assert.equal(artifact.pipelineRun.executionMode, 'shared_learning_machine')
assert.equal(artifact.teacherAuthority.authenticatedTeacherSession, false)

assert.doesNotMatch(serialized, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
assert.doesNotMatch(serialized, /studentEmail|studentName|sourceFileId|transcriptId|reviewerId|requestId|artifactId/)
assert.doesNotMatch(source, /carolvdrummond|Gustavo Drummond|Gustavo Salgado/i)
assert.doesNotMatch(source, /data\/students\/carolvdrummond-gmail-com\.firestore\.json/)

assert.match(artifact.fixture.learnerRef, /^[a-f0-9]{16}$/)
assert.match(artifact.fixture.lessonRef, /^[a-f0-9]{16}$/)
assert.match(artifact.teacherAuthority.reviewerRef, /^[a-f0-9]{16}$/)
console.log('Golden runtime witness redaction self-test: PASS')
