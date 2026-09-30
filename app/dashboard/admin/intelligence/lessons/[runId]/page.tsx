import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, FileText, ShieldCheck } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { getTeacherLessonTrace } from '@/lib/teacher-intelligence'

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-[#f8fbff] p-3 text-xs leading-5 text-[#49617f]">
      {JSON.stringify(value ?? null, null, 2)}
    </pre>
  )
}

function sourceUrl(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const value = (metadata as Record<string, unknown>).sourceUrl
  return typeof value === 'string' && value.startsWith('https://') ? value : null
}

function containsSyntheticMarker(value: unknown) {
  if (!value) return false
  try {
    const text = JSON.stringify(value).toLowerCase()
    return text.includes('synthetic test transcript') || text.includes('"synthetic"') || text.includes('test transcript')
  } catch {
    return false
  }
}

export default async function TeacherLessonDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  const trace = await getTeacherLessonTrace(runId)
  if (!trace) notFound()

  const originalSourceUrl = sourceUrl(trace.transcript?.metadata)
  const pendingReviewTasks = trace.reviewTasks.filter((task) => !task.decision)
  const lessonDate = trace.transcript?.effectiveAt || trace.transcript?.recordedAt || null
  const hasLearnerFacingOutput = Boolean(trace.report || trace.portfolio)
  const hasTeacherMaterial = Boolean(
    trace.evidence.length ||
    trace.reviewTasks.length ||
    trace.signals.length ||
    trace.insight ||
    trace.report ||
    trace.portfolio
  )
  const failedWithoutPedagogicalOutput = trace.run.status === 'failed' && !hasTeacherMaterial
  const syntheticSource = containsSyntheticMarker(trace.transcript?.metadata)

  return (
    <div className="space-y-5 text-[#0a235c]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/dashboard/admin/intelligence/lessons?studentEmail=${encodeURIComponent(trace.run.studentEmail)}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#60718d] hover:text-[#263c86]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Student lessons
        </Link>
        <div className="flex flex-wrap gap-2">
          <IntelligenceStatusBadge
            label={trace.run.status === 'failed' ? 'processing failed' : `processing ${trace.run.status}`}
            state={trace.run.status === 'failed' ? 'FAILED' : 'PRESENT'}
          />
          {syntheticSource ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
              Test artifact
            </span>
          ) : null}
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.07)] md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Lesson Intelligence</p>
        <h1 className="mt-1 text-2xl font-bold text-[#0a235c]">{trace.run.studentEmail}</h1>
        <p className="mt-2 text-sm text-[#60718d]">
          {lessonDate ? new Date(lessonDate).toLocaleString('en-GB') : 'Lesson date unavailable'}
        </p>

        {failedWithoutPedagogicalOutput ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-bold text-red-900">This attempt stopped before pedagogical evidence was created.</p>
            <p className="mt-1 text-sm leading-6 text-red-800">
              Nothing from this failed attempt should be interpreted as learner performance or teacher assessment.
              No teacher action is required from this attempt.
            </p>
            {trace.run.errorCode ? (
              <p className="mt-2 text-xs font-semibold text-red-700">Technical reason: {trace.run.errorCode}</p>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-[#304d7d]">
            This page summarizes what this lesson attempt actually produced. Teacher decisions remain separate from technical processing.
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a98ad]">Source</p>
          <p className="mt-2 text-sm font-bold text-[#0a235c]">{trace.transcript ? 'Transcript available' : 'No source persisted'}</p>
          {originalSourceUrl ? (
            <a
              href={originalSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline"
            >
              Open source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a98ad]">Evidence</p>
          <p className="mt-2 text-sm font-bold text-[#0a235c]">
            {trace.evidence.length ? `${trace.evidence.length} candidate${trace.evidence.length === 1 ? '' : 's'}` : 'No evidence candidate'}
          </p>
          <p className="mt-1 text-xs text-[#60718d]">
            {trace.evidence.length ? 'Available for teacher review.' : 'Nothing to review from this attempt.'}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a98ad]">Teacher review</p>
          <p className="mt-2 text-sm font-bold text-[#0a235c]">
            {pendingReviewTasks.length
              ? `${pendingReviewTasks.length} pending`
              : trace.reviewTasks.length
                ? 'Decision recorded'
                : 'No review task'}
          </p>
          <p className="mt-1 text-xs text-[#60718d]">
            {pendingReviewTasks.length ? 'Teacher action is required.' : 'No pending teacher action.'}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a98ad]">Learner-facing output</p>
          <p className="mt-2 text-sm font-bold text-[#0a235c]">{hasLearnerFacingOutput ? 'Output persisted' : 'No output published'}</p>
          <p className="mt-1 text-xs text-[#60718d]">
            {trace.portfolio ? `Portfolio projection v${trace.portfolio.version}` : trace.report ? 'Class report present' : 'Nothing from this attempt reached the learner record.'}
          </p>
        </article>
      </section>

      {trace.evidence.length ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Evidence</p>
            <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Evidence candidates</h2>
            <p className="mt-2 text-sm text-[#60718d]">Candidates remain proposals until the appropriate teacher validation occurs.</p>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {trace.evidence.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7184a1]">{item.category}</p>
                  <IntelligenceStatusBadge
                    label={item.requiresReview ? 'needs review' : item.state}
                    state={item.requiresReview ? 'NEEDS_REVIEW' : item.state === 'rejected' || item.state === 'blocked' ? 'BLOCKED' : 'PRESENT'}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-[#304d7d]">{item.observation}</p>
                {item.sourceSpan ? <p className="mt-3 text-xs leading-5 text-[#60718d]"><strong>Source:</strong> {item.sourceSpan}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {trace.reviewTasks.length ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Teacher decisions</p>
          <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Review history</h2>
          <div className="mt-4 space-y-3">
            {trace.reviewTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 bg-[#fbfdff] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#0a235c]">{task.stage.replace(/_/g, ' ')}</p>
                  <IntelligenceStatusBadge label={task.decision || 'pending'} state={task.decision ? 'PRESENT' : 'NEEDS_REVIEW'} />
                </div>
                {task.reason ? <p className="mt-2 text-xs leading-5 text-[#60718d]">{task.reason}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {trace.report || trace.signals.length || trace.insight ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {trace.report ? (
            <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Class report</p>
              <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Report state</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <IntelligenceStatusBadge label={trace.report.documentStatus} state="PRESENT" />
                <IntelligenceStatusBadge label={trace.report.implementationStatus} state={trace.report.implementationStatus === 'proven' ? 'PRESENT' : 'NOT_PROVEN'} />
              </div>
            </article>
          ) : null}

          {trace.signals.length || trace.insight ? (
            <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">AI proposals</p>
              <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Suggestions awaiting human authority</h2>
              <p className="mt-3 text-sm text-[#60718d]">Signals: {trace.signals.length}</p>
              {trace.insight ? (
                <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-violet-700" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-violet-700">
                      {trace.insight.isOfficial ? 'official flag persisted' : 'AI proposed'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-violet-950">{trace.insight.text}</p>
                </div>
              ) : null}
            </article>
          ) : null}
        </section>
      ) : null}

      <details className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_42px_rgba(15,48,93,0.05)]">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-sm font-bold text-[#304d7d] md:px-6 [&::-webkit-details-marker]:hidden">
          <FileText className="h-5 w-5 text-[#7184a1]" aria-hidden="true" />
          Technical trace / audit
          <span className="ml-auto text-xs font-medium text-[#8a98ad]">Open only when troubleshooting</span>
        </summary>

        <div className="space-y-5 border-t border-slate-200 p-5 md:p-6">
          <section>
            <h2 className="text-sm font-bold text-[#0a235c]">Processing attempt</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <div><dt className="text-[#8a98ad]">PipelineRun</dt><dd className="mt-1 break-all font-medium text-[#304d7d]">{trace.run.id}</dd></div>
              <div><dt className="text-[#8a98ad]">Lesson identity</dt><dd className="mt-1 break-all font-medium text-[#304d7d]">{trace.run.lessonId}</dd></div>
              <div><dt className="text-[#8a98ad]">Authority</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.run.authorityStatus}</dd></div>
              <div><dt className="text-[#8a98ad]">Started</dt><dd className="mt-1 font-medium text-[#304d7d]">{new Date(trace.run.startedAt).toLocaleString('en-GB')}</dd></div>
              <div><dt className="text-[#8a98ad]">Completed</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.run.completedAt ? new Date(trace.run.completedAt).toLocaleString('en-GB') : 'Not completed'}</dd></div>
              <div><dt className="text-[#8a98ad]">Portfolio apply</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.run.portfolioApplyStatus || 'not applied'}</dd></div>
              <div><dt className="text-[#8a98ad]">Error code</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.run.errorCode || 'none'}</dd></div>
            </dl>
            {trace.run.errorMessage ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">{trace.run.errorMessage}</p>
            ) : null}
          </section>

          {trace.transcript ? (
            <section>
              <h2 className="text-sm font-bold text-[#0a235c]">Source provenance</h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-[#8a98ad]">sourceFileId</dt><dd className="mt-1 break-all font-medium text-[#304d7d]">{trace.transcript.sourceFileId || 'not persisted'}</dd></div>
                <div><dt className="text-[#8a98ad]">transcriptId</dt><dd className="mt-1 break-all font-medium text-[#304d7d]">{trace.transcript.id}</dd></div>
                <div><dt className="text-[#8a98ad]">source type</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.transcript.source}</dd></div>
                <div><dt className="text-[#8a98ad]">recordedAt</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.transcript.recordedAt ? new Date(trace.transcript.recordedAt).toLocaleString('en-GB') : 'not persisted'}</dd></div>
              </dl>
            </section>
          ) : null}

          <section>
            <h2 className="text-sm font-bold text-[#0a235c]">AI generation provenance</h2>
            <div className="mt-3"><JsonBlock value={trace.aiProvenance} /></div>
          </section>

          {trace.portfolio ? (
            <section>
              <h2 className="text-sm font-bold text-[#0a235c]">Portfolio projection payload</h2>
              <div className="mt-3"><JsonBlock value={trace.portfolio.projection} /></div>
            </section>
          ) : null}

          <section>
            <h2 className="text-sm font-bold text-[#0a235c]">Persisted events</h2>
            {trace.events.length ? (
              <div className="mt-3 space-y-2">
                {trace.events.map((event) => (
                  <details key={event.id} className="rounded-xl border border-slate-200 bg-[#fbfdff] p-3">
                    <summary className="cursor-pointer text-sm font-medium text-[#304d7d]">
                      {event.eventType} <span className="ml-2 text-xs text-[#8a98ad]">{new Date(event.createdAt).toLocaleString('en-GB')}</span>
                    </summary>
                    <div className="mt-3"><JsonBlock value={event.payload} /></div>
                  </details>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#60718d]">No persisted events for this attempt.</p>
            )}
          </section>
        </div>
      </details>
    </div>
  )
}
