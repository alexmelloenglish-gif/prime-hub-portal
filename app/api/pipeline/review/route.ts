import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { reviewPipelineRun } from '@/lib/pipeline/run'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (!isAdminUser(session.user)) {
    return NextResponse.json({ error: 'Administrator access required' }, { status: 403 })
  }

  try {
    const body = await request.json() as Record<string, unknown>
    const pipelineRunId = typeof body.pipelineRunId === 'string' ? body.pipelineRunId.trim() : ''
    const decision = body.decision === 'approved' || body.decision === 'rejected' ? body.decision : null
    const reason = typeof body.reason === 'string' ? body.reason.trim() : undefined
    if (!pipelineRunId || !decision) {
      return NextResponse.json({ error: 'pipelineRunId and decision are required' }, { status: 400 })
    }

    const result = await reviewPipelineRun({
      pipelineRunId,
      decision,
      reason,
      reviewerId: session.user.email || session.user.id || 'admin',
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process review decision'
    const status = message.includes('not found') || message.includes('missing') ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
