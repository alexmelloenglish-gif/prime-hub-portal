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

function humanize(value: string | null | undefined) {
  if (!value) return 'NOT PROVEN'
  return value.replace(/_/g, ' ').replace(/\//g, ' · ')
}

export default async function TeacherLessonDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  const trace = await getTeacherLessonTrace(runId)
  if (!trace) notFound()

  const originalSourceUrl = sourceUrl(trace.transcript?.metadata)
  const pendingReviewTasks = trace.reviewTasks.filter((task) => !task.decision)
  const evidenceLabel = trace.evidence.length
    ? `${trace.evidence.length} candidate${trace.evidence.length === 1 ? '' : 's'}`
    : trace.transcript
      ? 'source only'
      : 'NOT PROVEN'
  const reviewLabel = trace.reviewTasks.length
    ? pendingReviewTasks.length
      ? `${pendingReviewTasks.length} pending`
      : 'decisions recorded'
    : 'NOT PROVEN'
  const reportLabel = trace.report
    ? `${trace.report.documentStatus}/${trace.report.implementationStatus}`
    : 'NOT PROVEN'

  const chain = [
    {
      key: 'identity',
      label: 'Identity',
      value: `${trace.run.studentEmail} · ${trace.run.lessonId}`,
      state: 'VERIFIED',
      note: `PipelineRun ${trace.run.id}; authority ${trace.run.authorityStatus}.`,
    },
    {
      key: 'attendance',
      label: 'Attendance',
      value: 'NOT PROVEN',
      state: 'NOT_PROVEN',
      note: 'No independent canonical attendance authority is linked to this PipelineRun. Transcript or processing existence is not treated as attendance.',
    },
    {
      key: 'source',
      label: 'Source',
      value: trace.transcript
        ? `${trace.transcript.source}${trace.transcript.sourceFileId ? ` · ${trace.transcript.sourceFileId}` : ''}`
        : 'NOT PROVEN',
      state: trace.transcript?.sourceFileId ? 'VERIFIED' : trace.transcript ? 'PRESENT' : 'NOT_PROVEN',
      note: trace.transcript
        ? `Transcript record ${trace.transcript.id}; source link is only shown when explicitly persisted.`
        : 'No persisted transcript/source record.',
    },
    {
      key: 'processing',
      label: 'Processing',
      value: trace.run.status,
      state: trace.run.status === 'failed' ? 'FAILED' : 'PRESENT',
      note: 'Processing state is technical only. COMPLETED does not imply evidence, assessment or report validity.',
    },
    {
      key: 'evidence',
      label: 'Evidence',
      value: evidenceLabel,
      state: trace.evidence.length || trace.transcript ? 'PRESENT' : 'NOT_PROVEN',
      note: trace.evidence.length
        ? 'Persisted Evidence Candidates are proposals until the appropriate evidence authority validates them.'
        : trace.transcript
          ? 'A source is present, but no Evidence Candidate is persisted for this run.'
          : 'No evidence-bearing source is proven.',
    },
    {
      key: 'assessment',
      label: 'Assessment',
      value: 'NOT PROVEN',
      state: 'NOT_PROVEN',
      note: 'No canonical Assessment record is persisted on this trace. Evidence Candidates, AI signals, insights and reports are not converted into assessment state.',
    },
    {
      key: 'review',
      label: 'Review',
      value: reviewLabel,
      state: trace.reviewTasks.length ? 'PRESENT' : 'NOT_PROVEN',
      note: trace.reviewTasks.length
        ? 'ReviewTask history is shown read-only. A decision applies only to the scope recorded by that task.'
        : 'No ReviewTask is persisted; absence of a task is not teacher approval.',
    },
    {
      key: 'report',
      label: 'Report',
      value: reportLabel,
      state: trace.report ? 'PRESENT' : 'NOT_PROVEN',
      note: 'Report/document state remains independent from evidence and assessment authority.',
    },
    {
      key: 'provenance',
      label: 'Provenance',
      value: `${trace.events.length} audit event${trace.events.length === 1 ? '' : 's'}`,
      state: trace.events.length || trace.transcript || trace.aiProvenance ? 'PRESENT' : 'NOT_PROVEN',
      note: 'Source identifiers, AI generation provenance and persisted events explain what happened without creating learner judgments.',
    },
  ] as const

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
            label={`processing ${trace.run.status}`}
            state={trace.run.status === 'failed' ? 'FAILED' : 'PRESENT'}
          />
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#60718d]">
            Read-only trace
          </span>
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.07)] md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Admin Lesson Intelligence</p>
        <h1 className="mt-1 text-2xl font-bold text-[#0a235c]">{trace.run.studentEmail}</h1>
        <p className="mt-2 break-all text-sm text-[#60718d]">Lesson identity: {trace.run.lessonId}</p>
        <p className="mt-1 break-all text-xs text-[#8a98ad]">Processing attempt: {trace.run.id}</p>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          This surface explains what the system can prove for this attempt. It does not create a learner judgment, infer attendance, or turn pipeline completion into assessment.
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.07)] md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Authority chain</p>
            <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Why is the system saying this?</h2>
          </div>
          <p className="max-w-xl text-xs leading-5 text-[#60718d]">Each stage is read independently. A downstream artifact never proves that an upstream pedagogical state occurred.</p>
        </div>

        <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {chain.map((stage, index) => (
            <li key={stage.key} className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a98ad]">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-1 text-sm font-bold text-[#0a235c]">{stage.label}</h3>
                </div>
                <IntelligenceStatusBadge label={stage.value} state={stage.state} />
              </div>
              <p className="mt-3 text-xs leading-5 text-[#60718d]">{stage.note}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Source</p>
              <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Drive / transcript provenance</h2>
            </div>
            {originalSourceUrl ? (
              <a
                href={originalSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-100"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open Drive source
              </a>
            ) : null}
          </div>

          {trace.transcript ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-[#8a98ad]">sourceFileId</dt><dd className="mt-1 break-all font-medium text-[#304d7d]">{trace.transcript.sourceFileId || 'NOT PROVEN'}</dd></div>
              <div><dt className="text-[#8a98ad]">transcriptId</dt><dd className="mt-1 break-all font-medium text-[#304d7d]">{trace.transcript.id}</dd></div>
              <div><dt className="text-[#8a98ad]">source type</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.transcript.source}</dd></div>
              <div><dt className="text-[#8a98ad]">effectiveAt</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.transcript.effectiveAt ? new Date(trace.transcript.effectiveAt).toLocaleString('en-GB') : 'NOT PROVEN'}</dd></div>
              <div><dt className="text-[#8a98ad]">recordedAt</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.transcript.recordedAt ? new Date(trace.transcript.recordedAt).toLocaleString('en-GB') : 'NOT PROVEN'}</dd></div>
              <div><dt className="text-[#8a98ad]">Drive link</dt><dd className="mt-1 font-medium text-[#304d7d]">{originalSourceUrl ? 'persisted' : 'NOT PROVEN'}</dd></div>
            </dl>
          ) : (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No persisted transcript/source record.</p>
          )}
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Processing</p>
          <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Technical attempt</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-[#8a98ad]">status</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.run.status}</dd></div>
            <div><dt className="text-[#8a98ad]">authority</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.run.authorityStatus}</dd></div>
            <div><dt className="text-[#8a98ad]">started</dt><dd className="mt-1 font-medium text-[#304d7d]">{new Date(trace.run.startedAt).toLocaleString('en-GB')}</dd></div>
            <div><dt className="text-[#8a98ad]">completed</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.run.completedAt ? new Date(trace.run.completedAt).toLocaleString('en-GB') : 'NOT PROVEN'}</dd></div>
            <div><dt className="text-[#8a98ad]">error</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.run.errorCode || 'none persisted'}</dd></div>
            <div><dt className="text-[#8a98ad]">portfolio apply</dt><dd className="mt-1 font-medium text-[#304d7d]">{trace.run.portfolioApplyStatus || 'not applied'}</dd></div>
          </dl>
          {trace.run.errorMessage ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">{trace.run.errorMessage}</p> : null}
        </article>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Evidence</p>
            <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Persisted Evidence Candidates</h2>
          </div>
          <span className="text-xs font-semibold text-[#60718d]">Candidate ≠ validated evidence ≠ assessment</span>
        </div>

        {trace.evidence.length ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {trace.evidence.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7184a1]">{item.category}</p>
                    <p className="mt-1 break-all text-[11px] text-[#8a98ad]">{item.id}</p>
                  </div>
                  <IntelligenceStatusBadge
                    label={item.requiresReview ? 'needs review' : item.state}
                    state={item.requiresReview ? 'NEEDS_REVIEW' : item.state === 'rejected' || item.state === 'blocked' ? 'BLOCKED' : 'PRESENT'}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-[#304d7d]">{item.observation}</p>
                <p className="mt-3 text-xs leading-5 text-[#60718d]"><strong>Source span:</strong> {item.sourceSpan || 'NOT PROVEN'}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Zero persisted Evidence Candidates. No learning state is inferred from processing, transcript existence or report presence.
          </p>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Assessment</p>
          <h2 className="mt-1 text-xl font-bold text-amber-950">NOT PROVEN</h2>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            The current persisted trace has no canonical Assessment record. This screen deliberately does not translate Evidence Candidates, signal proposals, an AI insight, a class report or a completed run into `NOT_ASSESSED`, `REVIEW_REQUIRED` or `TEACHER_VALIDATED`.
          </p>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Review</p>
          <h2 className="mt-1 text-xl font-bold text-[#0a235c]">ReviewTask history</h2>
          {trace.reviewTasks.length ? (
            <div className="mt-4 space-y-3">
              {trace.reviewTasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-200 bg-[#fbfdff] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[#0a235c]">{humanize(task.stage)}</p>
                    <IntelligenceStatusBadge label={task.decision || 'pending'} state={task.decision ? 'PRESENT' : 'NEEDS_REVIEW'} />
                  </div>
                  <p className="mt-2 text-xs text-[#60718d]">Reviewer: {task.reviewerId || 'NOT PROVEN'} · Reviewed: {task.reviewedAt ? new Date(task.reviewedAt).toLocaleString('en-GB') : 'not yet'}</p>
                  {task.reason ? <p className="mt-2 text-xs leading-5 text-[#60718d]">Reason: {task.reason}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#60718d]">No ReviewTask persisted. This does not imply approval.</p>
          )}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Report</p>
          <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Class report state</h2>
          {trace.report ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <IntelligenceStatusBadge label={trace.report.documentStatus} state="PRESENT" />
                <IntelligenceStatusBadge label={trace.report.implementationStatus} state={trace.report.implementationStatus === 'proven' ? 'PRESENT' : 'NOT_PROVEN'} />
              </div>
              <p className="text-xs leading-5 text-[#60718d]">Report presence is a document/projection fact only. It does not prove validated evidence or teacher assessment.</p>
              <JsonBlock value={trace.report.content} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#60718d]">No ClassReportProjection persisted.</p>
          )}
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">AI proposals</p>
          <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Signals and insight are not judgments</h2>
          <div className="mt-4 space-y-3">
            <p className="text-sm text-[#60718d]">Signal proposals: {trace.signals.length}</p>
            {trace.signals.map((signal) => (
              <div key={signal.id} className="rounded-xl border border-slate-200 bg-[#fbfdff] p-3">
                <p className="text-sm font-medium text-[#304d7d]">{signal.signal}</p>
                <p className="mt-1 text-xs leading-5 text-[#60718d]">{signal.rationale}</p>
              </div>
            ))}
            {trace.insight ? (
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-violet-700" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-violet-700">{trace.insight.isOfficial ? 'official flag persisted' : 'AI proposed'}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-violet-950">{trace.insight.text}</p>
              </div>
            ) : <p className="text-sm text-[#60718d]">No TeacherInsightProposal persisted.</p>}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Provenance</p>
          <h2 className="mt-1 text-xl font-bold text-[#0a235c]">AI generation provenance</h2>
          <div className="mt-4"><JsonBlock value={trace.aiProvenance} /></div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Downstream projection</p>
          <h2 className="mt-1 text-xl font-bold text-[#0a235c]">PortfolioProjection from this run</h2>
          {trace.portfolio ? (
            <div className="mt-4">
              <p className="mb-3 text-sm text-[#60718d]">Version {trace.portfolio.version} · source run {trace.portfolio.sourceRunId}</p>
              <JsonBlock value={trace.portfolio.projection} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#60718d]">No PortfolioProjection sourced from this run.</p>
          )}
        </article>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.06)] md:p-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#7184a1]" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Audit / provenance</p>
            <h2 className="mt-1 text-xl font-bold text-[#0a235c]">Persisted events</h2>
          </div>
        </div>
        {trace.events.length ? (
          <div className="mt-4 space-y-2">
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
          <p className="mt-4 text-sm text-[#60718d]">No PipelineEvent records found.</p>
        )}
      </section>
    </div>
  )
}
