import { captureMeetGeminiSourceToCandidate } from '@/lib/intelligence/meet-gemini-capture'

export const dynamic = 'force-static'
export const revalidate = false

const SOURCE_FILE_ID = '1V2cBuJvgljvE92lWOdjqltjgpX7u0-zSI5SEeSzFa4c'
const LESSON_ID = 'unscheduled-2026-09-12-valeria-in-person-demo'
const EXPECTED_BRANCH = 'codex/meet-gemini-capture'

export default async function ValeriaBuildWitnessPage() {
  const isExpectedPreview =
    process.env.VERCEL_ENV === 'preview' &&
    process.env.VERCEL_GIT_COMMIT_REF === EXPECTED_BRANCH

  if (!isExpectedPreview) {
    return <main>Preview witness disabled.</main>
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

    const state = {
      witness: 'valeria-in-person-unscheduled',
      candidateRecordId: result.candidateRecordId,
      candidateKey: result.candidateKey,
      lessonId: result.lessonId,
      lessonIdentityStatus: result.lessonIdentityStatus,
      status: result.status,
      duplicate: result.duplicate,
      authorityStatus: 'candidate',
      requiresReview: true,
      automaticPublicationAllowed: false,
      teacherAttestationApplied: false,
    }

    console.info('VALERIA_BUILD_WITNESS_RESULT', JSON.stringify(state))

    return (
      <main>
        <h1>Valeria witness</h1>
        <p>Status: {state.status}</p>
        <p>Authority: candidate</p>
        <p>Requires review: true</p>
      </main>
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Witness capture failed'
    console.error('VALERIA_BUILD_WITNESS_ERROR', message)
    throw error
  }
}
