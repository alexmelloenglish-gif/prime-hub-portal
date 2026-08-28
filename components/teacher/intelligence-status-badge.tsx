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
    VERIFIED: { icon: CheckCircle2, className: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' },
    PRESENT: { icon: CheckCircle2, className: 'border-sky-300/20 bg-sky-300/10 text-sky-100' },
    NEEDS_REVIEW: { icon: AlertTriangle, className: 'border-amber-300/20 bg-amber-300/10 text-amber-100' },
    BLOCKED: { icon: XCircle, className: 'border-orange-300/20 bg-orange-300/10 text-orange-100' },
    FAILED: { icon: XCircle, className: 'border-red-300/20 bg-red-300/10 text-red-100' },
    NOT_PROVEN: { icon: CircleDashed, className: 'border-white/10 bg-white/5 text-prime-cream/65' },
  }[state]
  const Icon = config.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]', config.className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}
