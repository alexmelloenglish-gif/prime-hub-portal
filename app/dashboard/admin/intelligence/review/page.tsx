import Link from 'next/link'
import { ClipboardCheck, ExternalLink } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listEvidenceReviewQueue } from '@/lib/teacher-intelligence'
import { reviewEvidenceCandidateAction } from './actions'

function provenanceSummary(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'NOT PROVEN'
  const record = value as Record<string, unknown>
  const origin = typeof record.origin === 'string' ? record.origin : null
  const source = typeof record.source_reference === 'string' ? record.source_reference : null
  return [origin, source].filter(Boolean).join(' · ') || 'NOT PROVEN'
}

export default async function TeacherEvidenceReviewPage() {
  const items = await listEvidenceReviewQueue(100)
  return (
    <section className="space-y-4">
      <div className="glass-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Review queue</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Evidence Candidate review</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">A teacher decision is persisted as an audit event and changes the candidate review state. Accepting a candidate does not silently create canonical validated Evidence.</p>
          </div>
          <IntelligenceStatusBadge label={`${items.length} pending`} state={items.length ? 'NEEDS_REVIEW' : 'PRESENT'} />
        </div>
      </div>

      {items.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="glass-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">{item.category}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{item.studentEmail}</h3>
                  <p className="mt-1 break-all text-[11px] text-prime-cream/35">Evidence {item.id}</p>
                </div>
                <IntelligenceStatusBadge label="AI proposed" state="NEEDS_REVIEW" />
              </div>

              <p className="mt-4 text-sm leading-6 text-prime-cream/85">{item.observation}</p>
              <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                <div><dt className="text-prime-cream/40">Lesson</dt><dd className="mt-1 break-all text-prime-cream/70">{item.lessonId}</dd></div>
                <div><dt className="text-prime-cream/40">Transcript</dt><dd className="mt-1 break-all text-prime-cream/70">{item.transcriptId}</dd></div>
                <div><dt className="text-prime-cream/40">Source span</dt><dd className="mt-1 text-prime-cream/70">{item.sourceSpan || 'NOT PROVEN'}</dd></div>
                <div><dt className="text-prime-cream/40">Confidence</dt><dd className="mt-1 text-prime-cream/70">{item.confidence ?? 'NOT PROVEN'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-prime-cream/40">Evidence provenance</dt><dd className="mt-1 break-all text-prime-cream/70">{provenanceSummary(item.provenance)}</dd></div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/dashboard/admin/intelligence/lessons/${item.pipelineRunId}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">Open lesson trace</Link>
                <Link href={`/dashboard/admin/intelligence/lessons/${item.pipelineRunId}/transcript?evidence=${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Source</Link>
              </div>

              <form action={reviewEvidenceCandidateAction} className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <input type="hidden" name="evidenceId" value={item.id} />
                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-prime-cream/50" htmlFor={`reason-${item.id}`}>Decision reason</label>
                <textarea id={`reason-${item.id}`} name="reason" rows={3} placeholder="Required for reject, return or block. Optional for accept." className="w-full rounded-xl border border-white/10 bg-prime-dark/70 px-3 py-2 text-sm text-white outline-none placeholder:text-prime-cream/30 focus:border-prime-red/60 focus:ring-2 focus:ring-prime-red/20" />
                <div className="flex flex-wrap gap-2">
                  <button type="submit" name="decision" value="accept" className="rounded-xl bg-emerald-300/90 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-200">ACCEPT</button>
                  <button type="submit" name="decision" value="reject" className="rounded-xl border border-red-300/20 bg-red-300/10 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-300/20">REJECT</button>
                  <button type="submit" name="decision" value="return" className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-300/20">RETURN FOR REVISION</button>
                  <button type="submit" name="decision" value="block" className="rounded-xl border border-orange-300/20 bg-orange-300/10 px-3 py-2 text-xs font-semibold text-orange-100 hover:bg-orange-300/20">BLOCK</button>
                </div>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-card flex items-center gap-3 p-5 text-sm text-prime-cream/60"><ClipboardCheck className="h-5 w-5" aria-hidden="true" /> No Evidence Candidates currently require review.</div>
      )}
    </section>
  )
}
