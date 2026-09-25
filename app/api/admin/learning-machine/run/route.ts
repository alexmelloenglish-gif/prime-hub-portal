import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { executeSharedLearningMachine } from '@/lib/learning-machine/shared-runner'
import { PIPELINE_AUTOMATION_FROZEN, pipelineFreezePayload } from '@/lib/pipeline-freeze'
import { parseTranscriptPayload } from '@/lib/pipeline/run'
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
    console.warn(JSON.stringify({
      event: 'manual_learning_machine_blocked',
      code: 'PIPELINE_AUTOMATION_FROZEN',
    }))
    return NextResponse.json(
      pipelineFreezePayload('admin-learning-machine-run'),
      { status: 503 },
    )
  }

  try {
    const body = await request.json()
    const transcript = parseTranscriptPayload(body)
    const result = await executeSharedLearningMachine({
      triggerOrigin: 'manual',
      requestedBy: session.user.email || session.user.id || 'admin',
      transcript,
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to execute PRIME Learning Machine'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
