import Link from 'next/link'
import { AlertTriangle, ArrowRight, BookOpen, ClipboardCheck, FileText, Lightbulb, Waypoints } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { getTeacherCommandCenter } from '@/lib/teacher-intelligence'

export default async function TeacherIntelligenceHomePage() {
  const data = await getTeacherCommandCenter()
  const cards = [
    { label: 'Review tasks', value: data.needsReview.reviewTasks, href: '/dashboard/admin/intelligence/review', icon: ClipboardCheck },
    { label: 'Evidence candidates', value: data.needsReview.evidenceCandidates, href: '/dashboard/admin/intelligence/review', icon: AlertTriangle },
    { label: 'Signal proposals', value: data.needsReview.signalProposals, href: '/dashboard/admin/intelligence/signals', icon: Waypoints },
    { label: 'Insight proposals', value: data.needsReview.insightProposals, href: '/dashboard/admin/intelligence/insights', icon: Lightbulb },
    { label: 'Draft reports', value: data.needsReview.reportsAwaitingPublication, href: '/dashboard/admin/intelligence/lessons', icon: FileText },
  ]

  return (
    <div className="space-y-5">
      <section aria-labelledby="attention-heading" className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-prime-cream/45">Teacher command center</p>
          <h2 id="attention-heading" className="mt-1 text-xl font-semibold text-white">What requires attention now?</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.label} href={card.href} className="glass-card group p-4 transition hover:-translate-y-0.5 hover:border-white/20">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-prime-cream/55" aria-hidden="true" />
                  <ArrowRight className="h-4 w-4 text-prime-cream/30 transition group-hover:translate-x-0.5 group-hover:text-white" aria-hidden="true" />
                </div>
                <p className="mt-5 text-3xl font-semibold text-white">{card.value}</p>
                <p className="mt-1 text-sm text-prime-cream/60">{card.label}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.9fr_1fr]">
        <article className="glass-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Recent lessons</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Runtime-backed lesson activity</h2>
            </div>
            <Link href="/dashboard/admin/intelligence/lessons" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-prime-cream/80 hover:bg-white/10 hover:text-white">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> All lessons
            </Link>
          </div>

          {data.recentLessons.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-prime-cream/40">
                  <tr>
                    <th className="px-3 py-2 font-medium">Student / lesson</th>
                    <th className="px-3 py-2 font-medium">Technical</th>
                    <th className="px-3 py-2 font-medium">AI</th>
                    <th className="px-3 py-2 font-medium">Evidence</th>
                    <th className="px-3 py-2 font-medium">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.recentLessons.map((lesson) => (
                    <tr key={lesson.pipelineRunId} className="align-top">
                      <td className="px-3 py-3">
                        <Link href={`/dashboard/admin/intelligence/lessons/${lesson.pipelineRunId}`} className="font-medium text-white hover:underline">
                          {lesson.studentEmail}
                        </Link>
                        <p className="mt-1 max-w-[280px] truncate text-xs text-prime-cream/45">{lesson.lessonId}</p>
                      </td>
                      <td className="px-3 py-3 text-prime-cream/70">{lesson.technicalStatus}</td>
                      <td className="px-3 py-3"><IntelligenceStatusBadge label={lesson.aiStatus.replace('_', ' ')} state={lesson.aiStatus} /></td>
                      <td className="px-3 py-3">
                        <div className="text-white">{lesson.evidenceCount}</div>
                        <div className="text-xs text-prime-cream/45">{lesson.evidenceNeedsReview} need review</div>
                      </td>
                      <td className="px-3 py-3 text-prime-cream/70">{lesson.reportStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-prime-cream/60">No runtime lesson activity is available.</p>
          )}
        </article>

        <aside className="glass-card p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Runtime truth</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Do not collapse states</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-prime-cream/70">Infrastructure</span><IntelligenceStatusBadge label="historically verified" state="VERIFIED" /></div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-prime-cream/70">Gemini post-gate</span><IntelligenceStatusBadge label="not proven" state="NOT_PROVEN" /></div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-prime-cream/70">Evidence E2E</span><IntelligenceStatusBadge label="not proven" state="NOT_PROVEN" /></div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-prime-cream/70">Canonical signal</span><IntelligenceStatusBadge label="not proven" state="NOT_PROVEN" /></div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-prime-cream/70">Learning State</span><IntelligenceStatusBadge label="not proven" state="NOT_PROVEN" /></div>
          </div>
        </aside>
      </section>
    </div>
  )
}
