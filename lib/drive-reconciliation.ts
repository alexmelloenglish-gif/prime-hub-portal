import { createHash } from 'node:crypto'
import { ExternalAccountClient } from 'google-auth-library'
import { getVercelOidcToken } from '@vercel/oidc'
import studentRegistry from '@/data/students/student-core-registry.json'
import { getPrismaClient } from '@/lib/prisma'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const DOCS_API = 'https://docs.googleapis.com/v1'
const GOOGLE_MEET_ROOT_FOLDER_ID = process.env.GOOGLE_MEET_ROOT_FOLDER_ID?.trim() || '1LipcZbo-LNgCNOvjYzFpOzecOf4byDGL'
const PROCESSED_FOLDER_ID = process.env.GOOGLE_DRIVE_PROCESSED_FOLDER_ID?.trim() || '1omPN8i31cwFeBLzEyQ5yOKnbmhMnhnO7'
const INGEST_URL = process.env.PRIME_PIPELINE_INGEST_URL?.trim() || 'https://www.primedigitalhub.com.br/api/pipeline/ingest'
const PROJECT_NUMBER = '567332591101'
const VERCEL_TEAM_SLUG = 'prime-digital-hun-dasboard'
const VERCEL_PROJECT_SLUG = 'prime-hub-portal'
const WIF_POOL_ID = 'vercel-prod'
const WIF_PROVIDER_ID = 'vercel'
const DRIVE_SERVICE_ACCOUNT = 'prime-drive-pipeline-worker@prime-hub-portal.iam.gserviceaccount.com'
const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document'
const GOOGLE_FOLDER_MIME = 'application/vnd.google-apps.folder'
const EXCLUDED_FOLDER_NAMES = new Set(['processados', 'legacy meet recordings'])
const MAX_SOURCE_READS_PER_RUN = 10

const INSUFFICIENT_PATTERNS = [
  /insufficient conversation/i,
  /not enough conversation/i,
  /no conversation/i,
  /no transcript/i,
  /could not generate (?:a )?transcript/i,
  /couldn't generate (?:a )?transcript/i,
  /transcription unavailable/i,
]

type DriveFile = {
  id: string
  name: string
  mimeType: string
  modifiedTime?: string
  md5Checksum?: string
  webViewLink?: string
  parents?: string[]
  createdTime?: string
}

type DriveListResponse = {
  files?: DriveFile[]
  nextPageToken?: string
}

type RegistryStudent = (typeof studentRegistry.students)[number]

type TriageResult = {
  status: 'usable_transcript' | 'ambiguous_identity' | 'insufficient_transcript'
  student?: RegistryStudent
  identityMatches: string[]
  reason: string
}

type ReconciliationResult = {
  folderId: string
  scanned: number
  alreadyIngested: number
  sourceReads: number
  submitted: number
  duplicates: number
  quarantined: number
}

function normalizeForMatch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function safeFileRef(fileId: string): string {
  return sha256(fileId).slice(0, 12)
}

function extractDate(value: string): string | undefined {
  const match = value.match(/(20\d{2})[-_/](\d{2})[-_/](\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined
}

function studentNameTokens(student: RegistryStudent): string[] {
  return [...new Set(
    `${student.studentName} ${student.canonicalEmail} ${student.emailAliases.join(' ')}`
      .split(/[^a-zA-ZÀ-ÿ0-9@.]+/)
      .map(normalizeForMatch)
      .filter((token) => token.length >= 4)
  )]
}

function hasBodyIdentityMatch(student: RegistryStudent, transcript: string): boolean {
  const normalizedBody = normalizeForMatch(transcript)
  const canonicalName = normalizeForMatch(student.studentName)
  const canonicalEmail = normalizeForMatch(student.canonicalEmail)
  const emailLocalPart = normalizeForMatch(student.canonicalEmail.split('@')[0] || '')
  return normalizedBody.includes(canonicalName) || normalizedBody.includes(canonicalEmail) || normalizedBody.includes(emailLocalPart)
}

function hasStrongFileNameMatch(student: RegistryStudent, fileName: string): boolean {
  const fileTokens = new Set(normalizeForMatch(fileName).split(' ').filter((token) => token.length >= 4))
  const canonicalTokens = normalizeForMatch(student.studentName).split(' ').filter((token) => token.length >= 4)
  const matchedTokens = canonicalTokens.filter((token) => fileTokens.has(token))
  return canonicalTokens.length >= 2 && matchedTokens.length >= Math.ceil(canonicalTokens.length * 0.75)
}

function hasSpeakerLabelMatch(student: RegistryStudent, transcript: string): boolean {
  const firstName = normalizeForMatch(student.studentName.split(/\s+/)[0] || '')
  if (!firstName) return false
  return transcript.split(/\r?\n/).some((line) => {
    const separator = line.indexOf(':')
    if (separator <= 0 || separator > 80) return false
    return normalizeForMatch(line.slice(0, separator)) === firstName
  })
}

function classifyTranscript(file: DriveFile, transcript: string): TriageResult {
  const normalizedName = normalizeForMatch(file.name)
  const nameMatches = studentRegistry.students.filter((student) =>
    studentNameTokens(student).some((token) => normalizedName.includes(token))
  )
  const strongFileMatches = nameMatches.filter((student) => hasStrongFileNameMatch(student, file.name))
  const bodyMatches = nameMatches.filter((student) =>
    hasBodyIdentityMatch(student, transcript) ||
    (strongFileMatches.length === 1 && strongFileMatches[0].studentId === student.studentId && hasSpeakerLabelMatch(student, transcript))
  )
  const trimmed = transcript.trim()

  if (!trimmed || trimmed.length < 800 || INSUFFICIENT_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return {
      status: 'insufficient_transcript',
      identityMatches: nameMatches.map((student) => student.studentId),
      reason: 'Transcript content is empty, below the minimum threshold, or explicitly unavailable.',
    }
  }

  if (bodyMatches.length !== 1) {
    return {
      status: 'ambiguous_identity',
      identityMatches: bodyMatches.map((student) => student.studentId),
      reason: 'The worker requires exactly one registry identity confirmed by both filename and transcript content.',
    }
  }

  return {
    status: 'usable_transcript',
    student: bodyMatches[0],
    identityMatches: [bodyMatches[0].studentId],
    reason: 'Filename and transcript content identify one canonical student; downstream review remains mandatory.',
  }
}

function getProviderAudience(): string {
  return `https://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL_ID}/providers/${WIF_PROVIDER_ID}`
}

function getStsAudience(): string {
  return `//iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL_ID}/providers/${WIF_PROVIDER_ID}`
}

function getDriveAuth() {
  const providerAudience = getProviderAudience()
  const stsAudience = getStsAudience()
  const auth = ExternalAccountClient.fromJSON({
    type: 'external_account',
    audience: stsAudience,
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/documents.readonly',
    ],
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url:
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/` +
      `${encodeURIComponent(DRIVE_SERVICE_ACCOUNT)}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: async () => getVercelOidcToken({
        audience: providerAudience,
        team: VERCEL_TEAM_SLUG,
        project: VERCEL_PROJECT_SLUG,
      }),
    },
  })

  if (!auth) throw new Error('drive_wif_client_unavailable')
  return auth
}

async function driveRequest<T>(auth: ReturnType<typeof getDriveAuth>, url: string): Promise<T> {
  const authHeaders = await auth.getRequestHeaders()
  const headers = new Headers(authHeaders)
  headers.set('Accept', 'application/json')
  const response = await fetch(url, { headers, cache: 'no-store' })
  if (!response.ok) throw new Error(`drive_http_${response.status}`)
  return response.json() as Promise<T>
}

async function listDriveChildren(auth: ReturnType<typeof getDriveAuth>, folderId: string): Promise<DriveFile[]> {
  const files: DriveFile[] = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false and (mimeType = '${GOOGLE_DOC_MIME}' or mimeType = '${GOOGLE_FOLDER_MIME}')`,
      pageSize: '100',
      orderBy: 'modifiedTime desc',
      fields: 'files(id,name,mimeType,modifiedTime,md5Checksum,webViewLink,createdTime,parents),nextPageToken',
    })
    if (pageToken) params.set('pageToken', pageToken)
    const result = await driveRequest<DriveListResponse>(auth, `${DRIVE_API}/files?${params.toString()}`)
    files.push(...(result.files || []))
    pageToken = result.nextPageToken
  } while (pageToken)

  return files
}

async function listDriveTranscriptsRecursively(auth: ReturnType<typeof getDriveAuth>, rootFolderId: string): Promise<DriveFile[]> {
  const documents: DriveFile[] = []
  const visitedFolders = new Set<string>()

  async function walk(folderId: string): Promise<void> {
    if (visitedFolders.has(folderId)) return
    visitedFolders.add(folderId)

    const children = await listDriveChildren(auth, folderId)
    for (const child of children) {
      if (child.mimeType === GOOGLE_FOLDER_MIME) {
        if (EXCLUDED_FOLDER_NAMES.has(child.name.trim().toLowerCase())) continue
        await walk(child.id)
      } else if (child.mimeType === GOOGLE_DOC_MIME) {
        documents.push(child)
      }
    }
  }

  await walk(rootFolderId)
  return documents
}

type GoogleDocsStructuralElement = {
  textRun?: { content?: string }
  paragraph?: { elements?: GoogleDocsStructuralElement[] }
  table?: { tableRows?: Array<{ tableCells?: Array<{ content?: GoogleDocsStructuralElement[] }> }> }
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
  const tabBodies = (root.tabs || [])
    .map((tab) => extractDocsElements(tab.documentTab?.body?.content))
    .filter(Boolean)
  if (tabBodies.length) return tabBodies.join('\n\n')
  return extractDocsElements(root.body?.content)
}

async function moveToProcessed(auth: ReturnType<typeof getDriveAuth>, file: DriveFile): Promise<void> {
  const currentParents = (file.parents || []).filter((parentId) => parentId !== PROCESSED_FOLDER_ID)
  const params = new URLSearchParams({
    addParents: PROCESSED_FOLDER_ID,
    fields: 'id,parents',
  })
  if (currentParents.length) params.set('removeParents', currentParents.join(','))

  const authHeaders = await auth.getRequestHeaders()
  const headers = new Headers(authHeaders)
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/json')
  const response = await fetch(`${DRIVE_API}/files/${encodeURIComponent(file.id)}?${params.toString()}`, {
    method: 'PATCH',
    headers,
    body: '{}',
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`drive_move_processed_http_${response.status}`)
}

async function exportGoogleDoc(auth: ReturnType<typeof getDriveAuth>, fileId: string): Promise<string> {
  const authHeaders = await auth.getRequestHeaders()
  const headers = new Headers(authHeaders)
  const docsUrl = `${DOCS_API}/documents/${encodeURIComponent(fileId)}?includeTabsContent=true`
  const docsResponse = await fetch(docsUrl, { headers, cache: 'no-store' })
  if (docsResponse.ok) {
    const document = await docsResponse.json()
    const tabText = extractGoogleDocsText(document)
    if (tabText.trim()) return tabText
  }

  // Fallback for documents where the Docs API is unavailable or has no body.
  const exportUrl = `${DRIVE_API}/files/${encodeURIComponent(fileId)}/export?mimeType=text%2Fplain`
  const exportResponse = await fetch(exportUrl, { headers, cache: 'no-store' })
  if (!exportResponse.ok) throw new Error(`drive_export_http_${exportResponse.status}`)
  return exportResponse.text()
}

function buildPayload(file: DriveFile, transcript: string, triage: TriageResult) {
  if (!triage.student) throw new Error('identity_not_resolved')
  const student = triage.student
  const sourceHash = sha256(transcript)
  const lessonId = `lesson_${sha256(`${student.studentId}|${file.id}`).slice(0, 16)}`
  const classDate = extractDate(file.name) || file.modifiedTime?.slice(0, 10)

  return {
    lessonId,
    studentId: student.studentId,
    studentEmail: student.canonicalEmail,
    studentName: student.studentName,
    teacherId: studentRegistry.teacher.teacherId,
    teacherName: studentRegistry.teacher.teacherName,
    program: 'Prime Digital Hub',
    classDate,
    transcriptId: file.id,
    transcript,
    source: 'google_meet' as const,
    recordedAt: file.modifiedTime || file.createdTime,
    attendanceStatus: 'attended' as const,
    attendanceSource: 'google_meet',
    metadata: {
      sourceFileId: file.id,
      sourceDocumentId: file.id,
      driveFolderId: GOOGLE_MEET_ROOT_FOLDER_ID,
      sourceName: file.name,
      sourceMimeType: file.mimeType,
      sourceUrl: file.webViewLink || null,
      sourceHash,
      driveModifiedTime: file.modifiedTime || null,
      driveCreatedTime: file.createdTime || null,
      ingestionMode: 'drive-reconciliation-cron',
      triageStatus: triage.status,
      identityVerified: true,
      identityMatches: triage.identityMatches,
    },
  }
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) return error.message.replace(/[^a-zA-Z0-9_ -]/g, '').slice(0, 80) || 'unknown_error'
  return 'unknown_error'
}

export async function reconcileDriveTranscripts(): Promise<ReconciliationResult> {
  const auth = getDriveAuth()
  const files = await listDriveTranscriptsRecursively(auth, GOOGLE_MEET_ROOT_FOLDER_ID)
  const prisma = getPrismaClient()
  const result: ReconciliationResult = {
    folderId: GOOGLE_MEET_ROOT_FOLDER_ID,
    scanned: files.length,
    alreadyIngested: 0,
    sourceReads: 0,
    submitted: 0,
    duplicates: 0,
    quarantined: 0,
  }

  for (const file of files) {
    const existing = await prisma.transcript.findUnique({
      where: { sourceFileId: file.id },
      select: { pipelineRuns: { orderBy: { attemptNumber: 'desc' }, take: 1, select: { status: true } } },
    })
    const latestAttempt = existing?.pipelineRuns[0]
    if (existing && latestAttempt?.status !== 'failed') {
      result.alreadyIngested += 1
      continue
    }

    if (result.sourceReads >= MAX_SOURCE_READS_PER_RUN) break
    result.sourceReads += 1

    let transcript: string
    try {
      transcript = await exportGoogleDoc(auth, file.id)
    } catch (error) {
      result.quarantined += 1
      console.warn(JSON.stringify({ event: 'drive_source_read_failed', fileRef: safeFileRef(file.id), error: sanitizeError(error) }))
      continue
    }

    const triage = classifyTranscript(file, transcript)
    if (triage.status !== 'usable_transcript') {
      result.quarantined += 1
      console.warn(JSON.stringify({ event: 'drive_transcript_quarantined', fileRef: safeFileRef(file.id), status: triage.status, matchCount: triage.identityMatches.length }))
      continue
    }

    const payload = buildPayload(file, transcript, triage)
    const ingestSecret = process.env.PRIME_PIPELINE_INGEST_SECRET
    if (!ingestSecret) throw new Error('ingest_secret_not_configured')

    const response = await fetch(INGEST_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-prime-pipeline-secret': ingestSecret,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`ingest_http_${response.status}`)
    const body = await response.json() as { duplicate?: boolean }
    if (body.duplicate) {
      result.duplicates += 1
      console.log(JSON.stringify({ event: 'drive_ingest_duplicate', fileRef: safeFileRef(file.id), sourceHash: payload.metadata.sourceHash.slice(0, 12) }))
    } else {
      result.submitted += 1
      console.log(JSON.stringify({ event: 'drive_ingest_accepted', fileRef: safeFileRef(file.id), sourceHash: payload.metadata.sourceHash.slice(0, 12) }))
      try {
        await moveToProcessed(auth, file)
        console.log(JSON.stringify({ event: 'drive_source_archived', fileRef: safeFileRef(file.id), destinationRef: safeFileRef(PROCESSED_FOLDER_ID) }))
      } catch (error) {
        // The ingest is already accepted; surface archive failure without treating it as a new ingest failure.
        console.warn(JSON.stringify({ event: 'drive_archive_failed', fileRef: safeFileRef(file.id), error: sanitizeError(error) }))
      }
    }
    // Continue scanning the same folder so one trigger can submit every eligible file
    // up to MAX_SOURCE_READS_PER_RUN; sourceFileId idempotency prevents duplicates.
  }

  return result
}
