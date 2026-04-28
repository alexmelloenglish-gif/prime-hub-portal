import { StudentData } from '@/types/student'

const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE === 'true'

/**
 * Fetches student data from Firestore by UID.
 * Falls back to local JSON seed data if PREVIEW_MODE is enabled
 * or if Firestore is unavailable (e.g. missing credentials in dev).
 */
export async function getStudentData(uid: string): Promise<StudentData | null> {
  // Preview / local development fallback
  if (PREVIEW_MODE || !process.env.FIREBASE_PROJECT_ID) {
    try {
      const seed = await import(`@/data/students/rafael-copolino.json`)
      console.warn('[student-data] Running in PREVIEW MODE — returning seed data')
      return seed.default as StudentData
    } catch {
      console.error('[student-data] Preview mode active but seed file not found')
      return null
    }
  }

  // Production: fetch from Firestore
  try {
    const { getAdminDb } = await import('@/lib/firebase-admin')
    const db = getAdminDb()

    const docRef = db.collection('students').doc(uid)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      console.warn(`[student-data] No Firestore document found for uid: ${uid}`)
      return null
    }

    return snapshot.data() as StudentData
  } catch (error) {
    console.error('[student-data] Error fetching from Firestore:', error)
    return null
  }
}

/**
 * Checks if a student has active access.
 * Returns true if status is 'active', false otherwise.
 */
export async function checkStudentAccess(uid: string): Promise<boolean> {
  const student = await getStudentData(uid)
  return student?.status === 'active'
}
