import { randomUUID } from 'node:crypto'
import type { GenerationProvenance, GenerationProviderAttempt } from './contracts'

export type ModelGenerationErrorCode =
  | 'missing_credential'
  | 'http_error'
  | 'empty_response'
  | 'invalid_json'
  | 'all_providers_failed'

export class ModelGenerationError extends Error {
  readonly stage: string
  readonly code: ModelGenerationErrorCode
  readonly provider?: string
  readonly httpStatus?: number
  readonly model?: string
  readonly requestId?: string
  readonly promptVersion: string
  readonly startedAt: string
  readonly completedAt: string
  readonly artifactId: string
  readonly attempts: GenerationProviderAttempt[]

  constructor(input: {
    stage: string
    code: ModelGenerationErrorCode
    message: string
    promptVersion: string
    startedAt: string
    artifactId: string
    attempts: GenerationProviderAttempt[]
    provider?: string
    httpStatus?: number
    model?: string
    requestId?: string
  }) {
    super(input.message)
    this.name = 'ModelGenerationError'
    this.stage = input.stage
    this.code = input.code
    this.provider = input.provider
    this.httpStatus = input.httpStatus
    this.model = input.model
    this.requestId = input.requestId
    this.promptVersion = input.promptVersion
    this.startedAt = input.startedAt
    this.completedAt = new Date().toISOString()
    this.artifactId = input.artifactId
    this.attempts = input.attempts
  }
}

type ProviderId = 'gemini' | 'openai' | 'perplexity' | 'meta'

type ProviderConfig = {
  id: ProviderId
  kind: 'gemini' | 'openai-responses' | 'openai-compatible'
  apiKey?: string
  model?: string
  baseUrl?: string
}

type ProviderCallResult = {
  content: string
  responseStatus: number
}

function providerOrder(): ProviderId[] {
  const configured = (process.env.PRIME_MODEL_PROVIDER_ORDER || 'gemini,openai,perplexity,meta')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is ProviderId =>
      item === 'gemini' || item === 'openai' || item === 'perplexity' || item === 'meta',
    )
  return [...new Set(configured)]
}

function providerConfig(id: ProviderId): ProviderConfig {
  if (id === 'gemini') {
    return {
      id,
      kind: 'gemini',
      apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY,
      model: process.env.PRIME_GEMINI_MODEL || process.env.PRIME_PIPELINE_MODEL || 'gemini-3.7-flash',
    }
  }
  if (id === 'openai') {
    return {
      id,
      kind: 'openai-responses',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.PRIME_OPENAI_MODEL || 'gpt-5.6',
      baseUrl: process.env.PRIME_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    }
  }
  if (id === 'perplexity') {
    return {
      id,
      kind: 'openai-compatible',
      apiKey: process.env.PERPLEXITY_API_KEY,
      model: process.env.PRIME_PERPLEXITY_MODEL,
      baseUrl: process.env.PRIME_PERPLEXITY_BASE_URL || 'https://api.perplexity.ai/router/v1',
    }
  }
  return {
    id,
    kind: 'openai-compatible',
    apiKey: process.env.PRIME_META_API_KEY,
    model: process.env.PRIME_META_MODEL,
    baseUrl: process.env.PRIME_META_BASE_URL,
  }
}

function parseJsonCandidate(content: string): Record<string, unknown> | null {
  const normalized = content
    .trim()
    .replace(/^\`\`\`(?:json)?\s*/i, '')
    .replace(/\s*\`\`\`$/i, '')
    .trim()
  try {
    const parsed = JSON.parse(normalized)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null
  } catch {
    const firstObject = normalized.indexOf('{')
    const lastObject = normalized.lastIndexOf('}')
    if (firstObject < 0 || lastObject <= firstObject) return null
    try {
      const parsed = JSON.parse(normalized.slice(firstObject, lastObject + 1))
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : null
    } catch {
      return null
    }
  }
}

function openAiResponseText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const record = payload as Record<string, unknown>
  if (typeof record.output_text === 'string') return record.output_text.trim()
  const output = Array.isArray(record.output) ? record.output : []
  return output
    .flatMap((item) => {
      if (!item || typeof item !== 'object') return []
      const content = Array.isArray((item as Record<string, unknown>).content)
        ? (item as Record<string, unknown>).content as unknown[]
        : []
      return content.map((part) => {
        if (!part || typeof part !== 'object') return ''
        const text = (part as Record<string, unknown>).text
        return typeof text === 'string' ? text : ''
      })
    })
    .join('')
    .trim()
}

function compatibleResponseText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const choices = Array.isArray((payload as Record<string, unknown>).choices)
    ? (payload as Record<string, unknown>).choices as unknown[]
    : []
  const first = choices[0]
  if (!first || typeof first !== 'object') return ''
  const message = (first as Record<string, unknown>).message
  if (!message || typeof message !== 'object') return ''
  const content = (message as Record<string, unknown>).content
  return typeof content === 'string' ? content.trim() : ''
}

async function callProvider(
  provider: ProviderConfig,
  system: string,
  userContent: string,
): Promise<ProviderCallResult> {
  if (!provider.apiKey || !provider.model) {
    throw new Error('provider_not_configured')
  }

  if (provider.kind === 'gemini') {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': provider.apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: userContent }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
        cache: 'no-store',
      },
    )
    if (!response.ok) {
      const error = new Error(`provider_http_${response.status}`) as Error & { status?: number }
      error.status = response.status
      throw error
    }
    const payload = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    return {
      content: payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || '',
      responseStatus: response.status,
    }
  }

  const baseUrl = provider.baseUrl?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('provider_not_configured')

  if (provider.kind === 'openai-responses') {
    const response = await fetch(`${baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        input: [
          { role: 'system', content: system },
          { role: 'user', content: userContent },
        ],
      }),
      cache: 'no-store',
    })
    if (!response.ok) {
      const error = new Error(`provider_http_${response.status}`) as Error & { status?: number }
      error.status = response.status
      throw error
    }
    return {
      content: openAiResponseText(await response.json()),
      responseStatus: response.status,
    }
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.1,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent },
      ],
    }),
    cache: 'no-store',
  })
  if (!response.ok) {
    const error = new Error(`provider_http_${response.status}`) as Error & { status?: number }
    error.status = response.status
    throw error
  }
  return {
    content: compatibleResponseText(await response.json()),
    responseStatus: response.status,
  }
}

export async function generateStructuredJson<T>(input: {
  stage: string
  promptVersion: string
  system: string
  userContent: string
}): Promise<T & { generationStatus: 'model_generated'; generationProvenance: GenerationProvenance }> {
  const stageStartedAt = new Date().toISOString()
  const artifactId = `artifact-${input.stage}-${randomUUID()}`
  const attempts: GenerationProviderAttempt[] = []

  for (const providerId of providerOrder()) {
    const provider = providerConfig(providerId)
    const requestId = `${providerId}-${randomUUID()}`
    const startedAt = new Date().toISOString()

    if (!provider.apiKey || !provider.model || (provider.kind !== 'gemini' && !provider.baseUrl)) {
      attempts.push({
        provider: providerId,
        model: provider.model,
        requestId,
        startedAt,
        completedAt: new Date().toISOString(),
        outcome: 'skipped',
        errorCode: 'not_configured',
      })
      continue
    }

    try {
      const response = await callProvider(provider, input.system, input.userContent)
      if (!response.content) {
        attempts.push({
          provider: providerId,
          model: provider.model,
          requestId,
          responseStatus: response.responseStatus,
          startedAt,
          completedAt: new Date().toISOString(),
          outcome: 'failed',
          errorCode: 'empty_response',
        })
        continue
      }
      const parsed = parseJsonCandidate(response.content)
      if (!parsed) {
        attempts.push({
          provider: providerId,
          model: provider.model,
          requestId,
          responseStatus: response.responseStatus,
          startedAt,
          completedAt: new Date().toISOString(),
          outcome: 'failed',
          errorCode: 'invalid_json',
        })
        continue
      }

      const completedAt = new Date().toISOString()
      attempts.push({
        provider: providerId,
        model: provider.model,
        requestId,
        responseStatus: response.responseStatus,
        startedAt,
        completedAt,
        outcome: 'success',
      })
      return {
        ...parsed,
        generationStatus: 'model_generated',
        generationProvenance: {
          provider: providerId,
          model: provider.model,
          requestId,
          promptVersion: input.promptVersion,
          responseStatus: response.responseStatus,
          startedAt: stageStartedAt,
          completedAt,
          artifactId,
          validationStatus: 'valid',
          attempts,
        },
      } as T & { generationStatus: 'model_generated'; generationProvenance: GenerationProvenance }
    } catch (error) {
      const httpStatus = typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
        ? error.status
        : undefined
      attempts.push({
        provider: providerId,
        model: provider.model,
        requestId,
        responseStatus: httpStatus,
        startedAt,
        completedAt: new Date().toISOString(),
        outcome: 'failed',
        errorCode: httpStatus ? `http_${httpStatus}` : 'provider_error',
      })
      console.warn(JSON.stringify({
        event: 'model_provider_attempt_failed',
        stage: input.stage,
        provider: providerId,
        model: provider.model,
        requestId,
        status: httpStatus || null,
      }))
    }
  }

  const last = attempts.at(-1)
  throw new ModelGenerationError({
    stage: input.stage,
    code: 'all_providers_failed',
    message: `All configured model providers failed for ${input.stage}`,
    promptVersion: input.promptVersion,
    startedAt: stageStartedAt,
    artifactId,
    attempts,
    provider: last?.provider,
    model: last?.model,
    requestId: last?.requestId,
    httpStatus: last?.responseStatus,
  })
}
