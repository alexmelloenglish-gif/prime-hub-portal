import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, FileText, Search } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { getTeacherLessonTrace } from '@/lib/teacher-intelligence'

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-5 text-prime-cream/65">
      {JSON.stringify(value ?? null, null, 2)}
    </pre>
  )
}

function sourceUrl(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const value = (metadata as Record<string, unknown>).sourceUrl
  return typeof value === 'string' && value.startsWith('https://') ? value : null
}

export default async function TeacherLessonDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  const trace = await getTeacherLessonTrace(runId)
  if (!trace) notFound()
  const originalSourceUrl = sourceUrl(trace.transcript?.metadata)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/admin/intelligence/lessons" className="inline-flex items-center gap-2 text-sm text-prime-cream/65 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Lessons
        </Link>
        <div className="flex flex-wrap gap-2">
          <IntelligenceStatusBadge label={`technical ${trace.run.status}`} state={trace.run.status === 'failed' ? 'FAILED' : trace.run.status === 'not_proven' ? 'NOT_PROVEN' : 'PRESENT'} />
          {trace.firstUnprovenStage ? <IntelligenceStatusBadge label={`first unproven: ${trace.firstUnprovenStage}`} state="NOT_PROVEN" /> : null}
        </div>
      </div>

      <section className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Lesson trace</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">{trace.run.studentEmail}</h2>
        <div className="mt-3 grid gap-2 text-sm text-prime-cream/60 md:grid-cols-2 xl:grid-cols-4">
          <p><span className="text-prime-cream/40">Lesson ID</span><br /><span className="break-all text-prime-cream/85">{trace.run.lessonId}</span></p>
          <p><span className="text-prime-cream/40">PipelineRun</span><br /><span className="break-all text-prime-cream/85">{trace.run.id}</span></p>
          <p><span className="text-prime-cream/40">Started</span><br /><span className="text-prime-cream/85">{new Date(trace.run.startedAt).toLocaleString('en-GB')}</span></p>
          <p><span className="text-prime-cream/40">Authority</span><br /><span className="text-prime-cream/85">{trace.run.authorityStatus}</span></p>
        </div>
      </section>

      <section className="glass-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Golden trace UI</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Verification depth</h2>
          </div>
          <p className="text-xs text-prime-cream/45">A persisted object is not automatically a verified cognitive claim.</p>
        </div>
        <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {trace.traceStages.map((stage) => (
            <li key={stage.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{stage.label}</p>
                  {stage.id ? <p className="mt-1 break-all text-[11px] text-prime-cream/40">{stage.id}</p> : null}
                </div>
                <IntelligenceStatusBadge label={stage.state.replace('_', ' ')} state={stage.state} />
              </div>
              {stage.details ? <p className="mt-3 text-xs leading-5 text-prime-cream/55">{stage.details}</p> : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="glass-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Source</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Transcript / Drive provenance</h2>
            </div>
            <div className="flex gap-2">
              {trace.transcript ? (
                <Link href={`/dashboard/admin/intelligence/lessons/${trace.run.id}/transcript`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
                  <Search className="h-4 w-4" aria-hidden="true" /> Transcript
                </Link>
              ) : null}
              {originalSourceUrl ? (
                <a href={originalSourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" /> Source
                </a>
              ) : null}
            </div>
          </div>
          {trace.transcript ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-prime-cream/40">sourceFileId</dt><dd className="mt-1 break-all text-prime-cream/85">{trace.transcript.sourceFileId || 'NOT PROVEN'}</dd></div>
              <div><dt className="text-prime-cream/40">transcriptId</dt><dd className="mt-1 break-all text-prime-cream/85">{trace.transcript.id}</dd></div>
              <div><dt className="text-prime-cream/40">source type</dt><dd className="mt-1 text-prime-cream/85">{trace.transcript.source}</dd></div>
              <div><dt className="text-prime-cream/40">recordedAt</dt><dd className="mt-1 text-prime-cream/85">{trace.transcript.recordedAt ? new Date(trace.transcript.recordedAt).toLocaleString('en-GB') : 'NOT PROVEN'}</dd></div>
            </dl>
          ) : <p className="mt-4 text-sm text-prime-cream/55">No persisted transcript.</p>}
        </article>

        <article className="glass-card p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">AI provenance</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Prompt 1 generation</h2>
          <div className="mt-4"><JsonBlock value={trace.aiProvenance} /></div>
        </article>
      </section>

      <section className="glass-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">AI proposals</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Evidence Candidates</h2>
          </div>
          <Link href="/dashboard/admin/intelligence/review" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">Open review queue</Link>
        </div>
        {trace.evidence.length ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {trace.evidence.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-prime-cream/40">{item.category}</p>
                    <p className="mt-1 break-all text-[11px] text-prime-cream/35">{item.id}</p>
                  </div>
                  <IntelligenceStatusBadge label={item.requiresReview ? 'needs review' : item.state} state={item.requiresReview ? 'NEEDS_REVIEW' : item.state === 'rejected' || item.state === 'blocked' ? 'BLOCKED' : 'PRESENT'} />
                </div>
                <p className="mt-3 text-sm leading-6 text-prime-cream/85">{item.observation}</p>
                <p className="mt-3 text-xs leading-5 text-prime-cream/55"><span className="font-semibold text-prime-cream/70">Source span:</span> {item.sourceSpan || 'NOT PROVEN'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {trace.transcript ? <Link href={`/dashboard/admin/intelligence/lessons/${trace.run.id}/transcript?evidence=${encodeURIComponent(item.id)}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white hover:bg-white/10">Open source</Link> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">Zero persisted Evidence Candidates. Do not infer learning from the report or pipeline status.</p>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="glass-card p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Learning Signal Proposals</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Proposal ≠ canonical signal</h2>
          {trace.signals.length ? <div className="mt-4 space-y-3">{trace.signals.map((signal) => <div key={signal.id} className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-sm text-white">{signal.signal}</p><p className="mt-2 text-xs leading-5 text-prime-cream/55">{signal.rationale}</p><p className="mt-2 text-[11px] text-prime-cream/35">Evidence refs: {signal.evidenceIds.join(', ') || 'NOT PROVEN'}</p></div>)}</div> : <p className="mt-4 text-sm text-prime-cream/55">No signal proposals persisted.</p>}
        </article>
        <article className="glass-card p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Teacher Insight Proposal</p>
          <h2 className="mt-1 text-xl font-semibold text-white">AI proposal ≠ published insight</h2>
          {trace.insight ? <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-sm leading-6 text-prime-cream/85">{trace.insight.text}</p><div className="mt-3 flex gap-2"><IntelligenceStatusBadge label={trace.insight.isOfficial ? 'official' : 'AI proposed'} state={trace.insight.isOfficial ? 'PRESENT' : 'NOT_PROVEN'} /></div></div> : <p className="mt-4 text-sm text-prime-cream/55">No Teacher Insight Proposal persisted.</p>}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="glass-card p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Class Report</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Document projection</h2>
          {trace.report ? <div className="mt-4 space-y-3"><div className="flex flex-wrap gap-2"><IntelligenceStatusBadge label={trace.report.documentStatus} state="PRESENT" /><IntelligenceStatusBadge label={trace.report.implementationStatus} state={trace.report.implementationStatus === 'proven' ? 'PRESENT' : 'NOT_PROVEN'} /></div><JsonBlock value={trace.report.content} /></div> : <p className="mt-4 text-sm text-prime-cream/55">No report projection.</p>}
        </article>
        <article className="glass-card p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Portfolio projection</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Read model / projection</h2>
          {trace.portfolio ? <div className="mt-4"><p className="mb-3 text-sm text-prime-cream/65">Version {trace.portfolio.version} · source run {trace.portfolio.sourceRunId}</p><JsonBlock value={trace.portfolio.projection} /></div> : <p className="mt-4 text-sm text-prime-cream/55">No PortfolioProjection sourced from this run.</p>}
        </article>
      </section>

      <section className="glass-card p-5 md:p-6">
        <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-prime-cream/55" aria-hidden="true" /><div><p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Audit</p><h2 className="mt-1 text-xl font-semibold text-white">Persisted events</h2></div></div>
        {trace.events.length ? <div className="mt-4 space-y-2">{trace.events.map((event) => <details key={event.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><summary className="cursor-pointer text-sm text-white">{event.eventType} <span className="ml-2 text-xs text-prime-cream/40">{new Date(event.createdAt).toLocaleString('en-GB')}</span></summary><div className="mt-3"><JsonBlock value={event.payload} /></div></details>)}</div> : <p className="mt-4 text-sm text-prime-cream/55">No PipelineEvent records found.</p>}
      </section>
    </div>
  )
}
