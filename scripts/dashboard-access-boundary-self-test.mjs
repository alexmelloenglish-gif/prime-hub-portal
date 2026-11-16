import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolveDashboardTargetEmail } from '../lib/dashboard-access-boundary.ts'

assert.equal(
  resolveDashboardTargetEmail({
    viewerEmail: 'student-a@example.test',
    requestedStudentEmail: 'student-b@example.test',
    mayPreviewAnotherStudent: false,
  }),
  'student-a@example.test',
  'A learner request for another learner must resolve only to the authenticated account identity',
)
assert.equal(
  resolveDashboardTargetEmail({
    viewerEmail: 'guardian@example.test',
    requestedStudentEmail: 'learner@example.test',
    mayPreviewAnotherStudent: false,
  }),
  'guardian@example.test',
  'A guardian cannot change learner target through an arbitrary email query; explicit account-learner relation resolution remains the separate authority path',
)
assert.equal(
  resolveDashboardTargetEmail({
    viewerEmail: 'admin@example.test',
    requestedStudentEmail: 'student-b@example.test',
    mayPreviewAnotherStudent: true,
  }),
  'student-b@example.test',
  'Only an independently authorized administrator preview may select another learner by legacy email',
)
assert.equal(
  resolveDashboardTargetEmail({
    viewerEmail: 'student-a@example.test',
    requestedStudentEmail: 'STUDENT-A@EXAMPLE.TEST',
    mayPreviewAnotherStudent: true,
  }),
  'student-a@example.test',
  'Email normalization must preserve the authenticated learner identity when both addresses are equal',
)
assert.equal(
  resolveDashboardTargetEmail({
    viewerEmail: '',
    requestedStudentEmail: 'student-b@example.test',
    mayPreviewAnotherStudent: true,
  }),
  '',
  'Missing authenticated identity must never resolve to a requested learner',
)

const dashboard = readFileSync('app/dashboard/page.tsx', 'utf8')
const studentData = readFileSync('lib/student-data.ts', 'utf8')
const audioRoute = readFileSync('app/api/dashboard/action/audio/route.ts', 'utf8')
const vocabularyRoute = readFileSync('app/api/student/vocabulary-reuse/route.ts', 'utf8')

assert.match(dashboard, /getServerSession\(authOptions\)/, 'Dashboard must acquire the server-side authenticated session')
assert.match(dashboard, /if \(!session\?\.user\) redirect\('\/login'\)/, 'Dashboard must redirect unauthenticated visitors')
assert.match(dashboard, /getStudentDashboardState\(session\.user/, 'Dashboard must resolve learner access from the authenticated account')
assert.match(studentData, /resolveDashboardTargetEmail\(/, 'Student data must apply the fail-closed learner-selection boundary')
assert.match(studentData, /mayPreviewAnotherStudent: canPreviewAnotherStudent\(user, requestedStudentEmail\)/, 'Cross-learner preview must depend on the separate admin authorization rule')
assert.match(audioRoute, /getStudentDashboardState\(session\.user, email\)/, 'Audio GET must resolve the target from the authenticated identity boundary')
assert.match(audioRoute, /getStudentDashboardState\(session\.user, requestedEmail\)/, 'Audio POST must resolve the target from the authenticated identity boundary')
assert.match(vocabularyRoute, /getStudentDashboardState\(session\.user, requestedEmail \|\| undefined\)/, 'Vocabulary API must use the same authenticated learner-resolution path')
assert.match(audioRoute, /!state\.hasAccess \|\| !state\.student\?\.studentId/, 'Audio routes must fail closed when learner access is absent')
assert.match(vocabularyRoute, /!state\.hasAccess \|\| !state\.student/, 'Vocabulary routes must fail closed when learner access is absent')

console.log('Dashboard access boundary self-test: PASS — authenticated learner target cannot be overridden by an unprivileged cross-account email.')
