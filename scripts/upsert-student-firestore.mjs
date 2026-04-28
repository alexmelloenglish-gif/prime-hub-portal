#!/usr/bin/env node
/**
 * Upsert student data into Firestore.
 *
 * Usage:
 *   node scripts/upsert-student-firestore.mjs <email> <json-file>
 *
 * Example:
 *   node scripts/upsert-student-firestore.mjs rafael.copolillo@gmail.com data/students/rafael-copolillo.firestore.json
 *
 * Required env vars (in .env.local or environment):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Load .env.local manually (Node doesn't load it automatically)
try {
  const { config } = await import('dotenv')
  config({ path: resolve(process.cwd(), '.env.local') })
} catch {
  // dotenv not installed — rely on environment variables already set
}

const [email, jsonFile] = process.argv.slice(2)

if (!email || !jsonFile) {
  console.error('Usage: node scripts/upsert-student-firestore.mjs <email> <json-file>')
  process.exit(1)
}

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error('Missing FIREBASE_* environment variables. Check your .env.local file.')
  process.exit(1)
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })

const db = getFirestore(app)
const collection = process.env.FIREBASE_STUDENT_COLLECTION ?? 'students'

const data = JSON.parse(readFileSync(resolve(process.cwd(), jsonFile), 'utf-8'))

console.log(`Upserting student "${email}" into collection "${collection}"...`)

await db.collection(collection).doc(email).set(data, { merge: true })

console.log(`✅ Done! Document ID: ${email}`)
process.exit(0)
