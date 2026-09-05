import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
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

  if (!studentState.hasAccess && !adminUser && process.env.NODE_ENV !== 'development') {
    redirect('/pending-access')
  }

  const topbarUser = {
    name: studentState.student?.studentName ?? activeUser.name,
    email: studentState.student?.studentEmail ?? activeUser.email,
    image:
      studentState.student?.studentEmail?.toLowerCase() === 'rafael.copolillo@gmail.com'
        ? '/assets/rafael-profile.svg'
        : activeUser.image,
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
