export type CoordinationWakeEvent = {
  id: string
  workstreamId: string
  senderRole: string
  targetRole: string
  eventType: string
  repo: string
  issueNumber: number | null
  prNumber: number | null
  sha: string | null
  githubCommentUrl: string | null
  payloadJson: unknown
  leaseExpiresAt: Date | null
}

export async function deliverCoordinationWake(input: {
  event: CoordinationWakeEvent
  claimedBy: string
  targetUrl: string | null
  wakeSecret?: string
  fetchImpl: typeof fetch
  markDispatched: (input: { eventId: string; claimedBy: string }) => Promise<unknown>
  releaseLease: (input: {
    eventId: string
    claimedBy: string
    dispatchError?: string | null
  }) => Promise<unknown>
}) {
  const { event } = input

  if (!input.targetUrl) {
    await input.releaseLease({
      eventId: event.id,
      claimedBy: input.claimedBy,
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

  try {
    const response = await input.fetchImpl(input.targetUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(input.wakeSecret
          ? { 'x-prime-agent-wake-secret': input.wakeSecret }
          : {}),
      },
      body: JSON.stringify(wakePayload),
      redirect: 'error',
    })

    if (!response.ok) {
      const message = `WAKE_HTTP_${response.status}`
      await input.releaseLease({
        eventId: event.id,
        claimedBy: input.claimedBy,
        dispatchError: message,
      })
      return {
        status: 'failed' as const,
        event,
        error: message,
      }
    }

    await input.markDispatched({
      eventId: event.id,
      claimedBy: input.claimedBy,
    })
    return {
      status: 'dispatched' as const,
      event,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Wake dispatch failed'
    await input.releaseLease({
      eventId: event.id,
      claimedBy: input.claimedBy,
      dispatchError: message,
    })
    return {
      status: 'failed' as const,
      event,
      error: message,
    }
  }
}
