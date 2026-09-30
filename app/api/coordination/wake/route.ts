import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { acknowledgeAgentCoordinationEvent } from '@/lib/agent-coordination/store'
import {
  PRODUCTION_WITNESS_ACKNOWLEDGED_BY,
  validateProductionWitnessWake,
} from '@/lib/agent-coordination/production-witness'
import { getPrismaClient } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function secretMatches(actual: string | null, expected: string) {
  if (!actual) return false
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length) return false
  return timingSafeEqual(actualBuffer, expectedBuffer)
}

export async function POST(request: Request) {
  const expectedSecret = process.env.PRIME_AGENT_WAKE_SECRET?.trim()
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Production witness wake receiver is not configured' },
      { status: 503 },
    )
  }

  if (!secretMatches(request.headers.get('x-prime-agent-wake-secret'), expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as Record<string, unknown>
    const coordinationEventId =
      typeof body.coordinationEventId === 'string' ? body.coordinationEventId.trim() : ''
    if (!coordinationEventId) {
      return NextResponse.json({ error: 'coordinationEventId is required' }, { status: 400 })
    }

    const prisma = getPrismaClient()
    const event = await prisma.agentCoordinationEvent.findUnique({
      where: { id: coordinationEventId },
    })
    if (!event) {
      return NextResponse.json({ error: 'Coordination event not found' }, { status: 404 })
    }

    const proof = validateProductionWitnessWake({
      body,
      event,
      deployedSha: process.env.VERCEL_GIT_COMMIT_SHA,
    })

    const ack = await acknowledgeAgentCoordinationEvent({
      eventId: proof.coordinationEventId,
      acknowledgedBy: PRODUCTION_WITNESS_ACKNOWLEDGED_BY,
      ackStatus: 'ACKNOWLEDGED',
    })

    return NextResponse.json(
      {
        ok: true,
        duplicate: ack.duplicate,
        coordinationEventId: ack.event.id,
        ackStatus: ack.event.ackStatus,
        acknowledgedBy: ack.event.acknowledgedBy,
        deployedSha: proof.deployedSha,
      },
      { status: 202 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid Production witness wake'
    const status =
      message.includes('already') || message.includes('raced')
        ? 409
        : message.includes('VERCEL_GIT_COMMIT_SHA')
          ? 503
          : 400
    return NextResponse.json({ error: message }, { status })
  }
}
