import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { verifyCanonicalStudentProjection } from '@/lib/student-projection-publisher'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ ok: false, errorCode: 'UNAUTHENTICATED' }, { status: 401 })
  }

  if (!isAdminUser(session.user)) {
    return NextResponse.json({ ok: false, errorCode: 'ADMIN_ACCESS_REQUIRED' }, { status: 403 })
  }

  let body: { email?: unknown } = {}
  try {
    body = (await request.json()) as { email?: unknown }
  } catch {
    // Empty body means use the explicit route requirement below.
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email) {
    return NextResponse.json({ ok: false, errorCode: 'STUDENT_EMAIL_REQUIRED' }, { status: 400 })
  }

  try {
    const result = await verifyCanonicalStudentProjection(email)
    return NextResponse.json({ ok: result.verified, ...result }, { status: result.verified ? 200 : 409 })
  } catch (error) {
    console.error('[student-projection] canonical Firestore verification failed', {
      email,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'PROJECTION_VERIFICATION_FAILED',
        errorMessage: error instanceof Error ? error.message : 'Projection verification failed',
      },
      { status: 500 },
    )
  }
}
