import { NextResponse } from 'next/server'
import { isAgentBusAuthorized } from '@/lib/agent-coordination/auth'
import {
  ingestAgentCoordinationEvent,
  listPendingAgentCoordinationEvents,
} from '@/lib/agent-coordination/store'
import type { AgentCoordinationEventInput } from '@/lib/agent-coordination/contract'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isAgentBusAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as Record<string, unknown>
    const input = {
      workstreamId: body.workstreamId,
      senderRole: body.senderRole,
      targetRole: body.targetRole,
      eventType: body.eventType,
      repo: body.repo,
      issueNumber: body.issueNumber,
      prNumber: body.prNumber,
      sha: body.sha,
      githubCommentUrl: body.githubCommentUrl,
      sourceDeliveryId: body.sourceDeliveryId,
      requiresAck: body.requiresAck,
      payload: body.payload,
    } as AgentCoordinationEventInput

    const result = await ingestAgentCoordinationEvent(input)
    return NextResponse.json(
      {
        ok: true,
        duplicate: result.duplicate,
        event: result.event,
      },
      { status: result.duplicate ? 200 : 201 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid coordination event'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET(request: Request) {
  if (!isAgentBusAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const targetRole = url.searchParams.get('targetRole') ?? ''
    const workstreamId = url.searchParams.get('workstreamId')
    const requestedLimit = Number(url.searchParams.get('limit') ?? 25)
    const limit = Number.isFinite(requestedLimit) ? requestedLimit : 25

    const events = await listPendingAgentCoordinationEvents({
      targetRole,
      workstreamId,
      limit,
    })

    return NextResponse.json({ ok: true, events })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to list coordination events'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
