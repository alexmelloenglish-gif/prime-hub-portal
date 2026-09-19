import type {
  LearningNarrativeDraft,
  NarrativeEvidence,
  NarrativeInput,
  NarrativeValidation,
} from './contracts'

const LEADING_STATUS_PATTERNS = [
  /^unchanged\b/i,
  /^no progress\b/i,
  /^not mastered\b/i,
  /^failed retrieval\b/i,
  /^support-dependent\b/i,
  /^weak area\b/i,
]

function chronologicalEvidence(input: NarrativeInput): NarrativeEvidence[] {
  return [...input.evidence]
    .filter((item) => item.authorization === 'teacher_validated' || item.authorization === 'canonical')
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
}

export function prepareNarrativeInput(input: NarrativeInput): NarrativeInput {
  const evidence = chronologicalEvidence(input)
  const allowedIds = new Set(evidence.map((item) => item.evidenceId))
  return {
    ...input,
    evidence,
    priorLessons: input.priorLessons.map((lesson) => ({
      ...lesson,
      evidenceIds: lesson.evidenceIds.filter((id) => allowedIds.has(id)),
    })),
    currentLesson: {
      ...input.currentLesson,
      evidenceIds: input.currentLesson.evidenceIds.filter((id) => allowedIds.has(id)),
    },
  }
}

export function validateNarrativeDraft(
  draft: LearningNarrativeDraft,
  input: NarrativeInput,
): NarrativeValidation {
  const evidenceById = new Map(input.evidence.map((item) => [item.evidenceId, item]))
  const errors: string[] = []
  const warnings: string[] = []
  const referenced = new Set<string>()

  if (draft.schemaVersion !== 'learning-narrative.v1') errors.push('Unsupported narrative schema version.')
  if (draft.currentLessonId !== input.currentLesson.lessonId) errors.push('Narrative current lesson does not match input.')
  if (draft.narrativeStatus !== 'draft') errors.push('Narrative must remain a draft until teacher review.')
  if (draft.authorityStatus !== 'non_authoritative') errors.push('Narrative must remain non-authoritative until teacher review.')
  if (draft.requiresTeacherReview !== true) errors.push('Narrative must require teacher review.')
  if (!draft.segments.length) errors.push('Narrative contains no evidence-linked segments.')

  for (const segment of draft.segments) {
    if (!segment.evidenceIds.length) {
      errors.push(\`Segment \${segment.segmentId} has no evidence references.\`)
      continue
    }
    for (const id of segment.evidenceIds) {
      referenced.add(id)
      if (!evidenceById.has(id)) errors.push(\`Segment \${segment.segmentId} references unknown evidence \${id}.\`)
    }
    if (!segment.text.trim()) errors.push(\`Segment \${segment.segmentId} is empty.\`)
    if (LEADING_STATUS_PATTERNS.some((pattern) => pattern.test(segment.text.trim()))) {
      warnings.push(\`Segment \${segment.segmentId} begins with status language; prefer the event/context itself.\`)
    }
  }

  const narrativeEvidenceIds = new Set(draft.sourceEvidenceIds)
  for (const id of narrativeEvidenceIds) {
    if (!evidenceById.has(id)) errors.push(\`Narrative sourceEvidenceIds contains unknown evidence \${id}.\`)
  }

  for (const id of referenced) {
    if (!narrativeEvidenceIds.has(id)) errors.push(\`Evidence \${id} is used by a segment but missing from sourceEvidenceIds.\`)
  }

  if (!draft.narrativeText.trim()) errors.push('Narrative text is empty.')
  if (draft.narrativeText.length > 6000) warnings.push('Narrative is long; review for factual compression without loss of chronology.')

  const contentEvidence = input.evidence.filter((item) => item.domain === 'content' || item.domain === 'mixed')
  if (contentEvidence.length && !draft.boundaryNotes.length) {
    warnings.push('Content-domain evidence is present; record a boundary note separating participation from subject mastery claims.')
  }

  if (input.authorizedNextStep && !draft.nextStepText?.trim()) {
    warnings.push('An authorized next step exists but was not represented in the narrative.')
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    referencedEvidenceIds: [...referenced],
  }
}
