import type { ClassReportEntry, TeacherFeedbackEntry, VocabularyEntry } from '@/lib/student-data'

export const DASHBOARD_DISPLAY_BUDGET = {
  priorities: 3,
  recentLessons: 3,
  recentReports: 3,
  reportFocusItems: 3,
  reportVocabularyItems: 5,
  progressItems: 4,
  activeVocabularyItems: 5,
  grammarItems: 3,
  teacherFeedbackItems: 1,
} as const

function normalizeTerm(value: string) {
  return value.trim().toLocaleLowerCase('en-US')
}

function reportTimestamp(report: ClassReportEntry) {
  const parsed = Date.parse(report.date)
  return Number.isFinite(parsed) ? parsed : 0
}

export function selectRecentReports(reports: ClassReportEntry[]) {
  return [...reports]
    .filter((report) => report.status === 'published' || report.contentStatus === 'published')
    .sort((a, b) => reportTimestamp(b) - reportTimestamp(a))
    .slice(0, DASHBOARD_DISPLAY_BUDGET.recentReports)
}

/**
 * Canonical v1 vocabulary-review selection.
 *
 * The cumulative bank remains longitudinal memory. The dashboard exposes only
 * a small review set. We prefer vocabulary already present in the most recent
 * published class report, then fill any remaining slots with the newest
 * authorized bank entries. This keeps the rule deterministic and evidence-led
 * while the teacher/pipeline curation layer evolves.
 */
export function selectActiveVocabulary(
  vocabularyBank: VocabularyEntry[],
  classReports: ClassReportEntry[]
): VocabularyEntry[] {
  if (!vocabularyBank.length) return []

  const byTerm = new Map(
    vocabularyBank.map((item) => [normalizeTerm(item.term), item] as const)
  )
  const selected: VocabularyEntry[] = []
  const seen = new Set<string>()
  const latestReport = selectRecentReports(classReports)[0]

  for (const term of latestReport?.vocabulary ?? []) {
    const key = normalizeTerm(term)
    const match = byTerm.get(key)
    if (!match || seen.has(key)) continue
    selected.push(match)
    seen.add(key)
    if (selected.length >= DASHBOARD_DISPLAY_BUDGET.activeVocabularyItems) {
      return selected
    }
  }

  for (const item of [...vocabularyBank].reverse()) {
    const key = normalizeTerm(item.term)
    if (seen.has(key)) continue
    selected.push(item)
    seen.add(key)
    if (selected.length >= DASHBOARD_DISPLAY_BUDGET.activeVocabularyItems) break
  }

  return selected
}

export function selectCurrentFeedback(feedback: TeacherFeedbackEntry[]) {
  return feedback.slice(-DASHBOARD_DISPLAY_BUDGET.teacherFeedbackItems)
}
