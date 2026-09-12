import { createHash } from 'node:crypto'
import { ExternalAccountClient } from 'google-auth-library'
import { getVercelOidcToken } from '@vercel/oidc'
import studentRegistry from '@/data/students/student-core-registry.json'
import { createIntelligenceCandidate } from '@/lib/intelligence/authority-service'
import {
  generateGeminiIntelligenceCandidate,
  INTELLIGENCE_CANDIDATE_PROCESSOR_VERSION,
  INTELLIGENCE_CANDIDATE_PROMPT_VERSION,
} from '@/lib/intelligence/gemini-candidate-generator'

export const dynamic = 'force-static'
export const revalidate = false

const SOURCE_FILE_ID = '1V2cBuJvgljvE92lWOdjqltjgpX7u0-zSI5SEeSzFa4c'
const LESSON_ID = 'unscheduled-2026-09-12-valeria-in-person-demo'
const STUDENT_EMAIL = 'vcrlima89@gmail.com'
const PROJECT_NUMBER = '567332591101'
const POOL_ID = 'vercel-prod'
const PROVIDER_ID = 'vercel-preview'
const SERVICE_ACCOUNT = 'prime-dashboard-reader@prime-hub-portal.iam.gserviceaccount.com'

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
    const candidateKey = `meet-gemini:${sha256(`${LESSON_ID}|${SOURCE_FILE_ID}|${sourceHash}|${INTELLIGENCE_CANDIDATE_PROMPT_VERSION}`).slice(0, 40)}`

    const artifact = await generateGeminiIntelligenceCandidate({
      lessonId: LESSON_ID,
      studentId: student.studentId,
      studentEmail: student.canonicalEmail,
      studentName: student.studentName,
      teacherId: studentRegistry.teacher.teacherId,
      teacherName: studentRegistry.teacher.teacherName,
      classDate: '2026-09-12',
      sourceKind: 'meet_transcript',
      sourceRef,
      sourceHash,
      sourceName: metadata.name,
      sourceModifiedTime: metadata.modifiedTime,
      content,
      deliveryMode: 'in_person',
      lessonOrigin: 'unscheduled',
      speakerDiarizationStatus: 'unreliable',
    })

    const record = await createIntelligenceCandidate({
      candidateKey,
      lessonId: LESSON_ID,
      studentEmail: student.canonicalEmail,
      sourceType: 'meet_transcript',
      sourceRef,
      sourceHash,
      sourceOccurredAt: metadata.modifiedTime ? new Date(metadata.modifiedTime) : null,
      candidateType: 'lesson_intelligence_bundle',
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
      },
      promptVersion: INTELLIGENCE_CANDIDATE_PROMPT_VERSION,
      processorVersion: INTELLIGENCE_CANDIDATE_PROCESSOR_VERSION,
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
    }))

    return <main>Valeria direct witness: REVIEW_REQUIRED</main>
  } catch (error) {
    console.error('VALERIA_DIRECT_WITNESS_ERROR', error instanceof Error ? error.message : 'Witness failed')
    return <main>Valeria witness diagnostic recorded.</main>
  }
}
