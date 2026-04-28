import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'
import { getStudentDashboardState, isAdminUser } from '@/lib/student-data'

type FeedbackPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function DashboardTeacherFeedbackPage({
  searchParams,
}: FeedbackPageProps) {
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
      title="Teacher Feedback"
      description="Cumulative feedback blocks extracted from Rafael&apos;s portfolio and monthly review."
    >
      <div className="space-y-4">
        {student.teacherFeedback.map((feedback, index) => (
          <article
            key={feedback.id}
            className={`rounded-[28px] border p-6 ${
              index === 0
                ? 'border-prime-red/25 bg-[linear-gradient(140deg,rgba(168,34,23,0.16),rgba(255,255,255,0.03))] shadow-[0_20px_50px_rgba(168,34,23,0.14)]'
                : 'border-sky-300/20 bg-[linear-gradient(140deg,rgba(56,189,248,0.14),rgba(255,255,255,0.03))] shadow-[0_20px_50px_rgba(56,189,248,0.10)]'
            }`}
          >
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-prime-cream/55">
                Teacher perspective
              </p>
              <h3 className="text-xl font-semibold text-white">{feedback.title}</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-prime-cream/86">{feedback.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
