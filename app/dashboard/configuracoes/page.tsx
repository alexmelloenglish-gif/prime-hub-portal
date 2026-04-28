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
        {student.teacherFeedback.map((feedback) => (
          <article key={feedback.id} className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white">{feedback.title}</h3>
            <p className="mt-4 text-sm leading-7 text-prime-cream/80">{feedback.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
