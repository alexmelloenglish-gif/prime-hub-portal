import { NextResponse } from 'next/server'
import { parseTranscriptPayload, processLessonTranscript } from '@/lib/pipeline/run'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isAuthorized(request: Request): boolean {
  const expected = process.env.PRIME_PIPELINE_INGEST_SECRET
  if (!expected) return process.env.NODE_ENV !== 'production'
  return request.headers.get('x-prime-pipeline-secret') === expected
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const payload = parseTranscriptPayload(await request.json())
    const result = await processLessonTranscript(payload)
    return NextResponse.json(result, { status: result.duplicate ? 200 : 202 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid pipeline request'
    const isClientContractError = message.includes('required') || message.includes('Invalid JSON') || message.includes('Drive-origin') || message.includes('Only Google Docs') || message.includes('triageStatus=usable_transcript')
    const status = isClientContractError ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
