import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { BrainCircuit } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { TeacherIntelligenceNav } from '@/components/teacher/teacher-intelligence-nav'

export const dynamic = 'force-dynamic'

export default async function TeacherIntelligenceLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  if (!isAdminUser(session.user)) redirect('/pending-access')

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <header className="glass-card overflow-hidden p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-prime-red/20 bg-prime-red/15 p-3 text-white">
              <BrainCircuit className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-prime-cream/45">Internal teacher surface</p>
              <h1 className="mt-1 text-2xl font-semibold text-white md:text-3xl">Teacher Intelligence</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/65">
                Observe, review, validate and trace the real runtime. AI proposals remain proposals until human authorization exists.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-5 text-prime-cream/60">
            <p><span className="font-semibold text-prime-cream/85">Viewer:</span> {session.user.email}</p>
            <p><span className="font-semibold text-prime-cream/85">Rule:</span> the dashboard must never lie.</p>
          </div>
        </div>
        <div className="mt-5">
          <TeacherIntelligenceNav />
        </div>
      </header>
      {children}
    </div>
  )
}
