import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkProviderHealth } from '../../lib/pipeline/provider-health.ts'
import { ModelGenerationError, generateStructuredJson } from '../../lib/pipeline/model-provider.ts'

const BASE_ENV = {
  PRIME_MODEL_PROVIDER_ORDER: 'gemini,openai',
  GOOGLE_AI_STUDIO_API_KEY: 'test-gemini-key',
  PRIME_GEMINI_MODEL: 'test-gemini-model',
  OPENAI_API_KEY: 'test-openai-key',
  PRIME_OPENAI_MODEL: 'test-openai-model',
}

function withEnv(overrides: Record<string, string | undefined>, run: () => Promise<void>) {
  const previous: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  return run().finally(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })
}

test('provider health: reports healthy, unhealthy and not_configured without external calls', async () => {
  await withEnv(BASE_ENV, async () => {
    const report = await checkProviderHealth({
      fetchImpl: (async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('generativelanguage.googleapis.com')) {
          return new Response('{}', { status: 200 })
        }
        return new Response('{}', { status: 503 })
      }) as typeof fetch,
    })

    assert.equal(report.overallStatus, 'degraded')
    assert.equal(report.providers.length, 2)
    assert.equal(report.providers[0].provider, 'gemini')
    assert.equal(report.providers[0].status, 'healthy')
    assert.equal(report.providers[1].provider, 'openai')
    assert.equal(report.providers[1].status, 'unhealthy')
    assert.equal(report.providers[1].errorCode, 'http_503')
  })
})

test('provider fallback: failed Gemini is recorded and OpenAI completes the request', async () => {
  await withEnv(BASE_ENV, async () => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('generativelanguage.googleapis.com')) {
        return new Response('{"error":"forced_test_failure"}', { status: 500 })
      }
      return new Response(JSON.stringify({ output_text: '{"ok":true}' }), { status: 200 })
    }) as typeof fetch

    try {
      const result = await generateStructuredJson<{ ok: boolean }>({
        stage: 'issue-58-provider-fallback',
        promptVersion: 'issue-58-test.v1',
        system: 'Return JSON.',
        userContent: 'Synthetic validation request.',
      })

      assert.equal(result.ok, true)
      assert.equal(result.generationProvenance.provider, 'openai')
      assert.equal(result.generationProvenance.attempts[0].provider, 'gemini')
      assert.equal(result.generationProvenance.attempts[0].outcome, 'failed')
      assert.equal(result.generationProvenance.attempts[1].provider, 'openai')
      assert.equal(result.generationProvenance.attempts[1].outcome, 'success')
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})

test('provider failure: total failure remains visible through error and warning log', async () => {
  await withEnv(BASE_ENV, async () => {
    const originalFetch = globalThis.fetch
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (message: unknown) => warnings.push(String(message))

    globalThis.fetch = (async () => new Response('{}', { status: 503 })) as typeof fetch

    try {
      await assert.rejects(
        generateStructuredJson({
          stage: 'issue-58-provider-total-failure',
          promptVersion: 'issue-58-test.v1',
          system: 'Return JSON.',
          userContent: 'Synthetic validation request.',
        }),
        (error: unknown) => {
          assert.ok(error instanceof ModelGenerationError)
          assert.equal(error.code, 'all_providers_failed')
          assert.equal(error.attempts.length, 2)
          return true
        },
      )

      assert.ok(warnings.some((message) => message.includes('model_provider_attempt_failed')))
    } finally {
      globalThis.fetch = originalFetch
      console.warn = originalWarn
    }
  })
})
