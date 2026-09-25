import { NextResponse } from 'next/server'
import { isAgentBusAuthorized } from '@/lib/agent-coordination/auth'
import { dispatchNextAgentCoordinationEvent } from '@/lib/agent-coordination/dispatcher'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  if (!isAgentBusAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as Record<string, unknown>
    const result = await dispatchNextAgentCoordinationEvent({
      targetRole: typeof body.targetRole === 'string' ? body.targetRole : '',
      dispatcherId: typeof body.dispatcherId === 'string' ? body.dispatcherId : '',
      workstreamId: typeof body.workstreamId === 'string' ? body.workstreamId : null,
      leaseSeconds: typeof body.leaseSeconds === 'number' ? body.leaseSeconds : undefined,
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to dispatch coordination work'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
