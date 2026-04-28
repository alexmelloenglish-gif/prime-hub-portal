import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'
import { getStudentDashboardState, isAdminUser } from '@/lib/student-data'

type GrammarPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function DashboardGrammarPage({ searchParams }: GrammarPageProps) {
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
      title="My Grammar Overview"
      description="Cumulative grammar focus points extracted from Rafael&apos;s portfolio and teacher review."
    >
      <article className="glass-card p-6">
        <h3 className="text-xl font-semibold text-white">{student.grammarOverview.title}</h3>
        <p className="mt-3 text-sm leading-6 text-prime-cream/80">
          {student.grammarOverview.summary}
        </p>

        <ul className="mt-5 space-y-3">
          {student.grammarOverview.focusPoints.map((point) => (
            <li
              key={point}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-6 text-prime-cream/80"
            >
              {point}
            </li>
          ))}
        </ul>
      </article>
    </SectionShell>
  )
}
