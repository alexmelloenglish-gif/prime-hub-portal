import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { getPrismaClient } from '@/lib/prisma'

type SubmissionPayload = {
  mimeType?: string
  audioBase64?: string
}

function parseRange(rangeHeader: string | null, size: number) {
  if (!rangeHeader?.startsWith('bytes=')) return null

  const [rawStart, rawEnd] = rangeHeader.slice('bytes='.length).split('-', 2)
  let start = rawStart ? Number(rawStart) : NaN
  let end = rawEnd ? Number(rawEnd) : NaN

  if (!rawStart && rawEnd) {
    const suffixLength = Number(rawEnd)
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null
    start = Math.max(size - suffixLength, 0)
    end = size - 1
  } else {
    if (!Number.isFinite(start) || start < 0) return null
    if (!Number.isFinite(end)) end = size - 1
  }

  if (start >= size || end < start) return { invalid: true as const }
  end = Math.min(end, size - 1)
  return { invalid: false as const, start, end }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdminUser(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

  const bytes = Buffer.from(payload.audioBase64, 'base64')
  const size = bytes.length
  const range = parseRange(request.headers.get('range'), size)

  const commonHeaders = {
    'Content-Type': payload.mimeType,
    'Cache-Control': 'private, no-store',
    'Accept-Ranges': 'bytes',
    'Content-Disposition': `inline; filename="learner-submission-${id}.webm"`,
    'X-Content-Type-Options': 'nosniff',
  }

  if (range?.invalid) {
    return new Response(null, {
      status: 416,
      headers: {
        ...commonHeaders,
        'Content-Range': `bytes */${size}`,
      },
    })
  }

  if (range && !range.invalid) {
    const chunk = bytes.subarray(range.start, range.end + 1)
    return new Response(chunk, {
      status: 206,
      headers: {
        ...commonHeaders,
        'Content-Length': String(chunk.length),
        'Content-Range': `bytes ${range.start}-${range.end}/${size}`,
      },
    })
  }

  return new Response(bytes, {
    status: 200,
    headers: {
      ...commonHeaders,
      'Content-Length': String(size),
    },
  })
}
