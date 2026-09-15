import { createHash } from 'node:crypto'
import { ExternalAccountClient } from 'google-auth-library'
import { getVercelOidcToken } from '@vercel/oidc'
import studentRegistry from '@/data/students/student-core-registry.json'
import { getPrismaClient } from '@/lib/prisma'
import { createIntelligenceCandidate } from './authority-service'
import {
  generateGeminiIntelligenceCandidate,
  INTELLIGENCE_CANDIDATE_PROCESSOR_VERSION,
  INTELLIGENCE_CANDIDATE_PROMPT_VERSION,
  type CandidateGenerationSource,
} from './gemini-candidate-generator'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const DOCS_API = 'https://docs.googleapis.com/v1'
const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document'
const GOOGLE_FOLDER_MIME = 'application/vnd.google-apps.folder'
const GOOGLE_MEET_ROOT_FOLDER_ID = process.env.GOOGLE_MEET_ROOT_FOLDER_ID?.trim() || '1LipcZbo-LNgCNOvjYzFpOzecOf4byDGL'
const PROJECT_NUMBER = process.env.GOOGLE_CLOUD_PROJECT_NUMBER?.trim() || '567332591101'
const VERCEL_TEAM_SLUG = process.env.PRIME_VERCEL_TEAM_SLUG?.trim() || 'prime-digital-hun-dasboard'
const VERCEL_PROJECT_SLUG = process.env.PRIME_VERCEL_PROJECT_SLUG?.trim() || 'prime-hub-portal'
const WIF_POOL_ID = process.env.PRIME_WIF_POOL_ID?.trim() || 'vercel-prod'
const WIF_PROVIDER_ID = process.env.PRIME_WIF_PROVIDER_ID?.trim() || 'vercel'
const DRIVE_SERVICE_ACCOUNT = process.env.PRIME_DRIVE_SERVICE_ACCOUNT?.trim() || process.env.GCP_SERVICE_ACCOUNT_EMAIL?.trim() || 'prime-dashboard-reader@prime-hub-portal.iam.gserviceaccount.com'
const MAX_PARENT_DEPTH = 12

export type MeetGeminiCaptureInput = {
  sourceFileId: string
  lessonId: string
  expectedStudentEmail?: string
  sourceKind?: 'meet_transcript' | 'gemini_notes'
  classDate?: string
  deliveryMode?: 'online' | 'in_person' | 'hybrid'
  lessonOrigin?: 'scheduled' | 'unscheduled'
  speakerDiarizationStatus?: 'reliable' | 'unreliable' | 'unknown'
  teacherAttestedStudent?: boolean
  previewSourceRootFolderIdOverride?: string
  previewExactSourceFileIdAllowlist?: string
}

export type MeetGeminiCaptureResult = {
  candidateRecordId: string
  candidateKey: string
  studentEmail: string
  lessonId: string
  lessonIdentityStatus: 'operator_supplied_unproven' | 'unscheduled_teacher_attested'
  sourceRef: string
  sourceHash: string
  status: 'review_required'
  duplicate: boolean
}

type DriveFile = {
  id: string
  name: string
  mimeType: string
  modifiedTime?: string
  createdTime?: string
  webViewLink?: string
  parents?: string[]
}

type RegistryStudent = (typeof studentRegistry.students)[number]

type GoogleDocsStructuralElement = {
  textRun?: { content?: string }
  paragraph?: { elements?: GoogleDocsStructuralElement[] }
  table?: { tableRows?: Array<{ tableCells?: Array<{ content?: GoogleDocsStructuralElement[] }> }> }
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function normalizeForMatch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9@.]+/g, ' ')
    .trim()
}

function requireValue(value: string, field: string): string {
  const normalized = value.trim()
  if (!normalized) throw new Error(`${field} is required`)
  return normalized
}

function getProviderAudience(): string {
  return `https://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL_ID}/providers/${WIF_PROVIDER_ID}`
}

function getStsAudience(): string {
  return `//iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL_ID}/providers/${WIF_PROVIDER_ID}`
}

function getReadOnlyDriveAuth() {
  const auth = ExternalAccountClient.fromJSON({
    type: 'external_account',
    audience: getStsAudience(),
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/documents.readonly',
    ],
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url:
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(DRIVE_SERVICE_ACCOUNT)}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: async () => getVercelOidcToken({
        audience: getProviderAudience(),
        team: VERCEL_TEAM_SLUG,
        project: VERCEL_PROJECT_SLUG,
      }),
    },
  })
  if (!auth) throw new Error('NEW INTELLIGENCE Drive read-only client is unavailable')
  return auth
}

async function authenticatedHeaders(auth: ReturnType<typeof getReadOnlyDriveAuth>): Promise<Headers> {
  const headers = new Headers(await auth.getRequestHeaders())
  headers.set('Accept', 'application/json')
  return headers
}

async function getDriveFile(auth: ReturnType<typeof getReadOnlyDriveAuth>, fileId: string): Promise<DriveFile> {
  const params = new URLSearchParams({
    fields: 'id,name,mimeType,modifiedTime,createdTime,webViewLink,parents',
  })
  const response = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?${params.toString()}`, {
    headers: await authenticatedHeaders(auth),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`NEW INTELLIGENCE source lookup failed with HTTP ${response.status}`)
  return response.json() as Promise<DriveFile>
}

async function assertSourceWithinMeetRoot(
  auth: ReturnType<typeof getReadOnlyDriveAuth>,
  source: DriveFile,
  rootFolderId: string,
): Promise<void> {
  let frontier = [...(source.parents || [])]
  const visited = new Set<string>()

  for (let depth = 0; depth < MAX_PARENT_DEPTH && frontier.length; depth += 1) {
    if (frontier.includes(rootFolderId)) return
    const next: string[] = []
    for (const parentId of frontier) {
      if (visited.has(parentId)) continue
      visited.add(parentId)
      const parent = await getDriveFile(auth, parentId)
      if (parent.id === rootFolderId) return
      if (parent.mimeType !== GOOGLE_FOLDER_MIME) continue
      next.push(...(parent.parents || []))
    }
    frontier = next
  }

  throw new Error('Source document is outside the configured Google Meet root folder')
}

function extractDocsElements(elements: GoogleDocsStructuralElement[] | undefined): string {
  if (!elements) return ''
  return elements.map((element) => {
    if (element.textRun?.content) return element.textRun.content
    if (element.paragraph?.elements) return extractDocsElements(element.paragraph.elements)
    if (element.table?.tableRows) {
      return element.table.tableRows
        .flatMap((row) => row.tableCells || [])
        .map((cell) => extractDocsElements(cell.content))
        .join('')
    }
    return ''
  }).join('')
}

function extractGoogleDocsText(document: unknown): string {
  if (!document || typeof document !== 'object' || Array.isArray(document)) return ''
  const root = document as {
    body?: { content?: GoogleDocsStructuralElement[] }
    tabs?: Array<{ documentTab?: { body?: { content?: GoogleDocsStructuralElement[] } } }>
  }
  const tabText = (root.tabs || [])
    .map((tab) => extractDocsElements(tab.documentTab?.body?.content))
    .filter(Boolean)
  if (tabText.length) return tabText.join('\n\n')
  return extractDocsElements(root.body?.content)
}

async function readGoogleDoc(
  auth: ReturnType<typeof getReadOnlyDriveAuth>,
  fileId: string,
): Promise<string> {
  const headers = await authenticatedHeaders(auth)
  const docsResponse = await fetch(`${DOCS_API}/documents/${encodeURIComponent(fileId)}?includeTabsContent=true`, {
    headers,
    cache: 'no-store',
  })
  if (docsResponse.ok) {
    const text = extractGoogleDocsText(await docsResponse.json())
    if (text.trim()) return text
  }

  const exportResponse = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}/export?mimeType=text%2Fplain`, {
    headers,
    cache: 'no-store',
  })
  if (!exportResponse.ok) throw new Error(`NEW INTELLIGENCE source export failed with HTTP ${exportResponse.status}`)
  return exportResponse.text()
}

function allStudentEmails(student: RegistryStudent): string[] {
  return [student.canonicalEmail, ...(student.emailAliases || [])].map(normalizeEmail)
}

function studentMatchesSource(student: RegistryStudent, fileName: string, content: string): boolean {
  const normalizedName = normalizeForMatch(fileName)
  const normalizedContent = normalizeForMatch(content)
  const canonicalName = normalizeForMatch(student.studentName)
  const nameTokens = canonicalName.split(' ').filter((token) => token.length >= 4)
  const strongNameMatch = nameTokens.length >= 2 && nameTokens.filter((token) => normalizedName.includes(token)).length >= Math.ceil(nameTokens.length * 0.75)
  const bodyNameMatch = canonicalName.length >= 4 && normalizedContent.includes(canonicalName)
  const emailMatch = allStudentEmails(student).some((email) => {
    const normalizedEmail = normalizeForMatch(email)
    const localPart = normalizeForMatch(email.split('@')[0] || '')
    return normalizedContent.includes(normalizedEmail) || (localPart.length >= 4 && normalizedContent.includes(localPart))
  })
  const firstName = normalizeForMatch(student.studentName.split(/\s+/)[0] || '')
  const speakerMatch = firstName.length >= 3 && content.split(/\r?\n/).some((line) => {
    const separator = line.indexOf(':')
    if (separator <= 0 || separator > 80) return false
    return normalizeForMatch(line.slice(0, separator)) === firstName
  })
  return bodyNameMatch || emailMatch || (strongNameMatch && speakerMatch)
}

function resolveStudent(file: DriveFile, content: string, expectedStudentEmail?: string): RegistryStudent {
  const expected = expectedStudentEmail ? normalizeEmail(expectedStudentEmail) : null
  const candidates = studentRegistry.students.filter((student) => studentMatchesSource(student, file.name, content))

  if (expected) {
    const expectedStudent = studentRegistry.students.find((student) => allStudentEmails(student).includes(expected))
    if (!expectedStudent) throw new Error('Expected student is not present in the canonical student registry')
    if (!candidates.some((student) => student.studentId === expectedStudent.studentId)) {
      throw new Error('Source evidence does not confirm the expected student identity')
    }
    return expectedStudent
  }

  if (candidates.length !== 1) {
    throw new Error(`Source identity is not uniquely resolved (${candidates.length} registry matches)`)
  }
  return candidates[0]
}

function minimumSourceLength(sourceKind: 'meet_transcript' | 'gemini_notes'): number {
  return sourceKind === 'meet_transcript' ? 800 : 300
}

export async function captureMeetGeminiSourceToCandidate(
  input: MeetGeminiCaptureInput,
): Promise<MeetGeminiCaptureResult> {
  const sourceFileId = requireValue(input.sourceFileId, 'sourceFileId')
  const lessonId = requireValue(input.lessonId, 'lessonId')
  const sourceKind = input.sourceKind || 'meet_transcript'
  const isPreview = process.env.VERCEL_ENV === 'preview'
  const previewRootOverride = isPreview ? input.previewSourceRootFolderIdOverride?.trim() : undefined
  const previewExactSource = isPreview ? input.previewExactSourceFileIdAllowlist?.trim() : undefined
  const sourceRootFolderId = previewRootOverride || GOOGLE_MEET_ROOT_FOLDER_ID

  const auth = getReadOnlyDriveAuth()
  const file = await getDriveFile(auth, sourceFileId)
  if (file.mimeType !== GOOGLE_DOC_MIME) throw new Error('NEW INTELLIGENCE capture accepts Google Docs sources only')
  const exactPreviewSourceAllowed = Boolean(previewExactSource && previewExactSource === sourceFileId)
  if (!exactPreviewSourceAllowed) await assertSourceWithinMeetRoot(auth, file, sourceRootFolderId)

  const content = (await readGoogleDoc(auth, sourceFileId)).trim()
  if (content.length < minimumSourceLength(sourceKind)) {
    throw new Error(`Source document is too short for ${sourceKind} candidate generation`)
  }

  const student = resolveStudent(file, content, input.expectedStudentEmail)
  const sourceHash = sha256(content)
  const sourceRef = `google-drive:${file.id}`
  const candidateKey = `meet-gemini:${sha256(`${lessonId}|${file.id}|${sourceHash}|${INTELLIGENCE_CANDIDATE_PROMPT_VERSION}`).slice(0, 40)}`
  const prisma = getPrismaClient()
  const existing = await prisma.intelligenceCandidateRecord.findUnique({ where: { candidateKey } })
  if (existing) {
    return {
      candidateRecordId: existing.id,
      candidateKey: existing.candidateKey,
      studentEmail: existing.studentEmail,
      lessonId: existing.lessonId,
      lessonIdentityStatus: input.lessonOrigin === 'unscheduled' && input.teacherAttestedStudent === true
        ? 'unscheduled_teacher_attested'
        : 'operator_supplied_unproven',
      sourceRef: existing.sourceRef,
      sourceHash: existing.sourceHash,
      status: 'review_required',
      duplicate: true,
    }
  }

  const generationSource: CandidateGenerationSource = {
    lessonId,
    studentId: student.studentId,
    studentEmail: student.canonicalEmail,
    studentName: student.studentName,
    teacherId: studentRegistry.teacher.teacherId,
    teacherName: studentRegistry.teacher.teacherName,
    classDate: input.classDate?.trim() || undefined,
    sourceKind,
    sourceRef,
    sourceHash,
    sourceName: file.name,
    sourceModifiedTime: file.modifiedTime,
    content,
    deliveryMode: input.deliveryMode || 'online',
    lessonOrigin: input.lessonOrigin || 'scheduled',
    speakerDiarizationStatus: input.speakerDiarizationStatus || 'unknown',
  }
  const artifact = await generateGeminiIntelligenceCandidate(generationSource)

  const record = await createIntelligenceCandidate({
    candidateKey,
    lessonId,
    studentEmail: student.canonicalEmail,
    sourceType: sourceKind,
    sourceRef,
    sourceHash,
    sourceOccurredAt: file.modifiedTime ? new Date(file.modifiedTime) : null,
    candidateType: 'lesson_intelligence_bundle',
    payload: artifact,
    provenance: {
      sourceDocumentId: file.id,
      sourceName: file.name,
      sourceMimeType: file.mimeType,
      sourceUrl: file.webViewLink || null,
      sourceCreatedTime: file.createdTime || null,
      sourceModifiedTime: file.modifiedTime || null,
      sourceHash,
      sourceKind,
      captureMode: 'read_only_google_drive',
      sourceRootFolderId: exactPreviewSourceAllowed ? null : sourceRootFolderId,
      sourceBoundaryMode: exactPreviewSourceAllowed
        ? 'preview_exact_file_allowlist'
        : previewRootOverride
          ? 'preview_exact_root_override'
          : 'configured_root',
      studentIdentityResolution: input.expectedStudentEmail ? 'registry_match_plus_expected_student' : 'unique_registry_match',
      lessonIdentity: input.lessonOrigin === 'unscheduled' && input.teacherAttestedStudent === true
        ? {
            lessonId,
            source: 'authenticated_teacher_attestation',
            proven: true,
            origin: 'unscheduled',
          }
        : {
            lessonId,
            source: 'operator_supplied',
            proven: false,
            origin: input.lessonOrigin || 'scheduled',
          },
      deliveryMode: input.deliveryMode || 'online',
      speakerDiarizationStatus: input.speakerDiarizationStatus || 'unknown',
      evidenceAttributionRequiresConfidence: true,
      teacherReviewRequired: true,
      automaticPublicationAllowed: false,
    },
    promptVersion: INTELLIGENCE_CANDIDATE_PROMPT_VERSION,
    processorVersion: INTELLIGENCE_CANDIDATE_PROCESSOR_VERSION,
  })

  return {
    candidateRecordId: record.id,
    candidateKey: record.candidateKey,
    studentEmail: record.studentEmail,
    lessonId: record.lessonId,
    lessonIdentityStatus: input.lessonOrigin === 'unscheduled' && input.teacherAttestedStudent === true
      ? 'unscheduled_teacher_attested'
      : 'operator_supplied_unproven',
    sourceRef: record.sourceRef,
    sourceHash: record.sourceHash,
    status: 'review_required',
    duplicate: false,
  }
}