import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { checkMeetAttendanceProviderHealth } from '@/lib/meet-attendance-collector'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function safeErrorCode(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (/^[A-Z0-9_]+$/.test(message)) return message
  return 'MEET_HEALTHCHECK_FAILED'
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json(
      { ok: false, provider: 'google_meet', errorCode: 'UNAUTHENTICATED' },
      { status: 401 },
    )
  }

  if (!isAdminUser(session.user)) {
    return NextResponse.json(
      { ok: false, provider: 'google_meet', errorCode: 'ADMIN_ACCESS_REQUIRED' },
      { status: 403 },
    )
  }

  try {
    const result = await checkMeetAttendanceProviderHealth()
    return NextResponse.json(result)
  } catch (error) {
    const errorCode = safeErrorCode(error)
    const checkedAt = new Date().toISOString()
    console.error(JSON.stringify({
      event: 'meet_provider_healthcheck_failed',
      provider: 'google_meet',
      errorCode,
      checkedAt,
    }))
    return NextResponse.json(
      {
        ok: false,
        provider: 'google_meet',
        httpStatus: null,
        apiReachable: false,
        errorCode,
        checkedAt,
      },
      { status: 503 },
    )
  }
}
