import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BrainCircuit, ShieldCheck, Sparkles } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { TeacherIntelligenceNav } from '@/components/teacher/teacher-intelligence-nav'

export const dynamic = 'force-dynamic'

export default async function TeacherIntelligenceLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  if (!isAdminUser(session.user)) redirect('/pending-access')

  return (
    <div className="teacher-intelligence-surface mx-auto max-w-[1500px] space-y-5">
      <header className="relative overflow-hidden rounded-[32px] border border-indigo-100 bg-[radial-gradient(circle_at_88%_8%,rgba(255,255,255,0.95),transparent_24%),linear-gradient(125deg,#eef2ff_0%,#f7f9ff_48%,#fff9f4_100%)] p-5 text-[#0a235c] shadow-[0_22px_60px_rgba(37,55,120,0.10)] md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[#263c86] p-3 text-white shadow-[0_12px_28px_rgba(38,60,134,0.22)]">
              <BrainCircuit className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6073a2]">Pedagogical command center</p>
              <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#0a235c] md:text-4xl">Teacher Intelligence</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#49617f] md:text-base">
                A teacher-first workspace for reading lesson evidence, spotting learning patterns and deciding what deserves pedagogical action next.
              </p>
            </div>
          </div>

          <div className="flex max-w-xl flex-wrap items-center gap-2 lg:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-2 text-xs font-semibold text-[#40558b] shadow-sm">
              <Sparkles className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              AI proposes
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Teacher validates
            </span>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0a235c] shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              System Admin
            </Link>
          </div>
        </div>

        <div className="relative mt-5">
          <TeacherIntelligenceNav />
        </div>
      </header>
      {children}
    </div>
  )
}
