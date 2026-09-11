import { normalizeProgressState, type PrimeProgressState } from '@/lib/progress-states'

type Tone = 'light' | 'dark'

const lightClasses: Record<PrimeProgressState, string> = {
  Strong: 'border-emerald-300 bg-emerald-100 text-emerald-900',
  Improving: 'border-blue-300 bg-blue-100 text-blue-900',
  'Needs Focus': 'border-amber-300 bg-amber-100 text-amber-900',
  'Not Assessed': 'border-slate-300 bg-slate-100 text-slate-700',
}

const darkClasses: Record<PrimeProgressState, string> = {
  Strong: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200',
  Improving: 'border-sky-300/30 bg-sky-300/10 text-sky-200',
  'Needs Focus': 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  'Not Assessed': 'border-white/15 bg-white/5 text-prime-cream/70',
}

export function ProgressStateBadge({ status, tone = 'light' }: { status?: string | null; tone?: Tone }) {
  const normalized = normalizeProgressState(status)
  const classes = tone === 'dark' ? darkClasses[normalized] : lightClasses[normalized]

  return (
    <span className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${classes}`}>
      {normalized}
    </span>
  )
}
