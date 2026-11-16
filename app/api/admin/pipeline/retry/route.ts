import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { retryFailedPipelineRun } from '@/lib/pipeline/run'
import { isAdminUser } from '@/lib/student-data'
import { rejectCrossOriginMutation } from '@/lib/request-security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function classifyRetryFailure(error: unknown): { code: string; status: number } {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('not found')) return { code: 'pipeline_run_not_found', status: 404 }
  if (
    message.includes('Latest pipeline run changed')
    || message.includes('does not match the preserved pipeline transcript')
    || message.includes('Only the latest failed pipeline run can be retried')
    || message.includes('normalized identity')
    || message.includes('normalized run identity')
    || message.includes('Teacher Authority')
  ) {
    return { code: 'pipeline_retry_conflict', status: 409 }
  }
  if (/provider|Gemini|model generation/i.test(message)) {
    return { code: 'pipeline_provider_unavailable', status: 502 }
  }
  return { code: 'pipeline_retry_failed', status: 500 }
}

export async function POST(request: Request) {
  const originError = rejectCrossOriginMutation(request)
  if (originError) return originError

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return errorResponse('authentication_required', 401)
  }
  if (!isAdminUser(session.user)) {
    return errorResponse('administrator_access_required', 403)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('invalid_json', 400)
  }

  if (!isRecord(body)) {
    return errorResponse('invalid_request_body', 400)
  }

  const pipelineRunId = typeof body.pipelineRunId === 'string'
    ? body.pipelineRunId.trim()
    : ''
  if (!pipelineRunId) {
    return errorResponse('pipelineRunId_required', 400)
  }

  if (body.sourceFileId !== undefined && typeof body.sourceFileId !== 'string') {
    return errorResponse('sourceFileId_must_be_a_string', 400)
  }

  const sourceFileId = typeof body.sourceFileId === 'string'
    ? body.sourceFileId.trim()
    : ''

  try {
    const result = await retryFailedPipelineRun({
      sourceFileId: sourceFileId || undefined,
      expectedPipelineRunId: pipelineRunId,
      requestedBy: session.user.email || session.user.id || 'admin',
    })
    return NextResponse.json(result)
  } catch (error) {
    const classified = classifyRetryFailure(error)
    console.error(JSON.stringify({
      event: 'pipeline_retry_failed',
      errorCode: classified.code,
      status: classified.status,
      errorName: error instanceof Error ? error.name : 'UnknownError',
    }))
    return errorResponse(classified.code, classified.status)
  }
}
