import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const files = {
  intelligence: 'lib/teacher-intelligence.ts',
  reviewAction: 'app/dashboard/admin/intelligence/review/actions.ts',
  reviewPage: 'app/dashboard/admin/intelligence/review/page.tsx',
  signals: 'app/dashboard/admin/intelligence/signals/page.tsx',
  insights: 'app/dashboard/admin/intelligence/insights/page.tsx',
  learningState: 'app/dashboard/admin/intelligence/learning-state/page.tsx',
  lessonTrace: 'app/dashboard/admin/intelligence/lessons/[runId]/page.tsx',
  sidebar: 'components/layout/sidebar.tsx',
}

const entries = await Promise.all(
  Object.entries(files).map(async ([key, path]) => [key, await readFile(path, 'utf8')])
)
const source = Object.fromEntries(entries)
const allTeacherSource = Object.values(source).join('\n')

assert.match(source.sidebar, /\/dashboard\/admin\/intelligence/, 'Teacher Intelligence must be reachable from the admin navigation')
assert.match(source.reviewAction, /isAdminUser\(session\.user\)/, 'Evidence review must preserve the existing authorization boundary')
assert.match(source.intelligence, /canonicalEvidenceCreated:\s*false/, 'Evidence Candidate acceptance must not silently create canonical Evidence')
assert.match(source.intelligence, /EvidenceCandidateReviewDecision/, 'Human Evidence review must persist an audit event')
assert.match(source.intelligence, /reviewerId:/, 'Human review provenance must include reviewer identity')
assert.match(source.intelligence, /previousState/, 'Human review provenance must include previous state')
assert.match(source.intelligence, /newState:/, 'Human review provenance must include new state')
assert.match(source.reviewPage, /ACCEPT/, 'Evidence review must expose ACCEPT')
assert.match(source.reviewPage, /REJECT/, 'Evidence review must expose REJECT')
assert.match(source.reviewPage, /RETURN FOR REVISION/, 'Evidence review must expose RETURN FOR REVISION')
assert.match(source.reviewPage, /BLOCK/, 'Evidence review must expose BLOCK')
assert.match(source.signals, /LearningSignalProposal ≠ canonical Learning Signal/, 'Signal proposal and canonical Signal must remain distinct')
assert.match(source.insights, /TeacherInsightProposal ≠ published Teacher Insight/, 'Insight proposal and published Insight must remain distinct')
assert.match(source.learningState, /No verified state transition/, 'Learning State UI must not manufacture a state transition')
assert.match(source.lessonTrace, /Zero persisted Evidence Candidates/, 'Lesson trace must expose the zero-evidence condition')
assert.match(source.intelligence, /GEMINI PROVENANCE/, 'Runtime trace must expose Gemini provenance')
assert.doesNotMatch(allTeacherSource, /OPENAI|openai|chat\/completions/, 'Teacher Intelligence must not introduce a second AI provider path')
assert.doesNotMatch(allTeacherSource, /canonicalEvidenceCreated:\s*true/, 'Teacher Intelligence must not claim canonical Evidence creation')

console.log('Teacher Intelligence static regression self-test: PASS')
