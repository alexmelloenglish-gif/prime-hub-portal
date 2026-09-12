const isProduction = process.env.VERCEL_ENV === 'production'
const isPreview = process.env.VERCEL_ENV === 'preview'

/**
 * Production must always provide a real secret. Preview may use a deterministic,
 * deployment-scoped fallback so protected smoke tests do not require a secret
 * to be stored in Vercel. The fallback is intentionally never allowed in prod.
 */
export function getNextAuthSecret() {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET
  }

  if (isProduction) {
    return undefined
  }

  if (isPreview) {
    const deploymentIdentity =
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_URL ?? 'preview-local'
    return `preview-only-nextauth-${deploymentIdentity}`
  }

  return 'development-only-nextauth-secret'
}

export function getNextAuthUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return undefined
}

export function assertProductionAuthConfiguration() {
  if (isProduction && !process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is required in production')
  }
}

export const nextAuthSecret = getNextAuthSecret()
export const nextAuthUrl = getNextAuthUrl()
assertProductionAuthConfiguration()
