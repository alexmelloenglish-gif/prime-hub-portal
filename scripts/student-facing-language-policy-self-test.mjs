import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  containsInternalGovernanceLanguage,
  learnerFacingNextAction,
  learnerFacingText,
  looksLikeTeacherPlan,
} from '../lib/student-facing-language-policy.ts'

assert.equal(containsInternalGovernanceLanguage('Teacher validated'), true)
assert.equal(containsInternalGovernanceLanguage('portfolio-confirmed'), true)
assert.equal(containsInternalGovernanceLanguage('This came from the pipeline'), true)
assert.equal(containsInternalGovernanceLanguage('Tell one short story about your weekend.'), false)

assert.equal(learnerFacingText('Teacher confirmed', 'fallback'), 'fallback')
assert.equal(learnerFacingText('Keep using the past to tell your own stories.', 'fallback'), 'Keep using the past to tell your own stories.')

assert.equal(looksLikeTeacherPlan('Start with a 60–90 second story, then prioritize question forms.'), true)
assert.equal(looksLikeTeacherPlan('Tell one short story about something that happened.'), false)

const guarded = learnerFacingNextAction({
  title: 'School-English Revision + One New Past Story',
  description: 'Start with a 60–90 second personal past story. Briefly mix Do/Did questions, then prioritize the school assessment.',
  destination: 'https://meet.google.com/example',
})
assert.equal(guarded.title, 'School-English Revision + One New Past Story')
assert.equal(guarded.description, 'We’ll work on this together in your next lesson.')

const dashboard = await readFile(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8')
const primitives = await readFile(new URL('../components/dashboard/student-dashboard-primitives.tsx', import.meta.url), 'utf8')

assert.ok(dashboard.includes('<details key={report.id}'), 'Class Reports must be collapsed by default')
assert.ok(dashboard.includes('Tap a class to open the full report.'), 'Class Reports need concise learner instructions')
assert.ok(!dashboard.includes('No validated current priority is available yet.'), 'Validation language must not leak to the learner')
assert.ok(!dashboard.includes('Why this changed:'), 'Audit evidence must not render in What Changed')
assert.ok(!primitives.includes("'teacher-validated': 'Teacher confirmed'"), 'Positive authority badges must not be learner-facing')
assert.ok(primitives.includes("status !== 'not-available'"), 'Only material unavailable state should render as a status badge')

console.log('Student-facing language policy self-test passed: governance stays internal, teacher plans stay teacher-side, and class reports are collapsed by default.')
