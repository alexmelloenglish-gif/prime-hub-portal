// @ts-nocheck
// Disposable-Postgres proof of retry eligibility. Provider calls are intercepted
// in-process and return HTTP 503; no external provider or learner system is used.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import { buildSharedLearningMachineExecutionOptions } from '../lib/learning-machine/shared-run-contract.ts'
import { resolveExistingDriveTranscriptDisposition } from '../lib/pipeline/retry-eligibility.ts'

async function main() {
  process.env.GOOGLE_AI_STUDIO_API_KEY = 'retry-state-witness-synthetic-key'
  process.env.PRIME_PIPELINE_MODEL = 'retry-state-witness-deterministic'
  process.env.PRIME_MODEL_PROVIDER_ORDER = 'gemini'

  let providerRequests = 0
  let holdNextProviderRequest = false
  let providerStartedResolve = () => {}
  let providerReleaseResolve = () => {}
  let providerStarted = Promise.resolve()
  let providerRelease = Promise.resolve()

  globalThis.fetch = async () => {
    providerRequests += 1
    if (holdNextProviderRequest) {
      holdNextProviderRequest = false
      providerStartedResolve()
      await providerRelease
    }
    return new Response(JSON.stringify({ error: { message: 'synthetic provider failure' } }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    })
  }

  const [{ processLessonTranscript }, { getPrismaClient }] = await Promise.all([
    import('../lib/pipeline/run.ts'),
    import('../lib/prisma.ts'),
  ])
  const prisma = getPrismaClient()
  const nonce = randomUUID().replace(/-/g, '').slice(0, 12)
  const fixedTime = new Date('2026-11-06T04:00:00.000Z')
  const summaries = []

  function buildInput(caseName) {
    const sourceFileId = 'retry-state-witness-' + nonce + '-' + caseName
    return {
      lessonId: 'retry-state-witness-lesson-' + nonce + '-' + caseName,
      studentEmail: 'synthetic.' + caseName + '.' + nonce + '@invalid.test',
      studentId: 'synthetic-' + caseName + '-' + nonce,
      studentName: 'Synthetic Learner',
      teacherId: 'synthetic-teacher-' + nonce,
      teacherName: 'Synthetic Teacher',
      program: 'PRIME isolated retry-state witness',
      classDate: '2026-11-06',
      transcriptId: 'synthetic-transcript-' + nonce + '-' + caseName,
      transcript: [
        'Teacher: Tell me one thing you did yesterday.',
        'Learner: I went to the library and read a short story.',
        'Teacher: What did you do after that?',
        'Learner: I wrote three sentences and checked the verbs.',
      ].join('\n'),
      source: 'google_meet',
      effectiveAt: fixedTime.toISOString(),
      recordedAt: fixedTime.toISOString(),
      metadata: {
        sourceFileId,
        sourceHash: 'synthetic-source-hash-' + nonce + '-' + caseName,
        sourceMimeType: 'application/vnd.google-apps.document',
        triageStatus: 'usable_transcript',
        ingestionMode: 'retry-state-disposable-witness',
        _pipelineInput: {
          studentId: 'synthetic-' + caseName + '-' + nonce,
          studentName: 'Synthetic Learner',
          teacherId: 'synthetic-teacher-' + nonce,
          teacherName: 'Synthetic Teacher',
          program: 'PRIME isolated retry-state witness',
          classDate: '2026-11-06',
          transcriptId: 'synthetic-transcript-' + nonce + '-' + caseName,
          source: 'google_meet',
          effectiveAt: fixedTime.toISOString(),
          recordedAt: fixedTime.toISOString(),
          attendanceStatus: 'unknown',
          attendanceSource: null,
          externalMeetingId: null,
        },
      },
    }
  }

  async function createTranscript(input) {
    return prisma.transcript.create({
      data: {
        sourceFileId: input.metadata.sourceFileId,
        externalId: input.transcriptId,
        studentEmail: input.studentEmail,
        lessonId: input.lessonId,
        source: input.source,
        effectiveAt: fixedTime,
        recordedAt: fixedTime,
        content: input.transcript,
        metadata: input.metadata,
      },
    })
  }

  async function createRun(transcript, input, overrides = {}) {
    return prisma.pipelineRun.create({
      data: {
        idempotencyKey: 'retry-state-witness:' + nonce + ':' + input.lessonId + ':attempt-1',
        transcriptId: transcript.id,
        attemptNumber: 1,
        studentEmail: input.studentEmail,
        lessonId: input.lessonId,
        status: 'failed',
        errorCode: 'SYNTHETIC_HISTORICAL_FAILURE',
        errorMessage: 'Synthetic pre-existing failed attempt.',
        ...overrides,
      },
    })
  }

  async function expectMockProviderFailure(promise, label) {
    let failure
    try {
      await promise
    } catch (error) {
      failure = error
    }
    assert.ok(failure, label + ': expected intercepted provider failure')
    assert.match(String(failure.message), /All configured model providers failed/)
  }

  try {
    // Legacy FAILED -> new attempt, same durable Transcript, old run immutable.
    const failedInput = buildInput('legacy-failed')
    const failedTranscript = await createTranscript(failedInput)
    const historicalRun = await createRun(failedTranscript, failedInput)
    const requestsBeforeLegacyRetry = providerRequests
    await expectMockProviderFailure(processLessonTranscript(failedInput), 'legacy FAILED retry')
    const legacyRuns = await prisma.pipelineRun.findMany({
      where: { transcriptId: failedTranscript.id },
      orderBy: { attemptNumber: 'asc' },
    })
    assert.equal(legacyRuns.length, 2)
    assert.deepEqual(legacyRuns.map((run) => run.attemptNumber), [1, 2])
    assert.equal(legacyRuns[0].id, historicalRun.id)
    assert.equal(legacyRuns[0].status, 'failed')
    assert.equal(legacyRuns[0].errorCode, 'SYNTHETIC_HISTORICAL_FAILURE')
    assert.equal(legacyRuns[1].status, 'failed')
    assert.equal(legacyRuns[1].transcriptId, failedTranscript.id)
    assert.equal(legacyRuns[1].lessonId, failedInput.lessonId)
    assert.equal(providerRequests, requestsBeforeLegacyRetry + 1)
    summaries.push({
      scenario: 'legacy_failed_to_new_attempt',
      verdict: 'PASS',
      historicalAttemptPreserved: true,
      newAttemptNumber: legacyRuns[1].attemptNumber,
      sameTranscriptIdentity: legacyRuns[0].transcriptId === legacyRuns[1].transcriptId,
      duplicateLessonCreated: false,
    })

    // Shared FAILED -> concurrent retries contend in Postgres. Exactly one
    // claims the existing PipelineRun; the other returns duplicate while the
    // provider call is held open so it cannot hide a double claim.
    const sharedInput = buildInput('shared-failed')
    const sharedTranscript = await createTranscript(sharedInput)
    const sharedOptions = buildSharedLearningMachineExecutionOptions({
      transcript: sharedInput,
      triggerOrigin: 'retry',
      requestedBy: 'retry-state-witness',
    })
    const sharedHistoricalRun = await createRun(sharedTranscript, sharedInput, {
      idempotencyKey: sharedOptions.normalizedRunIdentity,
      executionMode: sharedOptions.executionMode,
      normalizedRunIdentity: sharedOptions.normalizedRunIdentity,
      machineVersion: sharedOptions.machineVersion,
      machineContractVersion: sharedOptions.machineContractVersion,
      currentStage: 'prompt_1',
      resumePoint: 'prompt_1',
    })

    providerStarted = new Promise((resolve) => { providerStartedResolve = resolve })
    providerRelease = new Promise((resolve) => { providerReleaseResolve = resolve })
    holdNextProviderRequest = true
    const sharedRetries = [
      processLessonTranscript(sharedInput, sharedOptions),
      processLessonTranscript(sharedInput, sharedOptions),
    ]
    await providerStarted
    const claimedRows = await prisma.pipelineRun.findMany({
      where: {
        transcriptId: sharedTranscript.id,
        normalizedRunIdentity: sharedOptions.normalizedRunIdentity,
        status: 'processing',
      },
    })
    assert.equal(claimedRows.length, 1, 'Exactly one database row may be claimed for the shared execution')
    assert.equal(claimedRows[0].id, sharedHistoricalRun.id)
    assert.equal(claimedRows[0].attemptNumber, 1)
    assert.equal(claimedRows[0].normalizedRunIdentity, sharedOptions.normalizedRunIdentity)
    assert.equal(claimedRows[0].idempotencyKey, sharedOptions.normalizedRunIdentity)
    assert.equal(claimedRows[0].resumePoint, 'prompt_1', 'The claim must preserve the durable resume point')
    const losingRetry = await Promise.race(sharedRetries)
    assert.equal(losingRetry.duplicate, true)
    assert.equal(losingRetry.pipelineRunId, sharedHistoricalRun.id)
    assert.equal(losingRetry.status, 'processing')
    providerReleaseResolve()
    const sharedOutcomes = await Promise.allSettled(sharedRetries)
    assert.equal(sharedOutcomes.filter((item) => item.status === 'rejected').length, 1)
    assert.equal(
      sharedOutcomes.filter((item) => item.status === 'fulfilled' && item.value.duplicate).length,
      1,
    )
    const sharedRuns = await prisma.pipelineRun.findMany({
      where: { transcriptId: sharedTranscript.id },
    })
    assert.equal(sharedRuns.length, 1)
    assert.equal(sharedRuns[0].id, sharedHistoricalRun.id)
    assert.equal(sharedRuns[0].attemptNumber, 1)
    assert.equal(sharedRuns[0].executionMode, 'shared_learning_machine')
    assert.equal(sharedRuns[0].normalizedRunIdentity, sharedOptions.normalizedRunIdentity)
    assert.equal(sharedRuns[0].idempotencyKey, sharedOptions.normalizedRunIdentity)
    assert.equal(sharedRuns[0].resumePoint, 'prompt_1', 'Retry must not advance or reset the persisted resume point')
    assert.equal(sharedRuns[0].status, 'failed')
    assert.equal(providerRequests, 2)
    summaries.push({
      scenario: 'shared_failed_concurrent_retry_single_claim',
      verdict: 'PASS',
      samePipelineRunPreserved: true,
      pipelineRunCount: 1,
      successfulClaims: 1,
      retryMode: 'same_execution_resume',
      normalizedRunIdentityPreserved: true,
      resumePointPreserved: 'prompt_1',
      losingRetryReturnedDuplicate: true,
      providerRequestCount: 1,
    })

    // COMPLETED -> return existing run as duplicate without provider work.
    const completedInput = buildInput('completed')
    const completedTranscript = await createTranscript(completedInput)
    const completedRun = await createRun(completedTranscript, completedInput, {
      status: 'completed',
      errorCode: null,
      errorMessage: null,
      completedAt: fixedTime,
    })
    const requestsBeforeCompleted = providerRequests
    const completedReplay = await processLessonTranscript(completedInput)
    assert.equal(completedReplay.pipelineRunId, completedRun.id)
    assert.equal(completedReplay.status, 'completed')
    assert.equal(completedReplay.duplicate, true)
    assert.equal(providerRequests, requestsBeforeCompleted)
    assert.equal(await prisma.pipelineRun.count({ where: { transcriptId: completedTranscript.id } }), 1)
    summaries.push({
      scenario: 'completed_to_duplicate_skip',
      verdict: 'PASS',
      samePipelineRunReturned: true,
      providerCalled: false,
    })

    // PROCESSING -> no second run and no provider work.
    const processingInput = buildInput('processing')
    const processingTranscript = await createTranscript(processingInput)
    const processingRun = await createRun(processingTranscript, processingInput, {
      status: 'processing',
      errorCode: null,
      errorMessage: null,
    })
    const requestsBeforeProcessing = providerRequests
    const processingReplay = await processLessonTranscript(processingInput)
    assert.equal(processingReplay.pipelineRunId, processingRun.id)
    assert.equal(processingReplay.status, 'processing')
    assert.equal(processingReplay.duplicate, true)
    assert.equal(providerRequests, requestsBeforeProcessing)
    assert.equal(await prisma.pipelineRun.count({ where: { transcriptId: processingTranscript.id } }), 1)
    summaries.push({
      scenario: 'processing_to_no_duplicate',
      verdict: 'PASS',
      samePipelineRunReturned: true,
      providerCalled: false,
    })

    // Orphan Transcript -> first attempt on the same stored source. Simulate
    // Drive having a newer export than the immutable Transcript already saved.
    const orphanStoredInput = buildInput('orphaned-transcript')
    const orphanTranscript = await createTranscript(orphanStoredInput)
    const incomingOrphanInput = {
      ...orphanStoredInput,
      transcript: orphanStoredInput.transcript + '\nTeacher: This is a later Drive revision.',
      metadata: {
        ...orphanStoredInput.metadata,
        sourceHash: 'newer-drive-revision-hash-' + nonce,
      },
    }
    const preservedOptions = buildSharedLearningMachineExecutionOptions({
      transcript: orphanStoredInput,
      triggerOrigin: 'automatic',
      requestedBy: 'retry-state-witness',
    })
    const newerDriveOptions = buildSharedLearningMachineExecutionOptions({
      transcript: incomingOrphanInput,
      triggerOrigin: 'automatic',
      requestedBy: 'retry-state-witness',
    })
    assert.notEqual(
      newerDriveOptions.normalizedRunIdentity,
      preservedOptions.normalizedRunIdentity,
      'The simulated newer Drive revision must produce a different identity before the runner restores the preserved transcript',
    )
    assert.equal(
      resolveExistingDriveTranscriptDisposition({ transcriptExists: true, latestRunStatus: null }),
      'process_orphaned_transcript',
    )
    assert.equal(
      resolveExistingDriveTranscriptDisposition({ transcriptExists: true, latestRunStatus: 'completed' }),
      'skip_existing_run',
    )
    const requestsBeforeOrphan = providerRequests
    await expectMockProviderFailure(
      processLessonTranscript(incomingOrphanInput, newerDriveOptions),
      'orphan transcript first attempt',
    )
    const orphanRows = await prisma.transcript.findMany({
      where: { sourceFileId: orphanStoredInput.metadata.sourceFileId },
      include: { pipelineRuns: true },
    })
    assert.equal(orphanRows.length, 1)
    assert.equal(orphanRows[0].id, orphanTranscript.id)
    assert.equal(orphanRows[0].content, orphanStoredInput.transcript)
    assert.equal(orphanRows[0].metadata.sourceHash, orphanStoredInput.metadata.sourceHash)
    assert.equal(orphanRows[0].pipelineRuns.length, 1)
    assert.equal(orphanRows[0].pipelineRuns[0].attemptNumber, 1)
    assert.equal(orphanRows[0].pipelineRuns[0].transcriptId, orphanTranscript.id)
    assert.equal(orphanRows[0].pipelineRuns[0].status, 'failed')
    assert.equal(
      orphanRows[0].pipelineRuns[0].normalizedRunIdentity,
      preservedOptions.normalizedRunIdentity,
    )
    assert.equal(
      orphanRows[0].pipelineRuns[0].idempotencyKey,
      preservedOptions.normalizedRunIdentity,
    )
    assert.notEqual(
      orphanRows[0].pipelineRuns[0].normalizedRunIdentity,
      newerDriveOptions.normalizedRunIdentity,
    )
    assert.equal(providerRequests, requestsBeforeOrphan + 1)
    summaries.push({
      scenario: 'orphan_transcript_to_first_attempt_preserved_identity',
      verdict: 'PASS',
      sameTranscriptPreserved: true,
      transcriptCountForSource: 1,
      firstAttemptNumber: 1,
      identityMatchesStoredTranscript: true,
      newerDriveIdentityRejected: true,
    })

    assert.equal(providerRequests, 3, 'Only legacy retry, shared single-claim retry and orphan first-attempt should reach the mocked provider')
    const evidence = {
      verdict: 'PIPELINE RETRY STATE WITNESS PASS',
      database: 'GitHub Actions disposable PostgreSQL service',
      productionTouched: false,
      externalProviderContacted: false,
      providerFixture: {
        provider: 'gemini',
        model: 'retry-state-witness-deterministic',
        transport: 'in_process_mocked_fetch',
        responseStatus: 503,
        requestCount: providerRequests,
      },
      cases: summaries,
    }
    fs.mkdirSync('artifacts', { recursive: true })
    fs.writeFileSync(
      'artifacts/pipeline-retry-state-witness.json',
      JSON.stringify(evidence, null, 2) + String.fromCharCode(10),
    )
    console.log(JSON.stringify(evidence, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
