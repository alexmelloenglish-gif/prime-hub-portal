import { timingSafeEqual } from 'node:crypto'

const HEADER = 'x-prime-agent-bus-secret'

export function isAgentBusAuthorized(request: Request) {
  const expected = process.env.PRIME_AGENT_BUS_SECRET
  if (!expected) return process.env.NODE_ENV !== 'production'

  const actual = request.headers.get(HEADER)
  if (!actual) return false

  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(actual)
  if (expectedBuffer.length !== actualBuffer.length) return false
  return timingSafeEqual(expectedBuffer, actualBuffer)
}
