import { resolveAgentWakeTarget } from '@/lib/agent-coordination/active-contract'
import {
  claimNextAgentCoordinationEvent,
  markAgentCoordinationDispatched,
  releaseAgentCoordinationLease,
} from '@/lib/agent-coordination/store'

type FetchLike = typeof fetch

export async function dispatchNextAgentCoordinationEvent(input: {
  targetRole: string
  dispatcherId: string
  workstreamId?: string | null
  leaseSeconds?: number
  fetchImpl?: FetchLike
}) {
  const event = await claimNextAgentCoordinationEvent({
    targetRole: input.targetRole,
    claimedBy: input.dispatcherId,
    workstreamId: input.workstreamId,
    leaseSeconds: input.leaseSeconds,
  })

  if (!event) {
    return { status: 'idle' as const, event: null }
  }

  const target = resolveAgentWakeTarget(event.targetRole)
  if (!target) {
    await releaseAgentCoordinationLease({
      eventId: event.id,
      claimedBy: input.dispatcherId,
      dispatchError: 'NO_WAKE_TARGET_CONFIGURED',
    })
    return {
      status: 'not_configured' as const,
      event,
    }
  }

  const wakePayload = {
    coordinationEventId: event.id,
    workstreamId: event.workstreamId,
    senderRole: event.senderRole,
    targetRole: event.targetRole,
    eventType: event.eventType,
    repo: event.repo,
    issueNumber: event.issueNumber,
    prNumber: event.prNumber,
    sha: event.sha,
    githubCommentUrl: event.githubCommentUrl,
    payload: event.payloadJson,
    leaseExpiresAt: event.leaseExpiresAt?.toISOString() ?? null,
  }

  const fetchImpl = input.fetchImpl ?? fetch
  try {
    const response = await fetchImpl(target.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.PRIME_AGENT_WAKE_SECRET
          ? { 'x-prime-agent-wake-secret': process.env.PRIME_AGENT_WAKE_SECRET }
          : {}),
      },
      body: JSON.stringify(wakePayload),
      redirect: 'error',
    })

    if (!response.ok) {
      const message = `WAKE_HTTP_${response.status}`
      await releaseAgentCoordinationLease({
        eventId: event.id,
        claimedBy: input.dispatcherId,
        dispatchError: message,
      })
      return {
        status: 'failed' as const,
        event,
        error: message,
      }
    }

    await markAgentCoordinationDispatched({
      eventId: event.id,
      claimedBy: input.dispatcherId,
    })
    return {
      status: 'dispatched' as const,
      event,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Wake dispatch failed'
    await releaseAgentCoordinationLease({
      eventId: event.id,
      claimedBy: input.dispatcherId,
      dispatchError: message,
    })
    return {
      status: 'failed' as const,
      event,
      error: message,
    }
  }
}
