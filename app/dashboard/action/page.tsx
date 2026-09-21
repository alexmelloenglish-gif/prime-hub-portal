import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SectionShell } from '@/components/dashboard/section-shell'
import { ActionWorkspace } from '@/components/dashboard/action-workspace'
import { authOptions } from '@/lib/auth'
import { getStudentDashboardState, isAdminUser } from '@/lib/student-data'

type ActionPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function DashboardActionPage({ searchParams }: ActionPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  if (!session?.user) redirect('/login')

  const studentState = await getStudentDashboardState(session.user, resolvedSearchParams?.studentEmail)
  if (!studentState.hasAccess || !studentState.student) {
    if (isAdminUser(session.user)) redirect('/dashboard/admin')
    redirect('/pending-access')
  }

  const student = studentState.student
  const action = student.canonicalProjection.nextAction
  if (!action) redirect('/dashboard')

  return (
    <SectionShell
      title="Action Workspace"
      description="A focused place to complete the next authorized learning action."
    >
      <ActionWorkspace
        title={action.title}
        description={action.description}
        vocabulary={student.vocabularyBank.map((item) => item.term)}
        studentEmail={student.studentEmail}
        actionId={action.id}
        materialUrl={action.id === 'action-professional-introduction-60s' ? 'https://docs.google.com/presentation/d/18UsCOs01mfAj1EYmhWl7YzofIWPjnOiu/edit' : undefined}
        bookingUrl={action.id === 'action-professional-introduction-60s' ? 'https://calendar.app.google/z1N7yrhvrVr6WyfFA' : undefined}
      />
    </SectionShell>
  )
}
