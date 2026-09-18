import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const files = {
  intelligence: 'lib/teacher-intelligence.ts',
  reviewAction: 'app/dashboard/admin/intelligence/review/actions.ts',
  reviewPage: 'app/dashboard/admin/intelligence/review/page.tsx',
  pipelineReview: 'app/dashboard/admin/review/review-queue-actions.tsx',
  signals: 'app/dashboard/admin/intelligence/signals/page.tsx',
  insights: 'app/dashboard/admin/intelligence/insights/page.tsx',
  learningState: 'app/dashboard/admin/intelligence/learning-state/page.tsx',
  validation: 'app/dashboard/admin/intelligence/validation/page.tsx',
  learners: 'app/dashboard/admin/intelligence/students/page.tsx',
  learnerDecision: 'app/dashboard/admin/intelligence/students/[studentId]/page.tsx',
  decisionPackages: 'lib/teacher-decision-packages.ts',
  gustavoPackage: 'data/teacher-intelligence/gustavo-drummond-v2.json',
  lessonsPage: 'app/dashboard/admin/intelligence/lessons/page.tsx',
  lessonTrace: 'app/dashboard/admin/intelligence/lessons/[runId]/page.tsx',
  sidebar: 'components/layout/sidebar.tsx',
}

const entries = await Promise.all(
  Object.entries(files).map(async ([key, path]) => [key, await readFile(path, 'utf8')])
)
const source = Object.fromEntries(entries)
const allTeacherSource = Object.values(source).join('\n')
const gustavoPackage = JSON.parse(source.gustavoPackage)

assert.match(source.sidebar, /\/dashboard\/admin\/intelligence/, 'Teacher Intelligence must be reachable from the admin navigation')
assert.match(source.reviewAction, /isAdminUser\(session\.user\)/, 'Evidence review must preserve the existing authorization boundary')
assert.match(source.reviewPage, /listPendingReviewTasks/, 'Teacher Review Queue must reuse existing Pipeline ReviewTask workflow')
assert.match(source.reviewPage, /ReviewQueueActions/, 'Teacher Review Queue must render existing Pipeline ReviewTask controls')
assert.match(source.pipelineReview, /\/api\/pipeline\/review/, 'Pipeline review controls must reuse the existing review API')
assert.doesNotMatch(source.pipelineReview, /now visible to the student/, 'Review completion copy must not infer final projection visibility')
assert.match(source.intelligence, /canonicalEvidenceCreated:\s*false/, 'Evidence Candidate acceptance must not silently create canonical Evidence')
assert.match(source.intelligence, /EvidenceCandidateReviewDecision/, 'Human Evidence review must persist an audit event')
assert.match(source.intelligence, /reviewerId:/, 'Human review provenance must include reviewer identity')
assert.match(source.intelligence, /previousState/, 'Human review provenance must include previous state')
assert.match(source.intelligence, /newState:/, 'Human review provenance must include new state')
assert.match(source.reviewPage, /ACCEPT/, 'Evidence review must expose ACCEPT')
assert.match(source.reviewPage, /REJECT/, 'Evidence review must expose REJECT')
assert.match(source.reviewPage, /RETURN FOR REVISION/, 'Evidence review must expose RETURN FOR REVISION')
assert.match(source.reviewPage, /BLOCK/, 'Evidence review must expose BLOCK')
assert.match(source.signals, /working suggestions for the teacher/, 'Signal proposals must remain visibly separate from reviewed learner state')
assert.match(source.insights, /working notes/, 'AI-supported insights must remain visibly separate from teacher-reviewed interpretation')
assert.match(source.learningState, /Teacher-reviewed learning state/, 'Learning State must surface only recorded teacher-reviewed packages')
assert.match(source.validation, /Teacher decisions and exceptions/, 'Validation must remain a bounded human-decision workspace')
assert.match(source.validation, /Teacher-reviewed learners/, 'Validation must show resolved teacher-reviewed packages')
assert.match(source.learners, /Teacher reviewed/, 'Learner directory must expose available teacher-reviewed packages')
assert.match(source.learnerDecision, /Evidence → Pattern → Teacher interpretation → Next check/, 'Learner decision view must preserve the evidence-to-teacher-decision chain')
assert.match(source.decisionPackages, /gustavo-drummond-v2\.json/, 'Teacher decision package registry must include Gustavo V2')
assert.equal(gustavoPackage.status, 'teacher_authorized')
assert.equal(gustavoPackage.teacherDecision.currentStatePriorityPackage, 'accepted_v2_proposed_update')
assert.equal(gustavoPackage.teacherDecision.nextAction, 'accepted_v2_proposed_next_action')
assert.equal(gustavoPackage.teacherDecision.levelAssessment, 'no_change')
assert.equal(gustavoPackage.teacherDecision.canonicalProjection, 'authorized')
assert.equal(gustavoPackage.sourceLessons.length, 4)
assert.equal(gustavoPackage.classReportsV2.length, 4)
assert.equal(gustavoPackage.governance.legacyPolicy, 'additive_versioned_no_deletion')
assert.match(source.lessonsPage, /studentEmail/, 'Lesson Intelligence must consume the studentEmail route parameter')
assert.match(source.lessonsPage, /listTeacherLessons\(100, requestedStudent \|\| undefined\)/, 'Lesson Intelligence must pass the optional student filter to the query')
assert.match(source.intelligence, /studentEmail\?: string/, 'Teacher lesson listing must expose an optional studentEmail filter')
assert.match(source.intelligence, /normalizedStudentEmail \? \{ studentEmail: normalizedStudentEmail \} : \{\}/, 'Lesson listing must apply the studentEmail filter only when provided')
assert.match(source.intelligence, /endsWith: '@invalid\.test'/, 'Operational Teacher Intelligence queries must exclude synthetic validation identities')
assert.match(source.intelligence, /seenLessons/, 'Teacher cockpit must deduplicate technical retries into lesson identities')
assert.match(source.lessonsPage, /Processing history/, 'Technical retries must remain available only inside expandable lesson history')
assert.match(source.lessonTrace, /Zero persisted Evidence Candidates/, 'Lesson trace must expose the zero-evidence condition')
assert.match(source.intelligence, /GEMINI PROVENANCE/, 'Runtime trace must expose Gemini provenance')
assert.doesNotMatch(allTeacherSource, /OPENAI|openai|chat\/completions/, 'Teacher Intelligence must not introduce a second AI provider path')
assert.doesNotMatch(allTeacherSource, /canonicalEvidenceCreated:\s*true/, 'Teacher Intelligence must not claim canonical Evidence creation')

console.log('Teacher Intelligence static regression self-test: PASS')
