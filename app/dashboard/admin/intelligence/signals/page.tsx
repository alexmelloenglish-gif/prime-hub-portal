import Link from 'next/link'
import { Waypoints } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listSignalProposals } from '@/lib/teacher-intelligence'

export default async function TeacherSignalsPage() {
  const signals = await listSignalProposals(100)

  return (
    <section className="space-y-4">
      <div className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Learning patterns</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Patterns suggested from lesson evidence</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">
          These are working suggestions for the teacher. They do not become part of the learner&apos;s current learning state until reviewed.
        </p>
      </div>

      {signals.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {signals.map((signal) => (
            <article key={signal.id} className="glass-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">Suggested pattern</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{signal.signal}</h3>
                </div>
                <IntelligenceStatusBadge label="Needs teacher review" state="NEEDS_REVIEW" />
              </div>
              <p className="mt-3 text-sm leading-6 text-prime-cream/70">{signal.rationale}</p>
              <p className="mt-3 text-xs text-prime-cream/45">
                Based on {signal.evidenceIds.length} evidence item{signal.evidenceIds.length === 1 ? '' : 's'}.
              </p>
              <div className="mt-4">
                <Link href={`/dashboard/admin/intelligence/lessons/${signal.pipelineRunId}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">
                  Open lesson
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-card flex items-center gap-3 p-5 text-sm text-prime-cream/60">
          <Waypoints className="h-5 w-5" aria-hidden="true" />
          No learning patterns are waiting for review.
        </div>
      )}
    </section>
  )
}
