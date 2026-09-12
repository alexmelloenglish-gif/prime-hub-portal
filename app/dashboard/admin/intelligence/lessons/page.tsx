import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listTeacherLessons } from '@/lib/teacher-intelligence'

type LessonRow = Awaited<ReturnType<typeof listTeacherLessons>>[number]

function groupByLesson(rows: LessonRow[]) {
  const groups = new Map<string, LessonRow[]>()

  for (const row of rows) {
    const key = `${row.studentEmail.toLowerCase()}::${row.lessonId}`
    const current = groups.get(key) || []
    current.push(row)
    groups.set(key, current)
  }

  return Array.from(groups.values())
}

export default async function TeacherLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentEmail?: string }>
}) {
  const { studentEmail } = await searchParams
  const requestedStudent = studentEmail?.trim().toLowerCase() || null
  const runs = await listTeacherLessons(100, requestedStudent || undefined)
  const lessons = groupByLesson(runs)

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 text-[#0a235c] shadow-[0_16px_42px_rgba(15,48,93,0.07)] md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Admin Lesson Intelligence</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0a235c]">
            {requestedStudent ? `Lessons for ${requestedStudent}` : 'Lesson identity and processing attempts'}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#60718d]">
            One lesson identity may have multiple processing attempts. Attempts are preserved separately so repeated failures are never presented as additional attended lessons.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2 text-xs font-semibold text-[#60718d]">
          {lessons.length} lesson identities · {runs.length} processing attempts
        </div>
      </div>

      {requestedStudent ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#263c86] hover:bg-indigo-50"
          >
            Back to Admin
          </Link>
          <Link
            href={`/dashboard?studentEmail=${encodeURIComponent(requestedStudent)}`}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#263c86] hover:bg-indigo-50"
          >
            Preview student dashboard
          </Link>
        </div>
      ) : null}

      {lessons.length ? (
        <div className="mt-5 space-y-4">
          {lessons.map((attempts) => {
            const latest = attempts[0]
            const lessonDate = attempts.find((attempt) => attempt.lessonDate)?.lessonDate || null

            return (
              <article key={`${latest.studentEmail}:${latest.lessonId}`} className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0a235c]">{latest.studentEmail}</p>
                    <p className="mt-1 break-all text-xs text-[#60718d]">Lesson identity: {latest.lessonId}</p>
                    <p className="mt-2 text-xs text-[#7184a1]">
                      Lesson date: {lessonDate ? new Date(lessonDate).toLocaleString('en-GB') : 'NOT PROVEN'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-amber-700">
                      Attendance: NOT PROVEN at the operational run layer. Transcript or processing existence is not treated as attendance.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#60718d]">
                      {attempts.length} attempt{attempts.length === 1 ? '' : 's'}
                    </span>
                    <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                      {attempts.reduce((total, attempt) => total + attempt.evidenceCount, 0)} persisted candidate refs
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                  {attempts.map((attempt, index) => (
                    <div key={attempt.pipelineRunId} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#7184a1]">Attempt {attempts.length - index}</span>
                          <span className="text-xs text-[#60718d]">{new Date(attempt.processedAt).toLocaleString('en-GB')}</span>
                        </div>
                        <p className="mt-1 break-all text-[11px] text-[#8a98ad]">Run {attempt.pipelineRunId}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <IntelligenceStatusBadge
                          label={`processing ${attempt.technicalStatus}`}
                          state={attempt.technicalStatus === 'failed' ? 'FAILED' : 'PRESENT'}
                        />
                        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          evidence {attempt.evidenceCount}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-[#60718d]">
                          review {attempt.reviewStatus}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-[#60718d]">
                          report {attempt.reportStatus}
                        </span>
                        <Link
                          href={`/dashboard/admin/intelligence/lessons/${attempt.pipelineRunId}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                        >
                          Open trace <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fbff] p-4 text-sm text-[#60718d]">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
          {requestedStudent ? 'No persisted PipelineRun is available for this student.' : 'No persisted PipelineRun was found.'}
        </div>
      )}
    </section>
  )
}
