import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { getFirebaseConfigStatus, getFirebaseFirestore } from '@/lib/firebase-admin'

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

  if (config.runtimeMode !== 'wif') {
    return NextResponse.json(
      { ok: false, errorCode: 'WIF_RUNTIME_REQUIRED', config },
      { status: 409 },
    )
  }

  try {
    const db = getFirebaseFirestore()
    const snapshot = await db.collection(process.env.FIREBASE_STUDENT_COLLECTION || 'students').limit(1).get()

    return NextResponse.json({
      ok: true,
      source: 'firestore',
      authenticatedRead: true,
      documentCount: snapshot.size,
      config: {
        runtimeMode: config.runtimeMode,
        authMode: config.authMode,
        federatedAuthConfigured: config.federatedAuthConfigured,
      },
    })
  } catch (error) {
    console.error('[firestore-auth-check] real Firestore read failed', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        ok: false,
        errorCode: 'FIRESTORE_REAL_READ_FAILED',
        errorMessage: error instanceof Error ? error.message : 'Firestore read failed',
        source: 'firestore',
        config: {
          runtimeMode: config.runtimeMode,
          authMode: config.authMode,
          federatedAuthConfigured: config.federatedAuthConfigured,
        },
      },
      { status: 500 },
    )
  }
}
