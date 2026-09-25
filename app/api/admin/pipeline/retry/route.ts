import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { PIPELINE_AUTOMATION_FROZEN, pipelineFreezePayload } from '@/lib/pipeline-freeze'
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

  if (PIPELINE_AUTOMATION_FROZEN) {
    console.warn(JSON.stringify({ event: 'pipeline_retry_blocked', code: 'PIPELINE_AUTOMATION_FROZEN' }))
    return NextResponse.json(pipelineFreezePayload('admin-pipeline-retry'), { status: 503 })
  }

  try {
    const body = await request.json() as Record<string, unknown>
    const sourceFileId = typeof body.sourceFileId === 'string' ? body.sourceFileId.trim() : ''
    const expectedPipelineRunId =
      typeof body.pipelineRunId === 'string' ? body.pipelineRunId.trim() : ''
    if (!sourceFileId || !expectedPipelineRunId) {
      return NextResponse.json(
        { error: 'sourceFileId and pipelineRunId are required' },
        { status: 400 },
      )
    }

    const result = await retryFailedPipelineRun({
      sourceFileId,
      expectedPipelineRunId,
      requestedBy: session.user.email || session.user.id || 'admin',
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pipeline retry failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
