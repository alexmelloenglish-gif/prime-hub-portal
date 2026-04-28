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
  const grammarAccents = [
    'border-amber-300/25 bg-[linear-gradient(145deg,rgba(251,191,36,0.12),rgba(255,255,255,0.03))]',
    'border-sky-300/25 bg-[linear-gradient(145deg,rgba(125,211,252,0.12),rgba(255,255,255,0.03))]',
    'border-emerald-300/25 bg-[linear-gradient(145deg,rgba(52,211,153,0.12),rgba(255,255,255,0.03))]',
    'border-rose-300/25 bg-[linear-gradient(145deg,rgba(253,164,175,0.12),rgba(255,255,255,0.03))]',
    'border-violet-300/25 bg-[linear-gradient(145deg,rgba(196,181,253,0.12),rgba(255,255,255,0.03))]',
  ]

  return (
    <SectionShell
      title="My Grammar Overview"
      description="Cumulative grammar focus points extracted from Rafael&apos;s portfolio and teacher review."
    >
      <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
        <h3 className="text-xl font-semibold text-white">{student.grammarOverview.title}</h3>
        <p className="mt-3 text-sm leading-7 text-prime-cream/82">
          {student.grammarOverview.summary}
        </p>

        <ul className="mt-5 space-y-3">
          {student.grammarOverview.focusPoints.map((point, index) => (
            <li
              key={point}
              className={`rounded-2xl border px-4 py-4 text-sm leading-6 text-prime-cream/82 ${grammarAccents[index % grammarAccents.length]}`}
            >
              <div className="flex gap-4">
                <span className="mt-0.5 text-xs font-semibold uppercase tracking-[0.22em] text-prime-cream/55">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{point}</span>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </SectionShell>
  )
}
