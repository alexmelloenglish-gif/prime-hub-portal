import { createHash } from 'node:crypto'
import type { LessonTranscriptInput } from '@/lib/pipeline/contracts'

export const SHARED_LEARNING_MACHINE_VERSION = 'prime-learning-machine-v1' as const
export const SHARED_LEARNING_MACHINE_CONTRACT_VERSION = 'shared-runner-v1' as const
export const SHARED_LEARNING_MACHINE_EXECUTION_MODE = 'shared_learning_machine' as const

export type SharedLearningMachineTriggerOrigin =
  | 'manual'
  | 'automatic'
  | 'retry'
  | 'resume'

export type LearningMachineStage =
  | 'received'
  | 'prompt_1'
  | 'draft_generation'
  | 'awaiting_identity_review'
  | 'awaiting_teacher_authority'
  | 'canonicalization'
  | 'canonical_verification'
  | 'canonical_projections'
  | 'communication_projection'
  | 'completed'
  | 'failed'

export type SharedLearningMachineExecutionOptions = {
  executionMode: typeof SHARED_LEARNING_MACHINE_EXECUTION_MODE
  normalizedRunIdentity: string
  triggerOrigin: SharedLearningMachineTriggerOrigin
  requestedBy?: string
  machineVersion: typeof SHARED_LEARNING_MACHINE_VERSION
  machineContractVersion: typeof SHARED_LEARNING_MACHINE_CONTRACT_VERSION
}

export const CANONICAL_RESUME_STAGES = [
  'canonicalization',
  'canonical_verification',
  'canonical_projections',
  'communication_projection',
] as const

export type CanonicalResumeStage = (typeof CANONICAL_RESUME_STAGES)[number]

export function canonicalResumeStagesFrom(
  resumePoint: string | null | undefined,
): CanonicalResumeStage[] {
  const index = CANONICAL_RESUME_STAGES.indexOf(resumePoint as CanonicalResumeStage)
  return index >= 0
    ? CANONICAL_RESUME_STAGES.slice(index)
    : [...CANONICAL_RESUME_STAGES]
}

function stableNormalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => stableNormalize(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableNormalize(item)]),
    )
  }
  return value
}

function stableJson(value: unknown) {
  return JSON.stringify(stableNormalize(value))
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function sourceFileId(input: LessonTranscriptInput) {
  return text(input.metadata?.sourceFileId)
}

function explicitSourceHash(input: LessonTranscriptInput) {
  return text(input.metadata?.sourceHash)
    || text(input.metadata?.contentHash)
    || text(input.metadata?.transcriptHash)
}

export function normalizeLearningMachineInput(
  input: LessonTranscriptInput,
): LessonTranscriptInput {
  return {
    ...input,
    studentEmail: input.studentEmail.trim().toLowerCase(),
    studentId: input.studentId?.trim() || undefined,
    lessonId: input.lessonId.trim(),
    transcriptId: input.transcriptId?.trim() || undefined,
    externalMeetingId: input.externalMeetingId?.trim() || undefined,
    source: input.source ?? 'google_meet',
  }
}

export function createNormalizedRunIdentity(input: LessonTranscriptInput) {
  const normalized = normalizeLearningMachineInput(input)
  const sourceRef =
    sourceFileId(normalized)
    || normalized.transcriptId
    || normalized.externalMeetingId
    || normalized.lessonId

  const sourceHash =
    explicitSourceHash(normalized)
    || createHash('sha256').update(normalized.transcript).digest('hex')

  const identityEnvelope = {
    machineVersion: SHARED_LEARNING_MACHINE_VERSION,
    learnerIdentity: normalized.studentId || normalized.studentEmail,
    lessonId: normalized.lessonId,
    source: normalized.source,
    sourceRef,
    sourceHash,
  }

  return `lm:${createHash('sha256').update(stableJson(identityEnvelope)).digest('hex')}`
}

export function buildSharedLearningMachineExecutionOptions(input: {
  transcript: LessonTranscriptInput
  triggerOrigin: SharedLearningMachineTriggerOrigin
  requestedBy?: string
}): SharedLearningMachineExecutionOptions {
  return {
    executionMode: SHARED_LEARNING_MACHINE_EXECUTION_MODE,
    normalizedRunIdentity: createNormalizedRunIdentity(input.transcript),
    triggerOrigin: input.triggerOrigin,
    requestedBy: input.requestedBy,
    machineVersion: SHARED_LEARNING_MACHINE_VERSION,
    machineContractVersion: SHARED_LEARNING_MACHINE_CONTRACT_VERSION,
  }
}
