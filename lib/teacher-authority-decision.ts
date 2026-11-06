import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import {
  canonicalAuthorityDraftHash,
  type CanonicalAuthorityDraft,
} from '@/lib/canonicalization'

export type TeacherAuthorityDecision = 'approved' | 'rejected'

export class TeacherAuthorityDecisionError extends Error {
  constructor(
    public readonly code:
      | 'REVIEWER_NOT_AUTHORIZED'
      | 'TASK_NOT_FOUND'
      | 'TASK_NOT_CANONICAL_AUTHORITY'
      | 'TASK_PAYLOAD_INVALID'
      | 'TASK_ALREADY_DECIDED'
  ) {
    super(code)
    this.name = 'TeacherAuthorityDecisionError'
  }
}

function asRecord(value: Prisma.JsonValue | null): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

/**
 * Persist the human Teacher Authority decision against the exact immutable
 * payload presented in the review task. Repeated identical submissions are
 * idempotent; a different second decision is rejected.
 */
export async function recordTeacherAuthorityDecision(input: {
  taskId: string
  reviewerId: string
  decision: TeacherAuthorityDecision
  reason?: string
  decidedAt?: Date
}) {
  const prisma = getPrismaClient()
  const taskId = input.taskId.trim()
  const reviewerId = input.reviewerId.trim()
  if (!taskId || !reviewerId) {
    throw new TeacherAuthorityDecisionError('TASK_NOT_FOUND')
  }
  if (input.decision === 'rejected' && !input.reason?.trim()) {
    throw new TeacherAuthorityDecisionError('TASK_PAYLOAD_INVALID')
  }

  const decidedAt = input.decidedAt ?? new Date()
  return prisma.$transaction(async (tx) => {
    const [reviewer, task] = await Promise.all([
      tx.user.findUnique({
        where: { id: reviewerId },
        select: { id: true, role: true },
      }),
      tx.validationTask.findUnique({ where: { id: taskId } }),
    ])

    if (!reviewer || !['teacher', 'admin'].includes(reviewer.role)) {
      throw new TeacherAuthorityDecisionError('REVIEWER_NOT_AUTHORIZED')
    }
    if (!task) throw new TeacherAuthorityDecisionError('TASK_NOT_FOUND')
    if (task.type !== 'canonical_learning_record_authority') {
      throw new TeacherAuthorityDecisionError('TASK_NOT_CANONICAL_AUTHORITY')
    }

    const suggestedValue = task.suggestedValue
    const evidence = asRecord(task.evidence)
    const expectedHash = typeof evidence.authorityPayloadHash === 'string'
      ? evidence.authorityPayloadHash
      : ''
    if (
      !suggestedValue
      || typeof suggestedValue !== 'object'
      || Array.isArray(suggestedValue)
      || !expectedHash
      || canonicalAuthorityDraftHash(suggestedValue as unknown as CanonicalAuthorityDraft) !== expectedHash
    ) {
      throw new TeacherAuthorityDecisionError('TASK_PAYLOAD_INVALID')
    }

    if (task.status !== 'pending') {
      if (
        task.status === input.decision
        && task.decision === input.decision
        && task.reviewerId === reviewer.id
      ) {
        return { task, idempotentReplay: true, reviewerRole: reviewer.role }
      }
      throw new TeacherAuthorityDecisionError('TASK_ALREADY_DECIDED')
    }

    const update = await tx.validationTask.updateMany({
      where: { id: task.id, status: 'pending', decision: null },
      data: {
        status: input.decision,
        decision: input.decision,
        reviewerId: reviewer.id,
        reviewedAt: decidedAt,
        reason: input.reason?.trim() || null,
      },
    })
    if (update.count !== 1) {
      throw new TeacherAuthorityDecisionError('TASK_ALREADY_DECIDED')
    }

    if (task.entityType === 'PipelineRun') {
      await tx.pipelineEvent.upsert({
        where: {
          pipelineRunId_eventType_aggregateId: {
            pipelineRunId: task.entityId,
            eventType: 'TeacherAuthorityDecisionRecorded',
            aggregateId: task.id,
          },
        },
        update: {
          payload: {
            validationTaskId: task.id,
            reviewerId: reviewer.id,
            reviewerRole: reviewer.role,
            decision: input.decision,
            decisionTimestamp: decidedAt.toISOString(),
            authorityPayloadHash: expectedHash,
            reason: input.reason?.trim() || null,
          },
        },
        create: {
          pipelineRunId: task.entityId,
          eventType: 'TeacherAuthorityDecisionRecorded',
          aggregateType: 'ValidationTask',
          aggregateId: task.id,
          payload: {
            validationTaskId: task.id,
            reviewerId: reviewer.id,
            reviewerRole: reviewer.role,
            decision: input.decision,
            decisionTimestamp: decidedAt.toISOString(),
            authorityPayloadHash: expectedHash,
            reason: input.reason?.trim() || null,
          },
        },
      })
    }

    const saved = await tx.validationTask.findUniqueOrThrow({ where: { id: task.id } })
    return { task: saved, idempotentReplay: false, reviewerRole: reviewer.role }
  })
}
