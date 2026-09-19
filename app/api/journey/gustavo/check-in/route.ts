import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'

const ALLOWED_VALUES = new Set(['VERY_WELL', 'WITH_HELP', 'STUDY_MORE'])
const REQUIRED_ITEMS = [
  'past-story',
  'past-negative',
  'past-question',
  'past-answer',
  'now-past',
  'past-words',
  'advice',
  'health',
  'reflexive',
  'superlative',
  'nutrients',
  'digestion',
  'self-correction',
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (body?.journeyKey !== '7q4m9' || body?.studentId !== 'stu_4c4da6c04ac4') {
      return NextResponse.json({ ok: false, error: 'invalid_journey' }, { status: 403 })
    }

    const answers = body?.answers && typeof body.answers === 'object' ? body.answers : {}
    const valid = REQUIRED_ITEMS.every((id) => ALLOWED_VALUES.has(String(answers[id] || '')))
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'incomplete_or_invalid_answers' }, { status: 400 })
    }

    const prisma = getPrismaClient()
    const submissionId = randomUUID()
    const recordedAt = new Date()

    await prisma.pipelineEvent.create({
      data: {
        pipelineRunId: 'learner-checkin-' + submissionId,
        eventType: 'LEARNER_SELF_ASSESSMENT_SUBMITTED',
        aggregateType: 'learner_self_perception',
        aggregateId: 'stu_4c4da6c04ac4',
        payload: {
          schemaVersion: 'learner-self-perception-v1',
          studentId: 'stu_4c4da6c04ac4',
          journeyId: 'gustavo-first-5-lessons-2026',
          source: 'young-learner-journey-check-in',
          ratingsAreSelfPerceptionNotProficiency: true,
          answers,
          recordedAt: recordedAt.toISOString(),
        },
      },
    })

    return NextResponse.json({ ok: true, submissionId, recordedAt: recordedAt.toISOString() })
  } catch (error) {
    console.error('[journey-check-in] save failed', error)
    return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 500 })
  }
}
