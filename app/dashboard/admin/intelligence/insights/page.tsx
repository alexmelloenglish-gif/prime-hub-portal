import Link from 'next/link'
import { Lightbulb } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listInsightProposals } from '@/lib/teacher-intelligence'

export default async function TeacherInsightsPage() {
  const insights = await listInsightProposals(100)

  return (
    <section className="space-y-4">
      <div className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Teaching insights</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Interpretations for teacher review</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">
          AI-supported interpretations are shown as working notes. The teacher decides which ones are pedagogically meaningful.
        </p>
      </div>

      {insights.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {insights.map((insight) => (
            <article key={insight.id} className="glass-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">Suggested interpretation</p>
                <IntelligenceStatusBadge label={insight.isOfficial ? 'Teacher reviewed' : 'Needs teacher review'} state={insight.isOfficial ? 'PRESENT' : 'NEEDS_REVIEW'} />
              </div>
              <p className="mt-4 text-sm leading-6 text-prime-cream/85">{insight.text}</p>
              <p className="mt-3 text-xs text-prime-cream/45">
                Based on {insight.evidenceIds.length} evidence item{insight.evidenceIds.length === 1 ? '' : 's'} and {insight.signalIds.length} learning pattern{insight.signalIds.length === 1 ? '' : 's'}.
              </p>
              <div className="mt-4">
                <Link href={`/dashboard/admin/intelligence/lessons/${insight.pipelineRunId}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">
                  Open lesson
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-card flex items-center gap-3 p-5 text-sm text-prime-cream/60">
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
          No teaching insights are waiting for review.
        </div>
      )}
    </section>
  )
}
