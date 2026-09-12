import { createHash } from 'node:crypto'
import { ExternalAccountClient } from 'google-auth-library'
import { getVercelOidcToken } from '@vercel/oidc'
import studentRegistry from '@/data/students/student-core-registry.json'
import { createIntelligenceCandidate } from '@/lib/intelligence/authority-service'

export const dynamic = 'force-static'
export const revalidate = false

const SOURCE_FILE_ID = '1V2cBuJvgljvE92lWOdjqltjgpX7u0-zSI5SEeSzFa4c'
const LESSON_ID = 'unscheduled-2026-09-12-valeria-in-person-demo'
const STUDENT_EMAIL = 'vcrlima89@gmail.com'
const PROJECT_NUMBER = '567332591101'
const POOL_ID = 'vercel-prod'
const PROVIDER_ID = 'vercel-preview'
const SERVICE_ACCOUNT = 'prime-dashboard-reader@prime-hub-portal.iam.gserviceaccount.com'
const PROMPT_VERSION = 'chatgpt-preview-witness.v1'
const PROCESSOR_VERSION = 'preview-exact-file-ingest.v1'

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function getAuth() {
  const provider = `projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}`
  const auth = ExternalAccountClient.fromJSON({
    type: 'external_account',
    audience: `//iam.googleapis.com/${provider}`,
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/documents.readonly',
    ],
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(SERVICE_ACCOUNT)}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: async () => getVercelOidcToken({
        audience: `https://iam.googleapis.com/${provider}`,
        team: 'prime-digital-hun-dasboard',
        project: 'prime-hub-portal',
      }),
    },
  })
  if (!auth) throw new Error('Preview WIF auth unavailable')
  return auth
}

export default async function ValeriaDirectWitnessPage() {
  if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== 'codex/meet-gemini-capture') {
    return <main>Witness disabled.</main>
  }

  try {
    const student = studentRegistry.students.find((item) => item.canonicalEmail === STUDENT_EMAIL)
    if (!student) throw new Error('Valeria registry record not found')

    const auth = getAuth()
    const headers = new Headers(await auth.getRequestHeaders())
    headers.set('Accept', 'text/plain')

    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${SOURCE_FILE_ID}?fields=id,name,mimeType,createdTime,modifiedTime,webViewLink`,
      { headers, cache: 'no-store' },
    )
    if (!metadataResponse.ok) throw new Error(`Drive metadata HTTP ${metadataResponse.status}`)
    const metadata = await metadataResponse.json() as {
      id: string
      name: string
      mimeType: string
      createdTime?: string
      modifiedTime?: string
      webViewLink?: string
    }

    const exportResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${SOURCE_FILE_ID}/export?mimeType=text%2Fplain`,
      { headers, cache: 'no-store' },
    )
    if (!exportResponse.ok) throw new Error(`Drive export HTTP ${exportResponse.status}`)
    const content = (await exportResponse.text()).trim()
    if (content.length < 800) throw new Error('Valeria transcript is too short')

    const sourceHash = sha256(content)
    const sourceRef = `google-drive:${SOURCE_FILE_ID}`
    const candidateKey = `preview-ai:${sha256(`${LESSON_ID}|${SOURCE_FILE_ID}|${sourceHash}|${PROMPT_VERSION}`).slice(0, 40)}`

    const artifact = {
      schemaVersion: 'intelligence-candidate.v1',
      authorityStatus: 'candidate',
      requiresReview: true,
      lessonId: LESSON_ID,
      studentId: student.studentId,
      evidenceCandidates: [
        {
          id: 'e1',
          sourceSpan: 'Valeria and you decided to come back to lessons after a long time.',
          observation: 'The source explicitly references Valeria, but this does not by itself prove who produced each later utterance.',
          type: 'identity_context',
          confidence: 0.95,
        },
        {
          id: 'e2',
          sourceSpan: "I'm here to simulate a conversation, but I don't have a personal age or background.",
          observation: 'The transcript contains a turn incompatible with ordinary student self-report, indicating mixed or unreliable speaker attribution.',
          type: 'speaker_attribution_conflict',
          confidence: 0.99,
        },
        {
          id: 'e3',
          sourceSpan: 'Alex, I think focusing on building confidence and skills is more helpful.',
          observation: 'Some turns address Alex directly while the transcript does not preserve dependable speaker labels.',
          type: 'speaker_attribution_conflict',
          confidence: 0.98,
        },
      ],
      learningSignalCandidates: [
        {
          id: 's1',
          signal: 'Speaker attribution is unreliable in this single-microphone in-person capture.',
          rationale: 'The transcript merges turns and contains conflicting identity cues, so student-specific language evidence cannot be defended automatically.',
          evidenceCandidateIds: ['e1', 'e2', 'e3'],
          confidence: 0.99,
        },
      ],
      assessmentCandidates: [],
      teacherInsightCandidate: {
        text: 'Use this artifact as a capture/diarization stress test. Do not infer Valeria’s proficiency from utterances whose speaker cannot be defended; teacher review is required.',
        evidenceCandidateIds: ['e1', 'e2', 'e3'],
      },
      generationProvenance: {
        provider: 'chatgpt_assisted_preview_witness',
        model: 'external-review-assistant',
        requestId: `preview-${sourceHash.slice(0, 12)}`,
        promptVersion: PROMPT_VERSION,
        processorVersion: PROCESSOR_VERSION,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        responseStatus: 200,
        geminiStatus: 'blocked_missing_preview_credential',
      },
    }

    const record = await createIntelligenceCandidate({
      candidateKey,
      lessonId: LESSON_ID,
      studentEmail: student.canonicalEmail,
      sourceType: 'meet_transcript',
      sourceRef,
      sourceHash,
      sourceOccurredAt: metadata.modifiedTime ? new Date(metadata.modifiedTime) : null,
      candidateType: 'lesson_intelligence_bundle_preview_ai_assisted',
      payload: artifact,
      provenance: {
        sourceDocumentId: metadata.id,
        sourceName: metadata.name,
        sourceMimeType: metadata.mimeType,
        sourceUrl: metadata.webViewLink || null,
        sourceCreatedTime: metadata.createdTime || null,
        sourceModifiedTime: metadata.modifiedTime || null,
        sourceHash,
        sourceKind: 'meet_transcript',
        captureMode: 'preview_exact_file_read_only',
        studentIdentityResolution: 'preview_operator_asserted_registry_identity',
        lessonIdentity: {
          lessonId: LESSON_ID,
          source: 'operator_supplied',
          proven: false,
          origin: 'unscheduled',
        },
        deliveryMode: 'in_person',
        speakerDiarizationStatus: 'unreliable',
        evidenceAttributionRequiresConfidence: true,
        teacherReviewRequired: true,
        automaticPublicationAllowed: false,
        geminiGenerationStatus: 'blocked_missing_preview_credential',
      },
      promptVersion: PROMPT_VERSION,
      processorVersion: PROCESSOR_VERSION,
    })

    console.info('VALERIA_DIRECT_WITNESS_RESULT', JSON.stringify({
      candidateRecordId: record.id,
      candidateKey: record.candidateKey,
      studentEmail: record.studentEmail,
      lessonId: record.lessonId,
      sourceHash: record.sourceHash,
      authorityStatus: 'candidate',
      requiresReview: true,
      status: 'review_required',
      lessonIdentityStatus: 'operator_supplied_unproven',
      automaticPublicationAllowed: false,
      generator: 'chatgpt_assisted_preview_witness',
      geminiStatus: 'blocked_missing_preview_credential',
    }))

    return <main>Valeria direct witness: REVIEW_REQUIRED</main>
  } catch (error) {
    console.error('VALERIA_DIRECT_WITNESS_ERROR', error instanceof Error ? error.message : 'Witness failed')
    return <main>Valeria witness diagnostic recorded.</main>
  }
}
