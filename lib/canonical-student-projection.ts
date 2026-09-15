export const CANONICAL_STUDENT_PROJECTION_VERSION = 'student-dashboard-v1.0'

export type TemporalLayer = 'NOW' | 'RECENT' | 'MEMORY'
export type ProjectionStatus = 'teacher-validated' | 'portfolio-confirmed' | 'qualified' | 'not-available'

export type CanonicalAction = {
  id: string
  title: string
  description: string
  evidence: string
  authorizationStatus: ProjectionStatus
  destination: string | null
  outcome: unknown | null
}

export type CanonicalLesson = {
  lessonId: string
  studentId: string
  lessonDate: string
  temporalLayer: TemporalLayer
  status?: string
  sourceType?: string
  sourceDocumentId?: string
}

export type CanonicalStudentRecord = {
  studentId: string
  studentName: string
  studentEmail: string
  profileAsset?: string | null
  currentLevel?: string | null
  targetLevel?: string | null
  canonicalProjection?: Record<string, unknown>
  attendanceOverview?: Array<Record<string, unknown>>
  classReports?: Array<Record<string, unknown>>
  lessonRecords?: CanonicalLesson[]
}

export type LearningIntelligenceThread = {
  lessonId: string
  date: string
  title: string
  evidence: string
  signal: string
  insight: string
  boundary: string
  nextVerification: string
  status: ProjectionStatus
}

export type CanonicalStudentProjection = {
  version: typeof CANONICAL_STUDENT_PROJECTION_VERSION
  studentId: string
  studentName: string
  studentEmail: string
  profileAsset: string | null
  currentState: Record<string, unknown>
  whatChanged: Record<string, unknown> | null
  priorities: Array<Record<string, unknown>>
  nextAction: CanonicalAction | null
  schedule: Record<string, unknown>
  learningIntelligence: LearningIntelligenceThread[]
  recentLessons: CanonicalLesson[]
  memoryLessons: CanonicalLesson[]
  lessonIds: string[]
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function uniqueById<T extends { lessonId: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (!item.lessonId || seen.has(item.lessonId)) return false
    seen.add(item.lessonId)
    return true
  })
}

function parseTransferPoints(value: string) {
  if (!value.startsWith('Transfer points —')) return {}
  const body = value.slice('Transfer points —'.length).trim()
  const segments = body
    .split(/(?=(?:Evidence|Boundary|Interpretation|Next verification):)/)
    .map((segment) => segment.trim())
    .filter(Boolean)
  const result: Record<string, string> = {}
  for (const segment of segments) {
    const match = segment.match(/^(Evidence|Boundary|Interpretation|Next verification):\s*(.*)$/s)
    if (match) result[match[1]] = match[2].trim()
  }
  return result
}

function buildLearningIntelligence(
  reports: Array<Record<string, unknown>>,
  priorities: Array<Record<string, unknown>>,
): LearningIntelligenceThread[] {
  return reports
    .map((report): LearningIntelligenceThread => {
      const lessonId = stringValue(report.lessonId) || stringValue(report.id)
      const date = stringValue(report.date)
      const title = stringValue(report.title, 'Class report')
      const teacherInsight = stringValue(report.teacherInsight)
      const transfer = parseTransferPoints(teacherInsight)
      const reportFocus = Array.isArray(report.focus)
        ? report.focus.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).join(', ')
        : ''
      const matchingPriority = priorities.find((priority) => {
        const evidence = stringValue(priority.evidence).toLowerCase()
        return date && evidence.includes(date.toLowerCase().replace(/\s+/g, ' '))
      })
      const signal = matchingPriority
        ? stringValue(matchingPriority.why)
        : reportFocus
          ? `Current learning signal: ${reportFocus}.`
          : 'No separate learning signal was published for this lesson.'
      return {
        lessonId,
        date,
        title,
        evidence: transfer.Evidence || stringValue(report.summary),
        signal,
        insight: transfer.Interpretation || stringValue(report.teacherInsight),
        boundary: transfer.Boundary || 'No additional boundary statement was published.',
        nextVerification: transfer['Next verification'] || 'No next verification statement was published.',
        status: teacherInsight ? 'portfolio-confirmed' : 'not-available',
      }
    })
    .filter((item) => item.lessonId && (item.evidence || item.insight))
}

/**
 * Pure projection function.
 * Same authorized record + same projection version => same semantic projection.
 * No student identity is referenced here.
 */
export function buildCanonicalStudentProjection(
  record: CanonicalStudentRecord,
  options: { recentLessonLimit?: number } = {}
): CanonicalStudentProjection {
  const projection = objectValue(record.canonicalProjection)
  const currentState = objectValue(projection?.currentState) ?? {}
  const changed = objectValue(projection?.whatChanged)
  const schedule = objectValue(projection?.schedule) ?? {}
  const priorities = Array.isArray(projection?.priorities)
    ? projection.priorities.map(objectValue).filter((v): v is Record<string, unknown> => Boolean(v))
    : []
  const learningIntelligence = buildLearningIntelligence(record.classReports ?? [], priorities)

  const actionObject = objectValue(projection?.nextAction)
  const authorization = stringValue(actionObject?.authorizationStatus) || stringValue(actionObject?.status) || 'qualified'
  const rawActionEvidence = stringValue(actionObject?.evidence)
  const latestLearning = learningIntelligence[0]
  const actionEvidence = rawActionEvidence || latestLearning
    ? [
        rawActionEvidence,
        latestLearning ? `Evidence: ${latestLearning.evidence}` : '',
        latestLearning ? `Signal: ${latestLearning.signal}` : '',
        latestLearning ? `Insight: ${latestLearning.insight}` : '',
        latestLearning ? `Boundary: ${latestLearning.boundary}` : '',
        latestLearning ? `Next verification: ${latestLearning.nextVerification}` : '',
      ].filter(Boolean).join('\n')
    : ''
  const nextAction: CanonicalAction | null = actionObject && stringValue(actionObject.title)
    ? {
        id: stringValue(actionObject.id) || `action-${record.studentId}-1`,
        title: stringValue(actionObject.title),
        description: stringValue(actionObject.description),
        evidence: actionEvidence,
        authorizationStatus: authorization as ProjectionStatus,
        destination: stringValue(actionObject.destination) || null,
        outcome: actionObject.outcome ?? null,
      }
    : null

  const sourceLessons = uniqueById(
    (record.lessonRecords ?? []).map((lesson) => ({
      ...lesson,
      temporalLayer: lesson.temporalLayer ?? 'MEMORY',
    }))
  )

  const recentLimit = Math.max(0, options.recentLessonLimit ?? 3)
  const recentLessons = sourceLessons
    .filter((lesson) => lesson.temporalLayer === 'RECENT')
    .sort((a, b) => b.lessonDate.localeCompare(a.lessonDate))
    .slice(0, recentLimit)
  const memoryLessons = sourceLessons
    .filter((lesson) => lesson.temporalLayer === 'MEMORY')
    .sort((a, b) => b.lessonDate.localeCompare(a.lessonDate))

  return {
    version: CANONICAL_STUDENT_PROJECTION_VERSION,
    studentId: record.studentId,
    studentName: record.studentName,
    studentEmail: record.studentEmail,
    profileAsset: record.profileAsset ?? null,
    currentState,
    whatChanged: changed,
    priorities,
    nextAction,
    schedule,
    learningIntelligence,
    recentLessons,
    memoryLessons,
    lessonIds: sourceLessons.map((lesson) => lesson.lessonId),
  }
}

/** Canonical lesson identity: one lesson may have many derived projections, never many lesson identities. */
export function canonicalLessonId(value: unknown): string | null {
  const entry = objectValue(value)
  const id = stringValue(entry?.canonicalLessonId) || stringValue(entry?.lessonId)
  return id || null
}
