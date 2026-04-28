import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'
import { getStudentDashboardState, isAdminUser } from '@/lib/student-data'

const progressBarClasses = {
  green: 'bg-emerald-400',
  yellow: 'bg-amber-300',
  pink: 'bg-rose-300',
  blue: 'bg-sky-300',
} as const

const progressValueByStatus: Record<string, number> = {
  Strong: 86,
  'Active Growth': 72,
  Improving: 64,
  'Very Strong': 93,
}

type ProgressPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function DashboardProgressPage({ searchParams }: ProgressPageProps) {
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
      title="Progress Tracker"
      description="A clear pedagogical snapshot combining fluency, grammar and analytical performance with visual progress bars."
    >
      <div className="space-y-4">
        {student.progressTracker.map((item) => {
          const progressValue = progressValueByStatus[item.status] ?? 60

          return (
            <article key={item.id} className="glass-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-prime-cream/70">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-prime-cream/75">{item.insight}</p>
                </div>

                <div className="w-full max-w-xs space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-prime-cream/55">
                    <span>Progress</span>
                    <span>{progressValue}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${progressBarClasses[item.accent]}`}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </SectionShell>
  )
}
