import { NextResponse } from 'next/server'
import { getFirebaseConfigStatus, getFirebaseFirestore } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const status = getFirebaseConfigStatus()
  const startedAt = Date.now()

  try {
    const firestore = getFirebaseFirestore()
    const collectionName = process.env.FIREBASE_STUDENT_COLLECTION || 'students'
    const snapshot = await firestore.collection(collectionName).limit(1).get()
    const durationMs = Date.now() - startedAt

    console.info('[firestore-wif-diagnostic] REAL_FIRESTORE_READ_OK', {
      runtimeMode: status.runtimeMode,
      authMode: status.authMode,
      documentObserved: !snapshot.empty,
      durationMs,
    })

    return NextResponse.json({
      ok: true,
      realFirestoreRead: true,
      runtimeMode: status.runtimeMode,
      authMode: status.authMode,
      documentObserved: !snapshot.empty,
      durationMs,
    })
  } catch (error) {
    const durationMs = Date.now() - startedAt
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('[firestore-wif-diagnostic] REAL_FIRESTORE_READ_FAILED', {
      runtimeMode: status.runtimeMode,
      authMode: status.authMode,
      errorName,
      errorMessage,
      durationMs,
    })

    return NextResponse.json(
      {
        ok: false,
        realFirestoreRead: false,
        runtimeMode: status.runtimeMode,
        authMode: status.authMode,
        errorName,
        errorMessage,
        durationMs,
      },
      { status: 500 },
    )
  }
}
