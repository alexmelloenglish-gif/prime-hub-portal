import assert from 'node:assert/strict'
import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import {
  acknowledgeAgentCoordinationEvent,
  claimNextAgentCoordinationEvent,
  ingestAgentCoordinationEvent,
} from '../lib/agent-coordination/store.ts'
import { dispatchNextAgentCoordinationEvent } from '../lib/agent-coordination/dispatcher.ts'
import { getPrismaClient } from '../lib/prisma.ts'

const REPO = 'alexmelloenglish-gif/prime-hub-portal'
const PHASE2_SHA = 'd29f87480d43168311deab635c93acfcb0137118'
const POINTER = 'https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/64#issuecomment-5839762499'
const TARGET_ROLE = 'validator'
const prisma = getPrismaClient()

function eventInput(input: {
  workstreamId: string
  sourceDeliveryId: string
  payload?: Record<string, unknown>
}) {
  return {
    workstreamId: input.workstreamId,
    senderRole: 'runtime-proof-controller',
    targetRole: TARGET_ROLE,
    eventType: 'VALIDATION_REQUESTED' as const,
    repo: REPO,
    issueNumber: 58,
    prNumber: 64,
    sha: PHASE2_SHA,
    githubCommentUrl: POINTER,
    sourceDeliveryId: input.sourceDeliveryId,
    requiresAck: true,
    payload: input.payload ?? { task: 'harmless isolated runtime validation' },
  }
}

async function main() {
  const certPath = process.env.RUNTIME_WITNESS_CERT
  const keyPath = process.env.RUNTIME_WITNESS_KEY
  assert.ok(certPath && keyPath, 'isolated HTTPS cert/key paths are required')

  const workerExecutions: Array<{
    eventId: string
    sha: string
    githubCommentUrl: string
    validated: boolean
    receivedAt: string
    ackedAt: string
  }> = []

  const server = https.createServer(
    {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    },
    (request, response) => {
      void (async () => {
        try {
          assert.equal(request.method, 'POST')
          assert.equal(request.url, '/wake')
          assert.equal(
            request.headers['x-prime-agent-wake-secret'],
            'isolated-runtime-wake-secret',
          )

          const chunks: Buffer[] = []
          for await (const chunk of request) chunks.push(Buffer.from(chunk))
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>

          const coordinationEventId = String(body.coordinationEventId || '')
          const sha = String(body.sha || '')
          const githubCommentUrl = String(body.githubCommentUrl || '')
          const repo = String(body.repo || '')
          const eventType = String(body.eventType || '')

          // Harmless worker validation: verify this wake points to the exact validated
          // Phase 2 candidate and canonical GitHub evidence location. No repository,
          // learner, merge, release or Production state is mutated.
          const validated =
            repo === REPO
            && sha === PHASE2_SHA
            && eventType === 'VALIDATION_REQUESTED'
            && githubCommentUrl === POINTER

          assert.equal(validated, true)

          const receivedAt = new Date().toISOString()
          const ack = await acknowledgeAgentCoordinationEvent({
            eventId: coordinationEventId,
            acknowledgedBy: 'isolated-validator-worker',
            ackStatus: 'ACKNOWLEDGED',
          })
          assert.equal(ack.event.id, coordinationEventId)
          assert.equal(ack.event.ackStatus, 'ACKNOWLEDGED')

          workerExecutions.push({
            eventId: coordinationEventId,
            sha,
            githubCommentUrl,
            validated,
            receivedAt,
            ackedAt: ack.event.acknowledgedAt?.toISOString() || '',
          })

          response.writeHead(202, { 'content-type': 'application/json' })
          response.end(JSON.stringify({ ok: true, coordinationEventId }))
        } catch (error) {
          response.writeHead(500, { 'content-type': 'application/json' })
          response.end(JSON.stringify({
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          }))
        }
      })()
    },
  )

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve())
  })
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  const wakeUrl = `https://127.0.0.1:${address.port}/wake`
  process.env.PRIME_AGENT_WAKE_URLS_JSON = JSON.stringify({ [TARGET_ROLE]: wakeUrl })
  process.env.PRIME_AGENT_WAKE_SECRET = 'isolated-runtime-wake-secret'
  // This is safe only because the witness talks to its own ephemeral localhost
  // self-signed HTTPS receiver inside the GitHub Actions job.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  try {
    // 1-6: event -> atomic dispatcher claim -> real HTTPS wake -> worker validation -> ACK/readback.
    const successInsert = await ingestAgentCoordinationEvent(eventInput({
      workstreamId: 'runtime-proof:wake-success',
      sourceDeliveryId: 'runtime-proof-wake-success-v1',
      payload: {
        instruction: 'Validate the exact #64 pointer and ACK the same event.',
        expectedSha: PHASE2_SHA,
      },
    }))
    assert.equal(successInsert.duplicate, false)
    assert.equal(successInsert.event.ackStatus, 'PENDING')

    const duplicateInsert = await ingestAgentCoordinationEvent(eventInput({
      workstreamId: 'runtime-proof:wake-success',
      sourceDeliveryId: 'runtime-proof-wake-success-v1',
      payload: {
        instruction: 'Validate the exact #64 pointer and ACK the same event.',
        expectedSha: PHASE2_SHA,
      },
    }))
    assert.equal(duplicateInsert.duplicate, true)
    assert.equal(duplicateInsert.event.id, successInsert.event.id)

    const dispatched = await dispatchNextAgentCoordinationEvent({
      targetRole: TARGET_ROLE,
      dispatcherId: 'isolated-dispatcher',
      workstreamId: 'runtime-proof:wake-success',
      leaseSeconds: 300,
    })
    assert.equal(dispatched.status, 'dispatched')
    assert.equal(dispatched.event?.id, successInsert.event.id)
    assert.equal(workerExecutions.length, 1)
    assert.equal(workerExecutions[0].eventId, successInsert.event.id)

    const successReadBack = await prisma.agentCoordinationEvent.findUniqueOrThrow({
      where: { id: successInsert.event.id },
    })
    assert.equal(successReadBack.ackStatus, 'ACKNOWLEDGED')
    assert.equal(successReadBack.acknowledgedBy, 'isolated-validator-worker')
    assert.ok(successReadBack.acknowledgedAt)
    assert.equal(successReadBack.claimedBy, null)
    assert.equal(successReadBack.leaseExpiresAt, null)
    assert.equal(successReadBack.dispatchAttempts, 1)

    // 7: a second worker cannot claim/execute an event while the first live lease exists.
    const exclusiveInsert = await ingestAgentCoordinationEvent(eventInput({
      workstreamId: 'runtime-proof:lease-exclusive',
      sourceDeliveryId: 'runtime-proof-lease-exclusive-v1',
    }))
    const firstLease = await claimNextAgentCoordinationEvent({
      targetRole: TARGET_ROLE,
      claimedBy: 'lease-worker-a',
      workstreamId: 'runtime-proof:lease-exclusive',
      leaseSeconds: 300,
    })
    assert.ok(firstLease)
    assert.equal(firstLease.id, exclusiveInsert.event.id)
    assert.equal(firstLease.claimedBy, 'lease-worker-a')

    const losingLease = await claimNextAgentCoordinationEvent({
      targetRole: TARGET_ROLE,
      claimedBy: 'lease-worker-b',
      workstreamId: 'runtime-proof:lease-exclusive',
      leaseSeconds: 300,
    })
    assert.equal(losingLease, null)

    await acknowledgeAgentCoordinationEvent({
      eventId: exclusiveInsert.event.id,
      acknowledgedBy: 'lease-worker-a',
      ackStatus: 'ACKNOWLEDGED',
    })

    // 8: failed wake releases the lease, and a retry worker can claim the same event.
    const failureInsert = await ingestAgentCoordinationEvent(eventInput({
      workstreamId: 'runtime-proof:wake-failure-retry',
      sourceDeliveryId: 'runtime-proof-wake-failure-v1',
    }))
    const failedDispatch = await dispatchNextAgentCoordinationEvent(
      {
        targetRole: TARGET_ROLE,
        dispatcherId: 'failure-dispatcher',
        workstreamId: 'runtime-proof:wake-failure-retry',
        leaseSeconds: 300,
      },
      {
        resolveWakeTarget: () => ({ url: 'https://isolated-failure.invalid/wake' }),
        fetchImpl: async () => new Response(null, { status: 503 }),
      },
    )
    assert.equal(failedDispatch.status, 'failed')
    assert.equal(failedDispatch.event?.id, failureInsert.event.id)
    assert.equal(failedDispatch.error, 'WAKE_HTTP_503')

    const releasedReadBack = await prisma.agentCoordinationEvent.findUniqueOrThrow({
      where: { id: failureInsert.event.id },
    })
    assert.equal(releasedReadBack.ackStatus, 'PENDING')
    assert.equal(releasedReadBack.claimedBy, null)
    assert.equal(releasedReadBack.leaseExpiresAt, null)
    assert.equal(releasedReadBack.lastDispatchError, 'WAKE_HTTP_503')
    assert.equal(releasedReadBack.dispatchAttempts, 1)

    const retryLease = await claimNextAgentCoordinationEvent({
      targetRole: TARGET_ROLE,
      claimedBy: 'retry-worker',
      workstreamId: 'runtime-proof:wake-failure-retry',
      leaseSeconds: 300,
    })
    assert.ok(retryLease)
    assert.equal(retryLease.id, failureInsert.event.id)
    assert.equal(retryLease.claimedBy, 'retry-worker')
    assert.equal(retryLease.dispatchAttempts, 2)

    const retryAck = await acknowledgeAgentCoordinationEvent({
      eventId: failureInsert.event.id,
      acknowledgedBy: 'retry-worker',
      ackStatus: 'ACKNOWLEDGED',
    })
    assert.equal(retryAck.event.ackStatus, 'ACKNOWLEDGED')

    const finalFailureReadBack = await prisma.agentCoordinationEvent.findUniqueOrThrow({
      where: { id: failureInsert.event.id },
    })
    assert.equal(finalFailureReadBack.ackStatus, 'ACKNOWLEDGED')
    assert.equal(finalFailureReadBack.acknowledgedBy, 'retry-worker')
    assert.equal(finalFailureReadBack.claimedBy, null)

    // 9: the success event moved from insert to ACK entirely inside this runtime witness.
    // No human wrote, copied or relayed the event between those transitions.
    const evidence = {
      verdict: 'ACTIVE COORDINATION RUNTIME WITNESS PASS',
      basePhase2Sha: PHASE2_SHA,
      database: 'GitHub Actions disposable PostgreSQL service',
      productionTouched: false,
      humanRelayUsed: false,
      wakeTransport: {
        protocol: 'HTTPS',
        receiver: 'ephemeral localhost self-signed test worker',
        wakeSecretVerified: true,
      },
      successFlow: {
        eventId: successReadBack.id,
        idempotencyKey: successReadBack.idempotencyKey,
        eventType: successReadBack.eventType,
        githubCommentUrl: successReadBack.githubCommentUrl,
        sha: successReadBack.sha,
        dispatchAttempts: successReadBack.dispatchAttempts,
        ackStatus: successReadBack.ackStatus,
        acknowledgedBy: successReadBack.acknowledgedBy,
        acknowledgedAt: successReadBack.acknowledgedAt?.toISOString(),
        workerExecution: workerExecutions[0],
        duplicateDeliveryCollapsed: duplicateInsert.duplicate,
      },
      exclusiveLease: {
        eventId: exclusiveInsert.event.id,
        firstWorker: 'lease-worker-a',
        secondWorkerClaimed: Boolean(losingLease),
        result: 'second worker could not execute same live lease',
      },
      failedWakeRecovery: {
        eventId: failureInsert.event.id,
        firstDispatchResult: failedDispatch.status,
        firstDispatchError: failedDispatch.error,
        leaseReleasedAfterFailure:
          releasedReadBack.claimedBy === null
          && releasedReadBack.leaseExpiresAt === null,
        retryWorker: retryLease.claimedBy,
        dispatchAttemptsAfterRetryClaim: retryLease.dispatchAttempts,
        finalAckStatus: finalFailureReadBack.ackStatus,
        finalAcknowledgedBy: finalFailureReadBack.acknowledgedBy,
      },
    }

    fs.mkdirSync(path.join(process.cwd(), 'artifacts'), { recursive: true })
    fs.writeFileSync(
      path.join(process.cwd(), 'artifacts', 'coordination-runtime-witness.json'),
      JSON.stringify(evidence, null, 2) + '\n',
    )
    console.log(JSON.stringify(evidence, null, 2))
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
