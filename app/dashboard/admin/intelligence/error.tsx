'use client'

import { AlertTriangle } from 'lucide-react'

export default function TeacherIntelligenceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="glass-card p-6" role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-200" aria-hidden="true" />
        <div>
          <h2 className="font-semibold text-white">Teacher Intelligence could not load</h2>
          <p className="mt-2 text-sm leading-6 text-prime-cream/60">The UI will not replace missing runtime data with a fallback. Retry the read operation or inspect the audit trail.</p>
          {error.digest ? <p className="mt-2 text-xs text-prime-cream/35">Error reference: {error.digest}</p> : null}
          <button type="button" onClick={reset} className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10">Retry</button>
        </div>
      </div>
    </div>
  )
}
