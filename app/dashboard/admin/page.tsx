import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ClipboardCheck, Eye, Plus, Shield } from 'lucide-react'
import { SectionShell } from '@/components/dashboard/section-shell'
import { ProcessDriveButton } from './process-drive-button'
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
      description="Preview student dashboards as they will appear to the learner and manage the onboarding flow."
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 text-[#0a235c] shadow-[0_18px_42px_rgba(15,48,93,0.08)]">
          <div className="mb-6 rounded-3xl border border-[#f1d4cc] bg-[#fff7f2] p-5 shadow-[0_12px_28px_rgba(168,34,23,0.06)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#a82217]">Publication boundary</p>
                <p className="max-w-2xl text-sm font-medium leading-6 text-[#1f3b68]">
                  New transcripts stop after Prompt 1 until a teacher reviews identity and source evidence.
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
                Drive processing
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#0a235c]">Process new transcripts</h3>
              <p className="mt-2 text-sm leading-6 text-[#49617f]">
                Use this only after a new Google Meet transcript is available in the canonical Drive folder.
              </p>
              <div className="mt-4">
                <ProcessDriveButton />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#526783]">
                How to add more students
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-[#304d7d]">
                <li>1. Create or update an approved document in Firestore under the `students` collection.</li>
                <li>2. Use the student&apos;s canonical Google email in `studentEmail`.</li>
                <li>3. Preserve the student&apos;s own IDs, links, history, and source records.</li>
                <li>4. Use the review queue before opening any newly generated student-facing projection.</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#526783]">
                Current model
              </p>
              <p className="mt-3 text-sm leading-6 text-[#304d7d]">
                Firestore is the source of truth for student identity and profile data. Each student must remain isolated, with no cross-student fallback or copied portfolio history.
              </p>
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
                        Pipeline: {student.latestPipelineStatus ?? 'no run'}
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
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#526783]">Operational visibility</p>
          <h3 className="mt-2 text-xl font-semibold text-[#0a235c]">Recent processing activity</h3>
          <p className="mt-2 text-sm leading-6 text-[#49617f]">
            This is the same persisted pipeline state that feeds the student portfolio. It does not expose transcript content.
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
          <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Pipeline activity is currently unavailable. The student directory is still shown separately.
          </p>
        )}
      </section>
    </SectionShell>
  )
}
