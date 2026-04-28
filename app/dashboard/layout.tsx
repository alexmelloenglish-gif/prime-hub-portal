import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { authOptions } from '@/lib/auth'
import { getStudentData } from '@/lib/student-data'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const email = session.user.email ?? ''
  const isAdmin = session.user.role === 'admin'

  if (!isAdmin) {
    const studentData = await getStudentData(email)

    // null = Firebase configurado mas aluno não existe → pending-access
    // previewMode = Firebase não configurado → permite acesso com dados de preview
    if (studentData === null) {
      redirect('/dashboard/pending-access')
    }
  }

  return (
    <div className="min-h-screen bg-prime-dark">
      <Sidebar />
      <div className="min-h-screen md:ml-64">
        <Topbar user={session.user} />
        <main className="p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>
    </div>
  )
}
