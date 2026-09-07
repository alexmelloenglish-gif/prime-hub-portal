import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import Module, { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

// Exercise the actual document parser and projection without network services.
const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const modules = new Map()
function load(relative) {
  const filename = path.join(root, relative)
  if (modules.has(filename)) return modules.get(filename).exports
  const mod = new Module(filename)
  mod.filename = filename
  mod.require = (name) => {
    if (name === 'react') return { cache: (fn) => fn }
    if (name === '@/lib/firebase-admin') return { isFirebaseConfigured: false }
    if (name === '@/lib/prisma') return { getPrismaClient() { throw new Error('Unexpected database access in pure projection test') } }
    if (name.startsWith('@/')) {
      if (name.endsWith('.json')) return JSON.parse(fs.readFileSync(path.join(root, name.slice(2)), 'utf8'))
      return load(`${name.slice(2)}.ts`)
    }
    return require(name)
  }
  modules.set(filename, mod)
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename)
  return mod.exports
}
const { parseStudentDocument } = load('lib/student-data.ts')
const { buildDashboardProjection, reconcileAttendanceForProjection, reconcileClassReportsForProjection } = load('lib/canonical-dashboard.ts')
const source = JSON.parse(fs.readFileSync(path.join(root, 'data/students/italo-pires-gmail-com.firestore.json'), 'utf8'))
const before = JSON.stringify(source)
const student = parseStudentDocument(source, source.studentEmail)
const projection = buildDashboardProjection(student)
assert.equal(projection.currentState.level.value, 'CEFR A2')
assert.equal(projection.currentState.targetLevel.value, 'CEFR B1')
assert.equal(projection.currentState.level.status, 'teacher-validated')
assert.equal(projection.currentState.targetLevel.status, 'teacher-validated')
assert.equal(projection.whatChanged.changeType, 'learner-model')
assert.deepEqual(projection.priorities, source.canonicalProjection.priorities)
assert.equal(projection.nextAction.id, source.canonicalProjection.nextAction.id)
assert.equal(projection.nextAction.authorizationStatus, 'teacher-validated')
assert.equal(projection.nextAction.destination, '#next-action')
assert.equal(projection.nextAction.outcome, null)
assert.equal(projection.recentLessons.length, 1)
assert.equal(projection.recentLessons[0].lessonId, 'italo-2026-08-18')
assert.equal(projection.recentLessons[0].lessonDate, '2026-08-18')
assert.equal(projection.recentLessons[0].sourceDocumentId, source.lessonRecords[0].sourceDocumentId)
assert.equal(projection.memoryLessons.length, 0)
assert.equal(projection.profileAsset, '/assets/italo-profile.svg')
assert.equal(reconcileAttendanceForProjection(student).length, 1)
assert.equal(reconcileClassReportsForProjection(student.classReports).length, 1)
assert.equal(student.classReports[0].lessonId, 'italo-2026-08-18')
assert.equal(JSON.stringify(source), before, 'Projection must not mutate the source')

// Duplicate derived entries with different UI IDs still represent one lesson.
assert.equal(reconcileAttendanceForProjection({ ...student, attendanceOverview: [...student.attendanceOverview, { ...student.attendanceOverview[0], id: 'duplicate-derived-view' }] }).length, 1)
assert.equal(reconcileClassReportsForProjection([...student.classReports, { ...student.classReports[0], id: 'duplicate-derived-report' }]).length, 1)
const fallback = buildDashboardProjection({ ...student, lessonRecords: [] })
assert.equal(fallback.recentLessons[0].lessonId, 'italo-2026-08-18')
const memory = buildDashboardProjection({ ...student, lessonRecords: [{ ...student.lessonRecords[0], temporalLayer: 'MEMORY' }] })
assert.equal(memory.recentLessons.length, 0)
assert.equal(memory.memoryLessons.length, 1)

// Run the same mechanism for every authorized repository profile.
let profiles = 0
for (const filename of fs.readdirSync(path.join(root, 'data/students')).filter(name => name.endsWith('.firestore.json'))) {
  const raw = JSON.parse(fs.readFileSync(path.join(root, 'data/students', filename), 'utf8'))
  const parsed = parseStudentDocument(raw, raw.studentEmail)
  const result = buildDashboardProjection(parsed)
  assert.equal(result.studentEmail, raw.studentEmail)
  assert.equal(new Set(result.lessonIds).size, result.lessonIds.length)
  profiles++
}
console.log(`Canonical document -> dashboard projection: PASS (${profiles} student profiles; identity, action metadata, deduplication and temporal boundaries)`)
