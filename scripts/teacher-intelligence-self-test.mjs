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
  machineInbox: 'app/dashboard/admin/intelligence/machine/page.tsx',
  machineAction: 'app/dashboard/admin/intelligence/machine/actions.ts',
  machineSource: 'lib/drive-reconciliation.ts',
  home: 'app/dashboard/admin/intelligence/page.tsx',
  actions: 'app/dashboard/admin/intelligence/actions/page.tsx',
  sidebar: 'components/layout/sidebar.tsx',
}

const entries = await Promise.all(
  Object.entries(files).map(async ([key, path]) => [key, await readFile(path, 'utf8')])
)
const source = Object.fromEntries(entries)
const allTeacherSource = Object.values(source).join('\n')
const gustavoPackage = JSON.parse(source.gustavoPackage)

assert.match(source.sidebar, /\/dashboard\/admin\/intelligence/, 'Teacher Intelligence must be reachable from the admin navigation')
assert.match(source.home, /\/dashboard\/admin\/intelligence\/machine/, 'Teacher Intelligence must expose the Learning Machine inbox')
assert.match(source.machineInbox, /Real transcript sources waiting for PRIME/, 'Machine inbox must present real Drive sources as the processing entry point')
assert.match(source.machineInbox, /form action=\{processDriveTranscriptSource\}/, 'Machine inbox must expose a real Process action rather than pasted transcript assembly')
assert.match(source.machineAction, /prepareDriveTranscriptPayload/, 'Manual Process must acquire the canonical Drive source through the shared source adapter')
assert.match(source.machineAction, /executeSharedLearningMachine/, 'Manual Process must invoke the shared Learning Machine')
assert.match(source.machineAction, /triggerOrigin: 'manual'/, 'Manual Process must differ from automation only by trigger origin')
assert.match(source.machineAction, /isAdminUser\(session\.user\)/, 'Manual Process must require administrator authority')
assert.match(source.machineSource, /listDriveTranscriptSourceQueue/, 'Machine inbox must enumerate canonical Drive intake sources')
assert.match(source.machineSource, /sourceFileId: \{ in: selected\.map/, 'Drive intake queue must reconcile sources against persisted transcript lineage')
assert.match(source.sidebar, /const menuItems = isAdmin/, 'Admin navigation must depend on admin authority, not learner-preview state')
assert.doesNotMatch(source.sidebar, /isAdmin && !isStudentPreview/, 'Learner preview must not hide Teacher Intelligence/Admin from the admin viewer')
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
assert.match(source.reviewPage, /Mark as reviewed/, 'Pending learner audio must expose a real teacher review action')
assert.match(source.reviewPage, /reviewLearnerSubmissionAction/, 'Learner submission review UI must call the protected server action')
assert.match(source.reviewAction, /recordLearnerSubmissionReview/, 'Learner submission review action must persist an auditable review event')
assert.match(source.intelligence, /LearnerSubmissionTeacherReviewed/, 'Learner submission review must persist a dedicated event')
assert.match(source.intelligence, /canonicalEvidenceCreated:\s*false/, 'Learner submission review must not create canonical evidence')
assert.match(source.intelligence, /teacherAuthorityConsumed:\s*false/, 'Learner submission review must not consume Teacher Authority')
assert.match(source.intelligence, /learningStateChanged:\s*false/, 'Learner submission review must not mutate learning state')
assert.match(source.signals, /working suggestions for the teacher/, 'Signal proposals must remain visibly separate from reviewed learner state')
assert.match(source.insights, /working notes/, 'AI-supported insights must remain visibly separate from teacher-reviewed interpretation')
assert.match(source.learningState, /Teacher-reviewed learning state/, 'Learning State must surface only recorded teacher-reviewed packages')
assert.match(source.intelligence, /pending_source_grounded_proposal/, 'Teaching Actions must distinguish source-grounded proposals from legacy artifacts')
assert.match(source.intelligence, /covered_by_teacher_decision/, 'Teaching Actions must detect proposal sources covered by a later teacher decision')
assert.match(source.intelligence, /not_reviewable_unproven_basis/, 'Teaching Actions must quarantine proposals without a proven structured basis')
assert.match(source.intelligence, /canonical_learning_record_authority/, 'Teaching Actions resolution must use the bounded canonical-authority ValidationTask evidence')
assert.match(source.actions, /Only source-grounded AI proposals that are still unresolved appear as pending/, 'Teaching Actions must not present every CoachingGuidance row as pending teacher review')
assert.match(source.actions, /Historical proposal containment/, 'Teaching Actions must keep excluded historical proposals visible as contained history rather than deleting them')
assert.doesNotMatch(source.actions, /label="Teacher review"/, 'Teaching Actions must not falsely label legacy CoachingGuidance rows as pending teacher review')
assert.match(source.validation, /Teacher decisions and exceptions/, 'Validation must remain a bounded human-decision workspace')
assert.match(source.validation, /Teacher-confirmed learners/, 'Validation must show resolved teacher-confirmed packages')
assert.match(source.learners, /teacher-reviewed learning updates/, 'Learner directory must expose available teacher-reviewed packages')
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
assert.match(source.lessonTrace, /No evidence candidate/, 'Lesson trace must expose the zero-evidence condition without technical repetition')
assert.match(source.lessonTrace, /Technical trace \/ audit/, 'Full failed-attempt provenance must remain available behind the technical audit disclosure')
assert.match(source.intelligence, /technicalOnlyFailure/, 'Teacher lesson listing must classify technical-only failed runs')
assert.match(source.intelligence, /filter\(\(item\) => !item\.technicalOnlyFailure\)/, 'Technical-only failed runs must stay out of the pedagogical Lessons/Cockpit surfaces')
assert.match(source.lessonsPage, /remain preserved in Audit/, 'Lessons UI must explain where filtered technical-only failures remain available')
assert.match(source.intelligence, /MODEL PROVENANCE/, 'Runtime trace must expose provider-neutral model provenance')
assert.match(source.intelligence, /hasValidModelProvenance/, 'Teacher Intelligence must validate provenance by PRIME contract rather than one provider name')
assert.doesNotMatch(allTeacherSource, /api\.openai\.com|api\.perplexity\.ai|generativelanguage\.googleapis\.com/, 'Teacher Intelligence must not call model providers directly')
assert.doesNotMatch(allTeacherSource, /canonicalEvidenceCreated:\s*true/, 'Teacher Intelligence must not claim canonical Evidence creation')

console.log('Teacher Intelligence static regression self-test: PASS')
