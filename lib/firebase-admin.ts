/**
 * Firestore is frozen during the production migration to the canonical
 * Neon-backed student state. No application path should access Firestore.
 */

export const isFirebaseConfigured = false

export function getFirebaseConfigStatus() {
  return {
    runtimeMode: 'repository' as const,
    projectIdPresent: false,
    clientEmailPresent: false,
    clientEmailLooksLikeServiceAccount: false,
    privateKeyPresent: false,
    privateKeyHasPemMarkers: false,
    federatedAuthConfigured: false,
    federationProjectNumberPresent: false,
    federationAudiencePresent: false,
    federationServiceAccountPresent: false,
    writerFederatedAuthConfigured: false,
    authMode: 'repository' as const,
  }
}

function firestoreDisabled(): never {
  throw new Error('Firestore is frozen: production runtime uses the canonical repository/Neon student state.')
}

export function getFirebaseAdminApp(): never {
  return firestoreDisabled()
}

export function getFirebaseFirestore(): never {
  return firestoreDisabled()
}

export function getFirebaseFirestoreWriter(): never {
  return firestoreDisabled()
}
