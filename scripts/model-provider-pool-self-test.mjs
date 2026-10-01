import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const provider = readFileSync('lib/pipeline/model-provider.ts', 'utf8')
const prompts = readFileSync('lib/pipeline/prompts.ts', 'utf8')
const contracts = readFileSync('lib/pipeline/contracts.ts', 'utf8')
const qualityGate = readFileSync('lib/pipeline/quality-gate.ts', 'utf8')
const run = readFileSync('lib/pipeline/run.ts', 'utf8')
const teacher = readFileSync('lib/teacher-intelligence.ts', 'utf8')
const env = readFileSync('.env.example', 'utf8')

assert.match(provider, /PRIME_MODEL_PROVIDER_ORDER/, 'Provider order must be configurable')
for (const id of ['gemini', 'openai', 'perplexity', 'meta']) {
  assert.match(provider, new RegExp(`['"]${id}['"]`), `Provider pool must support ${id}`)
}
assert.match(provider, /for \(const providerId of providerOrder\(\)\)/, 'Provider pool must try configured providers sequentially')
assert.match(provider, /outcome: 'skipped'/, 'Unconfigured providers must be skipped without becoming Machine failures')
assert.match(provider, /outcome: 'failed'/, 'Provider failures must be persisted in attempt provenance')
assert.match(provider, /outcome: 'success'/, 'Successful provider must be explicit in attempt provenance')
assert.match(provider, /attempts,/, 'Successful provenance must include provider attempt history')
assert.match(provider, /all_providers_failed/, 'The stage may fail only after configured providers are exhausted')

assert.match(prompts, /generateStructuredJson/, 'Prompt stages must use the provider-neutral model gateway')
assert.doesNotMatch(prompts, /generativelanguage\.googleapis\.com/, 'Prompt stages must not call Gemini directly')
assert.doesNotMatch(prompts, /api\.openai\.com/, 'Prompt stages must not call OpenAI directly')

assert.match(contracts, /provider: string/, 'Generation provenance must not constrain authority to one provider')
assert.match(contracts, /GenerationProviderAttempt/, 'Generation provenance must retain provider attempt history')
assert.match(qualityGate, /isValidModelProvenance/, 'Quality gate must be provider-neutral')
assert.doesNotMatch(qualityGate, /provenance\.provider !== 'gemini'/, 'Quality gate must not privilege Gemini')
assert.match(qualityGate, /model_generated/, 'Quality gate must accept provider-pool generated output')

assert.match(run, /ModelGenerationFailed/, 'Provider exhaustion must create a provider-neutral audit event')
assert.match(run, /MODEL_PROVIDER_FAILED/, 'Pipeline failure code must be provider-neutral')
assert.match(run, /attempts: error\.attempts/, 'Failure audit must preserve every provider attempt')
assert.match(teacher, /MODEL PROVENANCE/, 'Teacher Intelligence must show provider-neutral provenance')
assert.doesNotMatch(teacher, /label: 'GEMINI PROVENANCE'/, 'Teacher Intelligence must not hard-code Gemini as the Machine')

assert.match(env, /PRIME_MODEL_PROVIDER_ORDER="gemini,openai,perplexity,meta"/, 'Provider order example must document all approved provider slots')
assert.match(env, /OPENAI_API_KEY=/, 'OpenAI resource slot must be documented')
assert.match(env, /PERPLEXITY_API_KEY=/, 'Perplexity resource slot must be documented')
assert.match(env, /PRIME_META_API_KEY=/, 'Meta-compatible resource slot must be documented')

console.log('Model provider pool static contract self-test: PASS')
