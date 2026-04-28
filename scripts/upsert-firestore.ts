/**
 * Script: upsert-firestore.ts
 * Uso: npx ts-node scripts/upsert-firestore.ts
 * ou via: npm run firestore:seed:rafael
 *
 * Insere ou atualiza os dados do Rafael Copolino no Firestore.
 * Requer .env.local com FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Carrega .env.local antes de qualquer import do Firebase
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import * as admin from 'firebase-admin'
import rafaelJson from '../data/students/rafael-copolino.json'

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Variáveis de ambiente do Firebase não encontradas.')
    console.error('   Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY no .env.local')
    process.exit(1)
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey } as admin.ServiceAccount),
    })
  }

  const db = admin.firestore()
  const email = rafaelJson.info.email.toLowerCase()

  console.log(`🔍 Verificando documento existente para: ${email}`)

  // Busca documento existente por email
  const existing = await db
    .collection('students')
    .where('info.email', '==', email)
    .limit(1)
    .get()

  if (!existing.empty) {
    // Atualiza documento existente
    const docRef = existing.docs[0].ref
    await docRef.set(rafaelJson, { merge: true })
    console.log(`✅ Documento atualizado para ${rafaelJson.info.name} (ID: ${docRef.id})`)
  } else {
    // Cria novo documento
    const docRef = await db.collection('students').add(rafaelJson)
    console.log(`✅ Documento criado para ${rafaelJson.info.name} (ID: ${docRef.id})`)
  }

  console.log('🎉 Seed do Firestore concluído com sucesso!')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Erro no seed:', err)
  process.exit(1)
})
