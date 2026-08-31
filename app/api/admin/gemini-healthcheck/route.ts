import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EXPECTED_RESPONSE = 'PRIME_GEMINI_HEALTHCHECK_OK'
const DEFAULT_MODEL = 'gemini-3.7-flash'

function sanitizeErrorMessage(value: unknown) {
  const message = typeof value === 'string' ? value : 'Gemini request failed'
  return message.replace(/[^a-zA-Z0-9_ .:/-]/g, '').slice(0, 200) || 'Gemini request failed'
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ ok: false, errorCode: 'UNAUTHENTICATED' }, { status: 401 })
  }

  if (!isAdminUser(session.user)) {
    return NextResponse.json({ ok: false, errorCode: 'ADMIN_ACCESS_REQUIRED' }, { status: 403 })
  }

  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY?.trim()
  const model = process.env.PRIME_PIPELINE_MODEL || DEFAULT_MODEL

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        provider: 'gemini',
        model,
        httpStatus: null,
        keyPresent: false,
        errorCode: 'MISSING_GOOGLE_AI_STUDIO_API_KEY',
        errorMessage: 'GOOGLE_AI_STUDIO_API_KEY is not configured',
      },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Return exactly: ${EXPECTED_RESPONSE}` }] }],
          generationConfig: { temperature: 0 },
        }),
        cache: 'no-store',
      },
    )

    const payload = (await response.json().catch(() => ({}))) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      error?: { code?: string | number; message?: string; status?: string }
    }
    const responseText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || ''

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          provider: 'gemini',
          model,
          httpStatus: response.status,
          keyPresent: true,
          errorCode: payload.error?.status || payload.error?.code || `HTTP_${response.status}`,
          errorMessage: sanitizeErrorMessage(payload.error?.message || response.statusText),
        },
        { status: 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      provider: 'gemini',
      model,
      httpStatus: response.status,
      keyPresent: true,
      responseMatchedExpected: responseText === EXPECTED_RESPONSE,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: 'gemini',
        model,
        httpStatus: null,
        keyPresent: true,
        errorCode: 'GEMINI_REQUEST_ERROR',
        errorMessage: sanitizeErrorMessage(error instanceof Error ? error.message : undefined),
      },
      { status: 502 },
    )
  }
}
