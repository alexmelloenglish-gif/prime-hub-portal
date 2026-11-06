import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import gustavoProfile from '@/data/students/carolvdrummond-gmail-com.firestore.json'
import { YoungLearnerJourneyDashboard } from '@/components/dashboard/young-learner-journey-dashboard'
import { parseStudentDocument } from '@/lib/student-data'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Gustavo • My English Journey | Prime Digital Hub',
  description: 'Family learning journey view for Gustavo.',
  robots: { index: false, follow: false, nocache: true },
}

export default async function GustavoFamilyJourneyPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/login?callbackUrl=%2Fjourney%2Fgustavo-5-lessons-7q4m9')
  }

  const student = parseStudentDocument(
    gustavoProfile as unknown as Record<string, unknown>,
    gustavoProfile.studentEmail,
    gustavoProfile.studentName
  )

  return <YoungLearnerJourneyDashboard student={student} publicMode />
}
