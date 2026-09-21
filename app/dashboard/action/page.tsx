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

const ITALO_ACTION_ID = 'action-professional-introduction-60s'
const CLAUDIO_ACTION_ID = 'next-diving-destination-project'
const PRIME_BOOKING_URL = 'https://calendar.app.google/z1N7yrhvrVr6WyfFA'

export default async function DashboardActionPage({ searchParams }: ActionPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  if (!session?.user) {
    const callbackUrl = resolvedSearchParams?.studentEmail
      ? `/dashboard/action?studentEmail=${encodeURIComponent(resolvedSearchParams.studentEmail)}`
      : '/dashboard/action'
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  const studentState = await getStudentDashboardState(session.user, resolvedSearchParams?.studentEmail)
  if (!studentState.hasAccess || !studentState.student) {
    if (isAdminUser(session.user)) redirect('/dashboard/admin')
    redirect('/pending-access')
  }

  const student = studentState.student
  const action = student.canonicalProjection.nextAction
  if (!action) redirect('/dashboard')

  const vocabulary =
    action.id === CLAUDIO_ACTION_ID
      ? student.vocabularyBank
          .filter((item) =>
            ['security margin', 'depth', 'dive computer', 'logistics', 'investment'].includes(
              item.term.toLowerCase()
            )
          )
          .map((item) => item.term)
      : student.vocabularyBank.map((item) => item.term)

  const hasAudioMission =
    action.id === ITALO_ACTION_ID || action.id === CLAUDIO_ACTION_ID

  return (
    <SectionShell
      title="Action Workspace"
      description="A focused place to complete the next authorized learning action."
    >
      <ActionWorkspace
        title={action.title}
        description={action.description}
        vocabulary={vocabulary}
        studentEmail={student.studentEmail}
        actionId={action.id}
        materialUrl={
          action.id === ITALO_ACTION_ID
            ? 'https://docs.google.com/presentation/d/18UsCOs01mfAj1EYmhWl7YzofIWPjnOiu/edit'
            : undefined
        }
        bookingUrl={hasAudioMission ? PRIME_BOOKING_URL : undefined}
      />
    </SectionShell>
  )
}
