export const PRIME_PROGRESS_STATES = [
  'Strong',
  'Improving',
  'Needs Focus',
  'Not Assessed',
] as const

export type PrimeProgressState = (typeof PRIME_PROGRESS_STATES)[number]

export const PRIME_PROGRESS_STATE_MEANINGS: Record<PrimeProgressState, string> = {
  Strong: 'The skill is demonstrated consistently.',
  Improving: 'The skill is showing active, observable development.',
  'Needs Focus': 'The skill requires targeted attention and practice.',
  'Not Assessed': 'There is not yet enough evidence to classify the skill.',
}

const aliases: Record<string, PrimeProgressState> = {
  strong: 'Strong',
  'very strong': 'Strong',
  secure: 'Strong',
  established: 'Strong',

  improving: 'Improving',
  'active growth': 'Improving',
  developing: 'Improving',
  progressing: 'Improving',
  'on track': 'Improving',
  'on-track': 'Improving',

  'needs focus': 'Needs Focus',
  'needs attention': 'Needs Focus',
  attention: 'Needs Focus',
  priority: 'Needs Focus',
  'needs practice': 'Needs Focus',

  'not assessed': 'Not Assessed',
  'not yet assessed': 'Not Assessed',
  pending: 'Not Assessed',
  unknown: 'Not Assessed',
  'not available': 'Not Assessed',
  'in progress': 'Not Assessed',
}

export function normalizeProgressState(value?: string | null): PrimeProgressState {
  const key = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return aliases[key] ?? 'Not Assessed'
}

export function isCanonicalProgressState(value?: string | null): value is PrimeProgressState {
  return PRIME_PROGRESS_STATES.includes(value as PrimeProgressState)
}
