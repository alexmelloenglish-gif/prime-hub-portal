import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getTeacherTranscript } from '@/lib/teacher-intelligence'

function getSourceUrl(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const value = (metadata as Record<string, unknown>).sourceUrl
  return typeof value === 'string' && value.startsWith('https://') ? value : null
}

export default async function TeacherTranscriptPage({
  params,
  searchParams,
}: {
  params: Promise<{ runId: string }>
  searchParams: Promise<{ evidence?: string }>
}) {
  const { runId } = await params
  const { evidence } = await searchParams
  const transcript = await getTeacherTranscript(runId, evidence)
  if (!transcript) notFound()
  const sourceUrl = getSourceUrl(transcript.metadata)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/dashboard/admin/intelligence/lessons/${runId}`} className="inline-flex items-center gap-2 text-sm text-prime-cream/65 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to lesson trace
        </Link>
        {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Open original source</a> : null}
      </div>

      <section className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Transcript viewer</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{transcript.studentEmail}</h2>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <div><dt className="text-prime-cream/40">Transcript ID</dt><dd className="mt-1 break-all text-prime-cream/80">{transcript.id}</dd></div>
          <div><dt className="text-prime-cream/40">sourceFileId</dt><dd className="mt-1 break-all text-prime-cream/80">{transcript.sourceFileId || 'NOT PROVEN'}</dd></div>
          <div><dt className="text-prime-cream/40">Lesson</dt><dd className="mt-1 break-all text-prime-cream/80">{transcript.lessonId}</dd></div>
        </dl>
      </section>

      {transcript.selectedEvidence ? (
        <aside className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/70">Selected Evidence Candidate</p>
          <p className="mt-2 text-sm leading-6 text-amber-50">{transcript.selectedEvidence.observation}</p>
          <p className="mt-2 text-xs leading-5 text-amber-100/70"><span className="font-semibold">Source span:</span> {transcript.selectedEvidence.sourceSpan || 'NOT PROVEN'}</p>
          <p className="mt-1 text-[11px] text-amber-100/50">Use the source span as the trace target. The current viewer does not claim exact character-offset highlighting unless the persisted span itself provides it.</p>
        </aside>
      ) : null}

      <section className="glass-card p-4 md:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-prime-cream/45">
          <span>Large transcript loaded on this dedicated route only.</span>
          <span>Browser find can be used for exact text search.</span>
        </div>
        <pre className="max-h-[72vh] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-7 text-prime-cream/80" tabIndex={0} aria-label="Lesson transcript">
          {transcript.content}
        </pre>
      </section>
    </div>
  )
}
