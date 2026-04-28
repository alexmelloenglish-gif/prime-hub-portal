import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function requiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getFirebaseApp() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: requiredEnv('FIREBASE_PROJECT_ID'),
        clientEmail: requiredEnv('FIREBASE_CLIENT_EMAIL'),
        privateKey: requiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
    })
  }

  return getApps()[0]
}

async function main() {
  const [, , filePath, collectionName = 'students', documentId] = process.argv

  if (!filePath) {
    throw new Error('Usage: node scripts/upsert-student-firestore.mjs <json-file> [collection] [document-id]')
  }

  const fileContent = await readFile(filePath, 'utf-8')
  const payload = JSON.parse(fileContent)
  const fallbackDocId =
    documentId ||
    payload.documentId ||
    payload.studentEmail?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
    'student-record'

  const firestore = getFirestore(getFirebaseApp())

  await firestore.collection(collectionName).doc(fallbackDocId).set(payload, { merge: true })

  console.log(`Student document upserted successfully.`)
  console.log(`Collection: ${collectionName}`)
  console.log(`Document: ${fallbackDocId}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
