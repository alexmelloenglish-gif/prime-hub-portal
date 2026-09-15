import { getPrismaClient } from '@/lib/prisma'
import { persistMeetAttendance, type MeetConference, type MeetParticipant } from '@/lib/attendance-reconciliation'

const MEET_API = 'https://meet.googleapis.com/v2'
const MEET_SCOPE = 'https://www.googleapis.com/auth/meetings.space.readonly'
const ORGANIZER_EMAIL = process.env.PRIME_MEET_ORGANIZER_EMAIL?.trim().toLowerCase()

type ConferenceRecord = {
  name: string
  startTime?: string
  endTime?: string
  space?: string
}

type ConferenceListResponse = {
  conferenceRecords?: ConferenceRecord[]
  nextPageToken?: string
}

type ParticipantResource = {
  name: string
  earliestStartTime?: string
  latestEndTime?: string
  signedinUser?: { user?: string; displayName?: string }
  anonymousUser?: { displayName?: string }
  phoneUser?: { displayName?: string }
}

type ParticipantListResponse = {
  participants?: ParticipantResource[]
  nextPageToken?: string
}

function normalizeName(value: string | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

async function getMeetAccessToken(): Promise<string> {
  const configured = process.env.GOOGLE_MEET_ACCESS_TOKEN?.trim()
  if (configured) return configured
  if (!ORGANIZER_EMAIL) throw new Error('PRIME_MEET_ORGANIZER_EMAIL_NOT_CONFIGURED')

  const prisma = getPrismaClient()
  const account = await prisma.account.findFirst({
    where: { provider: 'google', user: { email: ORGANIZER_EMAIL } },
    select: { id: true, access_token: true, refresh_token: true, expires_at: true, scope: true },
  })
  if (!account) throw new Error('MEET_ORGANIZER_GOOGLE_ACCOUNT_NOT_CONNECTED')

  const scope = account.scope || ''
  if (!scope.split(/\s+/).includes(MEET_SCOPE)) throw new Error('MEET_SCOPE_REAUTH_REQUIRED')

  const expiresAt = account.expires_at ? account.expires_at * 1000 : 0
  if (account.access_token && expiresAt > Date.now() + 60_000) return account.access_token
  if (!account.refresh_token) throw new Error('MEET_REFRESH_TOKEN_NOT_AVAILABLE')

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) throw new Error('GOOGLE_OAUTH_CLIENT_NOT_CONFIGURED')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: account.refresh_token,
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`MEET_TOKEN_REFRESH_HTTP_${response.status}`)

  const refreshed = await response.json() as { access_token?: string; expires_in?: number; scope?: string }
  if (!refreshed.access_token) throw new Error('MEET_TOKEN_REFRESH_EMPTY')

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: refreshed.access_token,
      expires_at: refreshed.expires_in ? Math.floor(Date.now() / 1000) + refreshed.expires_in : account.expires_at,
      scope: refreshed.scope || account.scope,
    },
  })
  return refreshed.access_token
}

async function meetGet<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${MEET_API}${path}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`MEET_API_HTTP_${response.status}`)
  return response.json() as Promise<T>
}

async function listConferences(token: string, start: Date, end: Date, meetingSpace?: string): Promise<ConferenceRecord[]> {
  const records: ConferenceRecord[] = []
  let pageToken: string | undefined
  do {
    const params = new URLSearchParams({ pageSize: '100' })
    params.set('filter', meetingSpace
      ? `space.name = "${meetingSpace.replace(/"/g, '')}"`
      : `start_time>="${start.toISOString()}" AND start_time<="${end.toISOString()}"`)
    if (pageToken) params.set('pageToken', pageToken)
    const response = await meetGet<ConferenceListResponse>(token, `/conferenceRecords?${params.toString()}`)
    records.push(...(response.conferenceRecords || []))
    pageToken = response.nextPageToken
  } while (pageToken)
  return records
}

async function listParticipants(token: string, conferenceRecordId: string): Promise<ParticipantResource[]> {
  const participants: ParticipantResource[] = []
  let pageToken: string | undefined
  do {
    const params = new URLSearchParams({ pageSize: '250' })
    if (pageToken) params.set('pageToken', pageToken)
    const response = await meetGet<ParticipantListResponse>(token, `/${conferenceRecordId}/participants?${params.toString()}`)
    participants.push(...(response.participants || []))
    pageToken = response.nextPageToken
  } while (pageToken)
  return participants
}

function toMeetConference(record: ConferenceRecord, participants: ParticipantResource[]): MeetConference {
  return {
    conferenceRecordId: record.name,
    meetingId: record.space,
    startTime: record.startTime,
    endTime: record.endTime,
    participants: participants.map((participant): MeetParticipant => ({
      participantId: participant.name,
      userId: participant.signedinUser?.user,
      displayName: participant.signedinUser?.displayName || participant.anonymousUser?.displayName || participant.phoneUser?.displayName,
      earliestStartTime: participant.earliestStartTime,
      latestEndTime: participant.latestEndTime,
    })),
  }
}

function getExternalMeetingId(metadata: unknown): string | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return undefined
  const value = metadata as Record<string, unknown>
  const nested = value._pipelineInput
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const candidate = (nested as Record<string, unknown>).externalMeetingId
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  }
  const candidate = value.externalMeetingId
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : undefined
}

function meetingSpaceFilterValue(value: string): string | undefined {
  if (value.startsWith('spaces/')) return value
  if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(value)) return value
  return undefined
}

async function resolveConference(token: string, effectiveAt: Date, metadata: unknown): Promise<ConferenceRecord | undefined> {
  const externalMeetingId = getExternalMeetingId(metadata)
  const meetingSpace = externalMeetingId ? meetingSpaceFilterValue(externalMeetingId) : undefined
  const start = new Date(effectiveAt.getTime() - 90 * 60_000)
  const end = new Date(effectiveAt.getTime() + 90 * 60_000)
  const conferences = await listConferences(token, start, end, meetingSpace)
  if (conferences.length !== 1) return undefined
  return conferences[0]
}

function participantNameMatch(participant: MeetParticipant, studentName: string): boolean {
  return normalizeName(participant.displayName) === normalizeName(studentName)
}

export type AttendanceCollectorResult = { scanned: number; proven: number; unresolved: number; skipped: number; errors: number }

export async function reconcileExistingMeetAttendance(): Promise<AttendanceCollectorResult> {
  const token = await getMeetAccessToken()
  const prisma = getPrismaClient()
  const transcripts = await prisma.transcript.findMany({
    where: { source: 'google_meet' },
    orderBy: { recordedAt: 'desc' },
    take: 250,
    select: { id: true, lessonId: true, studentEmail: true, effectiveAt: true, recordedAt: true, metadata: true },
  })

  const result: AttendanceCollectorResult = { scanned: transcripts.length, proven: 0, unresolved: 0, skipped: 0, errors: 0 }

  for (const transcript of transcripts) {
    try {
      const existing = await prisma.attendanceRecord.findUnique({
        where: { lessonId_studentEmail: { lessonId: transcript.lessonId, studentEmail: transcript.studentEmail.toLowerCase() } },
        select: { authorityStatus: true },
      })
      if (existing?.authorityStatus === 'authoritative') {
        result.skipped += 1
        continue
      }

      const effectiveAt = transcript.effectiveAt || transcript.recordedAt
      if (!effectiveAt) {
        result.unresolved += 1
        continue
      }

      const conference = await resolveConference(token, effectiveAt, transcript.metadata)
      if (!conference) {
        result.unresolved += 1
        await prisma.validationTask.upsert({
          where: { type_entityType_entityId: { type: 'attendance_reconciliation', entityType: 'Transcript', entityId: transcript.id } },
          update: { status: 'pending', description: 'No unique Google Meet conference could be reconciled to this lesson.', evidence: { transcriptId: transcript.id, lessonId: transcript.lessonId, effectiveAt: effectiveAt.toISOString() } },
          create: { type: 'attendance_reconciliation', entityType: 'Transcript', entityId: transcript.id, status: 'pending', priority: 100, studentEmail: transcript.studentEmail.toLowerCase(), lessonId: transcript.lessonId, title: 'Attendance conference unresolved', description: 'No unique Google Meet conference could be reconciled to this lesson.', evidence: { transcriptId: transcript.id, lessonId: transcript.lessonId, effectiveAt: effectiveAt.toISOString() } },
        })
        continue
      }

      const participants = await listParticipants(token, conference.name)
      const meetConference = toMeetConference(conference, participants)
      const student = await prisma.user.findFirst({ where: { email: transcript.studentEmail }, select: { name: true } })
      const studentName = student?.name || transcript.studentEmail.split('@')[0]
      const matched = meetConference.participants.filter((participant) => participantNameMatch(participant, studentName))

      if (matched.length !== 1 || !matched[0].userId) {
        result.unresolved += 1
        await prisma.validationTask.upsert({
          where: { type_entityType_entityId: { type: 'attendance_reconciliation', entityType: 'Transcript', entityId: transcript.id } },
          update: { status: 'pending', evidence: { conferenceRecordId: conference.name, participantCount: participants.length, matchedNameCount: matched.length, signedInMatchRequired: true }, suggestedValue: { status: 'attended' } },
          create: { type: 'attendance_reconciliation', entityType: 'Transcript', entityId: transcript.id, status: 'pending', priority: 100, studentEmail: transcript.studentEmail.toLowerCase(), lessonId: transcript.lessonId, title: 'Attendance identity unresolved', description: 'Google Meet conference exists, but no unique signed-in participant matched the canonical learner identity.', evidence: { conferenceRecordId: conference.name, participantCount: participants.length, matchedNameCount: matched.length, signedInMatchRequired: true }, suggestedValue: { status: 'attended' } },
        })
        continue
      }

      const persisted = await persistMeetAttendance({ lessonId: transcript.lessonId, studentEmail: transcript.studentEmail, studentName, conference: meetConference })
      if (persisted.authorityStatus === 'authoritative') {
        result.proven += 1
        const run = await prisma.pipelineRun.findFirst({ where: { transcriptId: transcript.id }, orderBy: { attemptNumber: 'desc' }, select: { id: true } })
        if (run) {
          await prisma.pipelineEvent.upsert({
            where: { pipelineRunId_eventType_aggregateId: { pipelineRunId: run.id, eventType: 'AttendanceReconciled', aggregateId: `${transcript.lessonId}:${transcript.studentEmail.toLowerCase()}` } },
            update: { payload: { source: 'google_meet', authorityStatus: 'authoritative', conferenceRecordId: conference.name, participantId: matched[0].participantId } },
            create: { pipelineRunId: run.id, eventType: 'AttendanceReconciled', aggregateType: 'AttendanceRecord', aggregateId: `${transcript.lessonId}:${transcript.studentEmail.toLowerCase()}`, payload: { source: 'google_meet', authorityStatus: 'authoritative', conferenceRecordId: conference.name, participantId: matched[0].participantId } },
          })
        }
      } else result.unresolved += 1
    } catch (error) {
      result.errors += 1
      console.warn(JSON.stringify({ event: 'meet_attendance_reconciliation_failed', lessonId: transcript.lessonId, studentEmail: transcript.studentEmail, error: error instanceof Error ? error.message : 'unknown_error' }))
    }
  }

  return result
}
