import { OAuth2Client } from 'google-auth-library'
import { NextResponse } from 'next/server'
import { PIPELINE_AUTOMATION_FROZEN } from '@/lib/pipeline-freeze'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const authClient = new OAuth2Client()

function getBearerToken(request: Request): string | null {
  const value = request.headers.get('authorization')
  if (!value?.startsWith('Bearer ')) return null
  return value.slice('Bearer '.length).trim() || null
}

async function verifyPubSubPush(request: Request): Promise<boolean> {
  const expectedAudience = process.env.DRIVE_EVENTS_PUBSUB_AUDIENCE?.trim()
  const expectedServiceAccount = process.env.DRIVE_EVENTS_PUBSUB_SERVICE_ACCOUNT?.trim()
  const token = getBearerToken(request)

  if (!expectedAudience || !expectedServiceAccount || !token) return false

  try {
    const ticket = await authClient.verifyIdToken({
      idToken: token,
      audience: expectedAudience,
    })
    const payload = ticket.getPayload()
    return Boolean(
      payload?.email === expectedServiceAccount &&
      payload.email_verified === true &&
      (payload.iss === 'https://accounts.google.com' || payload.iss === 'accounts.google.com')
    )
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!(await verifyPubSubPush(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (PIPELINE_AUTOMATION_FROZEN) {
    // Acknowledge authenticated Pub/Sub delivery so the provider does not
    // create a retry storm while PRIME's legacy automation is intentionally frozen.
    console.warn(JSON.stringify({ event: 'drive_event_acknowledged_while_pipeline_frozen' }))
    return new NextResponse(null, { status: 204 })
  }

  return NextResponse.json({ error: 'Drive event processing is unavailable.' }, { status: 503 })
}
