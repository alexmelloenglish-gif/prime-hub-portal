import assert from 'node:assert/strict'
import fs from 'node:fs'
import { ModelGenerationError, generateStructuredJson } from '../lib/pipeline/model-provider.ts'

async function main() {
  const originalFetch = globalThis.fetch
  const calls: Array<{ provider: string; status: number }> = []

  try {
    process.env.GOOGLE_AI_STUDIO_API_KEY = 'synthetic-gemini-key-not-a-secret'
    process.env.PRIME_GEMINI_MODEL = 'synthetic-gemini-model'
    process.env.OPENAI_API_KEY = 'synthetic-openai-key-not-a-secret'
    process.env.PRIME_OPENAI_MODEL = 'synthetic-openai-model'
    process.env.PRIME_OPENAI_BASE_URL = 'https://openai.invalid.test/v1'
    process.env.PRIME_MODEL_PROVIDER_ORDER = 'gemini,openai'

    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('generativelanguage.googleapis.com')) {
        calls.push({ provider: 'gemini', status: 503 })
        return new Response(JSON.stringify({ error: { message: 'synthetic provider unavailable' } }), { status: 503 })
      }
      if (url.endsWith('/responses')) {
        calls.push({ provider: 'openai', status: 200 })
        return new Response(JSON.stringify({ output_text: '{"result":"fallback-ok"}' }), { status: 200 })
      }
      throw new Error('Unexpected provider URL in synthetic test: ' + url)
    }

    const recovered = await generateStructuredJson<{ result: string }>({
      stage: 'provider-health-witness',
      promptVersion: 'provider-health-witness.v1',
      system: 'Return a JSON object.',
      userContent: 'Synthetic request only.',
    })
    assert.equal(recovered.result, 'fallback-ok')
    assert.equal(recovered.generationStatus, 'model_generated')
    assert.equal(recovered.generationProvenance.provider, 'openai')
    const recoveredAttempts = recovered.generationProvenance.attempts ?? []
    assert.equal(recoveredAttempts.length, 2, 'Provider provenance must retain both failed and successful attempts')
    assert.deepEqual(
      recoveredAttempts.map((attempt) => [attempt.provider, attempt.outcome, attempt.responseStatus]),
      [['gemini', 'failed', 503], ['openai', 'success', 200]],
    )

    process.env.PRIME_MODEL_PROVIDER_ORDER = 'gemini'
    globalThis.fetch = async () => {
      calls.push({ provider: 'gemini', status: 503 })
      return new Response(JSON.stringify({ error: { message: 'synthetic provider unavailable' } }), { status: 503 })
    }

    await assert.rejects(
      generateStructuredJson({
        stage: 'provider-exhaustion-witness',
        promptVersion: 'provider-health-witness.v1',
        system: 'Return a JSON object.',
        userContent: 'Synthetic request only.',
      }),
      (error: unknown) => {
        assert.ok(error instanceof ModelGenerationError)
        assert.equal(error.code, 'all_providers_failed')
        assert.equal(error.attempts.length, 1)
        assert.equal(error.attempts[0].provider, 'gemini')
        assert.equal(error.attempts[0].outcome, 'failed')
        assert.equal(error.attempts[0].responseStatus, 503)
        return true
      },
    )

    const evidence = {
      verdict: 'PROVIDER FALLBACK WITNESS PASS',
      productionTouched: false,
      externalProviderContacted: false,
      transport: 'in_process_fetch_stub',
      cases: [
        { scenario: 'gemini_503_falls_back_to_openai_mock', verdict: 'PASS', attempts: recoveredAttempts.map((attempt) => ({ provider: attempt.provider, outcome: attempt.outcome, responseStatus: attempt.responseStatus })) },
        { scenario: 'all_configured_providers_fail_visibly', verdict: 'PASS', errorCode: 'all_providers_failed', failureCount: 1 },
      ],
      providerCalls: calls,
    }

    fs.mkdirSync('artifacts', { recursive: true })
    fs.writeFileSync('artifacts/providers-health-witness.json', JSON.stringify(evidence, null, 2) + String.fromCharCode(10))
    console.log(JSON.stringify(evidence, null, 2))
  } finally {
    globalThis.fetch = originalFetch
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
