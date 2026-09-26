import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { retryFailedPipelineRun } from '@/lib/pipeline/run'
import { isAdminUser } from '@/lib/student-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

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
    const sourceFileId = typeof body.sourceFileId === 'string' ? body.sourceFileId.trim() : ''
    const expectedPipelineRunId =
      typeof body.pipelineRunId === 'string' ? body.pipelineRunId.trim() : ''
    if (!expectedPipelineRunId) {
      return NextResponse.json(
        { error: 'pipelineRunId is required' },
        { status: 400 },
      )
    }

    const result = await retryFailedPipelineRun({
      sourceFileId: sourceFileId || undefined,
      expectedPipelineRunId,
      requestedBy: session.user.email || session.user.id || 'admin',
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pipeline retry failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
