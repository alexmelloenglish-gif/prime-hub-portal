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
  const cardAccents = [
    'border-amber-300/25 bg-[linear-gradient(145deg,rgba(251,191,36,0.14),rgba(255,255,255,0.03))] shadow-[0_18px_45px_rgba(251,191,36,0.12)]',
    'border-emerald-300/25 bg-[linear-gradient(145deg,rgba(52,211,153,0.14),rgba(255,255,255,0.03))] shadow-[0_18px_45px_rgba(16,185,129,0.12)]',
    'border-sky-300/25 bg-[linear-gradient(145deg,rgba(125,211,252,0.14),rgba(255,255,255,0.03))] shadow-[0_18px_45px_rgba(56,189,248,0.12)]',
    'border-rose-300/25 bg-[linear-gradient(145deg,rgba(253,164,175,0.14),rgba(255,255,255,0.03))] shadow-[0_18px_45px_rgba(244,63,94,0.12)]',
  ]

  return (
    <SectionShell
      title="My Vocabulary Bank"
      description="Cumulative vocabulary gathered from Rafael&apos;s lessons, ready for active review and reuse."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {student.vocabularyBank.map((item, index) => (
          <article
            key={item.id}
            className={`rounded-[28px] border p-6 ${cardAccents[index % cardAccents.length]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-prime-cream/55">
                  Active vocabulary
                </p>
                <p className="mt-2 text-xl font-semibold text-white">{item.term}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-prime-cream/65">
                Reuse
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-prime-cream/82">{item.meaning}</p>
            <p className="mt-4 rounded-2xl border border-black/10 bg-black/20 px-4 py-3 text-sm italic text-prime-cream/72">
              {item.example}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
