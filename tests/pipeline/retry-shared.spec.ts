import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { getPrismaClient } from '../../lib/prisma.ts'
import { claimFailedSharedRun } from '../../lib/learning-machine/behavioral-boundary.ts'

test('shared retry claims the same PipelineRun once and preserves identity and resumePoint', async () => {
  const prisma = getPrismaClient()
  const nonce = randomUUID().replace(/-/g, '')
  const sourceFileId = `issue-58-shared-retry-${nonce}`
  const normalizedRunIdentity = `lm:issue-58-shared-retry:${nonce}`
  const resumePoint = 'canonical_verification'
  let transcriptId: string | undefined
  let pipelineRunId: string | undefined

  try {
    const transcript = await prisma.transcript.create({
      data: {
        sourceFileId,
        externalId: `synthetic-transcript-${nonce}`,
        studentEmail: `synthetic-${nonce}@invalid.test`,
        lessonId: `synthetic-lesson-${nonce}`,
        source: 'google_meet',
        content: 'Synthetic transcript for the shared retry integration test.',
        metadata: { sourceFileId, synthetic: true },
      },
    })
    transcriptId = transcript.id

    const original = await prisma.pipelineRun.create({
      data: {
        idempotencyKey: normalizedRunIdentity,
        transcriptId: transcript.id,
        attemptNumber: 1,
        studentEmail: transcript.studentEmail,
        lessonId: transcript.lessonId,
        status: 'failed',
        executionMode: 'shared_learning_machine',
        normalizedRunIdentity,
        machineVersion: 'prime-learning-machine-v1',
        machineContractVersion: 'shared-runner-v1',
        currentStage: 'canonical_verification',
        resumePoint,
        errorCode: 'SYNTHETIC_RETRY_FIXTURE',
        errorMessage: 'Synthetic failed run.',
      },
    })
    pipelineRunId = original.id

    const claim = () => claimFailedSharedRun({
      claim: async () => (
        await prisma.pipelineRun.updateMany({
          where: {
            id: original.id,
            status: 'failed',
            executionMode: 'shared_learning_machine',
          },
          data: {
            status: 'processing',
            errorCode: null,
            errorMessage: null,
            completedAt: null,
          },
        })
      ).count,
      readCurrent: () => prisma.pipelineRun.findUnique({ where: { id: original.id } }),
    })

    const results = await Promise.all([claim(), claim()])
    const winnerCount = results.filter((result) => result.claimed).length
    const loserCount = results.filter((result) => !result.claimed).length

    assert.equal(winnerCount, 1, 'exactly one concurrent retry must claim the durable run')
    assert.equal(loserCount, 1, 'the competing retry must observe the existing claim')
    for (const result of results) {
      assert.equal(result.current?.id, original.id, 'retry must retain the original PipelineRun id')
      assert.equal(result.current?.normalizedRunIdentity, normalizedRunIdentity)
      assert.equal(result.current?.resumePoint, resumePoint)
      assert.equal(result.current?.attemptNumber, 1)
      assert.equal(result.current?.transcriptId, transcript.id)
    }

    const persisted = await prisma.pipelineRun.findMany({ where: { transcriptId: transcript.id } })
    assert.equal(persisted.length, 1, 'shared retry must not create a second PipelineRun')
    assert.equal(persisted[0].id, original.id)
    assert.equal(persisted[0].status, 'processing')
    assert.equal(persisted[0].normalizedRunIdentity, normalizedRunIdentity)
    assert.equal(persisted[0].resumePoint, resumePoint)
    assert.equal(persisted[0].attemptNumber, 1)
  } finally {
    if (pipelineRunId) {
      await prisma.pipelineRun.deleteMany({ where: { id: pipelineRunId } })
    }
    if (transcriptId) {
      await prisma.transcript.deleteMany({ where: { id: transcriptId } })
    }
    await prisma.$disconnect()
  }
})
