import type { Session } from 'next-auth'
import { getFirebaseFirestore, isFirebaseConfigured } from '@/lib/firebase-admin'
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

const fallbackStudents: StudentDirectoryEntry[] = [
  {
    id: 'rafael-copolillo-gmail-com',
    studentEmail: 'rafael.copolillo@gmail.com',
    studentName: 'Rafael Copolillo',
    currentLevel: 'B2 Upper-Intermediate',
    targetLevel: 'C1 Advanced',
    attendanceRate: '100%',
  },
]

export async function listStudentsForAdmin(_user: AuthenticatedUser): Promise<StudentDirectoryEntry[]> {
  if (!isFirebaseConfigured) {
    return fallbackStudents
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

    return students.length ? students : fallbackStudents
  } catch {
    return fallbackStudents
  }
}
