import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  generateStructuredJson,
  ModelGenerationError,
} from '../../lib/pipeline/model-provider.ts'

const envKeys = [
  'PRIME_MODEL_PROVIDER_ORDER',
  'GOOGLE_AI_STUDIO_API_KEY',
  'PRIME_GEMINI_MODEL',
  'OPENAI_API_KEY',
  'PRIME_OPENAI_MODEL',
  'PRIME_OPENAI_BASE_URL',
  'PERPLEXITY_API_KEY',
  'PRIME_PERPLEXITY_MODEL',
  'PRIME_PERPLEXITY_BASE_URL',
  'PRIME_META_API_KEY',
  'PRIME_META_MODEL',
  'PRIME_META_BASE_URL',
] as const

function snapshotEnvironment() {
  return Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))
}

function restoreEnvironment(snapshot: Record<string, string | undefined>) {
  for (const key of envKeys) {
    const value = snapshot[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
}

function configureSyntheticProviderPool(order: string) {
  process.env.PRIME_MODEL_PROVIDER_ORDER = order
  process.env.GOOGLE_AI_STUDIO_API_KEY = 'synthetic-gemini-key'
  process.env.PRIME_GEMINI_MODEL = 'synthetic-gemini-model'
  process.env.OPENAI_API_KEY = 'synthetic-openai-key'
  process.env.PRIME_OPENAI_MODEL = 'synthetic-openai-model'
  process.env.PRIME_OPENAI_BASE_URL = 'https://openai.synthetic.invalid/v1'
  process.env.PERPLEXITY_API_KEY = 'synthetic-perplexity-key'
  process.env.PRIME_PERPLEXITY_MODEL = 'synthetic-perplexity-model'
  process.env.PRIME_PERPLEXITY_BASE_URL = 'https://perplexity.synthetic.invalid/v1'
  process.env.PRIME_META_API_KEY = 'synthetic-meta-key'
  process.env.PRIME_META_MODEL = 'synthetic-meta-model'
  process.env.PRIME_META_BASE_URL = 'https://meta.synthetic.invalid/v1'
}

test('provider fallback is deterministic and records the failed Gemini attempt', async () => {
  const env = snapshotEnvironment()
  const originalFetch = globalThis.fetch
  const requests: string[] = []
  configureSyntheticProviderPool('gemini,openai')

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input)
    requests.push(url)
    if (url.includes('generativelanguage.googleapis.com')) {
      return Response.json({ error: { message: 'synthetic outage' } }, { status: 503 })
    }
    return Response.json({ output_text: JSON.stringify({ fixture: 'synthetic-fallback' }) }, { status: 200 })
  }) as typeof fetch

  try {
    const result = await generateStructuredJson<{ fixture: string }>({
      stage: 'providers-health-witness',
      promptVersion: 'synthetic-v1',
      system: 'Return a JSON object.',
      userContent: 'Synthetic fixture only; do not use personal data.',
    })
    assert.equal(result.fixture, 'synthetic-fallback')
    assert.equal(result.generationProvenance.provider, 'openai')
    const attempts = result.generationProvenance.attempts ?? []
    assert.deepEqual(
      attempts.map((attempt) => [attempt.provider, attempt.outcome]),
      [['gemini', 'failed'], ['openai', 'success']],
    )
    assert.equal(requests.length, 2)
  } finally {
    globalThis.fetch = originalFetch
    restoreEnvironment(env)
  }
})

test('exhausted provider pool throws an auditable error instead of silently succeeding', async () => {
  const env = snapshotEnvironment()
  const originalFetch = globalThis.fetch
  const requests: string[] = []
  configureSyntheticProviderPool('gemini,openai,perplexity,meta')

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requests.push(String(input))
    return Response.json({ error: { message: 'synthetic provider outage' } }, { status: 503 })
  }) as typeof fetch

  try {
    await assert.rejects(
      generateStructuredJson({
        stage: 'providers-health-failure-witness',
        promptVersion: 'synthetic-v1',
        system: 'Return a JSON object.',
        userContent: 'Synthetic fixture only; no learner data.',
      }),
      (error: unknown) => {
        assert.ok(error instanceof ModelGenerationError)
        assert.equal(error.code, 'all_providers_failed')
        assert.deepEqual(
          error.attempts.map((attempt) => [attempt.provider, attempt.outcome, attempt.responseStatus]),
          [
            ['gemini', 'failed', 503],
            ['openai', 'failed', 503],
            ['perplexity', 'failed', 503],
            ['meta', 'failed', 503],
          ],
        )
        return true
      },
    )
    assert.equal(requests.length, 4)
  } finally {
    globalThis.fetch = originalFetch
    restoreEnvironment(env)
  }
})

test('Gemini and Meet operational endpoints expose authentication and provider failures', () => {
  const gemini = readFileSync('app/api/admin/gemini-healthcheck/route.ts', 'utf8')
  const meet = readFileSync('app/api/cron/meet-attendance/route.ts', 'utf8')

  assert.match(gemini, /errorCode: 'UNAUTHENTICATED'[\s\S]*status: 401/)
  assert.match(gemini, /errorCode: 'ADMIN_ACCESS_REQUIRED'[\s\S]*status: 403/)
  assert.match(gemini, /MISSING_GOOGLE_AI_STUDIO_API_KEY/)
  assert.match(gemini, /status: 502/)
  assert.match(meet, /if \(!isAuthorized\(request\)\)[\s\S]*status: 401/)
  assert.match(meet, /event: 'meet_attendance_cron_failed'/)
  assert.match(meet, /status: 503/)
})
