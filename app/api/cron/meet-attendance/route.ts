import { NextResponse } from 'next/server'
import { reconcileExistingMeetAttendance } from '@/lib/meet-attendance-collector'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const authorization = request.headers.get('authorization')
  return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`)
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await reconcileExistingMeetAttendance()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error'
    console.error(JSON.stringify({ event: 'meet_attendance_cron_failed', error: message }))
    return NextResponse.json({ ok: false, error: message }, { status: 503 })
  }
}
