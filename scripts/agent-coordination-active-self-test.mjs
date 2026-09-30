import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  coordinationLeaseDeadline,
  isCoordinationLeaseAvailable,
  normalizeCoordinationLeaseSeconds,
  resolveAgentWakeTarget,
} from '../lib/agent-coordination/active-contract.ts'
import { deliverCoordinationWake } from '../lib/agent-coordination/dispatch-core.ts'
import {
  PRODUCTION_WITNESS_KIND,
  validateProductionWitnessWake,
} from '../lib/agent-coordination/production-witness.ts'

const now = new Date('2026-09-25T21:30:00.000Z')
assert.equal(normalizeCoordinationLeaseSeconds(undefined), 300)
assert.equal(normalizeCoordinationLeaseSeconds(90), 90)
assert.throws(() => normalizeCoordinationLeaseSeconds(10), /between 30 and 3600/)
assert.equal(
  coordinationLeaseDeadline(now, 90).toISOString(),
  '2026-09-25T21:31:30.000Z',
)
assert.equal(
  isCoordinationLeaseAvailable({ ackStatus: 'PENDING', leaseExpiresAt: null, now }),
  true,
)
assert.equal(
  isCoordinationLeaseAvailable({
    ackStatus: 'PENDING',
    leaseExpiresAt: new Date('2026-09-25T21:29:59.000Z'),
    now,
  }),
  true,
)
assert.equal(
  isCoordinationLeaseAvailable({
    ackStatus: 'PENDING',
    leaseExpiresAt: new Date('2026-09-25T21:31:00.000Z'),
    now,
  }),
  false,
)
assert.equal(
  isCoordinationLeaseAvailable({ ackStatus: 'ACKNOWLEDGED', leaseExpiresAt: null, now }),
  false,
)

const target = resolveAgentWakeTarget(
  'validator',
  JSON.stringify({ validator: 'https://agent.example.test/wake' }),
)
assert.equal(target?.url, 'https://agent.example.test/wake')
assert.equal(resolveAgentWakeTarget('builder', '{}'), null)
assert.throws(
  () => resolveAgentWakeTarget('validator', JSON.stringify({ validator: 'http://agent.example.test/wake' })),
  /must use https/,
)

const event = {
  id: 'evt-1',
  workstreamId: 'prime:p0:shared-runner',
  senderRole: 'builder',
  targetRole: 'validator',
  eventType: 'VALIDATION_REQUESTED',
  repo: 'alexmelloenglish-gif/prime-hub-portal',
  issueNumber: 58,
  prNumber: 59,
  sha: '20c7ffee7320257b138c2bd74f903fbcebba413c',
  githubCommentUrl: 'https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/59#issuecomment-1',
  payloadJson: { summary: 'validate exact SHA' },
  leaseExpiresAt: new Date('2026-09-25T21:35:00.000Z'),
}

let marked = 0
let released = 0
let lastReleaseError = null

const success = await deliverCoordinationWake({
  event,
  claimedBy: 'dispatcher-1',
  targetUrl: 'https://agent.example.test/wake',
  wakeSecret: 'test-secret',
  fetchImpl: async (_url, init) => {
    assert.equal(init?.method, 'POST')
    assert.equal(init?.headers?.['x-prime-agent-wake-secret'], 'test-secret')
    const body = JSON.parse(String(init?.body))
    assert.equal(body.coordinationEventId, event.id)
    assert.equal(body.sha, event.sha)
    return new Response(null, { status: 202 })
  },
  markDispatched: async () => { marked += 1 },
  releaseLease: async (input) => {
    released += 1
    lastReleaseError = input.dispatchError ?? null
  },
})
assert.equal(success.status, 'dispatched')
assert.equal(marked, 1)
assert.equal(released, 0)

marked = 0
released = 0
lastReleaseError = null
const notConfigured = await deliverCoordinationWake({
  event,
  claimedBy: 'dispatcher-1',
  targetUrl: null,
  fetchImpl: async () => {
    throw new Error('fetch must not run without a configured target')
  },
  markDispatched: async () => { marked += 1 },
  releaseLease: async (input) => {
    released += 1
    lastReleaseError = input.dispatchError ?? null
  },
})
assert.equal(notConfigured.status, 'not_configured')
assert.equal(marked, 0)
assert.equal(released, 1)
assert.equal(lastReleaseError, 'NO_WAKE_TARGET_CONFIGURED')

released = 0
lastReleaseError = null
const failed = await deliverCoordinationWake({
  event,
  claimedBy: 'dispatcher-1',
  targetUrl: 'https://agent.example.test/wake',
  fetchImpl: async () => new Response(null, { status: 503 }),
  markDispatched: async () => { marked += 1 },
  releaseLease: async (input) => {
    released += 1
    lastReleaseError = input.dispatchError ?? null
  },
})
assert.equal(failed.status, 'failed')
assert.equal(released, 1)
assert.equal(lastReleaseError, 'WAKE_HTTP_503')

const deployedSha = '6fb8714ff4c21a70847dc07ecc18dac5095c3ce6'
const productionWitnessEvent = {
  id: 'evt-production-witness',
  workstreamId: 'production-activation:wake-witness:2026-09-29',
  senderRole: 'production-activation-controller',
  targetRole: 'validator',
  eventType: 'VALIDATION_REQUESTED',
  repo: 'alexmelloenglish-gif/prime-hub-portal',
  issueNumber: 58,
  prNumber: null,
  sha: deployedSha,
  githubCommentUrl: 'https://github.com/alexmelloenglish-gif/prime-hub-portal/issues/58#issuecomment-1',
  payloadJson: {
    witnessKind: PRODUCTION_WITNESS_KIND,
    expectedSha: deployedSha,
  },
}
const productionWitnessBody = {
  coordinationEventId: productionWitnessEvent.id,
  workstreamId: productionWitnessEvent.workstreamId,
  senderRole: productionWitnessEvent.senderRole,
  targetRole: productionWitnessEvent.targetRole,
  eventType: productionWitnessEvent.eventType,
  repo: productionWitnessEvent.repo,
  issueNumber: productionWitnessEvent.issueNumber,
  prNumber: productionWitnessEvent.prNumber,
  sha: productionWitnessEvent.sha,
  githubCommentUrl: productionWitnessEvent.githubCommentUrl,
  payload: productionWitnessEvent.payloadJson,
}
assert.equal(
  validateProductionWitnessWake({
    body: productionWitnessBody,
    event: productionWitnessEvent,
    deployedSha,
  }).coordinationEventId,
  productionWitnessEvent.id,
)
assert.throws(
  () => validateProductionWitnessWake({
    body: { ...productionWitnessBody, sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
    event: productionWitnessEvent,
    deployedSha,
  }),
  /Wake SHA does not match persisted event/,
)
assert.throws(
  () => validateProductionWitnessWake({
    body: productionWitnessBody,
    event: {
      ...productionWitnessEvent,
      payloadJson: { witnessKind: 'not-a-production-witness', expectedSha: deployedSha },
    },
    deployedSha,
  }),
  /marker is missing or invalid/,
)
assert.throws(
  () => validateProductionWitnessWake({
    body: productionWitnessBody,
    event: productionWitnessEvent,
    deployedSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  }),
  /must equal the executing Vercel deployment SHA/,
)

const schema = readFileSync('prisma/schema.prisma', 'utf8')
const store = readFileSync('lib/agent-coordination/store.ts', 'utf8')
const dispatchRoute = readFileSync('app/api/coordination/dispatch/route.ts', 'utf8')
const claimRoute = readFileSync('app/api/coordination/events/claim/route.ts', 'utf8')
const wakeRoute = readFileSync('app/api/coordination/wake/route.ts', 'utf8')

assert.match(schema, /claimedBy\s+String\?/)
assert.match(schema, /leaseExpiresAt\s+DateTime\?/)
assert.match(schema, /dispatchAttempts\s+Int\s+@default\(0\)/)
assert.match(store, /updateMany\(\{[\s\S]*ackStatus: 'PENDING'[\s\S]*leaseExpiresAt/)
assert.match(store, /dispatchAttempts: \{ increment: 1 \}/)
assert.match(dispatchRoute, /dispatchNextAgentCoordinationEvent/)
assert.match(claimRoute, /claimNextAgentCoordinationEvent/)
assert.match(wakeRoute, /PRIME_AGENT_WAKE_SECRET/)
assert.match(wakeRoute, /VERCEL_GIT_COMMIT_SHA/)
assert.match(wakeRoute, /validateProductionWitnessWake/)
assert.match(wakeRoute, /acknowledgeAgentCoordinationEvent/)

console.log('Agent Coordination Bus Phase 2 active self-test: PASS')
