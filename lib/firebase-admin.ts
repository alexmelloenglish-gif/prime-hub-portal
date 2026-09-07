import { getVercelOidcToken } from '@vercel/oidc'
import { ExternalAccountClient } from 'google-auth-library'
import { cert, getApps, initializeApp, type Credential } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function readPrivateKey() {
  const raw = process.env.FIREBASE_PRIVATE_KEY?.trim()
  if (!raw) return undefined

  return raw
    .replace(/^"|"$/g, '')
    .replace(/\\+n/g, '\n')
}

function getEnv(name: string) {
  return process.env[name]?.trim() || undefined
}

type FirebaseRuntimeMode = 'repository' | 'wif' | 'static'

function getFirebaseRuntimeMode(): FirebaseRuntimeMode {
  const mode = getEnv('PRIME_FIREBASE_MODE')?.toLowerCase()
  if (mode === 'wif') return 'wif'
  if (mode === 'static') return 'static'
  return 'repository'
}

type FederationConfig = {
  projectId: string
  projectNumber: string
  serviceAccountEmail: string
  audience: string
}

function normalizeWorkloadIdentityAudience(value: string) {
  if (value.startsWith('//iam.googleapis.com/')) return value
  if (value.startsWith('https://iam.googleapis.com/')) {
    return `//iam.googleapis.com/${value.slice('https://iam.googleapis.com/'.length)}`
  }
  if (value.startsWith('iam.googleapis.com/')) {
    return `//${value}`
  }
  return value
}

function getFederationConfig(): FederationConfig | undefined {
  if (getFirebaseRuntimeMode() !== 'wif') return undefined

  const projectId = getEnv('GCP_PROJECT_ID') ?? getEnv('FIREBASE_PROJECT_ID')
  const projectNumber = getEnv('GCP_PROJECT_NUMBER')
  const serviceAccountEmail = getEnv('GCP_SERVICE_ACCOUNT_EMAIL')
  const poolId = getEnv('GCP_WORKLOAD_IDENTITY_POOL_ID')
  const providerId = getEnv('GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID')

  if (!projectId || !projectNumber || !serviceAccountEmail || !poolId || !providerId) {
    return undefined
  }

  const audience = normalizeWorkloadIdentityAudience(
    getEnv('GCP_AUDIENCE') ??
      `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`
  )

  return { projectId, projectNumber, serviceAccountEmail, audience }
}

/**
 * Firebase Admin expects its Credential interface, while Google Auth's
 * ExternalAccountClient performs the WIF exchange and refresh itself.
 * The supplier deliberately obtains a fresh Vercel OIDC token for each
 * Google exchange instead of writing a one-time token to disk.
 */
function createFederatedCredential(): Credential | undefined {
  const config = getFederationConfig()
  if (!config) return undefined

  const authClient = ExternalAccountClient.fromJSON({
    type: 'external_account',
    audience: config.audience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url:
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/` +
      `${encodeURIComponent(config.serviceAccountEmail)}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: () => getVercelOidcToken({ audience: config.audience }),
    },
  })

  if (!authClient) {
    throw new Error('Google Workload Identity Federation client initialization failed')
  }

  return {
    getAccessToken: async () => {
      const { token, res } = await authClient.getAccessToken()
      if (!token) {
        throw new Error('Google Workload Identity Federation returned no access token')
      }

      const expiresIn =
        typeof res?.data === 'object' && res.data !== null &&
        'expires_in' in res.data && typeof res.data.expires_in === 'number'
          ? res.data.expires_in
          : 3600

      return { access_token: token, expires_in: expiresIn }
    },
  }
}

const runtimeMode = getFirebaseRuntimeMode()
const staticKeyConfigured = Boolean(
  runtimeMode === 'static' &&
    getEnv('FIREBASE_PROJECT_ID') &&
    getEnv('FIREBASE_CLIENT_EMAIL') &&
    readPrivateKey()
)
const federation = getFederationConfig()
const federatedAuthConfigured = Boolean(federation)

export function getFirebaseConfigStatus() {
  const projectId = getEnv('FIREBASE_PROJECT_ID') ?? ''
  const clientEmail = getEnv('FIREBASE_CLIENT_EMAIL') ?? ''
  const privateKey = readPrivateKey() ?? ''

  return {
    runtimeMode,
    projectIdPresent: Boolean(projectId),
    clientEmailPresent: Boolean(clientEmail),
    clientEmailLooksLikeServiceAccount: /@[^@]+\.iam\.gserviceaccount\.com$/.test(clientEmail),
    privateKeyPresent: Boolean(privateKey),
    privateKeyHasPemMarkers:
      privateKey.includes('-----BEGIN PRIVATE KEY-----') &&
      privateKey.includes('-----END PRIVATE KEY-----'),
    federatedAuthConfigured,
    federationProjectNumberPresent: Boolean(federation?.projectNumber),
    federationAudiencePresent: Boolean(federation?.audience),
    federationServiceAccountPresent: Boolean(federation?.serviceAccountEmail),
    authMode: federatedAuthConfigured ? 'vercel-oidc-wif' : staticKeyConfigured ? 'static-key' : 'repository',
  }
}

export const isFirebaseConfigured = federatedAuthConfigured || staticKeyConfigured

export function getFirebaseAdminApp() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase Admin is intentionally disabled. Set PRIME_FIREBASE_MODE=wif or PRIME_FIREBASE_MODE=static only after the selected authentication path has been verified.'
    )
  }

  if (!getApps().length) {
    const federatedCredential = federatedAuthConfigured ? createFederatedCredential() : undefined
    const credential =
      federatedCredential ??
      cert({
        projectId: getEnv('FIREBASE_PROJECT_ID'),
        clientEmail: getEnv('FIREBASE_CLIENT_EMAIL'),
        privateKey: readPrivateKey(),
      })

    initializeApp({
      credential,
      storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
    })
  }

  return getApps()[0]
}

export function getFirebaseFirestore() {
  return getFirestore(getFirebaseAdminApp())
}
