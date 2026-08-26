import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { reconcileDriveTranscripts } from '@/lib/drive-reconciliation'

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

  try {
    const result = await reconcileDriveTranscripts()
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Drive processing could not be completed'
    return NextResponse.json({ ok: false, error: message.replace(/[^a-zA-Z0-9_ -]/g, '').slice(0, 120) }, { status: 500 })
  }
}
