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
  candidateValidation: 'app/dashboard/admin/intelligence/validation/candidates/[studentId]/page.tsx',
  learners: 'app/dashboard/admin/intelligence/students/page.tsx',
  learnerDecision: 'app/dashboard/admin/intelligence/students/[studentId]/page.tsx',
  decisionPackages: 'lib/teacher-decision-packages.ts',
  candidatePackages: 'lib/teacher-intelligence-candidates.ts',
  gustavoPackage: 'data/teacher-intelligence/gustavo-drummond-v2.json',
  eduardaPackage: 'data/teacher-intelligence/eduarda-coelho-gabriel-v2.json',
  eduardaCandidate: 'data/teacher-intelligence/eduarda-coelho-gabriel-v2-candidate.json',
  eduardaDashboard: 'data/students/eduarda-coelho-gabriel-hotmail-com.firestore.json',
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
const eduardaPackage = JSON.parse(source.eduardaPackage)
const eduardaCandidate = JSON.parse(source.eduardaCandidate)
const eduardaDashboard = JSON.parse(source.eduardaDashboard)

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
assert.match(source.signals, /LearningSignalProposal ≠ canonical Learning Signal/, 'Signal proposal and canonical Signal must remain distinct')
assert.match(source.insights, /TeacherInsightProposal ≠ published Teacher Insight/, 'Insight proposal and published Insight must remain distinct')
assert.match(source.learningState, /Teacher-authorized bounded state packages/, 'Learning State must surface only recorded teacher-authorized packages')
assert.match(source.validation, /Exception-based authority/, 'Validation must be framed as exception-based authority')
assert.match(source.validation, /Pending pedagogical authority transitions/, 'Validation must expose bounded pending pedagogical decisions separately from operational exceptions')
assert.match(source.validation, /Teacher-authorized packages|Teacher-authorized/, 'Validation must show resolved teacher authority packages')
assert.match(source.candidateValidation, /Evidence → Signal → Interpretation → Boundary → Verification/, 'Candidate validation must preserve the evidence chain')
assert.match(source.candidateValidation, /canonical projection remains blocked|canonical projection, or be described as teacher-authorized/i, 'Candidate review must preserve the publication firewall')
assert.match(source.learners, /Teacher-authorized V2/, 'Learner directory must expose available teacher-authorized V2 packages')
assert.match(source.learnerDecision, /Evidence → Signal → Interpretation → Boundary → Verification/, 'Learner decision view must preserve the evidence chain')
assert.match(source.decisionPackages, /gustavo-drummond-v2\.json/, 'Teacher decision package registry must include Gustavo V2')
assert.match(source.decisionPackages, /eduarda-coelho-gabriel-v2\.json/, 'Teacher decision package registry must include Eduarda V2')
assert.match(source.candidatePackages, /const candidates: TeacherIntelligenceCandidatePackage\[\] = \[\]/, 'Eduarda must leave the pending candidate registry after teacher authorization')
assert.equal(gustavoPackage.status, 'teacher_authorized')
assert.equal(gustavoPackage.teacherDecision.currentStatePriorityPackage, 'accepted_v2_proposed_update')
assert.equal(gustavoPackage.teacherDecision.nextAction, 'accepted_v2_proposed_next_action')
assert.equal(gustavoPackage.teacherDecision.levelAssessment, 'no_change')
assert.equal(gustavoPackage.teacherDecision.canonicalProjection, 'authorized')
assert.equal(gustavoPackage.sourceLessons.length, 4)
assert.equal(gustavoPackage.classReportsV2.length, 4)
assert.equal(gustavoPackage.governance.legacyPolicy, 'additive_versioned_no_deletion')
assert.equal(eduardaPackage.status, 'teacher_authorized')
assert.equal(eduardaPackage.teacherDecision.currentStatePriorityPackage, 'accepted_v2_proposed_update')
assert.equal(eduardaPackage.teacherDecision.nextAction, 'accepted_v2_proposed_next_action')
assert.equal(eduardaPackage.teacherDecision.levelAssessment, 'no_change')
assert.equal(eduardaPackage.teacherDecision.canonicalProjection, 'authorized')
assert.equal(eduardaPackage.sourceLessons.length, 7)
assert.equal(eduardaPackage.classReportsV2.length, 7)
assert.equal(eduardaPackage.legacyLineage.historicalEncounters, 8)
assert.equal(eduardaPackage.legacyLineage.sourceOnlyEncounterDate, '2026-07-03')
assert.equal(eduardaPackage.governance.legacyPolicy, 'additive_versioned_no_deletion')
assert.equal(eduardaDashboard.studentName, 'Eduarda Dias Costa Coelho da Cunha Gabriel')
assert.equal(eduardaCandidate.status, 'awaiting_teacher_decision')
assert.equal(eduardaCandidate.canonicalizationStatus, 'not_authorized')
assert.equal(eduardaCandidate.sourceLessons.length, 7)
assert.equal(eduardaCandidate.classReportsV2.length, 7)
assert.equal(eduardaCandidate.legacyLineage.historicalEncounters, 8)
assert.equal(eduardaCandidate.legacyLineage.sourceOnlyEncounterDate, '2026-07-03')
assert.equal(eduardaCandidate.technicalPartials.length, 2)
assert.equal(eduardaCandidate.governance.legacyPolicy, 'additive_versioned_no_deletion')
assert.match(source.lessonsPage, /studentEmail/, 'Lesson Intelligence must consume the studentEmail route parameter')
assert.match(source.lessonsPage, /listTeacherLessons\(100, requestedStudent \|\| undefined\)/, 'Lesson Intelligence must pass the optional student filter to the query')
assert.match(source.intelligence, /studentEmail\?: string/, 'Teacher lesson listing must expose an optional studentEmail filter')
assert.match(source.intelligence, /where: normalizedStudentEmail \? \{ studentEmail: normalizedStudentEmail \} : undefined/, 'Lesson listing must filter by studentEmail only when provided')
assert.match(source.lessonTrace, /Zero persisted Evidence Candidates/, 'Lesson trace must expose the zero-evidence condition')
assert.match(source.intelligence, /GEMINI PROVENANCE/, 'Runtime trace must expose Gemini provenance')
assert.doesNotMatch(allTeacherSource, /OPENAI|openai|chat\/completions/, 'Teacher Intelligence must not introduce a second AI provider path')
assert.doesNotMatch(allTeacherSource, /canonicalEvidenceCreated:\s*true/, 'Teacher Intelligence must not claim canonical Evidence creation')

console.log('Teacher Intelligence static regression self-test: PASS')
