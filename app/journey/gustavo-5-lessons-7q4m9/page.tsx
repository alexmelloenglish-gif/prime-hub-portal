import type { Metadata } from 'next'
import gustavoProfile from '@/data/students/carolvdrummond-gmail-com.firestore.json'
import { YoungLearnerJourneyDashboard } from '@/components/dashboard/young-learner-journey-dashboard'
import { parseStudentDocument } from '@/lib/student-data'

export const metadata: Metadata = {
  title: 'Gustavo • My English Journey | Prime Digital Hub',
  description: 'Family learning journey view for Gustavo.',
  robots: { index: false, follow: false, nocache: true },
}

export default function GustavoFamilyJourneyPage() {
  const student = parseStudentDocument(
    gustavoProfile as unknown as Record<string, unknown>,
    gustavoProfile.studentEmail,
    gustavoProfile.studentName
  )

  return <YoungLearnerJourneyDashboard student={student} publicMode />
}
