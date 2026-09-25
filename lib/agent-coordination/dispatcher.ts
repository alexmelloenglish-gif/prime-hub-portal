import { resolveAgentWakeTarget } from '@/lib/agent-coordination/active-contract'
import { deliverCoordinationWake } from '@/lib/agent-coordination/dispatch-core'
import {
  claimNextAgentCoordinationEvent,
  markAgentCoordinationDispatched,
  releaseAgentCoordinationLease,
} from '@/lib/agent-coordination/store'

type FetchLike = typeof fetch

type DispatchDependencies = {
  claim?: typeof claimNextAgentCoordinationEvent
  markDispatched?: typeof markAgentCoordinationDispatched
  releaseLease?: typeof releaseAgentCoordinationLease
  resolveWakeTarget?: typeof resolveAgentWakeTarget
  fetchImpl?: FetchLike
}

export async function dispatchNextAgentCoordinationEvent(input: {
  targetRole: string
  dispatcherId: string
  workstreamId?: string | null
  leaseSeconds?: number
  fetchImpl?: FetchLike
}, dependencies: DispatchDependencies = {}) {
  const claim = dependencies.claim ?? claimNextAgentCoordinationEvent
  const markDispatched = dependencies.markDispatched ?? markAgentCoordinationDispatched
  const releaseLease = dependencies.releaseLease ?? releaseAgentCoordinationLease
  const resolveWakeTarget = dependencies.resolveWakeTarget ?? resolveAgentWakeTarget

  const event = await claim({
    targetRole: input.targetRole,
    claimedBy: input.dispatcherId,
    workstreamId: input.workstreamId,
    leaseSeconds: input.leaseSeconds,
  })

  if (!event) {
    return { status: 'idle' as const, event: null }
  }

  const target = resolveWakeTarget(event.targetRole)

  return deliverCoordinationWake({
    event,
    claimedBy: input.dispatcherId,
    targetUrl: target?.url ?? null,
    wakeSecret: process.env.PRIME_AGENT_WAKE_SECRET,
    fetchImpl: dependencies.fetchImpl ?? input.fetchImpl ?? fetch,
    markDispatched,
    releaseLease,
  })
}
