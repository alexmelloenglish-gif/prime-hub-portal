#!/usr/bin/env node

/**
 * Validate a Google Meet transcript against the PRIME pipeline ingestion contract.
 *
 * Safe defaults:
 *   - dry-run is the default;
 *   - transcript text is never printed;
 *   - no canonical domain mutation happens in this script;
 *   - submitting requires --submit and PRIME_PIPELINE_INGEST_SECRET.
 *
 * Examples:
 *   node scripts/validate-google-meet-pipeline.mjs \
 *     --transcript-resource conferenceRecords/abc/transcripts/xyz \
 *     --lesson-id lesson-2026-08-16 \
 *     --student-id stu_123 \
 *     --student-email student@example.com \
 *     --teacher-id teacher_123 \
 *     --program english-b2 \
 *     --class-date 2026-08-16 \
 *     --pipeline-url https://www.primedigitalhub.com.br \
 *     --dry-run
 *
 * For a local fixture:
 *   node scripts/validate-google-meet-pipeline.mjs \
 *     --transcript-file ./fixtures/meet-transcript.txt \
 *     --transcript-id tr_fixture_001 \
 *     --lesson-id lesson-fixture \
 *     --student-id stu_123 \
 *     --student-email student@example.com \
 *     --teacher-id teacher_123 \
 *     --program english-b2 \
 *     --class-date 2026-08-16 \
 *     --dry-run
 */

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import process from 'node:process'

const MEET_API_BASE = 'https://meet.googleapis.com/v2'
const DEFAULT_PIPELINE_URL = 'http://localhost:3000'
const MAX_TRANSCRIPT_CHARS = 2_000_000
const MAX_ENTRIES_PER_PAGE = 1000

function fail(message, details = {}) {
  const error = new Error(message)
  error.details = details
  throw error
}

function parseArgs(argv) {
  const args = { dryRun: true }
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) fail(`Argumento inválido: ${token}`)
    const key = token.slice(2).replaceAll('-', '_')
    if (key === 'dry_run') {
      args.dryRun = true
      continue
    }
    if (key === 'submit') {
      args.submit = true
      args.dryRun = false
      continue
    }
    if (key === 'help' || key === 'h') {
      args.help = true
      continue
    }
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) fail(`Valor ausente para --${key}`)
    args[key] = value
    index += 1
  }
  return args
}

function printHelp() {
  console.log(`
PRIME Google Meet → Pipeline Validator

Required identity fields:
  --lesson-id ID              Canonical lesson identifier
  --student-id ID             Stable student identifier; never inferred
  --student-email EMAIL       Student email used by current ingestion route
  --teacher-id ID             Stable teacher identifier
  --program PROGRAM           Program/cohort identifier
  --class-date YYYY-MM-DD     Lesson date

Transcript source (one of):
  --transcript-resource NAME  e.g. conferenceRecords/abc/transcripts/xyz
  --conference-record NAME    e.g. conferenceRecords/abc; latest transcript is listed
  --transcript-file PATH      Local fixture or previously exported transcript
  --transcript-id ID          Required with --transcript-file

Optional:
  --student-name NAME
  --teacher-name NAME
  --attendance-status attended|missed|cancelled|rescheduled|unknown
  --attendance-source SOURCE  Must identify an authorized source when status is attended/missed
  --effective-at ISO_TIMESTAMP
  --recorded-at ISO_TIMESTAMP
  --external-meeting-id ID
  --pipeline-url URL          Default: ${DEFAULT_PIPELINE_URL}
  --pipeline-path PATH        Default: /api/pipeline/ingest
  --meet-api-base URL         Default: ${MEET_API_BASE}
  --output PATH               Write validation report JSON
  --dry-run                   Default; do not call PRIME ingestion
  --submit                    Explicitly POST to PRIME ingestion
  --help

Environment:
  GOOGLE_MEET_ACCESS_TOKEN    OAuth access token for Meet API retrieval
  PRIME_PIPELINE_INGEST_SECRET Secret sent as x-prime-pipeline-secret on submit

The script never prints transcript content. It reports only metadata, hash, lengths and status.
`)
}

function required(args, key) {
  const value = args[key]
  if (typeof value !== 'string' || !value.trim()) fail(`Campo obrigatório ausente: --${key.replaceAll('_', '-')}`)
  return value.trim()
}

function isoOrUndefined(value, key) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) fail(`Data inválida em --${key.replaceAll('_', '-')}: ${value}`)
  return date.toISOString()
}

function normalizeResourceName(value) {
  if (!value) return undefined
  const trimmed = value.trim().replace(/^\/+/, '')
  if (!trimmed.startsWith('conferenceRecords/')) {
    fail(`Recurso Meet inválido: ${value}. Esperado conferenceRecords/...`)
  }
  return trimmed
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

function extractText(entry) {
  const candidates = [entry.text, entry.transcriptText, entry.content, entry.entry?.text]
  const text = candidates.find((value) => typeof value === 'string' && value.trim())
  return text?.trim() || ''
}

function extractSpeaker(entry) {
  return entry.participant || entry.participantName || entry.speaker || entry.entry?.participant || 'speaker-unknown'
}

function formatTimestamp(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString()
}

function formatEntries(entries) {
  return entries
    .map((entry) => {
      const text = extractText(entry)
      if (!text) return ''
      const start = formatTimestamp(entry.startTime || entry.start_time || entry.entry?.startTime)
      const speaker = extractSpeaker(entry)
      return `[${start || 'time-unknown'}] ${speaker}: ${text}`
    })
    .filter(Boolean)
    .join('\n')
}

async function meetGet(path, accessToken, baseUrl) {
  if (!accessToken) fail('GOOGLE_MEET_ACCESS_TOKEN é obrigatório para consultar a API do Meet')
  const response = await fetch(`${baseUrl}/${path.replace(/^\/+/, '')}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  })
  const body = await response.text()
  let parsed
  try {
    parsed = body ? JSON.parse(body) : null
  } catch {
    parsed = { raw: body.slice(0, 500) }
  }
  if (!response.ok) {
    fail(`Google Meet API respondeu ${response.status}`, { status: response.status, body: parsed })
  }
  return parsed
}

async function listAllTranscriptEntries(transcriptResource, accessToken, baseUrl) {
  const entries = []
  let pageToken = ''
  do {
    const query = new URLSearchParams({ pageSize: String(MAX_ENTRIES_PER_PAGE) })
    if (pageToken) query.set('pageToken', pageToken)
    const response = await meetGet(`${transcriptResource}/entries?${query}`, accessToken, baseUrl)
    if (Array.isArray(response?.transcriptEntries)) entries.push(...response.transcriptEntries)
    if (Array.isArray(response?.entries)) entries.push(...response.entries)
    pageToken = response?.nextPageToken || ''
  } while (pageToken)
  return entries
}

async function resolveTranscript(args) {
  const baseUrl = (args.meet_api_base || MEET_API_BASE).replace(/\/$/, '')
  const accessToken = process.env.GOOGLE_MEET_ACCESS_TOKEN
  const explicitResource = normalizeResourceName(args.transcript_resource)

  if (args.transcript_file) {
    const transcript = await readFile(args.transcript_file, 'utf8')
    const transcriptId = required(args, 'transcript_id')
    return {
      transcriptId,
      transcriptResource: explicitResource,
      transcript,
      sourceMode: 'local_file',
      entriesCount: null,
    }
  }

  if (!accessToken) fail('Informe --transcript-file para dry-run local ou configure GOOGLE_MEET_ACCESS_TOKEN para consultar o Google Meet')

  let transcriptResource = explicitResource
  let transcriptMetadata = null
  if (!transcriptResource && args.conference_record) {
    const conferenceRecord = normalizeResourceName(args.conference_record)
    const response = await meetGet(`${conferenceRecord}/transcripts`, accessToken, baseUrl)
    const transcripts = response?.transcripts || []
    if (!transcripts.length) fail(`Nenhum transcript encontrado em ${conferenceRecord}`)
    transcriptMetadata = [...transcripts].sort((a, b) => String(b.endTime || b.startTime || '').localeCompare(String(a.endTime || a.startTime || '')))[0]
    transcriptResource = normalizeResourceName(transcriptMetadata.name)
  }
  if (!transcriptResource) fail('Informe --transcript-resource, --conference-record ou --transcript-file')

  transcriptMetadata ||= await meetGet(transcriptResource, accessToken, baseUrl)
  const entries = await listAllTranscriptEntries(transcriptResource, accessToken, baseUrl)
  const transcript = formatEntries(entries)
  if (!transcript) fail(`O transcript ${transcriptResource} não contém entradas textuais recuperáveis`)
  return {
    transcriptId: transcriptResource.split('/').at(-1),
    transcriptResource,
    transcript,
    transcriptMetadata,
    sourceMode: 'google_meet_api',
    entriesCount: entries.length,
  }
}

function validateAttendance(args) {
  const status = args.attendance_status || 'unknown'
  const allowed = new Set(['attended', 'missed', 'cancelled', 'rescheduled', 'unknown'])
  if (!allowed.has(status)) fail(`attendance-status inválido: ${status}`)
  const source = (args.attendance_source || '').trim()
  if ((status === 'attended' || status === 'missed') && !source) {
    fail('attendance-source é obrigatório quando attendance-status é attended ou missed; LessonCompleted não prova presença')
  }
  return { status, source: source || 'not_provided' }
}

function buildPayload(args, source) {
  if (source.transcript.length > MAX_TRANSCRIPT_CHARS) {
    fail(`Transcript excede o limite seguro de ${MAX_TRANSCRIPT_CHARS} caracteres`)
  }
  const lessonId = required(args, 'lesson_id')
  const studentId = required(args, 'student_id')
  const studentEmail = required(args, 'student_email')
  const teacherId = required(args, 'teacher_id')
  const program = required(args, 'program')
  const classDate = required(args, 'class_date')
  const attendance = validateAttendance(args)
  const contentHash = sha256(source.transcript)
  const transcriptId = source.transcriptId || required(args, 'transcript_id')
  const sourceReference = source.transcriptResource || `local-file:${args.transcript_file}`
  const receivedAt = new Date().toISOString()
  const effectiveAt = isoOrUndefined(args.effective_at || `${classDate}T00:00:00.000Z`, 'effective_at')
  const recordedAt = isoOrUndefined(args.recorded_at, 'recorded_at')
  const ingestionId = `gmeet-${transcriptId}-${contentHash.slice(0, 16)}`

  const payload = {
    lessonId,
    studentId,
    studentEmail,
    studentName: args.student_name,
    teacherId,
    teacherName: args.teacher_name,
    program,
    classDate,
    effectiveAt,
    recordedAt,
    transcriptId,
    transcript: source.transcript,
    source: 'google_meet',
    attendanceStatus: attendance.status,
    attendanceSource: attendance.source,
    externalMeetingId: args.external_meeting_id || undefined,
    metadata: {
      ingestionId,
      sourceReference,
      receivedAt,
      contentHash,
      sourceMode: source.sourceMode,
      entriesCount: source.entriesCount,
      transcriptResource: source.transcriptResource,
      validator: 'validate-google-meet-pipeline.mjs',
      validatorVersion: '1.0.0',
    },
  }
  return { payload, contentHash, ingestionId, sourceReference, receivedAt }
}

function validatePayload(payload) {
  const checks = [
    ['required_identity', Boolean(payload.lessonId && payload.studentId && payload.studentEmail && payload.teacherId && payload.program)],
    ['transcript_id', Boolean(payload.transcriptId)],
    ['transcript_non_empty', typeof payload.transcript === 'string' && payload.transcript.trim().length > 0],
    ['source_google_meet', payload.source === 'google_meet'],
    ['content_hash', /^[a-f0-9]{64}$/.test(String(payload.metadata?.contentHash || ''))],
    ['provenance', Boolean(payload.metadata?.sourceReference && payload.metadata?.receivedAt)],
    ['attendance_authority', payload.attendanceStatus === 'unknown' || Boolean(payload.attendanceSource && payload.attendanceSource !== 'not_provided')],
  ]
  const failed = checks.filter(([, passed]) => !passed).map(([name]) => name)
  return { passed: failed.length === 0, checks: Object.fromEntries(checks), failed }
}

async function submit(payload, args) {
  const secret = process.env.PRIME_PIPELINE_INGEST_SECRET
  if (!secret) fail('PRIME_PIPELINE_INGEST_SECRET é obrigatório com --submit')
  const base = (args.pipeline_url || DEFAULT_PIPELINE_URL).replace(/\/$/, '')
  const path = args.pipeline_path || '/api/pipeline/ingest'
  const response = await fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
      'x-prime-pipeline-secret': secret,
      'x-prime-validation-run': 'true',
    },
    body: JSON.stringify(payload),
  })
  const body = await response.text()
  let parsed
  try {
    parsed = body ? JSON.parse(body) : null
  } catch {
    parsed = { raw: body.slice(0, 500) }
  }
  return { status: response.status, ok: response.ok, body: parsed }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  if (args.submit && args.dry_run) fail('Use --submit ou --dry-run, não os dois')
  if (args.submit && !args.transcript_resource && !args.conference_record) {
    fail('--submit exige uma origem real do Google Meet: --transcript-resource ou --conference-record')
  }

  const source = await resolveTranscript(args)
  const built = buildPayload(args, source)
  const validation = validatePayload(built.payload)
  const report = {
    validator: 'prime-google-meet-pipeline',
    validatorVersion: '1.0.0',
    mode: args.submit ? 'submit' : 'dry-run',
    checkedAt: new Date().toISOString(),
    source: {
      mode: source.sourceMode,
      transcriptId: source.transcriptId,
      transcriptResource: source.transcriptResource || null,
      entriesCount: source.entriesCount,
      characterCount: built.payload.transcript.length,
      contentHash: built.contentHash,
    },
    identity: {
      lessonId: built.payload.lessonId,
      studentId: built.payload.studentId,
      teacherId: built.payload.teacherId,
      program: built.payload.program,
      classDate: built.payload.classDate,
    },
    idempotency: {
      ingestionId: built.ingestionId,
      contentHash: built.contentHash,
    },
    validation,
  }

  if (!validation.passed) {
    report.status = 'validation_failed'
    console.error(JSON.stringify(report, null, 2))
    process.exitCode = 2
    return
  }

  if (args.submit) {
    const response = await submit(built.payload, args)
    report.submit = { status: response.status, ok: response.ok, response: response.body }
    report.status = response.ok ? (response.status === 200 ? 'duplicate_or_already_processed' : 'accepted') : 'submit_failed'
    console.log(JSON.stringify(report, null, 2))
    if (!response.ok) process.exitCode = 3
  } else {
    report.status = 'dry_run_validated'
    console.log(JSON.stringify(report, null, 2))
  }

  if (args.output) {
    await import('node:fs/promises').then(({ writeFile }) => writeFile(args.output, `${JSON.stringify(report, null, 2)}\n`, 'utf8'))
  }
}

main().catch((error) => {
  const report = {
    status: 'error',
    error: error instanceof Error ? error.message : String(error),
    details: error?.details || undefined,
  }
  console.error(JSON.stringify(report, null, 2))
  process.exitCode = 1
})
