import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const STUDENTS = path.join(ROOT, 'data', 'students')
const REQUIRED_PROJECTION_VERSION = 'student-dashboard-v1.0'
const VALID_LAYERS = new Set(['NOW', 'RECENT', 'MEMORY'])
const VALID_STATUS = new Set(['teacher-validated', 'portfolio-confirmed', 'qualified', 'not-available'])

function fail(message) {
  throw new Error(message)
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null
}

function validateStudent(file) {
  const record = JSON.parse(fs.readFileSync(file, 'utf8'))
  const errors = []
  const id = record.studentId || path.basename(file)
  const projection = asObject(record.canonicalProjection)

  if (!record.studentId) errors.push('missing studentId')
  if (!record.studentEmail) errors.push('missing studentEmail')
  if (!projection) errors.push('missing canonicalProjection')
  if (projection?.version !== REQUIRED_PROJECTION_VERSION) errors.push(`projection version must remain ${REQUIRED_PROJECTION_VERSION}`)

  const current = asObject(projection?.currentState)
  for (const field of ['level', 'targetLevel', 'objective', 'focus']) {
    const entry = asObject(current?.[field])
    if (!entry) errors.push(`currentState.${field} missing`)
    if (entry && !VALID_STATUS.has(entry.status)) errors.push(`currentState.${field}.status invalid`)
  }

  const action = asObject(projection?.nextAction)
  if (action) {
    for (const field of ['id', 'title', 'description', 'evidence']) {
      if (!String(action[field] ?? '').trim()) errors.push(`nextAction.${field} missing`)
    }
    if (action.authorizationStatus && !VALID_STATUS.has(action.authorizationStatus)) {
      errors.push('nextAction.authorizationStatus invalid')
    }
    if (!Object.hasOwn(action, 'destination')) errors.push('nextAction.destination missing')
    if (!Object.hasOwn(action, 'outcome')) errors.push('nextAction.outcome missing')
  }

  const lessons = Array.isArray(record.lessonRecords) ? record.lessonRecords : []
  const lessonIds = new Set()
  for (const lesson of lessons) {
    const lessonId = String(lesson.lessonId ?? lesson.canonicalLessonId ?? '').trim()
    if (!lessonId) errors.push('lesson without canonical lessonId')
    if (lessonIds.has(lessonId)) errors.push(`duplicate lesson identity: ${lessonId}`)
    lessonIds.add(lessonId)
    if (lesson.temporalLayer && !VALID_LAYERS.has(lesson.temporalLayer)) errors.push(`invalid temporalLayer: ${lesson.temporalLayer}`)
  }

  const reports = Array.isArray(record.classReports) ? record.classReports : []
  const reportLessonIds = new Set()
  for (const report of reports) {
    const lessonId = String(report.lessonId ?? '').trim()
    if (lessonId) reportLessonIds.add(lessonId)
  }
  for (const lessonId of reportLessonIds) {
    if (!lessonIds.has(lessonId)) errors.push(`report references unknown lesson identity: ${lessonId}`)
  }

  if (errors.length) fail(`${id}:\n- ${errors.join('\n- ')}`)
  return { id, email: record.studentEmail, lessons: lessons.length, reports: reports.length }
}

const files = fs.readdirSync(STUDENTS)
  .filter((name) => name.endsWith('.firestore.json'))
  .sort()
  .map((name) => path.join(STUDENTS, name))

if (!files.length) fail('No student repository records found.')

const results = files.map(validateStudent)
console.log(JSON.stringify({
  validator: 'Student Dashboard Contract Test',
  projectionVersion: REQUIRED_PROJECTION_VERSION,
  studentsValidated: results.length,
  results,
}, null, 2))
