import Link from 'next/link'
import { CheckCircle2, ListChecks, ShieldAlert } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listCoachingProposals } from '@/lib/teacher-intelligence'

function contentRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

export default async function TeacherActionsPage() {
  const coaching = await listCoachingProposals(100)
  const pending = coaching.filter((item) => item.reviewState === 'pending_source_grounded_proposal')
  const covered = coaching.filter((item) => item.reviewState === 'covered_by_teacher_decision')
  const unproven = coaching.filter((item) => item.reviewState === 'not_reviewable_unproven_basis')

  return (
    <section className="space-y-4">
      <div className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Teaching Actions</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Suggested next teaching steps</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">
          This is a proposal surface, not a separate authority system. Only source-grounded AI proposals that are still unresolved appear as pending. Older proposals covered by a later teacher decision, and legacy proposals without a proven structured basis, are not shown as items waiting for validation.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="glass-card p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">Pending</div>
          <div className="mt-1 text-2xl font-semibold text-white">{pending.length}</div>
          <div className="mt-1 text-xs text-prime-cream/55">Source-grounded proposals still awaiting a teacher decision path.</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">Covered</div>
          <div className="mt-1 text-2xl font-semibold text-white">{covered.length}</div>
          <div className="mt-1 text-xs text-prime-cream/55">Older proposal sources already covered by a later approved teacher decision.</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">Excluded</div>
          <div className="mt-1 text-2xl font-semibold text-white">{unproven.length}</div>
          <div className="mt-1 text-xs text-prime-cream/55">Legacy proposals without a proven structured evidence basis.</div>
        </div>
      </div>

      {pending.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {pending.map((item) => {
            const content = contentRecord(item.content)
            const strategy = typeof content.recommendedNextClassStrategy === 'string'
              ? content.recommendedNextClassStrategy
              : null
            return (
              <article key={item.id} className="glass-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">AI proposal</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{item.studentEmail}</h3>
                  </div>
                  <IntelligenceStatusBadge label="Proposal only" state="NEEDS_REVIEW" />
                </div>
                {strategy ? (
                  <p className="mt-3 text-sm leading-6 text-prime-cream/75">{strategy}</p>
                ) : null}
                <p className="mt-3 text-xs leading-5 text-prime-cream/55">
                  This item is not yet a teacher decision. Review the source lesson before using it in teaching. A proposal must not be treated as canonical learning state.
                </p>
                <div className="mt-4">
                  <Link href={`/dashboard/admin/intelligence/lessons/${item.pipelineRunId}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">
                    Open source lesson
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="glass-card flex items-start gap-3 p-5 text-sm text-prime-cream/65">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
          <div>
            <div className="font-semibold text-white">No source-grounded teaching-action proposals are waiting for review.</div>
            <div className="mt-1 leading-6">
              Previously visible legacy cards are no longer treated as pending merely because a CoachingGuidance row exists.
            </div>
          </div>
        </div>
      )}

      {covered.length || unproven.length ? (
        <div className="glass-card p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-white">Historical proposal containment</h3>
              <p className="mt-1 text-sm leading-6 text-prime-cream/60">
                {covered.length} proposal{covered.length === 1 ? ' is' : 's are'} covered by a later teacher decision and {unproven.length} proposal{unproven.length === 1 ? ' is' : 's are'} excluded because their preserved runtime basis is not sufficient for teacher-action review. They remain in the database as historical artifacts; they are not deleted or promoted.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!coaching.length ? (
        <div className="glass-card flex items-center gap-3 p-5 text-sm text-prime-cream/60">
          <ListChecks className="h-5 w-5" aria-hidden="true" />
          No coaching proposal artifacts are currently present.
        </div>
      ) : null}
    </section>
  )
}
