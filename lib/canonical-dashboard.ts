import profileAssetRegistry from '@/data/students/student-profile-assets.json'
import {
  buildCanonicalStudentProjection,
  canonicalLessonId,
  type CanonicalLesson,
  type CanonicalStudentProjection,
} from '@/lib/canonical-student-projection'
import type {
  ClassReportEntry,
  StudentDashboardData,
} from '@/lib/student-data'

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function parseDate(value: string) {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

function canonicalRecordKey(value: { id?: unknown; lessonId?: unknown; canonicalLessonId?: unknown; date?: unknown; title?: unknown }) {
  const explicit = canonicalLessonId(value)
  if (explicit) return explicit

  const id = typeof value.id === 'string' ? value.id.trim() : ''
  if (id.startsWith('pipeline-attendance-')) return id.slice('pipeline-attendance-'.length)
  if (id.startsWith('pipeline-')) return id.slice('pipeline-'.length)
  if (id) return id

  const date = normalizeText(value.date)
  const title = normalizeText(value.title)
  return date || title ? `${date}|${title}` : null
}

function dedupeByCanonicalKey<T extends { id?: string; lessonId?: string; canonicalLessonId?: string; date?: string; title?: string }>(items: T[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = canonicalRecordKey(item) ?? `${item.date ?? ''}|${item.title ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function temporalLayerForDate(date: string, latestTimestamp: number | null): CanonicalLesson['temporalLayer'] {
  const timestamp = parseDate(date)
  if (timestamp === null || latestTimestamp === null) return 'RECENT'
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  return latestTimestamp - timestamp <= thirtyDays ? 'RECENT' : 'MEMORY'
}

function buildCanonicalLessons(student: StudentDashboardData): CanonicalLesson[] {
  const attendance = dedupeByCanonicalKey(
    student.attendanceOverview.map((entry) => ({
      ...entry,
      lessonId: entry.id,
      studentId: student.studentId ?? student.studentEmail,
      lessonDate: entry.date,
    }))
  )

  const timestamps = attendance
    .map((entry) => parseDate(entry.date ?? ''))
    .filter((value): value is number => value !== null)
  const latestTimestamp = timestamps.length ? Math.max(...timestamps) : null

  return attendance.map((entry) => ({
    lessonId: canonicalRecordKey({ id: entry.id, lessonId: entry.lessonId }) ?? `${student.studentId ?? student.studentEmail}-lesson`,
    studentId: student.studentId ?? student.studentEmail,
    lessonDate: entry.date ?? '',
    temporalLayer: temporalLayerForDate(entry.date ?? '', latestTimestamp),
    status: entry.status,
    sourceType: entry.id?.startsWith('pipeline-') ? 'pipeline' : 'authorized-record',
    sourceDocumentId: entry.id,
  }))
}

export function resolveStudentProfileAsset(studentId: string | undefined, fallbackImage?: string | null) {
  if (!studentId) return fallbackImage ?? null
  const registry = profileAssetRegistry.students as Record<string, { asset?: string }>
  return registry[studentId]?.asset ?? fallbackImage ?? null
}

export function buildDashboardProjection(student: StudentDashboardData): CanonicalStudentProjection {
  return buildCanonicalStudentProjection({
    studentId: student.studentId ?? student.studentEmail,
    studentName: student.studentName,
    studentEmail: student.studentEmail,
    profileAsset: resolveStudentProfileAsset(student.studentId),
    currentLevel: student.currentLevel,
    targetLevel: student.targetLevel,
    canonicalProjection: student.canonicalProjection as unknown as Record<string, unknown>,
    attendanceOverview: student.attendanceOverview as unknown as Array<Record<string, unknown>>,
    classReports: student.classReports as unknown as Array<Record<string, unknown>>,
    lessonRecords: buildCanonicalLessons(student),
  })
}

export function reconcileAttendanceForProjection(student: StudentDashboardData) {
  const canonical = buildDashboardProjection(student)
  const recentIds = new Set(canonical.recentLessons.map((lesson) => lesson.lessonId))
  const memoryIds = new Set(canonical.memoryLessons.map((lesson) => lesson.lessonId))
  const allowedIds = new Set([...recentIds, ...memoryIds])

  return student.attendanceOverview.filter((entry) => allowedIds.has(canonicalRecordKey(entry) ?? entry.id))
}

export function reconcileClassReportsForProjection(reports: ClassReportEntry[]) {
  return dedupeByCanonicalKey(reports)
}
