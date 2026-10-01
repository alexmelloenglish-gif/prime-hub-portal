import Link from 'next/link'
import { ArrowLeft, ExternalLink, PlayCircle, RefreshCcw } from 'lucide-react'
import { listDriveTranscriptSourceQueue } from '@/lib/drive-reconciliation'
import { processDriveTranscriptSource } from './actions'

function formatDate(value: string | null) {
  if (!value) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const stateLabels = {
  not_ingested: {
    label: 'Ready to process',
    className: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  failed: {
    label: 'Previous processing failed',
    className: 'border-orange-200 bg-orange-50 text-orange-900',
  },
  ingested: {
    label: 'Already ingested',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
} as const

export default async function LearningMachineInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const sources = await listDriveTranscriptSourceQueue(40)

  return (
    <section className="space-y-5">
      <Link
        href="/dashboard/admin/intelligence"
        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Teacher Intelligence
      </Link>

      <header className="rounded-[28px] border border-indigo-100 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.07)] md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Learning Machine inbox</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0a235c]">Real transcript sources waiting for PRIME</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-[#526783]">
          Manual means manual trigger only. PRIME reads the canonical Drive source, verifies the transcript/learner identity, and sends it through the same shared Learning Machine used by automation.
        </p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-[#f8fbff] p-4 text-sm leading-6 text-[#60718d]">
          Automatic ingestion remains a separate trigger into the same Machine. Teacher Authority is still required wherever the Machine reaches an authority boundary.
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900">
          Processing stopped: {error}
        </div>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.07)] md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7184a1]">Canonical Drive intake</p>
            <h2 className="mt-1 text-2xl font-bold text-[#0a235c]">Transcript sources</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
            {sources.length} source{sources.length === 1 ? '' : 's'}
          </span>
        </div>

        {sources.length ? (
          <div className="mt-5 space-y-3">
            {sources.map((source) => {
              const state = stateLabels[source.state]
              return (
                <article key={source.sourceFileId} className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-[#0a235c]">{source.name}</p>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${state.className}`}>
                          {state.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[#7184a1]">Modified {formatDate(source.modifiedAt || source.createdAt)}</p>
                      {source.studentEmail ? <p className="mt-1 text-xs text-[#60718d]">{source.studentEmail}</p> : null}
                      {source.latestRunId ? (
                        <p className="mt-1 break-all text-[11px] text-[#8a98ad]">Existing run {source.latestRunId}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {source.sourceUrl ? (
                        <a
                          href={source.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#60718d] hover:bg-slate-50"
                        >
                          Open source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : null}

                      {source.state === 'not_ingested' ? (
                        <form action={processDriveTranscriptSource}>
                          <input type="hidden" name="sourceFileId" value={source.sourceFileId} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#263c86] px-3 py-2 text-xs font-bold text-white hover:bg-[#1f3272]"
                          >
                            <PlayCircle className="h-4 w-4" aria-hidden="true" />
                            Process
                          </button>
                        </form>
                      ) : source.latestRunId ? (
                        <Link
                          href={`/dashboard/admin/intelligence/lessons/${encodeURIComponent(source.latestRunId)}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                        >
                          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                          Processing history
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-slate-200 bg-[#f8fbff] p-4 text-sm text-[#60718d]">
            No transcript sources are currently visible in the canonical Drive intake.
          </p>
        )}
      </section>
    </section>
  )
}
