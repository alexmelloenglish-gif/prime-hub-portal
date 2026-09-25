import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  AGENT_COORDINATION_EVENT_TYPES,
  canApplyAckTransition,
  normalizeAgentCoordinationEvent,
} from '../lib/agent-coordination/contract.ts'

const synthetic = {
  workstreamId: 'prime:p0:shared-runner',
  senderRole: 'builder',
  targetRole: 'validator',
  eventType: 'VALIDATION_REQUESTED',
  repo: 'alexmelloenglish-gif/prime-hub-portal',
  issueNumber: 58,
  prNumber: 59,
  sha: 'abcdef1234567',
  githubCommentUrl: 'https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/59#issuecomment-1',
  sourceDeliveryId: 'synthetic-delivery-001',
  requiresAck: true,
  payload: { evidence: 'github-only', note: 'routing metadata only' },
}

const first = normalizeAgentCoordinationEvent(synthetic)
const replay = normalizeAgentCoordinationEvent({ ...synthetic })
assert.equal(
  first.idempotencyKey,
  replay.idempotencyKey,
  'Webhook retry must resolve to the same idempotency key',
)

const otherTarget = normalizeAgentCoordinationEvent({
  ...synthetic,
  targetRole: 'builder',
})
assert.notEqual(
  first.idempotencyKey,
  otherTarget.idempotencyKey,
  'Fan-out to a different target role must use a distinct ledger envelope',
)

const otherSha = normalizeAgentCoordinationEvent({
  ...synthetic,
  sha: 'fedcba7654321',
})
assert.notEqual(
  first.idempotencyKey,
  otherSha.idempotencyKey,
  'A new candidate SHA must not collapse into an earlier validation request',
)

const ledger = new Map()
ledger.set(first.idempotencyKey, first)
ledger.set(replay.idempotencyKey, replay)
assert.equal(ledger.size, 1, 'Synthetic delivery retry must deduplicate to one ledger event')

assert.equal(canApplyAckTransition('PENDING', 'ACKNOWLEDGED'), true)
assert.equal(canApplyAckTransition('PENDING', 'SUPERSEDED'), true)
assert.equal(canApplyAckTransition('ACKNOWLEDGED', 'ACKNOWLEDGED'), true)
assert.equal(canApplyAckTransition('ACKNOWLEDGED', 'SUPERSEDED'), false)
assert.equal(canApplyAckTransition('SUPERSEDED', 'ACKNOWLEDGED'), false)

assert.throws(
  () => normalizeAgentCoordinationEvent({
    ...synthetic,
    eventType: 'MERGE_AUTHORIZED',
  }),
  /Unsupported Phase 1 event type/,
  'Phase 1 must not manufacture merge authority',
)

assert.deepEqual(AGENT_COORDINATION_EVENT_TYPES, [
  'CANDIDATE_SHA_PUBLISHED',
  'VALIDATION_REQUESTED',
  'VALIDATION_ACKNOWLEDGED',
  'VALIDATION_PASSED',
  'VALIDATION_BLOCKED',
  'CORRECTION_REQUESTED',
])

const schema = readFileSync('prisma/schema.prisma', 'utf8')
const migration = readFileSync(
  'prisma/migrations/20260925162500_add_agent_coordination_bus_phase1/migration.sql',
  'utf8',
)
const store = readFileSync('lib/agent-coordination/store.ts', 'utf8')
const eventRoute = readFileSync('app/api/coordination/events/route.ts', 'utf8')
const ackRoute = readFileSync('app/api/coordination/events/[id]/ack/route.ts', 'utf8')

assert.match(schema, /model AgentCoordinationEvent/)
assert.match(schema, /idempotencyKey\s+String\s+@unique/)
assert.match(schema, /ackStatus\s+String\s+@default\("PENDING"\)/)
assert.match(migration, /CREATE UNIQUE INDEX "agent_coordination_events_idempotencyKey_key"/)
assert.match(store, /P2002/, 'Concurrent duplicate inserts must collapse to the existing ledger row')
assert.match(store, /ackStatus: 'PENDING'/, 'ACK transition must be conditional on pending state')
assert.match(eventRoute, /x-prime-agent-bus-secret|isAgentBusAuthorized/)
assert.match(ackRoute, /acknowledgeAgentCoordinationEvent/)

console.log('Agent Coordination Bus Phase 1 self-test: PASS')
