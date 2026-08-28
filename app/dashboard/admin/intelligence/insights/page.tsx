import Link from 'next/link'
import { Lightbulb } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listInsightProposals } from '@/lib/teacher-intelligence'

export default async function TeacherInsightsPage() {
  const insights = await listInsightProposals(100)
  return (
    <section className="space-y-4">
      <div className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Teacher Insights</p>
        <h2 className="mt-1 text-xl font-semibold text-white">TeacherInsightProposal ≠ published Teacher Insight</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">AI-generated interpretation is shown with explicit proposal status. This implementation does not invent a publication transition where the canonical runtime has not yet proven one.</p>
      </div>
      {insights.length ? <div className="grid gap-4 xl:grid-cols-2">{insights.map((insight) => (
        <article key={insight.id} className="glass-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">{insight.authorType}</p><p className="mt-1 break-all text-[11px] text-prime-cream/35">{insight.id}</p></div>
            <IntelligenceStatusBadge label={insight.isOfficial ? 'official' : insight.status} state={insight.isOfficial ? 'PRESENT' : 'NEEDS_REVIEW'} />
          </div>
          <p className="mt-4 text-sm leading-6 text-prime-cream/85">{insight.text}</p>
          <p className="mt-3 text-xs text-prime-cream/45">Evidence refs: {insight.evidenceIds.join(', ') || 'NOT PROVEN'}</p>
          <p className="mt-1 text-xs text-prime-cream/45">Signal refs: {insight.signalIds.join(', ') || 'NOT PROVEN'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/dashboard/admin/intelligence/lessons/${insight.pipelineRunId}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">Open lesson trace</Link>
            {!insight.isOfficial ? <IntelligenceStatusBadge label="published insight not proven" state="NOT_PROVEN" /> : null}
          </div>
        </article>
      ))}</div> : <div className="glass-card flex items-center gap-3 p-5 text-sm text-prime-cream/60"><Lightbulb className="h-5 w-5" aria-hidden="true" /> No TeacherInsightProposal records found.</div>}
    </section>
  )
}
