export const dynamic = 'force-static'
export const revalidate = false

const SOURCE_FILE_ID = '1V2cBuJvgljvE92lWOdjqltjgpX7u0-zSI5SEeSzFa4c'

export default async function ValeriaBuildWitnessPage() {
  if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== 'codex/meet-gemini-capture') {
    return <main>Witness disabled.</main>
  }

  process.env.PRIME_WIF_PROVIDER_ID = 'vercel-preview'

  try {
    const { captureMeetGeminiSourceToCandidate } = await import('@/lib/intelligence/meet-gemini-capture')
    const result = await captureMeetGeminiSourceToCandidate({
      sourceFileId: SOURCE_FILE_ID,
      lessonId: 'unscheduled-2026-09-12-valeria-in-person-demo',
      classDate: '2026-09-12',
      sourceKind: 'meet_transcript',
      deliveryMode: 'in_person',
      lessonOrigin: 'unscheduled',
      speakerDiarizationStatus: 'unreliable',
      teacherAttestedStudent: false,
      previewExactSourceFileIdAllowlist: SOURCE_FILE_ID,
    })

    console.info('VALERIA_BUILD_WITNESS_RESULT', JSON.stringify({
      candidateRecordId: result.candidateRecordId,
      candidateKey: result.candidateKey,
      studentEmail: result.studentEmail,
      lessonId: result.lessonId,
      lessonIdentityStatus: result.lessonIdentityStatus,
      sourceHash: result.sourceHash,
      status: result.status,
      duplicate: result.duplicate,
      authorityStatus: 'candidate',
      requiresReview: true,
      automaticPublicationAllowed: false,
    }))

    return <main>Valeria witness: REVIEW_REQUIRED</main>
  } catch (error) {
    console.error('VALERIA_BUILD_WITNESS_ERROR', error instanceof Error ? error.message : 'Witness failed')
    return <main>Valeria witness diagnostic recorded.</main>
  }
}
