import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { PIPELINE_AUTOMATION_FROZEN, pipelineFreezePayload } from '@/lib/pipeline-freeze'
import { isAdminUser } from '@/lib/student-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST() {
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

  return NextResponse.json({ error: 'Pipeline retry is unavailable.' }, { status: 503 })
}
