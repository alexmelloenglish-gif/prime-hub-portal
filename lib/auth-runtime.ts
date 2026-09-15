function trimmed(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized || undefined
}

export function getNextAuthUrl(): string | undefined {
  const explicit = trimmed(process.env.NEXTAUTH_URL)
  if (explicit) return explicit

  const vercelUrl = trimmed(process.env.VERCEL_URL)
  return vercelUrl ? `https://${vercelUrl}` : undefined
}

export function getNextAuthSecret(): string {
  const explicit = trimmed(process.env.NEXTAUTH_SECRET)
  if (explicit) return explicit

  if (process.env.VERCEL_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is required in production')
  }

  const previewSeed =
    trimmed(process.env.VERCEL_GIT_COMMIT_SHA) ||
    trimmed(process.env.VERCEL_URL) ||
    'local-test'

  // Deterministic Preview/development fallback only. This is not a production secret.
  return `preview-only-${previewSeed}`
}
