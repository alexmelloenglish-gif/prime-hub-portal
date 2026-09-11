import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { PIPELINE_AUTOMATION_FROZEN, pipelineFreezePayload } from '@/lib/pipeline-freeze'
import { isAdminUser } from '@/lib/student-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (!isAdminUser(session.user)) {
    return NextResponse.json({ error: 'Administrator access required' }, { status: 403 })
  }

  if (PIPELINE_AUTOMATION_FROZEN) {
    console.warn(JSON.stringify({ event: 'manual_drive_processing_blocked', code: 'PIPELINE_AUTOMATION_FROZEN' }))
    return NextResponse.json(pipelineFreezePayload('admin-process-drive'), { status: 503 })
  }

  return NextResponse.json({ error: 'Drive processing is unavailable.' }, { status: 503 })
}
