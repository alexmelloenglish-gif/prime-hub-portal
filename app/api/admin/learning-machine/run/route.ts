import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { executeSharedLearningMachine } from '@/lib/learning-machine/shared-runner'
import { prepareDriveTranscriptPayload } from '@/lib/drive-reconciliation'
import { parseTranscriptPayload } from '@/lib/pipeline/run'
import { isAdminUser } from '@/lib/student-data'
import { rejectCrossOriginMutation } from '@/lib/request-security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(request: Request) {
  const originError = rejectCrossOriginMutation(request)
  if (originError) return originError

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
    const transcript = sourceFileId
      ? await prepareDriveTranscriptPayload(sourceFileId, { ingestionMode: 'manual-drive-source-v1' })
      : parseTranscriptPayload(body)
    const result = await executeSharedLearningMachine({
      triggerOrigin: 'manual',
      requestedBy: session.user.email || session.user.id || 'admin',
      transcript,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error(JSON.stringify({ event: 'admin_learning_machine_failed', errorName: error instanceof Error ? error.name : 'UnknownError' }))
    return NextResponse.json({ error: 'learning_machine_execution_failed' }, { status: 400 })
  }
}
