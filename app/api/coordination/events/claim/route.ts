import { NextResponse } from 'next/server'
import { isAgentBusAuthorized } from '@/lib/agent-coordination/auth'
import { claimNextAgentCoordinationEvent } from '@/lib/agent-coordination/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isAgentBusAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as Record<string, unknown>
    const event = await claimNextAgentCoordinationEvent({
      targetRole: typeof body.targetRole === 'string' ? body.targetRole : '',
      claimedBy: typeof body.claimedBy === 'string' ? body.claimedBy : '',
      workstreamId: typeof body.workstreamId === 'string' ? body.workstreamId : null,
      leaseSeconds: typeof body.leaseSeconds === 'number' ? body.leaseSeconds : undefined,
    })

    return NextResponse.json({
      ok: true,
      claimed: Boolean(event),
      event,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to claim coordination work'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
