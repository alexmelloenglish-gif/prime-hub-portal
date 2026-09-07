export const CANONICAL_STUDENT_PROJECTION_VERSION = 'student-dashboard-v1.1'

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
  recentLessons: CanonicalLesson[]
  memoryLessons: CanonicalLesson[]
  lessonIds: string[]
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function uniqueById<T extends { lessonId: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (!item.lessonId || seen.has(item.lessonId)) return false
    seen.add(item.lessonId)
    return true
  })
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

  const actionObject = objectValue(projection?.nextAction)
  const nextAction: CanonicalAction | null = actionObject && stringValue(actionObject.title)
    ? {
        id: stringValue(actionObject.id) || `action-${record.studentId}-1`,
        title: stringValue(actionObject.title),
        description: stringValue(actionObject.description),
        evidence: stringValue(actionObject.evidence),
        authorizationStatus:
          stringValue(actionObject.authorizationStatus) as ProjectionStatus ||
          (stringValue(actionObject.status) as ProjectionStatus || 'qualified'),
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
