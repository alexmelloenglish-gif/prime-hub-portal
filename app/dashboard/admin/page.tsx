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
        <article className="glass-card p-6">
          <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-100/70">Publication boundary</p>
                <p className="mt-2 text-sm leading-6 text-amber-50/85">New transcripts stop after Prompt 1 until a teacher reviews identity and source evidence.</p>
              </div>
              <Link href="/dashboard/admin/review" className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-amber-200/90 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-100">
                <ClipboardCheck className="h-4 w-4" />
                Review queue
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-prime-red/15 p-3 text-prime-cream">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Admin access</h3>
              <p className="text-sm text-prime-cream/65">{session.user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-100/70">
                Drive processing
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">Process new transcripts</h3>
              <p className="mt-2 text-sm leading-6 text-prime-cream/75">
                Use this only after a new Google Meet transcript is available in the canonical Drive folder.
              </p>
              <div className="mt-4">
                <ProcessDriveButton />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">
                How to add more students
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-prime-cream/80">
                <li>1. Create or update an approved document in Firestore under the `students` collection.</li>
                <li>2. Use the student&apos;s canonical Google email in `studentEmail`.</li>
                <li>3. Preserve the student&apos;s own IDs, links, history, and source records.</li>
                <li>4. Use the review queue before opening any newly generated student-facing projection.</li>
              </ol>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">
                Current model
              </p>
              <p className="mt-3 text-sm leading-6 text-prime-cream/80">
                Firestore is the source of truth for student identity and profile data. Each student must remain isolated, with no cross-student fallback or copied portfolio history.
              </p>
            </div>
          </div>
        </article>

        <div className="space-y-4">
          {students.map((student) => {
            const previewHref = `/dashboard?studentEmail=${encodeURIComponent(student.studentEmail)}`

            return (
              <article key={student.id} className="glass-card p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-prime-cream/70">
                        {student.currentLevel}
                      </span>
                      <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-100">
                        Target {student.targetLevel}
                      </span>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-100">
                        Attendance {student.attendanceRate}
                      </span>
                      <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-100">
                        Reports {student.publishedReportCount ?? 0}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white">{student.studentName}</h3>
                      <p className="text-sm text-prime-cream/65">{student.studentEmail}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-prime-cream/45">
                        Pipeline: {student.latestPipelineStatus ?? 'no run'}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-prime-cream/45">
                        Profile source: {student.dataSource ?? 'unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={previewHref}
                      className="inline-flex items-center gap-2 rounded-2xl bg-prime-red px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-prime-red/90"
                    >
                      <Eye className="h-4 w-4" />
                      Open student view
                    </Link>
                    <Link
                      href={`${previewHref.replace('/dashboard', '/dashboard/aulas')}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-prime-cream/85 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Open lessons view
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <section className="glass-card space-y-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">Operational visibility</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Recent processing activity</h3>
          <p className="mt-2 text-sm leading-6 text-prime-cream/65">
            This is the same persisted pipeline state that feeds the student portfolio. It does not expose transcript content.
          </p>
        </div>
        {pipelineActivity.length ? (
          <div className="space-y-3">
            {pipelineActivity.map((activity) => (
              <article key={activity.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{activity.studentEmail}</p>
                    <p className="mt-1 text-xs text-prime-cream/55">Lesson: {activity.lessonId} · Source: {activity.source}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em]">
                    <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-sky-100">{activity.status}</span>
                    <span className={`rounded-full border px-2.5 py-1 ${activity.publishedReport ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-amber-300/20 bg-amber-300/10 text-amber-100'}`}>
                      {activity.publishedReport ? 'report published' : 'report not published'}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-prime-cream/55">
                  Started: {new Date(activity.createdAt).toLocaleString('en-GB')} · Portfolio: {activity.portfolioApplyStatus || 'not applied'}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            Pipeline activity is currently unavailable. The student directory is still shown separately.
          </p>
        )}
      </section>
    </SectionShell>
  )
}
