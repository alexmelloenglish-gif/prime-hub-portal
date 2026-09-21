import type { Metadata } from 'next'
import claudioProfile from '@/data/students/claudio-bit-gmail-com.firestore.json'
import { AdultLearnerJourneyDashboard } from '@/components/dashboard/adult-learner-journey-dashboard'
import { parseStudentDocument } from '@/lib/student-data'

export const metadata: Metadata = { title: 'Cláudio • My English Journey | Prime Digital Hub', description: 'Standalone learning journey view for Cláudio.', robots: { index:false, follow:false, nocache:true } }
export default function ClaudioJourneyPage(){ const student=parseStudentDocument(claudioProfile as unknown as Record<string,unknown>,claudioProfile.studentEmail,claudioProfile.studentName); return <AdultLearnerJourneyDashboard student={student}/> }
