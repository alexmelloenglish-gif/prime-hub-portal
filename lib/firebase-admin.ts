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

type FederationConfig = {
  projectId: string
  projectNumber: string
  serviceAccountEmail: string
  poolId: string
  providerId: string
  audience: string
}

function getFederationConfig(): FederationConfig | undefined {
  const projectId = getEnv('GCP_PROJECT_ID') ?? getEnv('FIREBASE_PROJECT_ID')
  const projectNumber = getEnv('GCP_PROJECT_NUMBER')
  const serviceAccountEmail = getEnv('GCP_SERVICE_ACCOUNT_EMAIL')
  const poolId = getEnv('GCP_WORKLOAD_IDENTITY_POOL_ID')
  const providerId = getEnv('GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID')

  if (!projectId || !projectNumber || !serviceAccountEmail || !poolId || !providerId) {
    return undefined
  }

  const audience =
    getEnv('GCP_AUDIENCE') ??
    `https://iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`

  return {
    projectId,
    projectNumber,
    serviceAccountEmail,
    poolId,
    providerId,
    audience,
  }
}

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
      getSubjectToken: ({ audience }) => getVercelOidcToken({ audience }),
    },
  })

  if (!authClient) {
    throw new Error('Google Auth did not create an external-account client for Vercel OIDC.')
  }

  return {
    async getAccessToken() {
      const response = await authClient.getAccessToken()
      if (!response.token) {
        throw new Error('Google STS did not return an access token for Vercel OIDC.')
      }

      const expiresIn = Number(response.res?.data?.expires_in ?? 3600)
      return {
        access_token: response.token,
        expires_in: Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3600,
      }
    },
  }
}

const staticKeyConfigured = Boolean(
  getEnv('FIREBASE_PROJECT_ID') &&
    getEnv('FIREBASE_CLIENT_EMAIL') &&
    readPrivateKey()
)

const federatedAuthConfigured = Boolean(getFederationConfig())

export function getFirebaseConfigStatus() {
  const projectId = getEnv('FIREBASE_PROJECT_ID') ?? ''
  const clientEmail = getEnv('FIREBASE_CLIENT_EMAIL') ?? ''
  const privateKey = readPrivateKey() ?? ''
  const federation = getFederationConfig()

  return {
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
    federationPoolPresent: Boolean(federation?.poolId),
    federationProviderPresent: Boolean(federation?.providerId),
    federationServiceAccountPresent: Boolean(federation?.serviceAccountEmail),
    authMode: federatedAuthConfigured ? 'vercel-oidc-wif' : staticKeyConfigured ? 'static-key' : 'unconfigured',
  }
}

export const isFirebaseConfigured = Boolean(
  getEnv('FIREBASE_PROJECT_ID') && (federatedAuthConfigured || staticKeyConfigured)
)

export function getFirebaseAdminApp() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID and either Vercel OIDC/WIF variables or the legacy Firebase service-account variables.'
    )
  }

  if (!getApps().length) {
    const federatedCredential = createFederatedCredential()
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
