import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import {
  canApplyAckTransition,
  normalizeAckStatus,
  normalizeAgentCoordinationEvent,
  type AgentCoordinationAckStatus,
  type AgentCoordinationEventInput,
} from '@/lib/agent-coordination/contract'
import {
  coordinationLeaseDeadline,
  normalizeCoordinationLeaseSeconds,
  normalizeCoordinationWorkerId,
} from '@/lib/agent-coordination/active-contract'

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
      claimedBy: null,
      claimedAt: null,
      leaseExpiresAt: null,
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


export async function claimNextAgentCoordinationEvent(input: {
  targetRole: string
  claimedBy: string
  workstreamId?: string | null
  leaseSeconds?: number
}) {
  const prisma = getPrismaClient()
  const targetRole = normalizeCoordinationWorkerId(input.targetRole, 'targetRole')
  const claimedBy = normalizeCoordinationWorkerId(input.claimedBy, 'claimedBy')
  const leaseSeconds = normalizeCoordinationLeaseSeconds(input.leaseSeconds)
  const workstreamId = input.workstreamId?.trim() || undefined

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const now = new Date()
    const candidate = await prisma.agentCoordinationEvent.findFirst({
      where: {
        targetRole,
        ackStatus: 'PENDING',
        ...(workstreamId ? { workstreamId } : {}),
        OR: [
          { leaseExpiresAt: null },
          { leaseExpiresAt: { lte: now } },
        ],
      },
      orderBy: { createdAt: 'asc' },
    })

    if (!candidate) return null

    const leaseExpiresAt = coordinationLeaseDeadline(now, leaseSeconds)
    const claimed = await prisma.agentCoordinationEvent.updateMany({
      where: {
        id: candidate.id,
        ackStatus: 'PENDING',
        OR: [
          { leaseExpiresAt: null },
          { leaseExpiresAt: { lte: now } },
        ],
      },
      data: {
        claimedBy,
        claimedAt: now,
        leaseExpiresAt,
        dispatchAttempts: { increment: 1 },
        lastDispatchError: null,
      },
    })

    if (claimed.count === 1) {
      return prisma.agentCoordinationEvent.findUniqueOrThrow({
        where: { id: candidate.id },
      })
    }
  }

  return null
}

export async function releaseAgentCoordinationLease(input: {
  eventId: string
  claimedBy: string
  dispatchError?: string | null
}) {
  const prisma = getPrismaClient()
  const eventId = input.eventId.trim()
  const claimedBy = normalizeCoordinationWorkerId(input.claimedBy, 'claimedBy')
  if (!eventId) throw new Error('eventId is required')

  const released = await prisma.agentCoordinationEvent.updateMany({
    where: {
      id: eventId,
      ackStatus: 'PENDING',
      claimedBy,
    },
    data: {
      claimedBy: null,
      claimedAt: null,
      leaseExpiresAt: null,
      lastDispatchAt: new Date(),
      lastDispatchError: input.dispatchError?.slice(0, 4000) || null,
    },
  })

  return released.count === 1
}

export async function markAgentCoordinationDispatched(input: {
  eventId: string
  claimedBy: string
}) {
  const prisma = getPrismaClient()
  const eventId = input.eventId.trim()
  const claimedBy = normalizeCoordinationWorkerId(input.claimedBy, 'claimedBy')
  if (!eventId) throw new Error('eventId is required')

  const updated = await prisma.agentCoordinationEvent.updateMany({
    where: {
      id: eventId,
      ackStatus: 'PENDING',
      claimedBy,
    },
    data: {
      lastDispatchAt: new Date(),
      lastDispatchError: null,
    },
  })

  return updated.count === 1
}
