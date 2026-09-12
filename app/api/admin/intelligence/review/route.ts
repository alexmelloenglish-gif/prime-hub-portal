import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { getIntelligenceCandidate, recordTeacherDecision } from '@/lib/intelligence/authority-service'
import { TEACHER_DECISIONS, type TeacherDecision } from '@/lib/intelligence/authority-contract'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isDecision(value: unknown): value is TeacherDecision {
  return typeof value === 'string' && TEACHER_DECISIONS.includes(value as TeacherDecision)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (!isAdminUser(session.user)) return NextResponse.json({ error: 'Teacher authority required' }, { status: 403 })

  try {
    const body = await request.json() as Record<string, unknown>
    const candidateRecordId = typeof body.candidateRecordId === 'string' ? body.candidateRecordId.trim() : ''
    const decision = body.decision
    const reason = typeof body.reason === 'string' ? body.reason.trim() : undefined
    const reviewedPayload = body.reviewedPayload

    if (!candidateRecordId || !isDecision(decision)) {
      return NextResponse.json({ error: 'candidateRecordId and a valid decision are required' }, { status: 400 })
    }
    if (decision === 'edited' && (reviewedPayload === undefined || reviewedPayload === null)) {
      return NextResponse.json({ error: 'reviewedPayload is required for edited decisions' }, { status: 400 })
    }

    const candidate = await getIntelligenceCandidate(candidateRecordId)
    if (!candidate) return NextResponse.json({ error: 'Candidate record not found' }, { status: 404 })
    if (candidate.reviewTransition) {
      return NextResponse.json({ error: 'Candidate already has a final teacher decision' }, { status: 409 })
    }

    const transition = await recordTeacherDecision({
      candidateRecordId,
      decision,
      reviewerId: session.user.email || session.user.id || 'admin',
      reason,
      ...(reviewedPayload === undefined ? {} : { reviewedPayload }),
    })

    return NextResponse.json({
      transition,
      authorityStatus: 'teacher_validated',
      canonicalization: 'not_performed',
      projection: 'not_performed',
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to record teacher decision'
    const status = message.includes('not found') ? 404 : message.includes('already has') ? 409 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
