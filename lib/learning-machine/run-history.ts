import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import type {
  LearningMachineStage,
  SharedLearningMachineExecutionOptions,
} from '@/lib/learning-machine/shared-run-contract'

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

export async function recordLearningMachineTrigger(
  pipelineRunId: string,
  options: SharedLearningMachineExecutionOptions,
) {
  const prisma = getPrismaClient()
  const aggregateId = `${options.normalizedRunIdentity}:${options.triggerOrigin}`

  await prisma.pipelineEvent.upsert({
    where: {
      pipelineRunId_eventType_aggregateId: {
        pipelineRunId,
        eventType: 'LearningMachineTriggerReceived',
        aggregateId,
      },
    },
    update: {
      payload: {
        normalizedRunIdentity: options.normalizedRunIdentity,
        triggerOrigin: options.triggerOrigin,
        requestedBy: options.requestedBy ?? null,
        machineVersion: options.machineVersion,
        machineContractVersion: options.machineContractVersion,
      },
    },
    create: {
      pipelineRunId,
      eventType: 'LearningMachineTriggerReceived',
      aggregateType: 'LearningMachineRun',
      aggregateId,
      payload: {
        normalizedRunIdentity: options.normalizedRunIdentity,
        triggerOrigin: options.triggerOrigin,
        requestedBy: options.requestedBy ?? null,
        machineVersion: options.machineVersion,
        machineContractVersion: options.machineContractVersion,
      },
    },
  })
}

export async function checkpointLearningMachine(input: {
  pipelineRunId: string
  stage: LearningMachineStage
  status?: string
  resumePoint?: LearningMachineStage | null
  payload?: Record<string, unknown>
}) {
  const prisma = getPrismaClient()
  const now = new Date().toISOString()

  await prisma.$transaction([
    prisma.pipelineRun.update({
      where: { id: input.pipelineRunId },
      data: {
        ...(input.status ? { status: input.status } : {}),
        currentStage: input.stage,
        resumePoint: input.resumePoint ?? null,
      },
    }),
    prisma.pipelineEvent.upsert({
      where: {
        pipelineRunId_eventType_aggregateId: {
          pipelineRunId: input.pipelineRunId,
          eventType: 'LearningMachineCheckpoint',
          aggregateId: input.stage,
        },
      },
      update: {
        payload: {
          stage: input.stage,
          status: input.status ?? null,
          resumePoint: input.resumePoint ?? null,
          checkpointedAt: now,
          ...(input.payload ?? {}),
        },
      },
      create: {
        pipelineRunId: input.pipelineRunId,
        eventType: 'LearningMachineCheckpoint',
        aggregateType: 'LearningMachineRun',
        aggregateId: input.stage,
        payload: {
          stage: input.stage,
          status: input.status ?? null,
          resumePoint: input.resumePoint ?? null,
          checkpointedAt: now,
          ...(input.payload ?? {}),
        },
      },
    }),
  ])
}

export async function persistLearningMachineManifest(input: {
  pipelineRunId: string
  manifest: Record<string, unknown>
  status: string
  completed: boolean
}) {
  const prisma = getPrismaClient()
  const completedAt = input.completed ? new Date() : null

  await prisma.$transaction([
    prisma.pipelineRun.update({
      where: { id: input.pipelineRunId },
      data: {
        status: input.status,
        currentStage: input.completed ? 'completed' : undefined,
        resumePoint: input.completed ? null : undefined,
        finalManifest: asJson(input.manifest),
        completedAt,
      },
    }),
    prisma.pipelineEvent.upsert({
      where: {
        pipelineRunId_eventType_aggregateId: {
          pipelineRunId: input.pipelineRunId,
          eventType: 'LearningMachineManifestPersisted',
          aggregateId: input.pipelineRunId,
        },
      },
      update: {
        payload: asJson(input.manifest),
      },
      create: {
        pipelineRunId: input.pipelineRunId,
        eventType: 'LearningMachineManifestPersisted',
        aggregateType: 'LearningMachineRun',
        aggregateId: input.pipelineRunId,
        payload: asJson(input.manifest),
      },
    }),
  ])
}

export async function listLearningMachineTriggerOrigins(pipelineRunId: string) {
  const prisma = getPrismaClient()
  const events = await prisma.pipelineEvent.findMany({
    where: {
      pipelineRunId,
      eventType: 'LearningMachineTriggerReceived',
    },
    orderBy: { createdAt: 'asc' },
    select: { payload: true },
  })

  return Array.from(new Set(events.flatMap((event) => {
    const payload = event.payload
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return []
    const origin = (payload as Record<string, unknown>).triggerOrigin
    return typeof origin === 'string' ? [origin] : []
  })))
}
