export const PRODUCTION_WITNESS_TARGET_ROLE = 'validator'
export const PRODUCTION_WITNESS_KIND = 'production-coordination-witness-v1'
export const PRODUCTION_WITNESS_ACKNOWLEDGED_BY = 'production-witness-validator'
export const PRODUCTION_WITNESS_REPO = 'alexmelloenglish-gif/prime-hub-portal'
export const PRODUCTION_WITNESS_ISSUE = 58
export const PRODUCTION_WITNESS_WORKSTREAM_PREFIX = 'production-activation:wake-witness:'

type JsonRecord = Record<string, unknown>

type PersistedCoordinationEvent = {
  id: string
  workstreamId: string
  senderRole: string
  targetRole: string
  eventType: string
  repo: string
  issueNumber: number | null
  prNumber: number | null
  sha: string | null
  githubCommentUrl: string | null
  payloadJson: unknown
}

function asRecord(value: unknown, field: string): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${field} must be an object`)
  }
  return value as JsonRecord
}

function requireText(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`)
  }
  return value.trim()
}

function requireIssue58Pointer(value: string) {
  const url = new URL(value)
  if (
    url.protocol !== 'https:'
    || url.hostname !== 'github.com'
    || !url.pathname.startsWith('/alexmelloenglish-gif/prime-hub-portal/issues/58')
  ) {
    throw new Error('githubCommentUrl must point to Issue #58')
  }
}

export function validateProductionWitnessWake(input: {
  body: JsonRecord
  event: PersistedCoordinationEvent
  deployedSha: string | undefined
}) {
  const deployedSha = requireText(input.deployedSha, 'VERCEL_GIT_COMMIT_SHA').toLowerCase()
  if (!/^[0-9a-f]{40}$/.test(deployedSha)) {
    throw new Error('VERCEL_GIT_COMMIT_SHA must be a full Git SHA')
  }

  const body = input.body
  const event = input.event
  const coordinationEventId = requireText(body.coordinationEventId, 'coordinationEventId')
  const workstreamId = requireText(body.workstreamId, 'workstreamId')
  const senderRole = requireText(body.senderRole, 'senderRole').toLowerCase()
  const targetRole = requireText(body.targetRole, 'targetRole').toLowerCase()
  const eventType = requireText(body.eventType, 'eventType')
  const repo = requireText(body.repo, 'repo').toLowerCase()
  const sha = requireText(body.sha, 'sha').toLowerCase()
  const githubCommentUrl = requireText(body.githubCommentUrl, 'githubCommentUrl')
  const payload = asRecord(body.payload, 'payload')
  const persistedPayload = asRecord(event.payloadJson, 'persisted payload')

  if (coordinationEventId !== event.id) throw new Error('Wake event ID does not match persisted event')
  if (workstreamId !== event.workstreamId) throw new Error('Wake workstream does not match persisted event')
  if (senderRole !== event.senderRole.toLowerCase()) throw new Error('Wake senderRole does not match persisted event')
  if (targetRole !== event.targetRole.toLowerCase()) throw new Error('Wake targetRole does not match persisted event')
  if (eventType !== event.eventType) throw new Error('Wake eventType does not match persisted event')
  if (repo !== event.repo.toLowerCase()) throw new Error('Wake repo does not match persisted event')
  if (sha !== event.sha?.toLowerCase()) throw new Error('Wake SHA does not match persisted event')
  if (githubCommentUrl !== event.githubCommentUrl) throw new Error('Wake GitHub pointer does not match persisted event')

  if (targetRole !== PRODUCTION_WITNESS_TARGET_ROLE) {
    throw new Error('Production witness receiver only accepts the validator role')
  }
  if (eventType !== 'VALIDATION_REQUESTED') {
    throw new Error('Production witness receiver only accepts VALIDATION_REQUESTED')
  }
  if (repo !== PRODUCTION_WITNESS_REPO) {
    throw new Error('Production witness receiver only accepts the PRIME repository')
  }
  if (event.issueNumber !== PRODUCTION_WITNESS_ISSUE || body.issueNumber !== PRODUCTION_WITNESS_ISSUE) {
    throw new Error('Production witness receiver only accepts Issue #58 evidence')
  }
  if (!workstreamId.startsWith(PRODUCTION_WITNESS_WORKSTREAM_PREFIX)) {
    throw new Error('Production witness workstream is outside the allowed prefix')
  }

  requireIssue58Pointer(githubCommentUrl)

  if (sha !== deployedSha) {
    throw new Error('Production witness SHA must equal the executing Vercel deployment SHA')
  }
  if (
    payload.witnessKind !== PRODUCTION_WITNESS_KIND
    || persistedPayload.witnessKind !== PRODUCTION_WITNESS_KIND
  ) {
    throw new Error('Production witness marker is missing or invalid')
  }
  if (
    payload.expectedSha !== deployedSha
    || persistedPayload.expectedSha !== deployedSha
  ) {
    throw new Error('Production witness expectedSha must equal the executing deployment SHA')
  }

  return {
    coordinationEventId,
    deployedSha,
    workstreamId,
  }
}
