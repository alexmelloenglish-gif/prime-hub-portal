import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let adminApp: App
let adminDb: Firestore

function getFirebaseAdmin() {
  if (!adminApp) {
    const existingApps = getApps()
    if (existingApps.length > 0) {
      adminApp = existingApps[0]
    } else {
      const projectId = process.env.FIREBASE_PROJECT_ID
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
          'Missing Firebase Admin environment variables. ' +
          'Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local'
        )
      }

      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      })
    }
  }

  return adminApp
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    const app = getFirebaseAdmin()
    adminDb = getFirestore(app)
  }
  return adminDb
}

export default getFirebaseAdmin
