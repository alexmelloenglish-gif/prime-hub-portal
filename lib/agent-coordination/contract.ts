import { createHash } from 'node:crypto'

export const AGENT_COORDINATION_EVENT_TYPES = [
  'CANDIDATE_SHA_PUBLISHED',
  'VALIDATION_REQUESTED',
  'VALIDATION_ACKNOWLEDGED',
  'VALIDATION_PASSED',
  'VALIDATION_BLOCKED',
  'CORRECTION_REQUESTED',
] as const

export const AGENT_COORDINATION_ACK_STATUSES = [
  'PENDING',
  'ACKNOWLEDGED',
  'SUPERSEDED',
] as const

export type AgentCoordinationEventType =
  (typeof AGENT_COORDINATION_EVENT_TYPES)[number]

export type AgentCoordinationAckStatus =
  (typeof AGENT_COORDINATION_ACK_STATUSES)[number]

export type AgentCoordinationEventInput = {
  workstreamId: string
  senderRole: string
  targetRole: string
  eventType: AgentCoordinationEventType
  repo: string
  issueNumber?: number | null
  prNumber?: number | null
  sha?: string | null
  githubCommentUrl?: string | null
  sourceDeliveryId: string
  requiresAck?: boolean
  payload?: Record<string, unknown> | null
}

export type NormalizedAgentCoordinationEvent = {
  workstreamId: string
  senderRole: string
  targetRole: string
  eventType: AgentCoordinationEventType
  repo: string
  issueNumber: number | null
  prNumber: number | null
  sha: string | null
  githubCommentUrl: string | null
  sourceDeliveryId: string
  requiresAck: boolean
  payload: Record<string, unknown> | null
  idempotencyKey: string
}

function requireText(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`)
  }
  return value.trim()
}

function optionalPositiveInteger(value: unknown, field: string) {
  if (value === undefined || value === null) return null
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new Error(`${field} must be a positive integer when provided`)
  }
  return Number(value)
}

function optionalSha(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  const sha = requireText(value, 'sha').toLowerCase()
  if (!/^[0-9a-f]{7,64}$/.test(sha)) {
    throw new Error('sha must be a hexadecimal Git commit hash')
  }
  return sha
}

function optionalGitHubUrl(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  const url = requireText(value, 'githubCommentUrl')
  if (!/^https:\/\/github\.com\//i.test(url)) {
    throw new Error('githubCommentUrl must point to github.com')
  }
  return url
}

function normalizePayload(value: unknown) {
  if (value === undefined || value === null) return null
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('payload must be an object when provided')
  }
  const payload = value as Record<string, unknown>
  const encoded = JSON.stringify(payload)
  if (encoded.length > 16_384) {
    throw new Error('payload exceeds the Phase 1 routing-metadata limit')
  }
  return payload
}

export function createAgentCoordinationIdempotencyKey(input: {
  repo: string
  sourceDeliveryId: string
  eventType: AgentCoordinationEventType
  targetRole: string
  sha: string | null
}) {
  const identity = [
    input.repo.trim().toLowerCase(),
    input.sourceDeliveryId.trim(),
    input.eventType,
    input.targetRole.trim().toLowerCase(),
    input.sha ?? 'no-sha',
  ].join('|')

  return `ace:${createHash('sha256').update(identity).digest('hex')}`
}

export function normalizeAgentCoordinationEvent(
  input: AgentCoordinationEventInput,
): NormalizedAgentCoordinationEvent {
  const eventType = requireText(input.eventType, 'eventType') as AgentCoordinationEventType
  if (!AGENT_COORDINATION_EVENT_TYPES.includes(eventType)) {
    throw new Error(`Unsupported Phase 1 event type: ${eventType}`)
  }

  const issueNumber = optionalPositiveInteger(input.issueNumber, 'issueNumber')
  const prNumber = optionalPositiveInteger(input.prNumber, 'prNumber')
  if (!issueNumber && !prNumber) {
    throw new Error('At least one GitHub issueNumber or prNumber is required')
  }

  const repo = requireText(input.repo, 'repo').toLowerCase()
  if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    throw new Error('repo must use owner/name format')
  }

  const normalized = {
    workstreamId: requireText(input.workstreamId, 'workstreamId'),
    senderRole: requireText(input.senderRole, 'senderRole').toLowerCase(),
    targetRole: requireText(input.targetRole, 'targetRole').toLowerCase(),
    eventType,
    repo,
    issueNumber,
    prNumber,
    sha: optionalSha(input.sha),
    githubCommentUrl: optionalGitHubUrl(input.githubCommentUrl),
    sourceDeliveryId: requireText(input.sourceDeliveryId, 'sourceDeliveryId'),
    requiresAck: input.requiresAck ?? true,
    payload: normalizePayload(input.payload),
  }

  return {
    ...normalized,
    idempotencyKey: createAgentCoordinationIdempotencyKey(normalized),
  }
}

export function normalizeAckStatus(value: unknown): Exclude<AgentCoordinationAckStatus, 'PENDING'> {
  if (value === 'ACKNOWLEDGED' || value === 'SUPERSEDED') return value
  throw new Error('ackStatus must be ACKNOWLEDGED or SUPERSEDED')
}

export function canApplyAckTransition(
  current: AgentCoordinationAckStatus,
  requested: Exclude<AgentCoordinationAckStatus, 'PENDING'>,
) {
  return current === 'PENDING' || current === requested
}
