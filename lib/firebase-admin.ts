import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let adminApp: App | undefined
let adminDb: Firestore | undefined

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  )
}

export function getAdminDb(): Firestore | null {
  if (!isFirebaseAdminConfigured()) return null

  if (!adminApp) {
    const apps = getApps()
    adminApp = apps.length
      ? apps[0]
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            // Vercel armazena a chave privada com \n literal — precisa substituir
            privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        })
  }

  if (!adminDb) {
    adminDb = getFirestore(adminApp)
  }

  return adminDb
}
