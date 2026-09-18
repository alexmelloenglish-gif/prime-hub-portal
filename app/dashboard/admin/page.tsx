import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BrainCircuit, ClipboardCheck, Eye, ShieldCheck, Users } from 'lucide-react'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'
import { listStudentsForAdmin } from '@/lib/admin-dashboard'
import { isAdminUser } from '@/lib/student-data'

export default async function DashboardAdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  if (!isAdminUser(session.user)) {
    redirect('/pending-access')
  }

  const students = await listStudentsForAdmin(session.user)

  return (
    <SectionShell
      title="Admin"
      description="Manage authorized learners, preview student dashboards and open teacher review tools."
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 text-[#0a235c] shadow-[0_18px_42px_rgba(15,48,93,0.08)]">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
              <Users aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7184a1]">Student access</p>
              <h2 className="mt-1 text-xl font-semibold">{students.length} authorized learners</h2>
              <p className="mt-2 text-sm leading-6 text-[#49617f]">
                Preview each learner&apos;s current dashboard and confirm that the learning record shown to the student is the intended one.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-indigo-100 bg-white p-6 text-[#0a235c] shadow-[0_18px_42px_rgba(37,55,120,0.08)]">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Teacher control</p>
              <h2 className="mt-1 text-xl font-semibold">Learning judgments stay teacher-controlled</h2>
              <p className="mt-2 text-sm leading-6 text-[#49617f]">
                Use the review tools when a learner-facing interpretation, priority or next step needs a human decision.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/dashboard/admin/review" className="inline-flex items-center gap-2 rounded-xl bg-prime-red px-3 py-2 text-sm font-bold text-white hover:bg-[#8f1b13]">
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  Review queue
                </Link>
                <Link href="/dashboard/admin/intelligence" className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-bold text-[#263c86] hover:bg-indigo-100">
                  <BrainCircuit className="h-4 w-4" aria-hidden="true" />
                  Teacher Intelligence
                </Link>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7184a1]">Learners</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0a235c]">Authorized student dashboards</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#60718d]">
            This list is for day-to-day administration. Technical processing history is kept out of the main workspace and remains available in the dedicated audit area.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {students.map((student) => {
            const previewHref = `/dashboard?studentEmail=${encodeURIComponent(student.studentEmail)}`
            const lessonIntelligenceHref = `/dashboard/admin/intelligence/lessons?studentEmail=${encodeURIComponent(student.studentEmail)}`

            return (
              <article key={student.id} className="rounded-[26px] border border-slate-200 bg-white p-5 text-[#0a235c] shadow-[0_14px_34px_rgba(15,48,93,0.07)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{student.studentName}</h3>
                    <p className="mt-1 text-sm text-[#60718d]">{student.studentEmail}</p>
                  </div>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {student.attendanceRate}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7184a1]">Current level</p>
                    <p className="mt-1 text-sm font-semibold text-[#0a235c]">{student.currentLevel}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7184a1]">Target</p>
                    <p className="mt-1 text-sm font-semibold text-[#0a235c]">{student.targetLevel}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7184a1]">Class reports</p>
                    <p className="mt-1 text-sm font-semibold text-[#0a235c]">{student.canonicalReportCount ?? 0}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={previewHref} className="inline-flex items-center gap-2 rounded-xl bg-prime-red px-3 py-2 text-sm font-bold text-white hover:bg-[#8f1b13]">
                    <Eye aria-hidden="true" className="h-4 w-4" />
                    Preview student dashboard
                  </Link>
                  <Link href={lessonIntelligenceHref} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#0a235c] hover:border-indigo-200 hover:bg-indigo-50">
                    Lesson history
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </SectionShell>
  )
}
