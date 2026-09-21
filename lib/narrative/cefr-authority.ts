export type CefrTransitionSource =
  | 'formal_assessment'
  | 'lesson'
  | 'lesson_accumulation'
  | 'lesson_replay'
  | 'other'

export type CefrTransitionAuthorityInput = {
  source: CefrTransitionSource
  assessmentReference?: string | null
  assessmentProcess?: string | null
  pedagogicallyAuthorized: boolean
  explicitProfileUpdate: boolean
}

export function validateCefrTransitionAuthority(
  input: CefrTransitionAuthorityInput,
): string[] {
  const errors: string[] = []

  if (input.source !== 'formal_assessment') {
    errors.push('CEFR transition requires a formal assessment/testing event.')
  }

  if (!input.assessmentReference?.trim() && !input.assessmentProcess?.trim()) {
    errors.push('CEFR transition requires an authorized assessment reference or process.')
  }

  if (!input.pedagogicallyAuthorized) {
    errors.push('CEFR transition requires pedagogical authorization.')
  }

  if (!input.explicitProfileUpdate) {
    errors.push('CEFR transition requires an explicit authorized profile update.')
  }

  return errors
}

export function canAuthorizeCefrTransition(
  input: CefrTransitionAuthorityInput,
): boolean {
  return validateCefrTransitionAuthority(input).length === 0
}
