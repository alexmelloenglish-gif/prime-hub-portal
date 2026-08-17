'use client'

import { useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'

type ReviewTaskItem = {
  id: string
  pipelineRunId: string
  studentEmail: string
  lessonId: string
  stage: string
  createdAt: string
  pipelineStatus: string
  authorityStatus: string
  source: string
  transcriptId: string | null
  effectiveAt: string | null
}

export function ReviewQueueActions({ initialTasks }: { initialTasks: ReviewTaskItem[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function stageLabel(stage: string) {
    if (stage === 'publication_review_required') return 'Publication review required'
    if (stage === 'processing_approved') return 'Processing retry required'
    return 'Identity review required'
  }

  function approvalLabel(stage: string) {
    if (stage === 'publication_review_required') return 'Approve publication'
    if (stage === 'processing_approved') return 'Retry processing'
    return 'Approve and continue'
  }

  async function decide(task: ReviewTaskItem, decision: 'approved' | 'rejected') {
    const reason = reasons[task.id]?.trim() || undefined
    if (decision === 'rejected' && !reason) {
      setMessage('A rejection reason is required so the audit trail explains the decision.')
      return
    }

    setBusyId(task.id)
    setMessage(null)
    try {
      const response = await fetch('/api/pipeline/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pipelineRunId: task.pipelineRunId, decision, reason }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'The review decision could not be saved.')
      setTasks((current) => current.filter((item) => item.id !== task.id))
      setMessage(decision === 'approved'
        ? task.stage === 'publication_review_required'
          ? 'Publication approved. The validated class report and portfolio projection are now visible to the student.'
          : 'Identity approved. Prompts 2–4 generated drafts; a second publication review is now required.'
        : 'Rejected safely. No student-facing projection was published.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The review decision could not be saved.')
    } finally {
      setBusyId(null)
    }
  }

  if (!tasks.length) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-lg font-medium text-white">No pending reviews.</p>
        <p className="mt-2 text-sm leading-6 text-prime-cream/65">New usable transcripts appear here after Drive triage and Prompt 1. Student-facing content is published only after identity review and publication review.</p>
        {message ? <p className="mt-4 text-sm text-emerald-200">{message}</p> : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {message ? <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm text-sky-100">{message}</div> : null}
      {tasks.map((task) => {
        const busy = busyId === task.id
        return (
          <article key={task.id} className="glass-card p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-amber-100">{stageLabel(task.stage)}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-prime-cream/70">{task.source}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{task.studentEmail}</h2>
                  <p className="mt-1 text-sm text-prime-cream/65">Lesson: {task.lessonId}</p>
                </div>
                <div className="grid gap-2 text-sm text-prime-cream/75 sm:grid-cols-2">
                  <p><span className="text-prime-cream/45">Transcript:</span> {task.transcriptId || 'not supplied'}</p>
                  <p><span className="text-prime-cream/45">Received:</span> {new Date(task.createdAt).toLocaleString('en-GB')}</p>
                  <p><span className="text-prime-cream/45">Effective at:</span> {task.effectiveAt ? new Date(task.effectiveAt).toLocaleString('en-GB') : 'not supplied'}</p>
                  <p><span className="text-prime-cream/45">Authority:</span> {task.authorityStatus}</p>
                </div>
              </div>
              <div className="w-full max-w-md space-y-3">
                <label className="block text-xs uppercase tracking-[0.16em] text-prime-cream/50" htmlFor={`reason-${task.id}`}>Reviewer note</label>
                <textarea
                  id={`reason-${task.id}`}
                  value={reasons[task.id] || ''}
                  onChange={(event) => setReasons((current) => ({ ...current, [task.id]: event.target.value }))}
                  placeholder="Confirm identity, lesson date, and any correction needed. Required for rejection."
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-prime-red/60"
                  disabled={busy}
                />
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => decide(task, 'approved')} disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {approvalLabel(task.stage)}
                  </button>
                  <button type="button" onClick={() => decide(task, 'rejected')} disabled={busy} className="inline-flex items-center gap-2 rounded-2xl border border-rose-300/25 bg-rose-300/10 px-4 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-300/20 disabled:cursor-wait disabled:opacity-60">
                    <X className="h-4 w-4" />
                    Reject safely
                  </button>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
