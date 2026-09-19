import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { authOptions } from '@/lib/auth'
import { getStudentDashboardState, isAdminUser } from '@/lib/student-data'
import { isAuthorizedLearner } from '@/lib/learner-eligibility'
import { resolveStudentProfileAsset } from '@/lib/canonical-dashboard'
import { getG6CanonicalDashboardState, isG6CanonicalConsumerEnabled } from '@/lib/g6-canonical-consumer'

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

  let topbarUser: {
    name: string | null | undefined
    email: string | null | undefined
    image: string | null
  }

  if (!adminUser && isG6CanonicalConsumerEnabled()) {
    const canonicalState = await getG6CanonicalDashboardState(activeUser)

    if (canonicalState.status !== 'AUTHORIZED' && process.env.NODE_ENV !== 'development') {
      redirect('/pending-access')
    }

    if (canonicalState.status === 'AUTHORIZED') {
      topbarUser = {
        name: canonicalState.learnerName,
        email: canonicalState.accountContactEmail ?? activeUser.email,
        image: resolveStudentProfileAsset(canonicalState.learnerId, activeUser.image),
      }
    } else {
      topbarUser = {
        name: activeUser.name,
        email: activeUser.email,
        image: activeUser.image ?? null,
      }
    }
  } else {
    const studentState = await getStudentDashboardState(activeUser)
    const activeStudentEmail = studentState.student?.studentEmail ?? activeUser.email
    const eligibleLearner = isAuthorizedLearner(activeStudentEmail)

    if (!adminUser && !eligibleLearner && process.env.NODE_ENV !== 'development') {
      redirect('/pending-access')
    }

    if (!studentState.hasAccess && !adminUser && process.env.NODE_ENV !== 'development') {
      redirect('/pending-access')
    }

    topbarUser = {
      name: studentState.student?.studentName ?? activeUser.name,
      email: studentState.student?.studentEmail ?? activeUser.email,
      image: resolveStudentProfileAsset(studentState.student?.studentId, activeUser.image),
    }
  }

  return (
    <div className="dashboard-light min-h-dvh overflow-x-hidden bg-[#f5f9ff] text-[#0a235c]">
      <Sidebar isAdmin={adminUser} />
      <div className="min-h-dvh md:ml-64">
        <Topbar user={topbarUser} />
        <main className="min-w-0 p-4 pb-24 md:p-5 md:pb-8">{children}</main>
      </div>
    </div>
  )
}
