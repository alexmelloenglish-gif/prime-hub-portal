import type { App } from 'firebase-admin/app'
import type { Firestore } from 'firebase-admin/firestore'

/**
 * Firestore is frozen during the production migration to the canonical
 * Neon-backed student state. No application path should access Firestore.
 *
 * These functions keep their historical return types so legacy callers can
 * still type-check while the migration is in progress. They always throw at
 * runtime, and isFirebaseConfigured remains false so supported application
 * paths use the canonical repository/Neon state instead.
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

export function getFirebaseAdminApp(): App {
  return firestoreDisabled()
}

export function getFirebaseFirestore(): Firestore {
  return firestoreDisabled()
}

export function getFirebaseFirestoreWriter(): Firestore {
  return firestoreDisabled()
}
