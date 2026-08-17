import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const DEFAULT_STATE = '.runtime/drive-transcript-state.json'

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

function buildPayload(file, transcript, config) {
  const sourceHash = sha256(transcript)
  const lessonId = `lesson_${sha256(`${config.studentId}|${file.id}`).slice(0, 16)}`
  return {
    lessonId,
    studentId: config.studentId,
    studentEmail: config.studentEmail,
    teacherId: config.teacherId,
    teacherName: config.teacherName,
    program: config.program,
    lessonDate: file.createdTime?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    transcriptId: file.id,
    transcript: transcript,
    source: {
      provider: 'google_drive',
      sourceType: 'drive_transcript_file',
      sourceFileId: file.id,
      sourceDocumentId: file.id,
      sourceName: file.name,
      sourceMimeType: file.mimeType,
      sourceUrl: file.webViewLink || null,
      sourceHash,
    },
    metadata: {
      driveModifiedTime: file.modifiedTime || null,
      driveCreatedTime: file.createdTime || null,
      ingestionMode: 'drive-folder-scanner',
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
    studentId: required('DRIVE_TRANSCRIPT_STUDENT_ID', process.env.DRIVE_TRANSCRIPT_STUDENT_ID),
    studentEmail: required('DRIVE_TRANSCRIPT_STUDENT_EMAIL', process.env.DRIVE_TRANSCRIPT_STUDENT_EMAIL).toLowerCase(),
    teacherId: required('DRIVE_TRANSCRIPT_TEACHER_ID', process.env.DRIVE_TRANSCRIPT_TEACHER_ID),
    teacherName: process.env.DRIVE_TRANSCRIPT_TEACHER_NAME || 'Teacher',
    program: process.env.DRIVE_TRANSCRIPT_PROGRAM || 'Prime Digital Hub',
  }

  const files = await listFiles(token, folderId)
  const report = { dryRun: !submit, folderId, scanned: files.length, skipped: 0, candidates: [], submitted: [] }
  const ingestUrl = process.env.PRIME_PIPELINE_INGEST_URL
  const ingestSecret = process.env.PRIME_PIPELINE_INGEST_SECRET

  for (const file of files) {
    const previous = state.files[file.id]
    const fingerprint = `${file.modifiedTime || ''}:${file.md5Checksum || ''}`
    if (previous?.fingerprint === fingerprint && previous.status === 'submitted') {
      report.skipped += 1
      continue
    }

    const transcript = await downloadTranscript(token, file)
    if (!transcript) {
      report.candidates.push({ fileId: file.id, name: file.name, status: 'unsupported_mime_type', mimeType: file.mimeType })
      continue
    }

    const payload = buildPayload(file, transcript, config)
    const summary = {
      fileId: file.id,
      name: file.name,
      lessonId: payload.lessonId,
      sourceHash: payload.source.sourceHash,
      characterCount: transcript.length,
      status: submit ? 'ready_to_submit' : 'dry_run_validated',
    }
    report.candidates.push(summary)

    if (submit) {
      if (!ingestUrl || !ingestSecret) throw new Error('PRIME_PIPELINE_INGEST_URL and PRIME_PIPELINE_INGEST_SECRET are required with --submit')
      const response = await fetch(ingestUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-prime-pipeline-secret': ingestSecret },
        body: JSON.stringify(payload),
      })
      const body = await response.text()
      if (!response.ok) throw new Error(`Pipeline ingest failed for ${file.id}: HTTP ${response.status} ${body.slice(0, 300)}`)
      state.files[file.id] = { fingerprint, sourceHash: payload.source.sourceHash, lessonId: payload.lessonId, status: 'submitted', submittedAt: new Date().toISOString() }
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
