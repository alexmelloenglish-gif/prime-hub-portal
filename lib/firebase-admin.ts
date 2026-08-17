import { getVercelOidcTokenSync } from '@vercel/oidc'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { applicationDefault, cert, getApps, initializeApp, type Credential } from 'firebase-admin/app'
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

  return {
    projectId,
    projectNumber,
    serviceAccountEmail,
    poolId,
    providerId,
    audience,
  }
}

/**
 * Firebase Admin v13 accepts only its own ServiceAccountCredential or
 * ApplicationDefaultCredential for Firestore. A generic Credential object
 * wrapping ExternalAccountClient is valid for some Admin services but is
 * rejected by firestore-internal.ts before the first request.
 *
 * The supported bridge is a short-lived external-account ADC configuration:
 * the subject token is written to /tmp for this serverless instance and the
 * JSON configuration contains no private key. Google Auth then performs STS
 * exchange and service-account impersonation through the existing WIF setup.
 */
function createFederatedApplicationDefault(): Credential | undefined {
  const config = getFederationConfig()
  if (!config) return undefined

  const directory = join(
    '/tmp',
    `prime-hub-portal-wif-${config.projectNumber}-${config.poolId}-${config.providerId}`
  )
  const subjectTokenPath = join(directory, 'subject-token')
  const credentialsPath = join(directory, 'external-account.json')

  mkdirSync(directory, { recursive: true, mode: 0o700 })
  writeFileSync(subjectTokenPath, getVercelOidcTokenSync(), { encoding: 'utf8', mode: 0o600 })

  const externalAccountConfig = {
    type: 'external_account',
    audience: config.audience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url:
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/` +
      `${encodeURIComponent(config.serviceAccountEmail)}:generateAccessToken`,
    credential_source: {
      file: subjectTokenPath,
      format: { type: 'text' },
    },
  }

  writeFileSync(credentialsPath, JSON.stringify(externalAccountConfig), {
    encoding: 'utf8',
    mode: 0o600,
  })

  // applicationDefault() reads this external-account file and returns the
  // Firebase Admin ApplicationDefaultCredential class that Firestore accepts.
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath
  return applicationDefault()
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
    const federatedCredential = federatedAuthConfigured
      ? createFederatedApplicationDefault()
      : undefined
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
