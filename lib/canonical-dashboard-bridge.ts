import type {
  StudentDashboardData,
  StudentDashboardProjection,
  VocabularyEntry,
  TeacherFeedbackEntry,
} from '@/lib/student-data'

export type VerifiedCanonicalLearningIntelligenceRow = {
  canonicalRecordId: string
  lessonId?: string | null
  scopeType?: string | null
  projection: unknown
  createdAt?: Date | string | null
  verifiedAt?: Date | string | null
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : []
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'priority'
}

function evidenceSummary(projection: Record<string, unknown>) {
  const evidence = Array.isArray(projection.validatedEvidence)
    ? projection.validatedEvidence
        .map(asObject)
        .map((item) => text(item?.statement))
        .filter(Boolean)
    : []
  return evidence.slice(0, 2).join(' ')
}

function splitAction(value: string) {
  const parts = value.split(' — ').map((part) => part.trim()).filter(Boolean)
  return {
    title: parts[0] || value,
    description: parts.length > 1 ? parts.slice(1).join(' — ') : value,
  }
}

function appendVocabulary(
  current: VocabularyEntry[],
  projection: Record<string, unknown>,
  canonicalRecordId: string,
) {
  const next = [...current]
  const values = Array.isArray(projection.vocabulary) ? projection.vocabulary : []
  for (const [index, value] of values.entries()) {
    const entry = asObject(value)
    const term = text(entry?.term)
    if (!term || next.some((item) => item.term.toLowerCase() === term.toLowerCase())) continue
    next.push({
      id: `canonical-${canonicalRecordId}-vocabulary-${index + 1}`,
      term,
      meaning: text(entry?.meaning) || 'Recorded in the teacher-authorized learning record.',
      example: 'Reuse this item in a future lesson or real-life context.',
    })
  }
  return next
}

function appendGrammar(
  current: string[],
  projection: Record<string, unknown>,
) {
  const next = [...current]
  const values = Array.isArray(projection.grammarCorrections) ? projection.grammarCorrections : []
  for (const value of values) {
    const entry = asObject(value)
    const item = text(entry?.item)
    const correction = text(entry?.correction)
    if (!item) continue
    const rendered = correction ? `${item} → ${correction}` : item
    if (!next.some((existing) => existing.toLowerCase() === rendered.toLowerCase())) next.push(rendered)
  }
  return next
}

function appendTeacherInsight(
  current: TeacherFeedbackEntry[],
  projection: Record<string, unknown>,
  canonicalRecordId: string,
) {
  const insight = asObject(projection.teacherInsight)
  const statement = text(insight?.statement)
  if (!statement) return current
  const id = `canonical-feedback-${canonicalRecordId}`
  if (current.some((item) => item.id === id)) return current
  return [
    ...current,
    {
      id,
      title: 'Teacher-authorized learning insight',
      body: statement,
    },
  ]
}

export function mergeCanonicalLearningIntelligenceRows(
  student: StudentDashboardData,
  rows: VerifiedCanonicalLearningIntelligenceRow[],
): StudentDashboardData {
  if (!rows.length) return student

  let currentLevel = student.currentLevel
  let targetLevel = student.targetLevel
  let focus = student.focus
  let vocabularyBank = [...student.vocabularyBank]
  let grammarFocus = [...student.grammarOverview.focusPoints]
  let teacherFeedback = [...student.teacherFeedback]
  const canonicalProjection: StudentDashboardProjection = {
    ...student.canonicalProjection,
    currentState: { ...student.canonicalProjection.currentState },
    priorities: [...student.canonicalProjection.priorities],
    nextAction: student.canonicalProjection.nextAction
      ? { ...student.canonicalProjection.nextAction }
      : null,
  }

  for (const row of rows) {
    const projection = asObject(row.projection)
    if (!projection) continue

    const evidence = evidenceSummary(projection)
    const state = asObject(projection.currentState)
    const stateLevel = text(state?.level)
    const stateTargetLevel = text(state?.targetLevel)
    const stateFocus = text(state?.learningFocus)

    if (stateLevel) {
      currentLevel = stateLevel
      canonicalProjection.currentState.level = {
        value: stateLevel,
        qualifier: 'Teacher-authorized canonical learning record.',
        status: 'teacher-validated',
      }
    }
    if (stateTargetLevel) {
      targetLevel = stateTargetLevel
      canonicalProjection.currentState.targetLevel = {
        value: stateTargetLevel,
        qualifier: 'Teacher-authorized canonical learning record.',
        status: 'teacher-validated',
      }
    }
    if (stateFocus) {
      focus = stateFocus
      canonicalProjection.currentState.focus = {
        value: stateFocus,
        qualifier: 'Current focus from the teacher-authorized canonical learning record.',
        status: 'teacher-validated',
      }
    }

    const priorityChange = asObject(projection.priorities)
    const priorities = stringArray(priorityChange?.priorities)
    if (priorities.length) {
      canonicalProjection.priorities = priorities.map((title, index) => ({
        id: `canonical-${row.canonicalRecordId}-priority-${index + 1}-${slug(title)}`,
        title,
        why: 'Current teacher-authorized learning priority.',
        evidence: evidence || 'Teacher-authorized canonical learning record.',
        status: 'teacher-validated',
      }))
    }

    const nextAction = asObject(projection.nextAction)
    const actionText = text(nextAction?.text)
    if (actionText) {
      const action = splitAction(actionText)
      canonicalProjection.nextAction = {
        id: `canonical-next-action-${row.canonicalRecordId}`,
        authorizationStatus: 'teacher-validated',
        destination: null,
        outcome: null,
        title: action.title,
        description: action.description,
        evidence: evidence || 'Teacher-authorized canonical learning record.',
        status: 'teacher-validated',
      }
    }

    const insight = asObject(projection.teacherInsight)
    const insightText = text(insight?.statement)
    if (priorities.length || stateFocus) {
      canonicalProjection.whatChanged = {
        title: priorities.length ? 'Your current learning priorities were updated' : 'Your current learning focus was updated',
        summary: stateFocus || insightText || priorities[0],
        changeType: priorities.length ? 'learning-priority' : 'learner-model',
        evidence: evidence || 'Teacher-authorized canonical learning record.',
        status: 'teacher-validated',
      }
    }

    vocabularyBank = appendVocabulary(vocabularyBank, projection, row.canonicalRecordId)
    grammarFocus = appendGrammar(grammarFocus, projection)
    teacherFeedback = appendTeacherInsight(teacherFeedback, projection, row.canonicalRecordId)
  }

  return {
    ...student,
    currentLevel,
    targetLevel,
    focus,
    canonicalProjection,
    vocabularyBank,
    grammarOverview: {
      ...student.grammarOverview,
      focusPoints: grammarFocus,
    },
    teacherFeedback,
  }
}
