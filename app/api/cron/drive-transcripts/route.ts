import { NextResponse } from 'next/server'
import { reconcileDriveTranscripts } from '@/lib/drive-reconciliation'
import { PIPELINE_AUTOMATION_FROZEN, pipelineFreezePayload } from '@/lib/pipeline-freeze'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

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

  try {
    const result = await reconcileDriveTranscripts()
    console.log(JSON.stringify({
      event: 'drive_cron_reconciliation_completed',
      submitted: result.submitted,
      duplicates: result.duplicates,
      quarantined: result.quarantined,
      scanned: result.scanned,
    }))
    return NextResponse.json({ ok: true, trigger: 'scheduled_reconciliation', reconciliation: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'drive_cron_reconciliation_failed'
    console.error(JSON.stringify({ event: 'drive_cron_reconciliation_failed', error: message }))
    return NextResponse.json({ error: 'Drive reconciliation failed.' }, { status: 503 })
  }
}
