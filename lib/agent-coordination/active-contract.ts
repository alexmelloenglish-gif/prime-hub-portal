export const DEFAULT_AGENT_COORDINATION_LEASE_SECONDS = 300

export function normalizeCoordinationWorkerId(value: unknown, field = 'workerId') {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`)
  }
  return value.trim().toLowerCase()
}

export function normalizeCoordinationLeaseSeconds(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_AGENT_COORDINATION_LEASE_SECONDS
  }
  const seconds = Number(value)
  if (!Number.isInteger(seconds) || seconds < 30 || seconds > 3600) {
    throw new Error('leaseSeconds must be an integer between 30 and 3600')
  }
  return seconds
}

export function coordinationLeaseDeadline(now: Date, leaseSeconds: number) {
  return new Date(now.getTime() + leaseSeconds * 1000)
}

export function isCoordinationLeaseAvailable(input: {
  ackStatus: string
  leaseExpiresAt: Date | null
  now: Date
}) {
  return input.ackStatus === 'PENDING'
    && (!input.leaseExpiresAt || input.leaseExpiresAt.getTime() <= input.now.getTime())
}

export type AgentWakeTarget = {
  url: string
}

function parseWakeTargets(raw: string | undefined): Record<string, AgentWakeTarget> {
  if (!raw?.trim()) return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('PRIME_AGENT_WAKE_URLS_JSON must be valid JSON')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('PRIME_AGENT_WAKE_URLS_JSON must be a role-to-URL object')
  }

  const result: Record<string, AgentWakeTarget> = {}
  for (const [role, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Wake target for ${role} must be a URL string`)
    }
    const url = new URL(value)
    if (url.protocol !== 'https:') {
      throw new Error(`Wake target for ${role} must use https`)
    }
    result[role.trim().toLowerCase()] = { url: url.toString() }
  }
  return result
}

export function resolveAgentWakeTarget(
  targetRole: string,
  raw = process.env.PRIME_AGENT_WAKE_URLS_JSON,
) {
  const role = normalizeCoordinationWorkerId(targetRole, 'targetRole')
  return parseWakeTargets(raw)[role] ?? null
}
