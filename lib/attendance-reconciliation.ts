import { randomUUID } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'

export type MeetParticipant = {
  participantId: string
  userId?: string
  email?: string
  displayName?: string
  earliestStartTime?: string
  latestEndTime?: string
}

export type MeetConference = {
  conferenceRecordId: string
  meetingId?: string
  startTime?: string
  endTime?: string
  participants: MeetParticipant[]
}

export type AttendanceReconciliationInput = {
  lessonId: string
  studentEmail: string
  studentId?: string
  studentName?: string
  teacherId?: string
  teacherName?: string
  scheduledStartAt?: string
  scheduledEndAt?: string
  conference: MeetConference
}

export type AttendanceReconciliationResult = {
  status: 'attended' | 'missed' | 'unknown'
  authorityStatus: 'authoritative' | 'not_proven'
  matchedParticipantId?: string
  reason: string
}

function normalizeEmail(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase() || undefined
}

function normalizeName(value: string | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function matchParticipant(input: AttendanceReconciliationInput): MeetParticipant | undefined {
  const canonicalEmail = normalizeEmail(input.studentEmail)
  const canonicalName = normalizeName(input.studentName)

  const exactEmailMatches = input.conference.participants.filter(
    (participant) => normalizeEmail(participant.email) === canonicalEmail
  )
  if (exactEmailMatches.length === 1) return exactEmailMatches[0]
  if (exactEmailMatches.length > 1) return undefined

  if (!canonicalName) return undefined
  const nameMatches = input.conference.participants.filter(
    (participant) => normalizeName(participant.displayName) === canonicalName
  )
  return nameMatches.length === 1 ? nameMatches[0] : undefined
}

/**
 * Attendance authority rule:
 * - A Google Meet participant record is the operational source of attendance.
 * - Transcript existence is never used as attendance evidence.
 * - Exact email identity is preferred; unique exact display-name match is a
 *   fallback only when the Meet participant has no email in the returned data.
 * - We deliberately do not invent a minimum duration threshold here. The
 *   participant record itself establishes that the learner joined the meeting;
 *   duration remains evidence for later policy if PRIME decides to require it.
 */
export function reconcileMeetAttendance(
  input: AttendanceReconciliationInput,
): AttendanceReconciliationResult {
  const participant = matchParticipant(input)

  if (!participant) {
    return {
      status: 'unknown',
      authorityStatus: 'not_proven',
      reason: 'No unique canonical learner match was found in the Google Meet participant record.',
    }
  }

  return {
    status: 'attended',
    authorityStatus: 'authoritative',
    matchedParticipantId: participant.participantId,
    reason: 'Canonical learner identity matched a Google Meet participant record.',
  }
}

export async function persistMeetAttendance(
  input: AttendanceReconciliationInput,
): Promise<AttendanceReconciliationResult> {
  const result = reconcileMeetAttendance(input)
  const prisma = getPrismaClient()

  const participant = input.conference.participants.find(
    (candidate) => candidate.participantId === result.matchedParticipantId,
  )

  const evidence: Prisma.InputJsonValue = {
    authority: 'google_meet_participants',
    conferenceRecordId: input.conference.conferenceRecordId,
    meetingId: input.conference.meetingId ?? null,
    participantId: participant?.participantId ?? null,
    participantUserId: participant?.userId ?? null,
    participantEmail: participant?.email ?? null,
    participantDisplayName: participant?.displayName ?? null,
    participantEarliestStartTime: participant?.earliestStartTime ?? null,
    participantLatestEndTime: participant?.latestEndTime ?? null,
    reconciledAt: new Date().toISOString(),
    rule: 'canonical_identity_match_to_google_meet_participant',
  }

  const record = await prisma.attendanceRecord.upsert({
    where: {
      lessonId_studentEmail: {
        lessonId: input.lessonId,
        studentEmail: input.studentEmail.trim().toLowerCase(),
      },
    },
    update: {
      studentId: input.studentId,
      studentName: input.studentName,
      teacherId: input.teacherId,
      teacherName: input.teacherName,
      status: result.status,
      authorityStatus: result.authorityStatus,
      source: 'google_meet',
      sourceReference: input.conference.conferenceRecordId,
      meetingId: input.conference.meetingId,
      conferenceRecordId: input.conference.conferenceRecordId,
      participantId: participant?.participantId,
      participantUserId: participant?.userId,
      scheduledStartAt: input.scheduledStartAt ? new Date(input.scheduledStartAt) : undefined,
      scheduledEndAt: input.scheduledEndAt ? new Date(input.scheduledEndAt) : undefined,
      conferenceStartAt: input.conference.startTime ? new Date(input.conference.startTime) : undefined,
      conferenceEndAt: input.conference.endTime ? new Date(input.conference.endTime) : undefined,
      participantStartAt: participant?.earliestStartTime ? new Date(participant.earliestStartTime) : undefined,
      participantEndAt: participant?.latestEndTime ? new Date(participant.latestEndTime) : undefined,
      reconciledAt: new Date(),
      evidence,
    },
    create: {
      id: randomUUID(),
      lessonId: input.lessonId,
      studentEmail: input.studentEmail.trim().toLowerCase(),
      studentId: input.studentId,
      studentName: input.studentName,
      teacherId: input.teacherId,
      teacherName: input.teacherName,
      status: result.status,
      authorityStatus: result.authorityStatus,
      source: 'google_meet',
      sourceReference: input.conference.conferenceRecordId,
      meetingId: input.conference.meetingId,
      conferenceRecordId: input.conference.conferenceRecordId,
      participantId: participant?.participantId,
      participantUserId: participant?.userId,
      scheduledStartAt: input.scheduledStartAt ? new Date(input.scheduledStartAt) : undefined,
      scheduledEndAt: input.scheduledEndAt ? new Date(input.scheduledEndAt) : undefined,
      conferenceStartAt: input.conference.startTime ? new Date(input.conference.startTime) : undefined,
      conferenceEndAt: input.conference.endTime ? new Date(input.conference.endTime) : undefined,
      participantStartAt: participant?.earliestStartTime ? new Date(participant.earliestStartTime) : undefined,
      participantEndAt: participant?.latestEndTime ? new Date(participant.latestEndTime) : undefined,
      reconciledAt: new Date(),
      evidence,
    },
  })

  if (result.authorityStatus !== 'authoritative') {
    await prisma.validationTask.upsert({
      where: {
        type_entityType_entityId: {
          type: 'attendance_reconciliation',
          entityType: 'AttendanceRecord',
          entityId: record.id,
        },
      },
      update: {
        status: 'pending',
        evidence,
        suggestedValue: { status: 'attended' },
      },
      create: {
        id: randomUUID(),
        type: 'attendance_reconciliation',
        entityType: 'AttendanceRecord',
        entityId: record.id,
        status: 'pending',
        priority: 100,
        studentEmail: input.studentEmail.trim().toLowerCase(),
        lessonId: input.lessonId,
        title: 'Attendance requires reconciliation',
        description: result.reason,
        evidence,
        suggestedValue: { status: 'attended' },
      },
    })
  }

  return result
}
