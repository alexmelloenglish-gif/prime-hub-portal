# PRIME — Provider Health and Safe Fallback Contract

## Provider pool

`lib/pipeline/model-provider.ts` uses the ordered provider list in `PRIME_MODEL_PROVIDER_ORDER` (default: Gemini, OpenAI, Perplexity, Meta). Providers without a complete credential/model/base URL are recorded as `skipped`; configured providers are attempted sequentially. Every attempt preserves provider, model, request ID, start/end time, response status, outcome and failure code. A successful alternate provider is recorded as that provider; it is never mislabeled as Gemini.

If all configured providers fail, the stage fails with provider-neutral `all_providers_failed` semantics. The pipeline persists the attempt history in `ModelGenerationFailed` and marks the run failed. It does not invent an Evidence Candidate, publish a Class Report or mutate canonical learner state from an invalid/absent response.

## Internal health routes

| Provider | Internal route | Probe | Authorization |
|---|---|---|---|
| Gemini | `GET /api/admin/gemini-healthcheck` | Calls the configured Gemini model with a bounded fixed prompt; returns model, `keyPresent`, HTTP status, sanitized error code and response-match result. | Authenticated PRIME administrator |
| Google Meet | `GET /api/admin/meet-healthcheck` | Checks organizer configuration and `meetings.space.readonly`, then reads at most one conference record. It does not reconcile attendance or write learner/pedagogical records. It may refresh an expired organizer token using the already stored refresh token. | Authenticated PRIME administrator |

Both routes are read-only with respect to learning state. Secrets and bearer tokens must never be returned or placed in logs.

## Alerting and failure response

- Gemini request failures remain visible in provider attempt provenance and `ModelGenerationFailed` events.
- Meet health failures return HTTP 503 and emit a structured `meet_provider_healthcheck_failed` runtime log with a sanitized error code and timestamp.
- Vercel runtime alert delivery/configuration is a separate platform capability; this repository change adds the event and status endpoint but does not claim an external notification channel is configured.
- On provider exhaustion, the teacher-facing operational state is “processing failed — provider unavailable; source preserved; supervised retry required.” The student-facing record remains unchanged; do not display an AI-generated report or claim a lesson was processed.
- A supervised retry must target the exact failed run and reuse its stored Transcript. Never create repeated automatic retries while the provider is unhealthy.

## Operational gate

A health endpoint succeeding proves that endpoint's bounded probe only. It does not prove that every prompt schema, provider fallback, quality gate, Teacher Authority or full lesson output works. GL-003 still requires its one controlled end-to-end retry and complete artifact read-back after all governance gates pass.