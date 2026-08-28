import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listTeacherLessons } from '@/lib/teacher-intelligence'

export default async function TeacherLessonsPage() {
  const lessons = await listTeacherLessons(75)
  return (
    <section className="glass-card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Lessons</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Processing and review status</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">Each row is a persisted PipelineRun. Technical completion, cognitive validity and publication are shown separately.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-prime-cream/55">{lessons.length} recent runs</div>
      </div>

      {lessons.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-prime-cream/40">
              <tr>
                <th className="px-3 py-2 font-medium">Student / lesson</th>
                <th className="px-3 py-2 font-medium">Dates</th>
                <th className="px-3 py-2 font-medium">Pipeline</th>
                <th className="px-3 py-2 font-medium">AI</th>
                <th className="px-3 py-2 font-medium">Evidence</th>
                <th className="px-3 py-2 font-medium">Review</th>
                <th className="px-3 py-2 font-medium">Report</th>
                <th className="px-3 py-2 font-medium"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {lessons.map((lesson) => (
                <tr key={lesson.pipelineRunId} className="align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium text-white">{lesson.studentEmail}</p>
                    <p className="mt-1 max-w-[240px] truncate text-xs text-prime-cream/45">{lesson.lessonId}</p>
                    <p className="mt-1 max-w-[240px] truncate text-[11px] text-prime-cream/35">Run {lesson.pipelineRunId}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-prime-cream/55">
                    <p>Lesson: {lesson.lessonDate ? new Date(lesson.lessonDate).toLocaleString('en-GB') : 'not proven'}</p>
                    <p className="mt-1">Processed: {new Date(lesson.processedAt).toLocaleString('en-GB')}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-prime-cream/75">{lesson.technicalStatus}</p>
                    {lesson.errorCode ? <p className="mt-1 text-xs text-red-200">{lesson.errorCode}</p> : null}
                  </td>
                  <td className="px-3 py-3"><IntelligenceStatusBadge label={lesson.aiStatus.replace('_', ' ')} state={lesson.aiStatus} /></td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-white">{lesson.evidenceCount}</p>
                    <p className="mt-1 text-xs text-prime-cream/45">{lesson.evidenceNeedsReview} pending</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-prime-cream/65">{lesson.reviewStatus}</td>
                  <td className="px-3 py-3 text-xs text-prime-cream/65">{lesson.reportStatus}</td>
                  <td className="px-3 py-3">
                    <Link href={`/dashboard/admin/intelligence/lessons/${lesson.pipelineRunId}`} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-white hover:bg-white/10">
                      Trace <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-prime-cream/60"><BookOpen className="h-5 w-5" aria-hidden="true" /> No persisted PipelineRun was found.</div>
      )}
    </section>
  )
}
