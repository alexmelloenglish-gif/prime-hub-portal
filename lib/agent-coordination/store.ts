import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import {
  canApplyAckTransition,
  normalizeAckStatus,
  normalizeAgentCoordinationEvent,
  type AgentCoordinationAckStatus,
  type AgentCoordinationEventInput,
} from '@/lib/agent-coordination/contract'

function asJson(value: Record<string, unknown> | null): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value ? JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue : Prisma.DbNull
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export async function ingestAgentCoordinationEvent(input: AgentCoordinationEventInput) {
  const prisma = getPrismaClient()
  const normalized = normalizeAgentCoordinationEvent(input)

  const existing = await prisma.agentCoordinationEvent.findUnique({
    where: { idempotencyKey: normalized.idempotencyKey },
  })
  if (existing) {
    return { event: existing, duplicate: true }
  }

  try {
    const created = await prisma.agentCoordinationEvent.create({
      data: {
        workstreamId: normalized.workstreamId,
        senderRole: normalized.senderRole,
        targetRole: normalized.targetRole,
        eventType: normalized.eventType,
        repo: normalized.repo,
        issueNumber: normalized.issueNumber,
        prNumber: normalized.prNumber,
        sha: normalized.sha,
        githubCommentUrl: normalized.githubCommentUrl,
        sourceDeliveryId: normalized.sourceDeliveryId,
        requiresAck: normalized.requiresAck,
        ackStatus: normalized.requiresAck ? 'PENDING' : 'ACKNOWLEDGED',
        acknowledgedAt: normalized.requiresAck ? null : new Date(),
        idempotencyKey: normalized.idempotencyKey,
        payloadJson: asJson(normalized.payload),
      },
    })
    return { event: created, duplicate: false }
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error
    const raced = await prisma.agentCoordinationEvent.findUnique({
      where: { idempotencyKey: normalized.idempotencyKey },
    })
    if (!raced) throw error
    return { event: raced, duplicate: true }
  }
}

export async function acknowledgeAgentCoordinationEvent(input: {
  eventId: string
  acknowledgedBy: string
  ackStatus: unknown
}) {
  const prisma = getPrismaClient()
  const eventId = input.eventId.trim()
  const acknowledgedBy = input.acknowledgedBy.trim().toLowerCase()
  if (!eventId) throw new Error('eventId is required')
  if (!acknowledgedBy) throw new Error('acknowledgedBy is required')

  const requested = normalizeAckStatus(input.ackStatus)
  const current = await prisma.agentCoordinationEvent.findUnique({
    where: { id: eventId },
  })
  if (!current) throw new Error('Coordination event not found')

  const currentStatus = current.ackStatus as AgentCoordinationAckStatus
  if (!canApplyAckTransition(currentStatus, requested)) {
    throw new Error(
      `Coordination event is already ${currentStatus}; cannot transition to ${requested}`,
    )
  }

  if (
    currentStatus === requested
    && current.acknowledgedBy?.toLowerCase() === acknowledgedBy
  ) {
    return { event: current, duplicate: true }
  }

  const updated = await prisma.agentCoordinationEvent.updateMany({
    where: {
      id: eventId,
      ackStatus: 'PENDING',
    },
    data: {
      ackStatus: requested,
      acknowledgedBy,
      acknowledgedAt: new Date(),
    },
  })

  if (updated.count === 1) {
    const event = await prisma.agentCoordinationEvent.findUniqueOrThrow({
      where: { id: eventId },
    })
    return { event, duplicate: false }
  }

  const raced = await prisma.agentCoordinationEvent.findUniqueOrThrow({
    where: { id: eventId },
  })
  if (
    raced.ackStatus === requested
    && raced.acknowledgedBy?.toLowerCase() === acknowledgedBy
  ) {
    return { event: raced, duplicate: true }
  }
  throw new Error(
    `Coordination event acknowledgement raced with another terminal transition: ${raced.ackStatus}`,
  )
}

export async function listPendingAgentCoordinationEvents(input: {
  targetRole: string
  workstreamId?: string | null
  limit?: number
}) {
  const prisma = getPrismaClient()
  const targetRole = input.targetRole.trim().toLowerCase()
  if (!targetRole) throw new Error('targetRole is required')
  const limit = Math.min(Math.max(input.limit ?? 25, 1), 100)

  return prisma.agentCoordinationEvent.findMany({
    where: {
      targetRole,
      ackStatus: 'PENDING',
      ...(input.workstreamId?.trim()
        ? { workstreamId: input.workstreamId.trim() }
        : {}),
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  })
}
