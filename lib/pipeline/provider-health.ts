import type { ProviderId } from './model-provider'

export type ProviderHealthStatus = 'healthy' | 'unhealthy' | 'not_configured'

export type ProviderHealthResult = {
  provider: ProviderId
  status: ProviderHealthStatus
  httpStatus?: number
  latencyMs?: number
  errorCode?: string
  checkedAt: string
}

export type ProviderHealthReport = {
  checkedAt: string
  overallStatus: 'healthy' | 'degraded' | 'unhealthy'
  providers: ProviderHealthResult[]
}

type HealthCheckFetch = typeof fetch

function providerOrder(): ProviderId[] {
  const configured = (process.env.PRIME_MODEL_PROVIDER_ORDER || 'gemini,openai,perplexity,meta')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is ProviderId =>
      item === 'gemini' || item === 'openai' || item === 'perplexity' || item === 'meta',
    )
  return [...new Set(configured)]
}

function providerEndpoint(provider: ProviderId): { url: string; init: RequestInit } | null {
  if (provider === 'gemini') {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY
    const model = process.env.PRIME_GEMINI_MODEL || process.env.PRIME_PIPELINE_MODEL
    if (!apiKey || !model) return null
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`,
      init: { method: 'GET', headers: { 'x-goog-api-key': apiKey }, cache: 'no-store' },
    }
  }

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY
    const baseUrl = (process.env.PRIME_OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
    if (!apiKey) return null
    return {
      url: `${baseUrl}/models`,
      init: { method: 'GET', headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' },
    }
  }

  if (provider === 'perplexity') {
    const apiKey = process.env.PERPLEXITY_API_KEY
    const baseUrl = (process.env.PRIME_PERPLEXITY_BASE_URL || 'https://api.perplexity.ai/router/v1').replace(/\/$/, '')
    if (!apiKey) return null
    return {
      url: `${baseUrl}/models`,
      init: { method: 'GET', headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' },
    }
  }

  const apiKey = process.env.PRIME_META_API_KEY
  const baseUrl = process.env.PRIME_META_BASE_URL?.replace(/\/$/, '')
  if (!apiKey || !baseUrl) return null
  return {
    url: `${baseUrl}/models`,
    init: { method: 'GET', headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' },
  }
}

async function checkProvider(
  provider: ProviderId,
  fetchImpl: HealthCheckFetch,
): Promise<ProviderHealthResult> {
  const checkedAt = new Date().toISOString()
  const endpoint = providerEndpoint(provider)

  if (!endpoint) {
    return {
      provider,
      status: 'not_configured',
      errorCode: 'missing_credential_or_model',
      checkedAt,
    }
  }

  const startedAt = Date.now()
  try {
    const response = await fetchImpl(endpoint.url, endpoint.init)
    const latencyMs = Date.now() - startedAt

    return {
      provider,
      status: response.ok ? 'healthy' : 'unhealthy',
      httpStatus: response.status,
      latencyMs,
      errorCode: response.ok ? undefined : `http_${response.status}`,
      checkedAt,
    }
  } catch (error) {
    return {
      provider,
      status: 'unhealthy',
      latencyMs: Date.now() - startedAt,
      errorCode: error instanceof Error ? error.message : 'provider_health_error',
      checkedAt,
    }
  }
}

export async function checkProviderHealth(input?: {
  fetchImpl?: HealthCheckFetch
}): Promise<ProviderHealthReport> {
  const fetchImpl = input?.fetchImpl || globalThis.fetch
  const checkedAt = new Date().toISOString()
  const providers = await Promise.all(
    providerOrder().map((provider) => checkProvider(provider, fetchImpl)),
  )

  const healthyCount = providers.filter((item) => item.status === 'healthy').length
  const configuredCount = providers.filter((item) => item.status !== 'not_configured').length

  const overallStatus: ProviderHealthReport['overallStatus'] =
    healthyCount === 0 && configuredCount > 0
      ? 'unhealthy'
      : healthyCount < configuredCount
        ? 'degraded'
        : 'healthy'

  return { checkedAt, overallStatus, providers }
}
