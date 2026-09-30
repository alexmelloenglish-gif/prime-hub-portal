import { AlertTriangle, CheckCircle2, CircleDashed, Info, ShieldCheck, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { pedagogicalAuthorityStatusClass, type PedagogicalAuthorityStatus } from '@/lib/status-color-contract'

type IntelligenceOperationalState =
  | 'VERIFIED'
  | 'NOT_PROVEN'
  | 'BLOCKED'
  | 'FAILED'
  | 'PRESENT'
  | 'NEEDS_REVIEW'

type IntelligenceStatus = IntelligenceOperationalState | PedagogicalAuthorityStatus

export function IntelligenceStatusBadge({
  label,
  state,
}: {
  label: string
  state: IntelligenceStatus
}) {
  const pedagogical = new Set<PedagogicalAuthorityStatus>([
    'TEACHER_CONFIRMED',
    'TEACHER_EDITED_CONFIRMED',
    'TEACHER_NOTE',
    'SELF_PERCEPTION',
    'NOT_CONFIRMED',
    'NOT_OBSERVED',
    'NOT_APPLICABLE',
    'INSUFFICIENT_EVIDENCE',
    'NOT_AVAILABLE',
  ])

  if (pedagogical.has(state as PedagogicalAuthorityStatus)) {
    const authorityState = state as PedagogicalAuthorityStatus
    const Icon =
      authorityState === 'TEACHER_CONFIRMED' || authorityState === 'TEACHER_EDITED_CONFIRMED'
        ? ShieldCheck
        : authorityState === 'TEACHER_NOTE' || authorityState === 'SELF_PERCEPTION'
          ? Info
          : authorityState === 'NOT_CONFIRMED' || authorityState === 'INSUFFICIENT_EVIDENCE'
            ? AlertTriangle
            : CircleDashed

    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]',
        pedagogicalAuthorityStatusClass(authorityState, 'dark'),
      )}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </span>
    )
  }

  const config = {
    VERIFIED: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    PRESENT: { icon: CheckCircle2, className: 'border-sky-200 bg-sky-50 text-sky-700' },
    NEEDS_REVIEW: { icon: AlertTriangle, className: 'border-amber-200 bg-amber-50 text-amber-800' },
    BLOCKED: { icon: XCircle, className: 'border-orange-200 bg-orange-50 text-orange-700' },
    FAILED: { icon: XCircle, className: 'border-red-200 bg-red-50 text-red-700' },
    NOT_PROVEN: { icon: CircleDashed, className: 'border-slate-200 bg-slate-50 text-slate-600' },
  }[state as IntelligenceOperationalState]

  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]', config.className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}
