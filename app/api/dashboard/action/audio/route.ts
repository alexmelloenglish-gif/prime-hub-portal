import { randomUUID } from 'node:crypto'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getStudentDashboardState } from '@/lib/student-data'
import { getPrismaClient } from '@/lib/prisma'

const MAX_AUDIO_BYTES = 3 * 1024 * 1024
const SUPPORTED_ACTION_IDS = new Set([
  'action-professional-introduction-60s',
  'next-diving-destination-project',
])
const EVENT_TYPE = 'learner_audio_submitted'
const AGGREGATE_TYPE = 'learner_action_submission'

type SubmissionPayload = {
  status?: string
  durationSeconds?: number | null
  mimeType?: string
  audioBase64?: string
  studentEmail?: string
  actionId?: string
}

function resolveAuthorizedActionId(studentActionId?: string, requestedActionId?: string | null) {
  const actionId = requestedActionId || studentActionId || ''
  if (!SUPPORTED_ACTION_IDS.has(actionId)) return null
  if (studentActionId !== actionId) return null
  return actionId
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = request.nextUrl.searchParams.get('studentEmail')
  const requestedActionId = request.nextUrl.searchParams.get('actionId')
  const state = await getStudentDashboardState(session.user, email)
  if (!state.hasAccess || !state.student?.studentId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const actionId = resolveAuthorizedActionId(state.student.canonicalProjection.nextAction?.id, requestedActionId)
  if (!actionId) return NextResponse.json({ error: 'Action not authorized' }, { status: 409 })

  const aggregateId = `${state.student.studentId}:${actionId}`
  const prisma = getPrismaClient()
  const event = await prisma.pipelineEvent.findFirst({
    where: { aggregateType: AGGREGATE_TYPE, aggregateId, eventType: EVENT_TYPE },
    orderBy: { createdAt: 'desc' },
    select: { id: true, payload: true, createdAt: true },
  })

  if (!event) return NextResponse.json({ submission: null })
  const payload = event.payload as SubmissionPayload
  return NextResponse.json({
    submission: {
      id: event.id,
      status: payload.status || 'submitted',
      submittedAt: event.createdAt,
      durationSeconds: payload.durationSeconds ?? null,
    },
  })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData()
  const requestedEmail = String(form.get('studentEmail') || '')
  const requestedActionId = String(form.get('actionId') || '')
  const state = await getStudentDashboardState(session.user, requestedEmail)
  const student = state.student
  if (!state.hasAccess || !student?.studentId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const actionId = resolveAuthorizedActionId(student.canonicalProjection.nextAction?.id, requestedActionId)
  if (!actionId) return NextResponse.json({ error: 'Action not authorized' }, { status: 409 })

  const audio = form.get('audio')
  if (!(audio instanceof File) || !audio.size) return NextResponse.json({ error: 'Audio is required' }, { status: 400 })
  if (audio.size > MAX_AUDIO_BYTES) return NextResponse.json({ error: 'Recording is too large. Please record again with a shorter response.' }, { status: 413 })
  if (!audio.type.startsWith('audio/')) return NextResponse.json({ error: 'Invalid audio type' }, { status: 415 })

  const duration = Number(form.get('durationSeconds') || 0)
  const bytes = Buffer.from(await audio.arrayBuffer())
  const aggregateId = `${student.studentId}:${actionId}`
  const submissionRunId = `learner-action-${randomUUID()}`
  const prisma = getPrismaClient()
  const event = await prisma.pipelineEvent.create({
    data: {
      pipelineRunId: submissionRunId,
      eventType: EVENT_TYPE,
      aggregateType: AGGREGATE_TYPE,
      aggregateId,
      payload: {
        status: 'submitted',
        studentId: student.studentId,
        studentEmail: student.studentEmail,
        actionId,
        mimeType: audio.type,
        audioBase64: bytes.toString('base64'),
        durationSeconds: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : null,
        source: 'learner_browser_recording',
        authorityStatus: 'learner_submission_pending_teacher_review',
      },
    },
    select: { id: true, createdAt: true },
  })

  return NextResponse.json({
    submission: { id: event.id, status: 'submitted', submittedAt: event.createdAt },
  }, { status: 201 })
}
