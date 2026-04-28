import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      } as admin.ServiceAccount),
    })
  } else {
    // Firebase não configurado — preview mode ativo
    console.warn('[firebase-admin] Variáveis de ambiente não configuradas. Preview mode ativo.')
  }
}

export const getFirestore = (): admin.firestore.Firestore | null => {
  if (!admin.apps.length) return null
  return admin.firestore()
}

export const getAuth = (): admin.auth.Auth | null => {
  if (!admin.apps.length) return null
  return admin.auth()
}

export default admin
