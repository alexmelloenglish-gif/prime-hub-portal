import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SectionShell } from '@/components/dashboard/section-shell'
import { VocabularyReuseGrid } from '@/components/dashboard/vocabulary-reuse-grid'
import { authOptions } from '@/lib/auth'
import { selectActiveVocabulary } from '@/lib/dashboard-display-budget'
import { getStudentDashboardState, isAdminUser } from '@/lib/student-data'

type VocabularyPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function DashboardVocabularyPage({ searchParams }: VocabularyPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  if (!session?.user) {
    redirect('/login')
  }

  const studentState = await getStudentDashboardState(
    session.user,
    resolvedSearchParams?.studentEmail
  )

  if (!studentState.hasAccess || !studentState.student) {
    if (isAdminUser(session.user)) {
      redirect('/dashboard/admin')
    }

    redirect('/pending-access')
  }

  const student = studentState.student
  const activeVocabulary = selectActiveVocabulary(student.vocabularyBank, student.classReports)

  return (
    <SectionShell
      title="Vocabulary to Reuse"
      description="A small active set from your learning record. Write your own sentence, lock it, and your sentence will return whenever this word comes back for review."
    >
      {activeVocabulary.length ? (
        <VocabularyReuseGrid
          studentEmail={student.studentEmail}
          items={activeVocabulary}
          tone="light"
        />
      ) : (
        <p className="rounded-2xl border border-slate-300 bg-white p-5 text-sm text-slate-700 shadow-sm">
          No vocabulary has been selected for active reuse yet.
        </p>
      )}
    </SectionShell>
  )
}
