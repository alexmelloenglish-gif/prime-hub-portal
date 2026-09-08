import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { getFirebaseConfigStatus } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ ok: false, errorCode: 'UNAUTHENTICATED' }, { status: 401 })
  }

  if (!isAdminUser(session.user)) {
    return NextResponse.json({ ok: false, errorCode: 'ADMIN_ACCESS_REQUIRED' }, { status: 403 })
  }

  const config = getFirebaseConfigStatus()

  return NextResponse.json(
    {
      ok: false,
      errorCode: 'FIRESTORE_RUNTIME_FROZEN',
      message: 'Firestore access is intentionally disabled. Production uses the canonical repository/Neon student state.',
      source: 'repository',
      config: {
        runtimeMode: config.runtimeMode,
        authMode: config.authMode,
        federatedAuthConfigured: config.federatedAuthConfigured,
      },
    },
    { status: 410 },
  )
}
