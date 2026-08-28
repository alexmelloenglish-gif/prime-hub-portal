import type {
  ClassReportOutput,
  GenerationProvenance,
  PromptOneOutput,
} from './contracts'

export class QualityGateRejectedError extends Error {
  readonly code = 'QUALITY_GATE_NOT_PROVEN'
  readonly assessment: QualityGateAssessment

  constructor(assessment: QualityGateAssessment) {
    super(qualityGateErrorMessage(assessment))
    this.name = 'QualityGateRejectedError'
    this.assessment = assessment
  }
}

export type QualityGateAssessment = {
  allowed: boolean
  cognitiveStatus: 'proven' | 'not_proven'
  reasons: string[]
  candidateCount: number
  substantiveCandidateCount: number
  persistedEvidenceCount: number
}

const PLACEHOLDER_PATTERNS = [
  /class report pending authorized source records/i,
  /teacher insight is pending authorized publication/i,
  /published learning impact will appear here/i,
]

function hasText(value: unknown, minimum = 1): value is string {
  return typeof value === 'string' && value.trim().length >= minimum
}

function isValidGeminiProvenance(provenance: GenerationProvenance | undefined): boolean {
  if (!provenance) return false
  if (provenance.provider !== 'gemini') return false
  if (!hasText(provenance.model)) return false
  if (!hasText(provenance.requestId)) return false
  if (!hasText(provenance.promptVersion)) return false
  if (!hasText(provenance.startedAt) || !hasText(provenance.completedAt)) return false
  if (!hasText(provenance.artifactId)) return false
  if (typeof provenance.responseStatus !== 'number' || provenance.responseStatus < 200 || provenance.responseStatus >= 300) return false
  return provenance.validationStatus === 'valid'
}

export function evaluatePromptOneGate(input: {
  promptOne: PromptOneOutput
  persistedEvidenceCount: number
}): QualityGateAssessment {
  const { promptOne, persistedEvidenceCount } = input
  const candidates = Array.isArray(promptOne.evidence_candidates) ? promptOne.evidence_candidates : []
  const transcriptId = promptOne.lesson_input?.transcript_id
  const substantive = candidates.filter((candidate) =>
    hasText(candidate.content, 12) &&
    hasText(candidate.source_span, 3) &&
    hasText(candidate.source_transcript_id) &&
    (!transcriptId || candidate.source_transcript_id === transcriptId) &&
    hasText(candidate.provenance?.origin) &&
    hasText(candidate.provenance?.source_reference)
  )
  const reasons: string[] = []

  if (!isValidGeminiProvenance(promptOne.generationProvenance)) reasons.push('Gemini provenance is missing or invalid.')
  if (!candidates.length) reasons.push('Prompt 1 produced zero evidence candidates.')
  if (substantive.length === 0) reasons.push('Prompt 1 has no substantive traceable evidence candidate.')
  if (persistedEvidenceCount < substantive.length) reasons.push('Persisted evidence count is lower than substantive candidate count.')

  const allowed = reasons.length === 0
  return {
    allowed,
    cognitiveStatus: allowed ? 'proven' : 'not_proven',
    reasons,
    candidateCount: candidates.length,
    substantiveCandidateCount: substantive.length,
    persistedEvidenceCount,
  }
}

export function evaluateClassReportGate(input: {
  report: ClassReportOutput
  promptOneGate: QualityGateAssessment
}): QualityGateAssessment {
  const { report, promptOneGate } = input
  const reasons = [...promptOneGate.reasons]
  const summary = report.summary || ''
  const markdown = report.markdown || ''
  const hasPlaceholder = PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(summary) || pattern.test(markdown))
  const hasSubstantiveReport =
    hasText(summary, 20) &&
    Array.isArray(report.evidenceHighlights) && report.evidenceHighlights.some((item) => hasText(item, 12)) &&
    Array.isArray(report.sourceEvidenceIds) && report.sourceEvidenceIds.length > 0

  if (hasPlaceholder) reasons.push('Class Report contains a known placeholder.')
  if (!hasSubstantiveReport) reasons.push('Class Report lacks substantive persisted evidence content.')
  if (report.generationStatus !== 'gemini_generated') reasons.push('Class Report generation status is not gemini_generated.')
  if (!isValidGeminiProvenance(report.generationProvenance)) reasons.push('Class Report Gemini provenance is missing or invalid.')

  const allowed = reasons.length === 0
  return {
    allowed,
    cognitiveStatus: allowed ? 'proven' : 'not_proven',
    reasons,
    candidateCount: promptOneGate.candidateCount,
    substantiveCandidateCount: promptOneGate.substantiveCandidateCount,
    persistedEvidenceCount: promptOneGate.persistedEvidenceCount,
  }
}

export function qualityGateErrorMessage(assessment: QualityGateAssessment): string {
  return assessment.reasons.join(' ')
}
