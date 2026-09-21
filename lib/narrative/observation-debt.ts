export type ObservationDebtStatus = 'OPEN' | 'CLOSED' | 'SUPERSEDED'

export type ObservationOpportunityAssessment =
  | 'OCCURRED'
  | 'NOT_OCCURRED'
  | 'AMBIGUOUS'

export type ObservationDebtResolution =
  | 'NOT_TESTED'
  | 'TESTED_CONFIRMED'
  | 'TESTED_PARTIAL'
  | 'TESTED_CONTRADICTED'
  | 'TESTED_UNRESOLVED'
  | 'SUPERSEDED'

export type ObservationDebt = {
  debtId: string
  originLessonId: string
  claimToCheck: string
  domain: string
  requiredOpportunity: string
  supportAllowed?: string | null
  evidenceNeeded?: string | null
  status: 'OPEN'
  parentDebtId?: string | null
}

export type ObservationDebtSuccessor = ObservationDebt & {
  parentDebtId: string
}

export type ObservationDebtReconciliationInput = {
  debt: ObservationDebt
  currentLessonId: string
  opportunityAssessment: ObservationOpportunityAssessment
  resolution: ObservationDebtResolution
  evidenceRefs?: string[]
  resultBoundary: string
  sourceQualityFailure?: string | null
  successorDebt?: ObservationDebtSuccessor | null
}

export type ObservationDebtReconciliation = {
  debtId: string
  originLessonId: string
  currentLessonId: string
  claimToCheck: string
  domain: string
  statusBeforeLesson: 'OPEN'
  opportunityAssessment: ObservationOpportunityAssessment
  evidenceRefs: string[]
  resolution: ObservationDebtResolution
  resultBoundary: string
  statusAfterLesson: ObservationDebtStatus
  successorDebtId: string | null
}

function requireText(value: string, field: string): void {
  if (!value.trim()) throw new Error(`${field} is required.`)
}

export function reconcileObservationDebt(
  input: ObservationDebtReconciliationInput,
): ObservationDebtReconciliation {
  const { debt } = input
  requireText(debt.debtId, 'debtId')
  requireText(debt.originLessonId, 'originLessonId')
  requireText(debt.claimToCheck, 'claimToCheck')
  requireText(debt.domain, 'domain')
  requireText(debt.requiredOpportunity, 'requiredOpportunity')
  requireText(input.currentLessonId, 'currentLessonId')
  requireText(input.resultBoundary, 'resultBoundary')

  const evidenceRefs = [...new Set(input.evidenceRefs ?? [])]

  if (input.opportunityAssessment === 'NOT_OCCURRED') {
    if (input.resolution !== 'NOT_TESTED') {
      throw new Error('NOT_OCCURRED opportunity must resolve as NOT_TESTED.')
    }
    if (input.successorDebt) {
      throw new Error('A NOT_TESTED debt remains open; do not create a successor as if the old question was tested.')
    }

    return {
      debtId: debt.debtId,
      originLessonId: debt.originLessonId,
      currentLessonId: input.currentLessonId,
      claimToCheck: debt.claimToCheck,
      domain: debt.domain,
      statusBeforeLesson: 'OPEN',
      opportunityAssessment: input.opportunityAssessment,
      evidenceRefs,
      resolution: input.resolution,
      resultBoundary: input.resultBoundary,
      statusAfterLesson: 'OPEN',
      successorDebtId: null,
    }
  }

  if (input.opportunityAssessment === 'AMBIGUOUS') {
    if (input.resolution !== 'TESTED_UNRESOLVED') {
      throw new Error('AMBIGUOUS opportunity must resolve as TESTED_UNRESOLVED.')
    }

    return {
      debtId: debt.debtId,
      originLessonId: debt.originLessonId,
      currentLessonId: input.currentLessonId,
      claimToCheck: debt.claimToCheck,
      domain: debt.domain,
      statusBeforeLesson: 'OPEN',
      opportunityAssessment: input.opportunityAssessment,
      evidenceRefs,
      resolution: input.resolution,
      resultBoundary: input.resultBoundary,
      statusAfterLesson: 'OPEN',
      successorDebtId: null,
    }
  }

  if (input.resolution === 'NOT_TESTED') {
    throw new Error('An OCCURRED opportunity cannot resolve as NOT_TESTED.')
  }

  if (evidenceRefs.length === 0 && !input.sourceQualityFailure?.trim()) {
    throw new Error('An OCCURRED opportunity requires evidenceRefs or an explicit sourceQualityFailure.')
  }

  if (input.successorDebt) {
    if (input.successorDebt.parentDebtId !== debt.debtId) {
      throw new Error('successorDebt.parentDebtId must reference the reconciled debt.')
    }
    if (input.successorDebt.debtId === debt.debtId) {
      throw new Error('A successor debt must have a new debtId.')
    }
    if (
      input.resolution !== 'TESTED_PARTIAL' &&
      input.resolution !== 'TESTED_CONFIRMED' &&
      input.resolution !== 'TESTED_CONTRADICTED' &&
      input.resolution !== 'SUPERSEDED'
    ) {
      throw new Error('A successor debt may only follow a resolved/superseded tested question.')
    }
  }

  let statusAfterLesson: ObservationDebtStatus
  if (input.resolution === 'TESTED_UNRESOLVED') statusAfterLesson = 'OPEN'
  else if (input.resolution === 'SUPERSEDED') statusAfterLesson = 'SUPERSEDED'
  else statusAfterLesson = 'CLOSED'

  if (statusAfterLesson === 'OPEN' && input.successorDebt) {
    throw new Error('Do not create a successor while the original debt remains open.')
  }

  return {
    debtId: debt.debtId,
    originLessonId: debt.originLessonId,
    currentLessonId: input.currentLessonId,
    claimToCheck: debt.claimToCheck,
    domain: debt.domain,
    statusBeforeLesson: 'OPEN',
    opportunityAssessment: input.opportunityAssessment,
    evidenceRefs,
    resolution: input.resolution,
    resultBoundary: input.resultBoundary,
    statusAfterLesson,
    successorDebtId: input.successorDebt?.debtId ?? null,
  }
}

export function reconcileObservationDebtsForLesson(input: {
  debtsAtLessonStart: ObservationDebt[]
  reconciliationInputs: ObservationDebtReconciliationInput[]
}): ObservationDebtReconciliation[] {
  const debtIds = new Set(input.debtsAtLessonStart.map((debt) => debt.debtId))
  if (debtIds.size !== input.debtsAtLessonStart.length) {
    throw new Error('Duplicate debtId at lesson start.')
  }

  const byDebtId = new Map<string, ObservationDebtReconciliationInput[]>()
  for (const item of input.reconciliationInputs) {
    if (!debtIds.has(item.debt.debtId)) {
      throw new Error(`Reconciliation supplied for unknown debt ${item.debt.debtId}.`)
    }
    const existing = byDebtId.get(item.debt.debtId) ?? []
    existing.push(item)
    byDebtId.set(item.debt.debtId, existing)
  }

  const results: ObservationDebtReconciliation[] = []
  for (const debt of input.debtsAtLessonStart) {
    const matches = byDebtId.get(debt.debtId) ?? []
    if (matches.length !== 1) {
      throw new Error(
        `Debt ${debt.debtId} must have exactly one reconciliation record; found ${matches.length}.`,
      )
    }
    results.push(reconcileObservationDebt(matches[0]))
  }

  return results
}
