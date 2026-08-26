import { NextResponse } from 'next/server'
import { reconcileDriveTranscripts } from '@/lib/drive-reconciliation'

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

  try {
    const result = await reconcileDriveTranscripts()
    console.log(JSON.stringify({ event: 'drive_reconciliation_completed', ...result }))
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const code = error instanceof Error ? error.message.replace(/[^a-zA-Z0-9_ -]/g, '').slice(0, 80) : 'unknown_error'
    console.error(JSON.stringify({ event: 'drive_reconciliation_failed', code: code || 'unknown_error' }))
    return NextResponse.json({ error: 'drive_reconciliation_failed', code: code || 'unknown_error' }, { status: 500 })
  }
}
