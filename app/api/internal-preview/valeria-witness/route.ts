import { NextResponse } from 'next/server'
import { captureMeetGeminiSourceToCandidate } from '@/lib/intelligence/meet-gemini-capture'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Preview witness runner; this touch intentionally redeploys after Preview auth env changes.
const SOURCE_FILE_ID = '1V2cBuJvgljvE92lWOdjqltjgpX7u0-zSI5SEeSzFa4c'
const LESSON_ID = 'unscheduled-2026-09-12-valeria-in-person-demo'

export async function GET() {
  if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== 'codex/meet-gemini-capture') {
    return NextResponse.json({ error: 'Preview-only witness route' }, { status: 404 })
  }

  try {
    const result = await captureMeetGeminiSourceToCandidate({
      sourceFileId: SOURCE_FILE_ID,
      lessonId: LESSON_ID,
      expectedStudentEmail: 'vcrlima89@gmail.com',
      classDate: '2026-09-12',
      sourceKind: 'meet_transcript',
      deliveryMode: 'in_person',
      lessonOrigin: 'unscheduled',
      speakerDiarizationStatus: 'unreliable',
      teacherAttestedStudent: false,
    })

    return NextResponse.json({
      witness: 'valeria-in-person-unscheduled',
      ...result,
      authorityStatus: 'candidate',
      requiresReview: true,
      automaticPublicationAllowed: false,
      teacherAttestationApplied: false,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Witness capture failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
