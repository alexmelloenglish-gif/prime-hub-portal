import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const [
  statusContract,
  studentPrimitives,
  intelligenceBadge,
  insights,
  students,
  validation,
  progressBadge,
] = await Promise.all([
  readFile('lib/status-color-contract.ts', 'utf8'),
  readFile('components/dashboard/student-dashboard-primitives.tsx', 'utf8'),
  readFile('components/teacher/intelligence-status-badge.tsx', 'utf8'),
  readFile('app/dashboard/admin/intelligence/insights/page.tsx', 'utf8'),
  readFile('app/dashboard/admin/intelligence/students/page.tsx', 'utf8'),
  readFile('app/dashboard/admin/intelligence/validation/page.tsx', 'utf8'),
  readFile('components/dashboard/progress-state-badge.tsx', 'utf8'),
])

const expected = {
  TEACHER_CONFIRMED: 'blue',
  TEACHER_EDITED_CONFIRMED: 'blue',
  TEACHER_NOTE: 'violet',
  SELF_PERCEPTION: 'purple',
  NOT_CONFIRMED: 'amber',
  NOT_OBSERVED: 'slate',
  NOT_APPLICABLE: 'violet',
  INSUFFICIENT_EVIDENCE: 'orange',
  NOT_AVAILABLE: 'zinc',
}

for (const [state, family] of Object.entries(expected)) {
  const pattern = new RegExp(state + String.raw`:[\s\S]*?light:\s*'[^']*` + family)
  assert.match(statusContract, pattern, `${state} must use the canonical ${family} family`)
}

const confirmedBlock = statusContract.match(/TEACHER_CONFIRMED:[\s\S]*?},/)?.[0] || ''
assert.ok(confirmedBlock.includes('blue-'), 'Teacher Confirmed must be blue')
assert.ok(!confirmedBlock.includes('emerald-') && !confirmedBlock.includes('green-'), 'Teacher Confirmed must never be green/emerald')

const editedConfirmedBlock = statusContract.match(/TEACHER_EDITED_CONFIRMED:[\s\S]*?},/)?.[0] || ''
assert.ok(editedConfirmedBlock.includes('blue-'), 'Teacher Edited & Confirmed must remain blue')

// Teacher Authority is still represented by the canonical contract and in teacher-facing
// intelligence surfaces. It must NOT appear as positive validation badges on student cards.
assert.doesNotMatch(studentPrimitives, /pedagogicalAuthorityStatusClass\('TEACHER_CONFIRMED'\)/)
assert.doesNotMatch(studentPrimitives, /'teacher-validated':\s*'Teacher confirmed'/)
assert.match(studentPrimitives, /status !== 'not-available'/)
assert.match(studentPrimitives, /Not available/)


assert.match(intelligenceBadge, /PedagogicalAuthorityStatus/)
assert.match(insights, /Teacher confirmed/)
assert.match(insights, /TEACHER_CONFIRMED/)
assert.match(students, /Teacher confirmed/)
assert.match(validation, /Teacher-confirmed learners/)
assert.match(validation, /text-blue-700/)

// Separate semantic systems remain intact.
assert.match(progressBadge, /Strong: 'border-emerald/)
assert.match(progressBadge, /Improving: 'border-blue/)
assert.match(intelligenceBadge, /VERIFIED: \{ icon: CheckCircle2, className: 'border-emerald/)

console.log('PRIME status color contract self-test: PASS')
