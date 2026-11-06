import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Contract-only CI test. It reads implementation; it does not contact providers
// or load secrets. Real network health is exercised by the protected staging routes.
const read = (path) => readFileSync(path, 'utf8')
const provider = read('lib/pipeline/model-provider.ts')
const pipeline = read('lib/pipeline/run.ts')
const geminiHealthcheck = read('app/api/admin/gemini-healthcheck/route.ts')
const meetCollector = read('lib/meet-attendance-collector.ts')
const meetCron = read('app/api/cron/meet-attendance/route.ts')
const auth = read('lib/auth.ts')

assert.match(geminiHealthcheck, /getServerSession\(authOptions\)/, 'Gemini healthcheck must require a NextAuth session')
assert.match(geminiHealthcheck, /isAdminUser\(session\.user\)/, 'Gemini healthcheck must be administrator-only')
assert.match(geminiHealthcheck, /MISSING_GOOGLE_AI_STUDIO_API_KEY/, 'Missing Gemini credentials must be visible')
assert.match(geminiHealthcheck, /response\.ok/, 'Gemini healthcheck must inspect provider HTTP success')
assert.match(geminiHealthcheck, /GEMINI_REQUEST_ERROR/, 'Gemini transport failures must be explicit')
assert.match(geminiHealthcheck, /status: 502/, 'Gemini provider failures must not return success')
assert.doesNotMatch(geminiHealthcheck, /apiKey\s*:/, 'Gemini healthcheck must never echo the API key')

assert.match(provider, /for \(const providerId of providerOrder\(\)\)/, 'The provider pool must try the configured provider order')
assert.match(provider, /outcome: 'skipped'/, 'Unconfigured providers must be recorded as skipped')
assert.match(provider, /outcome: 'failed'/, 'Provider failures must be included in provenance')
assert.match(provider, /model_provider_attempt_failed/, 'Provider failures must emit a visible warning')
assert.match(provider, /all_providers_failed/, 'Exhausted providers must raise a typed failure')
assert.match(pipeline, /ModelGenerationFailed/, 'The pipeline must persist provider exhaustion')
assert.match(pipeline, /MODEL_PROVIDER_FAILED/, 'Provider exhaustion must set a stable failure code')
assert.match(pipeline, /attempts: error\.attempts/, 'Persisted failure must retain provider attempt details')

assert.match(meetCron, /CRON_SECRET/, 'Meet reconciliation must require the server-side cron secret')
assert.match(meetCron, /meet_attendance_cron_failed/, 'Meet failures must emit a named operational log event')
assert.match(meetCron, /status: 503/, 'Meet failures must return a visible non-success response')
assert.match(meetCollector, /meetings\.space\.readonly/, 'Meet collector must require the read-only Meet scope')
assert.match(meetCollector, /MEET_SCOPE_REAUTH_REQUIRED/, 'Missing Meet scope must have an explicit failure code')
assert.match(meetCollector, /MEET_ORGANIZER_GOOGLE_ACCOUNT_NOT_CONNECTED/, 'Missing organizer account must have an explicit failure code')
assert.match(meetCollector, /throw new Error\(/, 'Meet authorization failures must fail closed')
assert.match(auth, /scope: \['openid', 'email', 'profile'\]/, 'Learner login must not request organizer Meet scopes')

console.log('Provider health and safe-fallback contract self-test: PASS')
