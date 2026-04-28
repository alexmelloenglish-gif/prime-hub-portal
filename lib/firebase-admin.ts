import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function readPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
}

export const isFirebaseConfigured = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
)

export function getFirebaseAdminApp() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase Admin is not configured.')
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: readPrivateKey(),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  }

  return getApps()[0]
}

export function getFirebaseFirestore() {
  return getFirestore(getFirebaseAdminApp())
}
