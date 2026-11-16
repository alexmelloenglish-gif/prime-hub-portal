import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { authOptions } from '@/lib/auth'
import { getStudentDashboardState, isAdminUser } from '@/lib/student-data'
import { isAuthorizedLearner } from '@/lib/learner-eligibility'
import { resolveStudentProfileAsset } from '@/lib/canonical-dashboard'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const isDevPreview =
    process.env.NODE_ENV === 'development' && (await cookies()).get('prime-dev-preview')?.value === '1'

  const previewUser = isDevPreview
    ? {
        id: 'dev-preview-admin',
        name: 'Prime Admin Preview',
        email: 'alexandre@primedigitalhub.com.br',
        image: null,
        role: 'admin',
      }
    : null

  const activeUser = session?.user ?? previewUser

  if (!activeUser) {
    redirect('/login')
  }

  const adminUser = isAdminUser(activeUser)
  const studentState = await getStudentDashboardState(activeUser)
  const activeStudentEmail = studentState.student?.studentEmail ?? activeUser.email
  const eligibleLearner = isAuthorizedLearner(activeStudentEmail)

  if (!adminUser && !eligibleLearner && process.env.NODE_ENV !== 'development') {
    redirect('/pending-access')
  }

  if (!studentState.hasAccess && !adminUser && process.env.NODE_ENV !== 'development') {
    redirect('/pending-access')
  }

  const topbarUser = {
    name: studentState.student?.studentName ?? activeUser.name,
    // Learner/responsible-account sessions display the authenticated account identity.
    // Admin preview may continue to display the target learner's legacy/profile email.
    email: adminUser
      ? (studentState.student?.studentEmail ?? activeUser.email)
      : activeUser.email,
    image: resolveStudentProfileAsset(studentState.student?.studentId, activeUser.image),
  }

  return (
    <div className="dashboard-light min-h-dvh overflow-x-hidden bg-[#f5f9ff] text-[#0a235c]">
      <Sidebar isAdmin={adminUser} />
      <div className="min-h-dvh md:ml-64">
        <Topbar user={topbarUser} />
        <main className="min-w-0 p-4 pb-24 md:p-5 md:pb-8">
          {studentState.dataFreshness === 'historical' ? (
            <section role="status" className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
              <strong>Historical learning snapshot.</strong> The profile includes retained repository records and is not verified as the learner&apos;s current state. Treat levels, attendance, priorities and lesson summaries as historical reference until the corresponding PLIE records are confirmed as published in Neon.
            </section>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  )
}
