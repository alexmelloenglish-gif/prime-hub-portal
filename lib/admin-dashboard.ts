import type { Session } from 'next-auth'
import {
  getFirebaseConfigStatus,
  getFirebaseFirestore,
  isFirebaseConfigured,
} from '@/lib/firebase-admin'
import rafaelProfile from '@/data/students/rafael-copolillo.firestore.json'
import louiseProfile from '@/data/students/louise-d-silva-nogueira.firestore.json'
import { normalizeEmail } from '@/lib/student-data'

type AuthenticatedUser = Session['user'] | null | undefined

export type StudentDirectoryEntry = {
  id: string
  studentEmail: string
  studentName: string
  currentLevel: string
  targetLevel: string
  attendanceRate: string
}

const repositoryStudentDirectory: StudentDirectoryEntry[] = [
  {
    id: 'rafael-copolillo-gmail-com',
    studentEmail: normalizeEmail(String(rafaelProfile.studentEmail)),
    studentName: String(rafaelProfile.studentName),
    currentLevel: String(rafaelProfile.currentLevel),
    targetLevel: String(rafaelProfile.targetLevel),
    attendanceRate: String(rafaelProfile.attendanceRate),
  },
  {
    id: 'louise-nogueira-hotmail-com',
    studentEmail: normalizeEmail(String(louiseProfile.studentEmail)),
    studentName: String(louiseProfile.studentName),
    currentLevel: String(louiseProfile.currentLevel),
    targetLevel: String(louiseProfile.targetLevel),
    attendanceRate: String(louiseProfile.attendanceRate),
  },
]

function getRepositoryStudentDirectory(reason: string): StudentDirectoryEntry[] {
  console.warn(`[admin-dashboard] Using the two-student repository directory: ${reason}`)
  return repositoryStudentDirectory.map((student) => ({ ...student }))
}

export async function listStudentsForAdmin(_user: AuthenticatedUser): Promise<StudentDirectoryEntry[]> {
  if (!isFirebaseConfigured) {
    console.error('[admin-dashboard] Firebase is disabled or unavailable for the current runtime', getFirebaseConfigStatus())
    return getRepositoryStudentDirectory('Firebase is not configured')
  }

  try {
    const firestore = getFirebaseFirestore()
    const collectionName = process.env.FIREBASE_STUDENT_COLLECTION || 'students'
    const snapshot = await firestore.collection(collectionName).get()

    const students = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        const studentEmail = normalizeEmail(
          typeof data.studentEmail === 'string' ? data.studentEmail : ''
        )

        if (!studentEmail) {
          return null
        }

        return {
          id: doc.id,
          studentEmail,
          studentName:
            typeof data.studentName === 'string' && data.studentName.trim()
              ? data.studentName.trim()
              : studentEmail,
          currentLevel:
            typeof data.currentLevel === 'string' && data.currentLevel.trim()
              ? data.currentLevel.trim()
        : 'B2 Upper-Intermediate',
          targetLevel:
            typeof data.targetLevel === 'string' && data.targetLevel.trim()
              ? data.targetLevel.trim()
        : 'C1 Advanced',
          attendanceRate:
            typeof data.attendanceRate === 'string' && data.attendanceRate.trim()
              ? data.attendanceRate.trim()
              : '0%',
        } satisfies StudentDirectoryEntry
      })
      .filter((student): student is StudentDirectoryEntry => Boolean(student))
      .sort((a, b) => a.studentName.localeCompare(b.studentName))

    if (!students.length) {
      console.error('[admin-dashboard] Firestore returned no valid student documents')
      return getRepositoryStudentDirectory('Firestore returned no valid documents')
    }
    return students
  } catch (error) {
    console.error('[admin-dashboard] Firestore student directory unavailable', {
      ...getFirebaseConfigStatus(),
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
    })
    return getRepositoryStudentDirectory('Firestore directory read failed')
  }
}
