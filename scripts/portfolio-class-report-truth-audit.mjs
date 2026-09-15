import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const dataDir = new URL('../data/students/', import.meta.url)
const registry = JSON.parse(await readFile(new URL('../data/students/student-core-registry.json', import.meta.url), 'utf8'))
const filenames = (await readdir(dataDir)).filter((name) => name.endsWith('.firestore.json')).sort()

const reports = []
const profiles = []

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseTransferPoints(value) {
  const insight = text(value)
  if (!insight.startsWith('Transfer points —')) return null
  const body = insight.slice('Transfer points —'.length).trim()
  const result = {}
  for (const segment of body.split(/(?=(?:Evidence|Signal|Boundary|Interpretation|Next verification):)/).map((v) => v.trim()).filter(Boolean)) {
    const match = segment.match(/^(Evidence|Signal|Boundary|Interpretation|Next verification):\s*(.*)$/s)
    if (match) result[match[1]] = match[2].trim()
  }
  return result
}

for (const filename of filenames) {
  const profile = JSON.parse(await readFile(new URL(`../data/students/${filename}`, import.meta.url), 'utf8'))
  profiles.push({ filename, profile })

  const lessonRecords = Array.isArray(profile.lessonRecords) ? profile.lessonRecords : []
  const lessonIds = new Set(lessonRecords.map((lesson) => text(lesson.lessonId)).filter(Boolean))
  const authoritativeLessons = new Set(
    lessonRecords
      .filter((lesson) => lesson.authorityStatus === 'authoritative_learning_evidence' && lesson.artifactStatus === 'confirmed')
      .map((lesson) => text(lesson.lessonId))
  )

  for (const report of Array.isArray(profile.classReports) ? profile.classReports : []) {
    const lessonId = text(report.lessonId) || text(report.id)
    const transfer = parseTransferPoints(report.teacherInsight)
    const hasSourceLinkage = lessonIds.has(lessonId)
    const sourceIsAuthoritative = authoritativeLessons.has(lessonId)
    const hasStructuredLearningIntelligence = Boolean(transfer?.Evidence && transfer?.Interpretation)

    let status = 'NARRATIVE_ONLY'
    if (!hasSourceLinkage) status = 'ORPHAN_REPORT'
    else if (!sourceIsAuthoritative) status = 'SOURCE_AUTHORITY_NOT_PROVEN'
    else if (hasStructuredLearningIntelligence) status = 'STRUCTURED_AND_SOURCE_BACKED'
    else status = 'SOURCE_BACKED_NARRATIVE'

    reports.push({
      student: profile.studentName,
      studentEmail: profile.studentEmail,
      reportId: text(report.id),
      lessonId,
      date: text(report.date),
      status,
      contentStatus: text(report.contentStatus) || text(report.status),
      hasEvidenceField: Boolean(text(report.evidence)),
      hasTransferPoints: Boolean(transfer),
      hasStructuredEvidence: Boolean(transfer?.Evidence),
      hasStructuredSignal: Boolean(transfer?.Signal),
      hasStructuredInterpretation: Boolean(transfer?.Interpretation),
      sourceLinkage: hasSourceLinkage,
      sourceAuthority: sourceIsAuthoritative,
    })
  }
}

const registryEmails = new Set(registry.students.map((student) => text(student.canonicalEmail).toLowerCase()))
for (const { profile } of profiles) {
  assert.ok(registryEmails.has(text(profile.studentEmail).toLowerCase()), `Profile not present in canonical registry: ${profile.studentEmail}`)
}

const counts = Object.fromEntries([...new Set(reports.map((r) => r.status))].map((status) => [status, reports.filter((r) => r.status === status).length]))
const studentsWithReports = [...new Set(reports.map((r) => r.student))].length

console.log(JSON.stringify({
  audit: 'portfolio-class-report-truth-audit',
  generatedAt: new Date().toISOString(),
  studentsInRegistry: registry.students.length,
  repositoryProfiles: profiles.length,
  studentsWithClassReports: studentsWithReports,
  classReports: reports.length,
  statusCounts: counts,
  reports,
}, null, 2))
