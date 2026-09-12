'use client'

import { useState } from 'react'

type Candidate = {
  id: string
  candidateKey: string
  lessonId: string
  studentEmail: string
  sourceType: string
  sourceRef: string
  sourceHash: string
  sourceOccurredAt: string | null
  candidateType: string
  payload: unknown
  provenance: unknown
  promptVersion: string | null
  processorVersion: string | null
  generatedAt: string
  createdAt: string
}

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2)
}

export function CandidateReviewList({ candidates }: { candidates: Candidate[] }) {
  const [items, setItems] = useState(candidates)
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function decide(candidate: Candidate, decision: 'approved' | 'edited' | 'rejected') {
    setBusy(candidate.id)
    setMessage(null)
    const reviewedPayload = decision === 'edited'
      ? window.prompt('Cole o JSON revisado pelo professor:')
      : undefined
    if (decision === 'edited' && !reviewedPayload) {
      setBusy(null)
      setMessage('Edited requires an explicit reviewed payload.')
      return
    }

    let parsedPayload: unknown = undefined
    if (reviewedPayload) {
      try {
        parsedPayload = JSON.parse(reviewedPayload)
      } catch {
        setBusy(null)
        setMessage('The reviewed payload must be valid JSON.')
        return
      }
    }

    try {
      const response = await fetch('/api/admin/intelligence/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateRecordId: candidate.id, decision, reviewedPayload: parsedPayload }),
      })
      const body = await response.json() as { error?: string }
      if (!response.ok) throw new Error(body.error || 'Review decision failed')
      setItems((current) => current.filter((item) => item.id !== candidate.id))
      setMessage(`Teacher decision recorded: ${decision}. Canonicalization and projection were not performed.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Review decision failed')
    } finally {
      setBusy(null)
    }
  }

  if (!items.length) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-[#60718d]">No NEW INTELLIGENCE candidates are waiting for review.</p>
  }

  return (
    <div className="space-y-5">
      {message && <p role="status" className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-semibold text-indigo-800">{message}</p>}
      {items.map((candidate) => (
        <article key={candidate.id} className="rounded-[26px] border border-amber-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,48,93,0.07)] md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">AI CANDIDATE · REVIEW REQUIRED</p>
              <h2 className="mt-1 break-all text-xl font-bold text-[#0a235c]">{candidate.lessonId}</h2>
              <p className="mt-1 text-sm text-[#60718d]">{candidate.studentEmail} · {candidate.candidateType}</p>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">candidate / requiresReview</span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">Source</h3>
              <dl className="mt-3 space-y-2 text-sm text-[#304d7d]">
                <div><dt className="font-bold">Type</dt><dd>{candidate.sourceType}</dd></div>
                <div><dt className="font-bold">Reference</dt><dd className="break-all">{candidate.sourceRef}</dd></div>
                <div><dt className="font-bold">Hash</dt><dd className="break-all font-mono text-xs">{candidate.sourceHash}</dd></div>
                <div><dt className="font-bold">Source time</dt><dd>{candidate.sourceOccurredAt || 'Not proven'}</dd></div>
              </dl>
            </section>
            <section className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-violet-800">Provenance</h3>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[#304d7d]">{pretty(candidate.provenance)}</pre>
            </section>
          </div>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-[#f8fbff] p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#49617f]">Generated AI content</h3>
              <span className="text-xs text-[#60718d]">Prompt {candidate.promptVersion || 'n/a'} · Processor {candidate.processorVersion || 'n/a'}</span>
            </div>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[#304d7d]">{pretty(candidate.payload)}</pre>
          </section>

          <section className="mt-4 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Teacher decision</h3>
            <p className="mt-2 text-xs leading-5 text-[#60718d]">Approval creates only an IntelligenceReviewTransition. It does not canonicalize or project learner-facing data.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['approved', 'edited', 'rejected'] as const).map((decision) => (
                <button key={decision} disabled={busy === candidate.id} onClick={() => decide(candidate, decision)} className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold capitalize text-indigo-800 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50">
                  {busy === candidate.id ? 'Saving…' : decision}
                </button>
              ))}
            </div>
          </section>
        </article>
      ))}
    </div>
  )
}
