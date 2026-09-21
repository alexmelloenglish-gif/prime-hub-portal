import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { getPrismaClient } from '@/lib/prisma'

type SubmissionPayload = {
  mimeType?: string
  audioBase64?: string
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdminUser(session.user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const prisma = getPrismaClient()
  const event = await prisma.pipelineEvent.findUnique({ where: { id } })
  if (!event || event.aggregateType !== 'learner_action_submission' || event.eventType !== 'learner_audio_submitted') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const payload = event.payload as SubmissionPayload
  if (!payload.audioBase64 || !payload.mimeType?.startsWith('audio/')) {
    return NextResponse.json({ error: 'Audio unavailable' }, { status: 404 })
  }

  return new Response(Buffer.from(payload.audioBase64, 'base64'), {
    headers: { 'Content-Type': payload.mimeType, 'Cache-Control': 'private, no-store' },
  })
}
