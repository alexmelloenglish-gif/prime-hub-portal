import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'
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

  return (
    <SectionShell
      title="My Vocabulary Bank"
      description="Cumulative vocabulary gathered from Rafael&apos;s lessons, ready for active review and reuse."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {student.vocabularyBank.map((item) => (
          <article key={item.id} className="glass-card p-6">
            <p className="text-xl font-semibold text-white">{item.term}</p>
            <p className="mt-3 text-sm leading-6 text-prime-cream/80">{item.meaning}</p>
            <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm italic text-prime-cream/65">
              {item.example}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
