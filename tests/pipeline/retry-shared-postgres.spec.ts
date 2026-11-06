import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PrismaClient } from '@prisma/client'
import { claimFailedSharedRun } from '../../lib/learning-machine/behavioral-boundary.ts'

const DATABASE_URL = process.env.PRIME_TEST_DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('PRIME_TEST_DATABASE_URL is required for the disposable Postgres retry-shared proof')
}

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
})

const RUN_ID = 'issue-58-retry-shared-postgres'
const NORMALIZED_IDENTITY = 'issue-58:retry-shared:concurrent:postgres'

async function resetFixture() {
  await prisma.pipelineRun.deleteMany({
    where: { id: RUN_ID },
  })

  return prisma.pipelineRun.create({
    data: {
      id: RUN_ID,
      status: 'failed',
      executionMode: 'shared_learning_machine',
      normalizedRunIdentity: NORMALIZED_IDENTITY,
      resumePoint: 'canonical_projections',
      studentEmail: 'retry-shared.postgres@invalid.test',
      lessonId: 'issue-58-retry-shared-postgres-lesson',
      errorCode: 'ISSUE_58_TEST_FIXTURE',
    },
  })
}

test('shared retry: two concurrent claims produce exactly one winner and one changed row', async () => {
  const fixture = await resetFixture()

  assert.equal(fixture.status, 'failed')
  assert.equal(fixture.resumePoint, 'canonical_projections')
  assert.equal(fixture.normalizedRunIdentity, NORMALIZED_IDENTITY)

  const claim = () => prisma.pipelineRun.updateMany({
    where: {
      id: RUN_ID,
      status: 'failed',
    },
    data: {
      status: 'processing',
    },
  }).then((result) => result.count)

  const readCurrent = async () => prisma.pipelineRun.findUnique({
    where: { id: RUN_ID },
  })

  const [first, second] = await Promise.all([
    claimFailedSharedRun({ claim, readCurrent }),
    claimFailedSharedRun({ claim, readCurrent }),
  ])

  const winners = [first, second].filter((result) => result.claimed)

  assert.equal(winners.length, 1, 'Exactly one concurrent retry must win the durable claim')
  assert.equal(first.current.id, second.current.id, 'Both claims must observe the same durable PipelineRun')
  assert.equal(first.current.normalizedRunIdentity, NORMALIZED_IDENTITY)
  assert.equal(second.current.normalizedRunIdentity, NORMALIZED_IDENTITY)
  assert.equal(first.current.resumePoint, 'canonical_projections')
  assert.equal(second.current.resumePoint, 'canonical_projections')

  const persisted = await prisma.pipelineRun.findUniqueOrThrow({
    where: { id: RUN_ID },
  })

  assert.equal(persisted.status, 'processing')
  assert.equal(persisted.resumePoint, 'canonical_projections')
  assert.equal(persisted.normalizedRunIdentity, NORMALIZED_IDENTITY)

  const changedRows = await prisma.pipelineRun.count({
    where: {
      id: RUN_ID,
      status: 'processing',
    },
  })

  assert.equal(changedRows, 1, 'Only one durable PipelineRun row may be changed by the winning claim')
})
