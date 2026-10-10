const INTERNAL_GOVERNANCE_PATTERNS: RegExp[] = [
  /\bteacher[- ]validated\b/i,
  /\bteacher confirmed\b/i,
  /\bteacher authorized\b/i,
  /\bteacher[- ]approved\b/i,
  /\bvalidated\b/i,
  /\bauthorization\b/i,
  /\bportfolio[- ]confirmed\b/i,
  /\bqualified insight\b/i,
  /\bsystem detected\b/i,
  /\bpending teacher review\b/i,
  /\bcanonical\b/i,
  /\bprojection\b/i,
  /\brepository\b/i,
  /\bruntime\b/i,
  /\bpipeline\b/i,
  /\bsource authority\b/i,
  /\bevidence boundary\b/i,
  /\bnext verification\b/i,
  /\bauthorization status\b/i,
  /\bAI[- ]generated\b/i,
]

const TEACHER_PLAN_PATTERNS: RegExp[] = [
  /\bstart with\b/i,
  /\bbriefly (?:mix|review|check|ask|test)\b/i,
  /\bprioriti[sz]e\b/i,
  /\binvite (?:the )?student\b/i,
  /\blet (?:the )?student\b/i,
  /\bobserve\b/i,
  /\bconduct\b/i,
  /\bcheck whether\b/i,
  /\buse .* to (?:check|test|observe|verify)\b/i,
]

export function containsInternalGovernanceLanguage(value?: string | null) {
  const text = value?.trim() ?? ''
  return Boolean(text && INTERNAL_GOVERNANCE_PATTERNS.some((pattern) => pattern.test(text)))
}

export function looksLikeTeacherPlan(value?: string | null) {
  const text = value?.trim() ?? ''
  return Boolean(text && TEACHER_PLAN_PATTERNS.some((pattern) => pattern.test(text)))
}

export function learnerFacingText(
  value: string | null | undefined,
  fallback = '',
) {
  const text = value?.trim() ?? ''
  if (!text) return fallback
  if (containsInternalGovernanceLanguage(text)) return fallback
  return text
}

export function learnerFacingNextAction(input: {
  title?: string | null
  description?: string | null
  destination?: string | null
}) {
  const title = learnerFacingText(input.title, 'Your next learning step')
  const unsafeDescription =
    containsInternalGovernanceLanguage(input.description) ||
    looksLikeTeacherPlan(input.description)

  const description = unsafeDescription
    ? 'We’ll work on this together in your next lesson.'
    : learnerFacingText(
        input.description,
        'We’ll work on this together in your next lesson.',
      )

  return {
    title,
    description,
    destination: input.destination ?? null,
  }
}

export const learnerFacingForbiddenPhrases = [
  'teacher validated',
  'teacher-validated',
  'teacher confirmed',
  'teacher authorized',
  'teacher approved',
  'validated',
  'authorization',
  'portfolio confirmed',
  'portfolio-confirmed',
  'qualified insight',
  'system detected',
  'pending teacher review',
  'canonical',
  'projection',
  'repository',
  'runtime',
  'pipeline',
  'source authority',
  'evidence boundary',
  'next verification',
  'authorization status',
  'AI-generated',
] as const
