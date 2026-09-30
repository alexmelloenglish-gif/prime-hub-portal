import Link from 'next/link'
import { ClipboardCheck, ExternalLink } from 'lucide-react'
import { ReviewQueueActions } from '@/app/dashboard/admin/review/review-queue-actions'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listPendingReviewTasks } from '@/lib/pipeline/run'
import { listEvidenceReviewQueue, listLearnerSubmissions } from '@/lib/teacher-intelligence'
import { reviewEvidenceCandidateAction, reviewLearnerSubmissionAction } from './actions'

function provenanceSummary(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'NOT PROVEN'
  const record = value as Record<string, unknown>
  const origin = typeof record.origin === 'string' ? record.origin : null
  const source = typeof record.source_reference === 'string' ? record.source_reference : null
  return [origin, source].filter(Boolean).join(' · ') || 'NOT PROVEN'
}

export default async function TeacherEvidenceReviewPage() {
  const [items, pipelineTasks, learnerSubmissions] = await Promise.all([
    listEvidenceReviewQueue(100),
    listPendingReviewTasks(),
    listLearnerSubmissions(100),
  ])
  const learnerSubmissionsPending = learnerSubmissions.filter((item) => item.needsTeacherReview).length
  const totalPending = items.length + pipelineTasks.length + learnerSubmissionsPending

  return (
    <section className="space-y-5">
      <div className="glass-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Teacher review</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Items waiting for a human decision</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">
              This workspace shows only items that actually require a teacher or administrator action.
            </p>
          </div>
          <IntelligenceStatusBadge label={`${totalPending} pending`} state={totalPending ? 'NEEDS_REVIEW' : 'PRESENT'} />
        </div>
      </div>

      <section aria-labelledby="learner-submissions-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#263c86]">Learner submissions</p>
            <h3 id="learner-submissions-heading" className="mt-1 text-lg font-semibold text-[#0a235c]">Audio missions requiring review</h3>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-[#60718d]">
              Learner audio can be listened to and marked as reviewed here. Self-perception check-ins are not review tasks and remain outside this workspace.
            </p>
          </div>
          <span className="text-xs font-medium text-[#60718d]">
            {learnerSubmissions.length} audio submission{learnerSubmissions.length === 1 ? '' : 's'} · {learnerSubmissionsPending} awaiting review
          </span>
        </div>

        {learnerSubmissions.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {learnerSubmissions.map((submission) => (
              <article id={`submission-${submission.id}`} key={submission.id} className="glass-card scroll-mt-6 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#263c86]">Audio mission</p>
                    <h4 className="mt-1 text-lg font-semibold text-[#0a235c]">
                      {submission.studentEmail || submission.studentId || 'Learner submission'}
                    </h4>
                    <p className="mt-1 text-xs text-[#60718d]">
                      {submission.actionId || 'Audio response'} · {submission.durationSeconds ?? '—'}s
                    </p>
                  </div>
                  <IntelligenceStatusBadge
                    label={submission.needsTeacherReview ? 'Needs review' : 'Reviewed'}
                    state={submission.needsTeacherReview ? 'NEEDS_REVIEW' : 'PRESENT'}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-prime-cream/45">Listen to submission</p>
                  <audio
                    controls
                    preload="metadata"
                    src={`/api/dashboard/action/audio/${submission.id}`}
                    className="w-full"
                  />
                  <a
                    href={`/api/dashboard/action/audio/${submission.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 rounded-lg border border-sky-300/30 bg-sky-300/10 px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-300/20"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    Open audio
                  </a>
                </div>

                <p className="mt-3 text-xs leading-5 text-[#60718d]">
                  Listening does not promote this response to teacher-confirmed evidence.
                </p>

                {submission.needsTeacherReview ? (
                  <form action={reviewLearnerSubmissionAction} className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <input type="hidden" name="submissionEventId" value={submission.id} />
                    <p className="text-xs leading-5 text-prime-cream/60">
                      Marking this submission as reviewed closes the submission-review task only. It does not create canonical evidence, change CEFR, consume Teacher Authority, or update the learner&apos;s learning state.
                    </p>
                    <button
                      type="submit"
                      className="mt-3 rounded-xl border border-sky-300/35 bg-sky-300/15 px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-300/25"
                    >
                      Mark as reviewed
                    </button>
                  </form>
                ) : (
                  <div className="mt-4 rounded-xl border border-sky-300/30 bg-sky-300/10 px-3 py-3 text-xs font-semibold leading-5 text-sky-100">
                    Reviewed by {submission.reviewerId || 'teacher'}
                    {submission.reviewedAt ? <> · {new Date(submission.reviewedAt).toLocaleString('en-GB')}</> : null}.
                    This remains a learner submission, not teacher-confirmed learning evidence.
                  </div>
                )}

                <p className="mt-4 text-[11px] text-prime-cream/65">
                  Submitted {new Date(submission.createdAt).toLocaleString('en-GB')} · event {submission.id}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-card flex items-center gap-3 p-5 text-sm text-prime-cream/60">
            <ClipboardCheck className="h-5 w-5" aria-hidden="true" /> No learner audio submissions require review.
          </div>
        )}
      </section>

      <section aria-labelledby="pipeline-review-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#263c86]">System checks</p>
            <h3 id="pipeline-review-heading" className="mt-1 text-lg font-semibold text-[#0a235c]">Access and publication checks</h3>
          </div>
          <span className="text-xs font-medium text-[#60718d]">{pipelineTasks.length} pending</span>
        </div>
        <ReviewQueueActions initialTasks={pipelineTasks} />
      </section>

      <section aria-labelledby="evidence-review-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#263c86]">Lesson evidence</p>
            <h3 id="evidence-review-heading" className="mt-1 text-lg font-semibold text-[#0a235c]">Evidence for teacher review</h3>
          </div>
          <span className="text-xs font-medium text-[#60718d]">{items.length} pending</span>
        </div>

        {items.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="glass-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-prime-cream/40">{item.category}</p>
                    <h4 className="mt-1 text-lg font-semibold text-white">{item.studentEmail}</h4>
                    
                  </div>
                  <IntelligenceStatusBadge label="Needs review" state="NEEDS_REVIEW" />
                </div>

                <p className="mt-4 text-sm leading-6 text-prime-cream/85">{item.observation}</p>
                <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                  <div><dt className="text-prime-cream/40">Lesson</dt><dd className="mt-1 break-all text-prime-cream/70">{item.lessonId}</dd></div>
                  
                  <div><dt className="text-prime-cream/40">Source span</dt><dd className="mt-1 text-prime-cream/70">{item.sourceSpan || 'NOT PROVEN'}</dd></div>
                  <div><dt className="text-prime-cream/40">Confidence</dt><dd className="mt-1 text-prime-cream/70">{item.confidence ?? 'NOT PROVEN'}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-prime-cream/40">Source</dt><dd className="mt-1 break-all text-prime-cream/70">{provenanceSummary(item.provenance)}</dd></div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/dashboard/admin/intelligence/lessons/${item.pipelineRunId}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">Open lesson</Link>
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
          <div className="glass-card flex items-center gap-3 p-5 text-sm text-[#60718d]"><ClipboardCheck className="h-5 w-5" aria-hidden="true" /> No evidence items currently require review.</div>
        )}
      </section>
    </section>
  )
}
