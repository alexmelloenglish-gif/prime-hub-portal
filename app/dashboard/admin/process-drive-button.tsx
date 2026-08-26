'use client'

import { useState } from 'react'
import { Loader2, Play } from 'lucide-react'

export function ProcessDriveButton() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function processNow() {
    setBusy(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/process-drive', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      })
      const body = await response.json().catch(() => ({})) as {
        error?: string
        result?: {
          scanned: number
          alreadyIngested: number
          sourceReads: number
          submitted: number
          duplicates: number
          quarantined: number
        }
      }

      if (!response.ok || !body.result) {
        throw new Error(body.error || 'The Drive processing cycle could not be completed.')
      }

      const result = body.result
      setMessage(
        `Ciclo concluído: ${result.scanned} encontrados, ${result.submitted} enviados, ${result.alreadyIngested} já processados e ${result.quarantined} em quarentena.`
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The Drive processing cycle could not be completed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={processNow}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-2xl bg-prime-red px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-prime-red/90 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {busy ? 'PROCESSANDO…' : 'PROCESSAR AGORA'}
      </button>
      <p className="text-xs leading-5 text-prime-cream/60">
        Usa o mesmo ciclo oficial Drive → ingest do cron. O botão não move, renomeia ou exclui arquivos e não envia dados diretamente ao pipeline.
      </p>
      {message ? <p className="rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm text-sky-100">{message}</p> : null}
    </div>
  )
}
