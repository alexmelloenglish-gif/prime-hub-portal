import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

function slug(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function stableStudentId(studentName, studentEmail) {
  const canonical = `${slug(studentName)}|${String(studentEmail || '').trim().toLowerCase()}`
  return `stu_${createHash('sha256').update(canonical).digest('hex').slice(0, 12)}`
}

function stableLessonId(studentId, entryId, date) {
  const source = `${studentId}|${entryId || date || 'lesson'}`
  return `lesson_${createHash('sha256').update(source).digest('hex').slice(0, 16)}`
}

function normalizeProfile(profile) {
  const studentName = profile.studentName || profile.dashboard?.studentName || 'Prime Student'
  const studentEmail = String(profile.studentEmail || profile.dashboard?.studentEmail || '').trim().toLowerCase()
  if (!studentEmail) throw new Error('studentEmail is required to derive a stable studentId')

  const studentId = profile.studentId || stableStudentId(studentName, studentEmail)
  const root = profile.dashboard && typeof profile.dashboard === 'object' ? profile.dashboard : profile
  const attendance = Array.isArray(root.attendanceOverview) ? root.attendanceOverview : []
  const normalizedAttendance = attendance.map((entry) => {
    const legacyId = String(entry.id || '')
    const lessonId = entry.lessonId || stableLessonId(studentId, legacyId, entry.date)
    return {
      ...entry,
      id: legacyId || lessonId,
      lessonId,
      sourceType: entry.sourceType || 'legacy_firestore_attendance',
      authorityStatus: entry.authorityStatus || 'legacy_import',
    }
  })

  const normalizedRoot = {
    ...root,
    studentId,
    identityVersion: root.identityVersion || 'prime-student-id-v1',
    identitySource: root.identitySource || 'canonical_name_email',
    profileStatus: root.profileStatus || 'active',
    attendanceOverview: normalizedAttendance,
  }

  if (profile.dashboard && typeof profile.dashboard === 'object') {
    return {
      ...profile,
      studentId,
      identityVersion: normalizedRoot.identityVersion,
      identitySource: normalizedRoot.identitySource,
      profileStatus: normalizedRoot.profileStatus,
      dashboard: normalizedRoot,
    }
  }

  return normalizedRoot
}

async function main() {
  const [, , inputPath, outputPath = inputPath] = process.argv
  if (!inputPath) throw new Error('Usage: node scripts/normalize-student-identities.mjs <input.json> [output.json]')
  const profile = JSON.parse(await readFile(inputPath, 'utf8'))
  const normalized = normalizeProfile(profile)
  await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify({
    outputPath,
    studentId: normalized.studentId,
    studentEmail: normalized.studentEmail,
    lessonCount: Array.isArray(normalized.attendanceOverview) ? normalized.attendanceOverview.length : 0,
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
