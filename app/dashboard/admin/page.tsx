import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ClipboardCheck, Eye, PauseCircle, Plus, Shield } from 'lucide-react'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'
import { listRecentPipelineActivity, listStudentsForAdmin } from '@/lib/admin-dashboard'
import { isAdminUser } from '@/lib/student-data'

export default async function DashboardAdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  if (!isAdminUser(session.user)) {
    redirect('/pending-access')
  }

  const [students, pipelineActivity] = await Promise.all([
    listStudentsForAdmin(session.user),
    listRecentPipelineActivity(),
  ])

  return (
    <SectionShell
      title="Admin Panel"
      description="Preview authorized student dashboards, review learner-facing state and inspect preserved pipeline history."
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 text-[#0a235c] shadow-[0_18px_42px_rgba(15,48,93,0.08)]">
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-[0_12px_28px_rgba(120,83,20,0.08)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-800">
                  <PauseCircle aria-hidden="true" className="h-5 w-5" />
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em]">Legacy automation frozen</p>
                </div>
                <p className="max-w-2xl text-sm font-medium leading-6 text-[#1f3b68]">
                  New transcript ingest, Drive reconciliation and pipeline retry are disabled while the canonical student state is being repaired. Historical runs remain preserved for audit.
                </p>
              </div>
              <Link
                href="/dashboard/admin/review"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-prime-red px-4 py-3 text-sm font-bold text-white shadow-[0_12px_26px_rgba(168,34,23,0.24)] transition hover:-translate-y-0.5 hover:bg-[#8f1b13]"
              >
                <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
                Review queue
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#a82217]/10 p-3 text-[#a82217]">
              <Shield aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#0a235c]">Admin access</h3>
              <p className="text-sm text-[#49617f]">{session.user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-blue-100 bg-[#f4f9ff] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-blue-700">
                Active architecture
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#0a235c]">Canonical repository + Neon/Prisma</h3>
              <p className="mt-2 text-sm leading-6 text-[#49617f]">
                Authorized repository snapshots provide the approved learner profile shown by the dashboard. Canonical Google Docs portfolios remain the human-readable longitudinal pedagogical reference. Neon/Prisma preserves operational pipeline and published class-report state.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#526783]">
                Publication boundary
              </p>
              <p className="mt-3 text-sm leading-6 text-[#304d7d]">
                Teacher review authorizes learner-facing changes. A model, transcript trigger or retry cannot publish a new learner judgment by itself.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#526783]">
                Student onboarding rule
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-[#304d7d]">
                <li>1. Preserve the stable student ID and canonical Google email.</li>
                <li>2. Add or update the authorized repository profile without replacing validated history.</li>
                <li>3. Point learner-facing links only to the current canonical resources.</li>
                <li>4. Review the student projection before exposing newly synchronized state.</li>
              </ol>
            </div>
          </div>
        </article>

        <div className="space-y-4">
          {students.map((student) => {
            const previewHref = `/dashboard?studentEmail=${encodeURIComponent(student.studentEmail)}`

            return (
              <article key={student.id} className="rounded-[28px] border border-slate-200 bg-white p-6 text-[#0a235c] shadow-[0_18px_42px_rgba(15,48,93,0.08)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#49617f]">
                        {student.currentLevel}
                      </span>
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                        Target {student.targetLevel}
                      </span>
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                        Attendance {student.attendanceRate}
                      </span>
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                        Reports {student.publishedReportCount ?? 0}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-[#0a235c]">{student.studentName}</h3>
                      <p className="text-sm text-[#49617f]">{student.studentEmail}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7184a1]">
                        Historical pipeline: {student.latestPipelineStatus ?? 'no run'}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7184a1]">
                        Profile source: {student.dataSource ?? 'unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={previewHref}
                      className="inline-flex items-center gap-2 rounded-2xl bg-prime-red px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(168,34,23,0.22)] transition-colors hover:bg-[#8f1b13]"
                    >
                      <Eye aria-hidden="true" className="h-4 w-4" />
                      Open student view
                    </Link>
                    <Link
                      href={`${previewHref.replace('/dashboard', '/dashboard/aulas')}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-[#0a235c] shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50"
                    >
                      <Plus aria-hidden="true" className="h-4 w-4" />
                      Open lessons view
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 text-[#0a235c] shadow-[0_18px_42px_rgba(15,48,93,0.08)]">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#526783]">Historical processing evidence</p>
          <h3 className="mt-2 text-xl font-semibold text-[#0a235c]">Preserved pipeline activity</h3>
          <p className="mt-2 text-sm leading-6 text-[#49617f]">
            These records are retained for audit. The frozen legacy pipeline is not allowed to create new ingest or retry runs during the canonical repair.
          </p>
        </div>
        {pipelineActivity.length ? (
          <div className="mt-4 space-y-3">
            {pipelineActivity.map((activity) => (
              <article key={activity.id} className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0a235c]">{activity.studentEmail}</p>
                    <p className="mt-1 text-xs text-[#49617f]">Lesson: {activity.lessonId} · Source: {activity.source}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.14em]">
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-blue-700">{activity.status}</span>
                    <span className={`rounded-full border px-2.5 py-1 ${activity.publishedReport ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                      {activity.publishedReport ? 'report published' : 'report not published'}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#49617f]">
                  Started: {new Date(activity.createdAt).toLocaleString('en-GB')} · Portfolio: {activity.portfolioApplyStatus || 'not applied'}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            No persisted pipeline activity is available in the current operational store.
          </p>
        )}
      </section>
    </SectionShell>
  )
}
