import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const DEFAULT_STATE = '.runtime/drive-transcript-state.json'
const INSUFFICIENT_PATTERNS = [
  /insufficient conversation/i,
  /not enough conversation/i,
  /no conversation/i,
  /no transcript/i,
  /transcript (?:is )?not available/i,
  /could not generate (?:a )?transcript/i,
  /couldn't generate (?:a )?transcript/i,
  /transcription unavailable/i,
]

function arg(name) {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`)
}

function required(name, value) {
  if (!value) throw new Error(`Missing required configuration: ${name}`)
  return value
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function normalizeForMatch(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function slug(value) {
  return normalizeForMatch(value).replace(/\s+/g, '-')
}

function extractDate(value) {
  const match = value.match(/(20\d{2})[-_/](\d{2})[-_/](\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined
}

function getIdentityTokens(config) {
  const emailLocalPart = config.studentEmail.split('@')[0]
  return [...new Set(`${config.studentName} ${emailLocalPart}`
    .split(/[^a-zA-ZÀ-ÿ0-9]+/)
    .map((token) => normalizeForMatch(token))
    .filter((token) => token.length >= 4))]
}

function classifyTranscript(file, transcript, config) {
  const normalizedName = normalizeForMatch(file.name)
  const identityTokens = getIdentityTokens(config)
  const identityMatches = identityTokens.filter((token) => normalizedName.includes(token))
  const identityVerified = identityMatches.length > 0
  const trimmed = transcript.trim()

  if (!trimmed || trimmed.length < 800 || INSUFFICIENT_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return {
      status: 'insufficient_transcript',
      identityVerified,
      identityMatches,
      reason: 'The source has no usable conversation body or is below the minimum transcript-content threshold.',
    }
  }

  if (!identityVerified) {
    return {
      status: 'ambiguous_identity',
      identityVerified: false,
      identityMatches: [],
      reason: 'The configured student identity was not found in the Drive filename; the source is quarantined for human routing.',
    }
  }

  return {
    status: 'usable_transcript',
    identityVerified: true,
    identityMatches,
    reason: 'Transcript content and filename identity checks passed; submission remains non-authoritative and review-gated downstream.',
  }
}

function jsonHeaders(token) {
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' }
}

async function request(url, options = {}) {
  const response = await fetch(url, options)
  const body = await response.text()
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}: ${body.slice(0, 300)}`)
  }
  return body ? JSON.parse(body) : null
}

async function loadState(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return { files: {} }
  }
}

async function saveState(path, state) {
  const slash = path.lastIndexOf('/')
  if (slash > 0) {
    await (await import('node:fs/promises')).mkdir(path.slice(0, slash), { recursive: true })
  }
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

async function listFiles(token, folderId) {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed = false`,
    pageSize: '100',
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,mimeType,modifiedTime,md5Checksum,webViewLink,createdTime),nextPageToken',
  })
  const files = []
  let pageToken
  do {
    if (pageToken) params.set('pageToken', pageToken)
    const result = await request(`${DRIVE_API}/files?${params}`, { headers: jsonHeaders(token) })
    files.push(...(result.files || []))
    pageToken = result.nextPageToken
  } while (pageToken)
  return files
}

async function downloadTranscript(token, file) {
  if (file.mimeType === 'application/vnd.google-apps.document') {
    const response = await fetch(`${DRIVE_API}/files/${encodeURIComponent(file.id)}/export?mimeType=text%2Fplain`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`Unable to export Google Doc ${file.id}: HTTP ${response.status}`)
    return response.text()
  }

  if (file.mimeType === 'text/plain' || file.mimeType === 'text/vtt' || file.mimeType === 'application/json') {
    const response = await fetch(`${DRIVE_API}/files/${encodeURIComponent(file.id)}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`Unable to download Drive file ${file.id}: HTTP ${response.status}`)
    return response.text()
  }

  return null
}

function buildPayload(file, transcript, config, triage) {
  const sourceHash = sha256(transcript)
  const classDate = config.classDate || extractDate(file.name)
  const lessonId = `lesson_${sha256(`${config.studentId}|${file.id}`).slice(0, 16)}`
  return {
    lessonId,
    studentId: config.studentId,
    studentEmail: config.studentEmail,
    studentName: config.studentName,
    teacherId: config.teacherId,
    teacherName: config.teacherName,
    program: config.program,
    classDate,
    transcriptId: file.id,
    transcript,
    source: 'google_meet',
    effectiveAt: config.effectiveAt || undefined,
    recordedAt: file.modifiedTime || file.createdTime || undefined,
    attendanceSource: 'google_meet',
    metadata: {
      sourceFileId: file.id,
      driveFolderId: config.folderId,
      sourceDocumentId: file.id,
      sourceName: file.name,
      sourceMimeType: file.mimeType,
      sourceUrl: file.webViewLink || null,
      sourceHash,
      driveModifiedTime: file.modifiedTime || null,
      driveCreatedTime: file.createdTime || null,
      ingestionMode: 'drive-folder-scanner',
      triageStatus: triage.status,
      identityVerified: triage.identityVerified,
      identityMatches: triage.identityMatches,
    },
  }
}

async function main() {
  const token = required('GOOGLE_DRIVE_ACCESS_TOKEN', process.env.GOOGLE_DRIVE_ACCESS_TOKEN)
  const folderId = arg('folder-id') || required('GOOGLE_DRIVE_FOLDER_ID', process.env.GOOGLE_DRIVE_FOLDER_ID)
  const statePath = arg('state') || process.env.DRIVE_TRANSCRIPT_STATE_PATH || DEFAULT_STATE
  const submit = hasFlag('submit')
  const state = await loadState(statePath)
  const config = {
    folderId,
    studentId: required('DRIVE_TRANSCRIPT_STUDENT_ID', process.env.DRIVE_TRANSCRIPT_STUDENT_ID),
    studentEmail: required('DRIVE_TRANSCRIPT_STUDENT_EMAIL', process.env.DRIVE_TRANSCRIPT_STUDENT_EMAIL).toLowerCase(),
    studentName: process.env.DRIVE_TRANSCRIPT_STUDENT_NAME || process.env.DRIVE_TRANSCRIPT_STUDENT_EMAIL?.split('@')[0] || 'Unknown student',
    teacherId: required('DRIVE_TRANSCRIPT_TEACHER_ID', process.env.DRIVE_TRANSCRIPT_TEACHER_ID),
    teacherName: process.env.DRIVE_TRANSCRIPT_TEACHER_NAME || 'Teacher',
    program: process.env.DRIVE_TRANSCRIPT_PROGRAM || 'Prime Digital Hub',
    classDate: process.env.DRIVE_TRANSCRIPT_CLASS_DATE,
    effectiveAt: process.env.DRIVE_TRANSCRIPT_EFFECTIVE_AT,
  }

  const files = await listFiles(token, folderId)
  const report = {
    dryRun: !submit,
    folderId,
    scanned: files.length,
    skipped: 0,
    triageCounts: {},
    candidates: [],
    submitted: [],
  }
  const ingestUrl = process.env.PRIME_PIPELINE_INGEST_URL
  const ingestSecret = process.env.PRIME_PIPELINE_INGEST_SECRET

  for (const file of files) {
    const previous = state.files[file.id]
    const fingerprint = `${file.modifiedTime || ''}:${file.md5Checksum || ''}`
    if (previous?.fingerprint === fingerprint && previous.status === 'submitted') {
      report.skipped += 1
      continue
    }

    let transcript
    try {
      transcript = await downloadTranscript(token, file)
    } catch (error) {
      const candidate = {
        fileId: file.id,
        name: file.name,
        status: 'source_read_error',
        reason: error instanceof Error ? error.message : 'Unable to read source file',
      }
      report.candidates.push(candidate)
      report.triageCounts[candidate.status] = (report.triageCounts[candidate.status] || 0) + 1
      continue
    }

    if (!transcript) {
      const candidate = { fileId: file.id, name: file.name, status: 'unsupported_mime_type', mimeType: file.mimeType }
      report.candidates.push(candidate)
      report.triageCounts[candidate.status] = (report.triageCounts[candidate.status] || 0) + 1
      continue
    }

    const triage = classifyTranscript(file, transcript, config)
    const payload = buildPayload(file, transcript, config, triage)
    const summary = {
      fileId: file.id,
      name: file.name,
      lessonId: payload.lessonId,
      sourceHash: payload.metadata.sourceHash,
      characterCount: transcript.length,
      status: triage.status,
      reason: triage.reason,
      identityVerified: triage.identityVerified,
      identityMatches: triage.identityMatches,
    }
    report.candidates.push(summary)
    report.triageCounts[triage.status] = (report.triageCounts[triage.status] || 0) + 1

    if (submit && triage.status === 'usable_transcript') {
      if (file.mimeType !== 'application/vnd.google-apps.document') {
        const rejected = { ...summary, status: 'non_google_doc_rejected', reason: 'Automatic ingestion accepts only Google Docs from the PRIME Meet Recordings folder.', mimeType: file.mimeType }
        report.candidates[report.candidates.length - 1] = rejected
        report.triageCounts[triage.status] -= 1
        report.triageCounts[rejected.status] = (report.triageCounts[rejected.status] || 0) + 1
        continue
      }
      if (!ingestUrl || !ingestSecret) throw new Error('PRIME_PIPELINE_INGEST_URL and PRIME_PIPELINE_INGEST_SECRET are required with --submit')
      const response = await fetch(ingestUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-prime-pipeline-secret': ingestSecret },
        body: JSON.stringify(payload),
      })
      const body = await response.text()
      if (!response.ok) throw new Error(`Pipeline ingest failed for ${file.id}: HTTP ${response.status} ${body.slice(0, 300)}`)
      let parsedBody = null
      try { parsedBody = JSON.parse(body) } catch { /* Preserve raw response in the report. */ }
      state.files[file.id] = {
        fingerprint,
        sourceHash: payload.metadata.sourceHash,
        lessonId: payload.lessonId,
        status: 'submitted',
        pipelineStatus: parsedBody?.status || 'accepted',
        submittedAt: new Date().toISOString(),
      }
      report.submitted.push({ ...summary, response: body.slice(0, 500) })
    }
  }

  await saveState(statePath, state)
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
