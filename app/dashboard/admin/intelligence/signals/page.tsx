import Link from 'next/link'
import { Waypoints } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listSignalProposals } from '@/lib/teacher-intelligence'

export default async function TeacherSignalsPage() {
  const signals = await listSignalProposals(100)
  return (
    <section className="space-y-4">
      <div className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Learning Signals</p>
        <h2 className="mt-1 text-xl font-semibold text-white">LearningSignalProposal ≠ canonical Learning Signal</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">The current runtime persists proposals. No canonical LearningSignal state transition is created by this screen, so validation controls are intentionally withheld until the domain/runtime path exists.</p>
      </div>
      {signals.length ? <div className="grid gap-4 xl:grid-cols-2">{signals.map((signal) => (
        <article key={signal.id} className="glass-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">Proposal {signal.proposalKey}</p><h3 className="mt-1 text-lg font-semibold text-white">{signal.signal}</h3></div>
            <IntelligenceStatusBadge label="AI proposed" state="NEEDS_REVIEW" />
          </div>
          <p className="mt-3 text-sm leading-6 text-prime-cream/70">{signal.rationale}</p>
          <p className="mt-3 text-xs text-prime-cream/45">Evidence refs: {signal.evidenceIds.join(', ') || 'NOT PROVEN'}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link href={`/dashboard/admin/intelligence/lessons/${signal.pipelineRunId}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">Open lesson trace</Link>
            <IntelligenceStatusBadge label="canonical signal not proven" state="NOT_PROVEN" />
          </div>
        </article>
      ))}</div> : <div className="glass-card flex items-center gap-3 p-5 text-sm text-prime-cream/60"><Waypoints className="h-5 w-5" aria-hidden="true" /> No LearningSignalProposal records found.</div>}
    </section>
  )
}
