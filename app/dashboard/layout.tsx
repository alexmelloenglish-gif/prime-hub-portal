import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { authOptions } from '@/lib/auth'
import { getStudentDashboardState, isAdminUser } from '@/lib/student-data'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const adminUser = isAdminUser(session.user)
  const studentState = await getStudentDashboardState(session.user)

  if (!studentState.hasAccess && !adminUser && process.env.NODE_ENV !== 'development') {
    redirect('/pending-access')
  }

  const topbarUser = {
    name: studentState.student?.studentName ?? session.user.name,
    email: studentState.student?.studentEmail ?? session.user.email,
    image: session.user.image,
  }

  return (
    <div className="min-h-screen bg-prime-dark">
      <Sidebar isAdmin={adminUser} />
      <div className="min-h-screen md:ml-64">
        <Topbar user={topbarUser} />
        <main className="p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>
    </div>
  )
}
