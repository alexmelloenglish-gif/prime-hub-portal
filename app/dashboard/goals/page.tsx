import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'
import { getStudentDashboardState, isAdminUser } from '@/lib/student-data'

const goalStatusClasses = {
  'on-track': 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  attention: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  completed: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
} as const

type GoalsPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function DashboardGoalsPage({ searchParams }: GoalsPageProps) {
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
      title="My Weekly Goals"
      description="Weekly learning priorities kept visible so the student always knows the next focus."
    >
      <div className="space-y-4">
        {student.goals.map((goal) => (
          <article key={goal.id} className="glass-card p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{goal.title}</h3>
                <p className="mt-3 text-sm leading-6 text-prime-cream/80">{goal.description}</p>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${goalStatusClasses[goal.status]}`}
              >
                {goal.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
