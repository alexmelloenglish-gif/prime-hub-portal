import Link from 'next/link'
import { FileClock } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listPipelineAuditEvents } from '@/lib/teacher-intelligence'

export default async function TeacherAuditPage() {
  const events = await listPipelineAuditEvents(150)
  return (
    <section className="space-y-4">
      <div className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">System / Audit</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Persisted runtime events</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">This view exposes PipelineEvent records as audit evidence. Event presence proves persistence of that event; it does not prove unrelated upstream or downstream stages.</p>
        <div className="mt-4 flex flex-wrap gap-2"><IntelligenceStatusBadge label="P4 persisted events" state="PRESENT" /><IntelligenceStatusBadge label="P6 requires complete trace" state="NOT_PROVEN" /></div>
      </div>
      {events.length ? <div className="space-y-3">{events.map((event) => (
        <article key={event.id} className="glass-card p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div><p className="font-semibold text-white">{event.eventType}</p><p className="mt-1 text-xs text-prime-cream/45">{event.aggregateType} · {event.aggregateId}</p></div>
            <time className="text-xs text-prime-cream/40">{new Date(event.createdAt).toLocaleString('en-GB')}</time>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2"><Link href={`/dashboard/admin/intelligence/lessons/${event.pipelineRunId}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">Run {event.pipelineRunId}</Link></div>
          <details className="mt-3"><summary className="cursor-pointer text-xs font-medium text-prime-cream/55">Event payload</summary><pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/25 p-3 text-xs leading-5 text-prime-cream/60">{JSON.stringify(event.payload, null, 2)}</pre></details>
        </article>
      ))}</div> : <div className="glass-card flex items-center gap-3 p-5 text-sm text-prime-cream/60"><FileClock className="h-5 w-5" aria-hidden="true" /> No persisted PipelineEvent records found.</div>}
    </section>
  )
}
