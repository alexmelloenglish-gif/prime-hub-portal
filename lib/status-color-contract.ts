export type PedagogicalAuthorityStatus =
  | 'TEACHER_CONFIRMED'
  | 'TEACHER_EDITED_CONFIRMED'
  | 'TEACHER_NOTE'
  | 'SELF_PERCEPTION'
  | 'NOT_CONFIRMED'
  | 'NOT_OBSERVED'
  | 'NOT_APPLICABLE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_AVAILABLE'

type Tone = 'light' | 'dark'

type AuthorityStatusVisual = {
  label: string
  light: string
  dark: string
}

/**
 * PRIME pedagogical authority color contract.
 *
 * Blue is reserved for teacher-confirmed authority. Do not use green to mean
 * Teacher Confirmed; green belongs to technical PASS/verified states and to the
 * separate learner-progress "Strong" state.
 *
 * Color is never the only carrier of meaning: the status label must remain
 * visible alongside the color treatment.
 */
export const PEDAGOGICAL_AUTHORITY_STATUS_VISUALS: Record<PedagogicalAuthorityStatus, AuthorityStatusVisual> = {
  TEACHER_CONFIRMED: {
    label: 'Teacher confirmed',
    light: 'border-blue-300 bg-blue-100 text-blue-900',
    dark: 'border-blue-300/35 bg-blue-300/15 text-blue-100',
  },
  TEACHER_EDITED_CONFIRMED: {
    label: 'Teacher edited & confirmed',
    light: 'border-blue-400 bg-blue-50 text-blue-950',
    dark: 'border-blue-200/40 bg-blue-200/15 text-blue-50',
  },
  TEACHER_NOTE: {
    label: 'Teacher note',
    light: 'border-violet-300 bg-violet-100 text-violet-900',
    dark: 'border-violet-300/30 bg-violet-300/10 text-violet-100',
  },
  SELF_PERCEPTION: {
    label: 'Learner self-perception',
    light: 'border-purple-300 bg-purple-100 text-purple-900',
    dark: 'border-purple-300/30 bg-purple-300/10 text-purple-100',
  },
  NOT_CONFIRMED: {
    label: 'Not confirmed',
    light: 'border-amber-300 bg-amber-100 text-amber-950',
    dark: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
  },
  NOT_OBSERVED: {
    label: 'Not observed',
    light: 'border-slate-300 bg-slate-100 text-slate-800',
    dark: 'border-slate-300/25 bg-slate-300/10 text-slate-200',
  },
  NOT_APPLICABLE: {
    label: 'Not applicable',
    light: 'border-violet-200 bg-violet-50 text-violet-800',
    dark: 'border-violet-300/20 bg-violet-300/5 text-violet-200',
  },
  INSUFFICIENT_EVIDENCE: {
    label: 'Insufficient evidence',
    light: 'border-orange-300 bg-orange-100 text-orange-950',
    dark: 'border-orange-300/30 bg-orange-300/10 text-orange-100',
  },
  NOT_AVAILABLE: {
    label: 'Not available',
    light: 'border-zinc-300 bg-zinc-100 text-zinc-700',
    dark: 'border-white/15 bg-white/5 text-zinc-300',
  },
}

export function pedagogicalAuthorityStatusClass(status: PedagogicalAuthorityStatus, tone: Tone = 'light') {
  return PEDAGOGICAL_AUTHORITY_STATUS_VISUALS[status][tone]
}

export function pedagogicalAuthorityStatusLabel(status: PedagogicalAuthorityStatus) {
  return PEDAGOGICAL_AUTHORITY_STATUS_VISUALS[status].label
}
