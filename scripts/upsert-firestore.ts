/**
 * Script: upsert-firestore.ts
 * Usage: pnpm firestore:seed:rafael
 *
 * Reads data/students/rafael-copolino.json and upserts it
 * into the Firestore 'students' collection using the student's uid as doc ID.
 *
 * Prerequisites:
 *   - .env.local must have FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *   - Run from project root: npx ts-node --project tsconfig.json scripts/upsert-firestore.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load .env.local before anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin environment variables.')
    console.error('   Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local')
    process.exit(1)
  }

  // Init Firebase Admin
  const app = getApps().length === 0
    ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId })
    : getApps()[0]

  const db = getFirestore(app)

  // Load seed file
  const seedPath = path.resolve(process.cwd(), 'data/students/rafael-copolino.json')

  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found: ${seedPath}`)
    process.exit(1)
  }

  const studentData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'))
  const uid = studentData.uid

  if (!uid) {
    console.error('❌ Seed file must contain a "uid" field.')
    process.exit(1)
  }

  console.log(`📤 Upserting student data for uid: ${uid}`)

  await db.collection('students').doc(uid).set(studentData, { merge: true })

  console.log(`✅ Success! Document students/${uid} upserted in Firestore.`)
  console.log(`   Project: ${projectId}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
