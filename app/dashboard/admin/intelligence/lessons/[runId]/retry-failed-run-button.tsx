'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RotateCcw } from 'lucide-react'

export function RetryFailedRunButton({ pipelineRunId, sourceFileId }: { pipelineRunId: string; sourceFileId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function retry() {
    if (busy) return
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/pipeline/retry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pipelineRunId, sourceFileId }),
      })
      const body = await response.json().catch(() => ({})) as {
        pipelineRunId?: string
        status?: string
        errorCode?: string
        error?: string
      }
      if (!response.ok || !body.pipelineRunId) {
        throw new Error(body.error || 'The pipeline retry could not be completed.')
      }
      setMessage(`New attempt ${body.pipelineRunId} persisted with status ${body.status || 'unknown'}${body.errorCode ? ` (${body.errorCode})` : ''}.`)
      router.push(`/dashboard/admin/intelligence/lessons/${body.pipelineRunId}`)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The pipeline retry could not be completed.')
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={retry}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl border border-red-300/25 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/25 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RotateCcw className="h-4 w-4" aria-hidden="true" />}
        {busy ? 'RETRYING…' : 'RETRY THIS FAILED RUN'}
      </button>
      <p className="max-w-sm text-right text-[11px] leading-4 text-prime-cream/45">
        Creates a new pipelineRun from the canonical stored transcript. The failed run remains unchanged.
      </p>
      {message ? <p className="max-w-md text-right text-xs text-sky-100">{message}</p> : null}
    </div>
  )
}
