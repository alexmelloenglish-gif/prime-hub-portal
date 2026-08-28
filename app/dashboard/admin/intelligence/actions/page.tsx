import Link from 'next/link'
import { ListChecks } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listCoachingProposals } from '@/lib/teacher-intelligence'

export default async function TeacherActionsPage() {
  const coaching = await listCoachingProposals(100)
  return (
    <section className="space-y-4">
      <div className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Actions</p>
        <h2 className="mt-1 text-xl font-semibold text-white">CoachingRecommendation ≠ TeacherDecision</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">Prompt 4 recommendations are visible, but the current runtime has no proven canonical PedagogicalDecision or EducationalAction entity. This view does not manufacture either one.</p>
      </div>
      {coaching.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {coaching.map((item) => (
            <article key={item.id} className="glass-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">AI coaching proposal</p><h3 className="mt-1 text-lg font-semibold text-white">{item.studentEmail}</h3></div>
                <IntelligenceStatusBadge label={item.recommendationStatus} state="NEEDS_REVIEW" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/dashboard/admin/intelligence/lessons/${item.pipelineRunId}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">Open lesson trace</Link>
                <IntelligenceStatusBadge label="human decision not proven" state="NOT_PROVEN" />
                <IntelligenceStatusBadge label="action not proven" state="NOT_PROVEN" />
              </div>
            </article>
          ))}
        </div>
      ) : <div className="glass-card flex items-center gap-3 p-5 text-sm text-prime-cream/60"><ListChecks className="h-5 w-5" aria-hidden="true" /> No CoachingGuidance records found.</div>}
    </section>
  )
}
