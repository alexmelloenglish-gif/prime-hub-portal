import { NextResponse } from 'next/server'
import { isAgentBusAuthorized } from '@/lib/agent-coordination/auth'
import { acknowledgeAgentCoordinationEvent } from '@/lib/agent-coordination/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAgentBusAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const body = await request.json() as Record<string, unknown>
    const acknowledgedBy =
      typeof body.acknowledgedBy === 'string' ? body.acknowledgedBy : ''

    const result = await acknowledgeAgentCoordinationEvent({
      eventId: id,
      acknowledgedBy,
      ackStatus: body.ackStatus,
    })

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      event: result.event,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to acknowledge coordination event'
    const status = message.includes('not found') ? 404 : message.includes('already') || message.includes('raced') ? 409 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
