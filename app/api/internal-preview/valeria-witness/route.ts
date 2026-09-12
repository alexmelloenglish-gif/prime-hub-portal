import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOURCE_FILE_ID = '1V2cBuJvgljvE92lWOdjqltjgpX7u0-zSI5SEeSzFa4c'
const LESSON_ID = 'unscheduled-2026-09-12-valeria-in-person-demo'
const SOURCE_PARENT_ID = '1ykQNe2tNBUvGY19L85I__Aou37dmX-zp'

export async function GET() {
  if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== 'codex/meet-gemini-capture') {
    return NextResponse.json({ error: 'Preview-only witness route' }, { status: 404 })
  }

  process.env.PRIME_WIF_PROVIDER_ID = 'vercel-preview'
  process.env.GOOGLE_MEET_ROOT_FOLDER_ID = SOURCE_PARENT_ID

  try {
    const { captureMeetGeminiSourceToCandidate } = await import('@/lib/intelligence/meet-gemini-capture')
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
      wifProvider: 'vercel-preview',
      sourceBoundary: 'exact_parent',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Witness capture failed'
    return NextResponse.json({ error: message, wifProvider: 'vercel-preview', sourceBoundary: 'exact_parent' }, { status: 500 })
  }
}
