import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { captureMeetGeminiSourceToCandidate } from '@/lib/intelligence/meet-gemini-capture'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (!isAdminUser(session.user)) {
    return NextResponse.json({ error: 'Administrator access required' }, { status: 403 })
  }

  try {
    const body = await request.json() as Record<string, unknown>
    const sourceFileId = typeof body.sourceFileId === 'string' ? body.sourceFileId.trim() : ''
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : ''
    const expectedStudentEmail = typeof body.expectedStudentEmail === 'string'
      ? body.expectedStudentEmail.trim()
      : undefined
    const classDate = typeof body.classDate === 'string' ? body.classDate.trim() : undefined
    const sourceKind = body.sourceKind === 'gemini_notes' ? 'gemini_notes' : 'meet_transcript'
    const deliveryMode = body.deliveryMode === 'in_person' || body.deliveryMode === 'hybrid' ? body.deliveryMode : 'online'
    const lessonOrigin = body.lessonOrigin === 'unscheduled' ? 'unscheduled' : 'scheduled'
    const speakerDiarizationStatus = body.speakerDiarizationStatus === 'reliable' || body.speakerDiarizationStatus === 'unreliable'
      ? body.speakerDiarizationStatus
      : 'unknown'
    const teacherAttestedStudent = body.teacherAttestedStudent === true

    if (!sourceFileId || !lessonId) {
      return NextResponse.json({ error: 'sourceFileId and lessonId are required' }, { status: 400 })
    }

    const result = await captureMeetGeminiSourceToCandidate({
      sourceFileId,
      lessonId,
      expectedStudentEmail,
      classDate,
      sourceKind,
      deliveryMode,
      lessonOrigin,
      speakerDiarizationStatus,
      teacherAttestedStudent,
    })

    return NextResponse.json({
      ...result,
      authorityStatus: 'candidate',
      requiresReview: true,
      automaticPublicationAllowed: false,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to capture source into NEW INTELLIGENCE'
    const badRequestPatterns = [
      'required',
      'outside the configured',
      'Google Docs sources only',
      'too short',
      'identity',
      'registry',
    ]
    const status = badRequestPatterns.some((pattern) => message.toLowerCase().includes(pattern.toLowerCase())) ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
