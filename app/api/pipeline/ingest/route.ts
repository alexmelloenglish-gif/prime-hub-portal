import { NextResponse } from 'next/server'
import { PIPELINE_AUTOMATION_FROZEN, pipelineFreezePayload } from '@/lib/pipeline-freeze'

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

  if (PIPELINE_AUTOMATION_FROZEN) {
    console.warn(JSON.stringify({ event: 'pipeline_ingest_blocked', code: 'PIPELINE_AUTOMATION_FROZEN' }))
    return NextResponse.json(pipelineFreezePayload('pipeline-ingest'), { status: 503 })
  }

  return NextResponse.json({ error: 'Pipeline ingestion is unavailable.' }, { status: 503 })
}
