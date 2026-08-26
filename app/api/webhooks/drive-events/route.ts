import { OAuth2Client } from 'google-auth-library'
import { NextResponse } from 'next/server'
import { reconcileDriveTranscripts } from '@/lib/drive-reconciliation'

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

type PubSubEnvelope = {
  message?: {
    data?: string
    messageId?: string
    attributes?: Record<string, string>
  }
  subscription?: string
}

function decodeEventType(envelope: PubSubEnvelope): string | undefined {
  const encoded = envelope.message?.data
  if (!encoded) return undefined

  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8')
    const event = JSON.parse(decoded) as { type?: string }
    return event.type
  } catch {
    return undefined
  }
}

export async function POST(request: Request) {
  if (!(await verifyPubSubPush(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let envelope: PubSubEnvelope = {}
  try {
    envelope = (await request.json()) as PubSubEnvelope
  } catch {
    return NextResponse.json({ error: 'Invalid Pub/Sub envelope' }, { status: 400 })
  }

  const eventType = decodeEventType(envelope)
  const messageId = envelope.message?.messageId

  try {
    const result = await reconcileDriveTranscripts()
    console.log(
      JSON.stringify({
        event: 'drive_event_reconciliation_completed',
        eventType: eventType || 'unknown',
        messageId: messageId || 'unknown',
        scanned: result.scanned,
        submitted: result.submitted,
        alreadyIngested: result.alreadyIngested,
        quarantined: result.quarantined,
      })
    )
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const code = error instanceof Error
      ? error.message.replace(/[^a-zA-Z0-9_ -]/g, '').slice(0, 80) || 'unknown_error'
      : 'unknown_error'
    console.error(
      JSON.stringify({
        event: 'drive_event_reconciliation_failed',
        eventType: eventType || 'unknown',
        messageId: messageId || 'unknown',
        code,
      })
    )
    return NextResponse.json({ error: 'drive_event_reconciliation_failed' }, { status: 500 })
  }
}
