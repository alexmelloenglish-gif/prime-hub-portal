import { NextResponse } from 'next/server'
import { PIPELINE_AUTOMATION_FROZEN, pipelineFreezePayload } from '@/lib/pipeline-freeze'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const authorization = request.headers.get('authorization')
  return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`)
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (PIPELINE_AUTOMATION_FROZEN) {
    console.warn(JSON.stringify({ event: 'drive_reconciliation_blocked', code: 'PIPELINE_AUTOMATION_FROZEN' }))
    return NextResponse.json(pipelineFreezePayload('vercel-cron-drive-transcripts'), { status: 503 })
  }

  return NextResponse.json({ error: 'Drive reconciliation is unavailable.' }, { status: 503 })
}
