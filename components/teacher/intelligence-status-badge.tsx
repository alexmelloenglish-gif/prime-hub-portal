import { AlertTriangle, CheckCircle2, CircleDashed, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function IntelligenceStatusBadge({
  label,
  state,
}: {
  label: string
  state: 'VERIFIED' | 'NOT_PROVEN' | 'BLOCKED' | 'FAILED' | 'PRESENT' | 'NEEDS_REVIEW'
}) {
  const config = {
    VERIFIED: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    PRESENT: { icon: CheckCircle2, className: 'border-sky-200 bg-sky-50 text-sky-700' },
    NEEDS_REVIEW: { icon: AlertTriangle, className: 'border-amber-200 bg-amber-50 text-amber-800' },
    BLOCKED: { icon: XCircle, className: 'border-orange-200 bg-orange-50 text-orange-700' },
    FAILED: { icon: XCircle, className: 'border-red-200 bg-red-50 text-red-700' },
    NOT_PROVEN: { icon: CircleDashed, className: 'border-slate-200 bg-slate-50 text-slate-600' },
  }[state]
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]', config.className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}
