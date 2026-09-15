import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const schemaPath = path.join(root, 'data/contracts/student-dashboard-projection.schema.json')
const fixtureDir = path.join(root, 'tests/fixtures/student-dashboard')
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))

function fail(message) { throw new Error(`Student Dashboard contract regression failed: ${message}`) }

function validate(node, rule, location = '$') {
  if (rule.type === 'object' && (!node || typeof node !== 'object' || Array.isArray(node))) fail(`${location} must be an object`)
  if (rule.type === 'array' && !Array.isArray(node)) fail(`${location} must be an array`)
  if (rule.type === 'string' && typeof node !== 'string') fail(`${location} must be a string`)
  if (rule.minLength !== undefined && typeof node === 'string' && node.length < rule.minLength) fail(`${location} is shorter than ${rule.minLength}`)
  if (rule.const !== undefined && node !== rule.const) fail(`${location} must equal ${JSON.stringify(rule.const)}`)
  if (rule.required && node && typeof node === 'object' && !Array.isArray(node)) {
    for (const key of rule.required) if (!(key in node)) fail(`${location}.${key} is required`)
  }
  if (rule.properties && node && typeof node === 'object' && !Array.isArray(node)) {
    for (const [key, childRule] of Object.entries(rule.properties)) if (key in node) validate(node[key], childRule, `${location}.${key}`)
  }
}

const diego = JSON.parse(fs.readFileSync(path.join(fixtureDir, 'diego.canonical.fixture.json'), 'utf8'))
const eduarda = JSON.parse(fs.readFileSync(path.join(fixtureDir, 'eduarda.canonical.fixture.json'), 'utf8'))
for (const [name, fixture] of [['Diego', diego], ['Eduarda', eduarda]]) validate(fixture, schema, name)

if (diego.lessonRecords.length !== 4 || diego.classReports.length !== 4) fail('Diego four-lesson/four-report witness contract changed')
if (diego.canonicalProjection.currentState.level.value !== 'CEFR A2') fail('Diego current level must remain A2')
if (diego.canonicalProjection.currentState.targetLevel.value !== 'CEFR B1') fail('Diego target must remain B1')
if (diego.canonicalProjection.priorities.length !== 3) fail('Diego must retain three priorities')
if (diego.canonicalProjection.nextAction.title !== '60–90 Second Executive Response') fail('Diego next action changed')

if (eduarda.lessonRecords.filter((item) => item.status !== 'pending').length !== 7 || eduarda.classReports.length !== 7) fail('Eduarda seven-lesson/seven-report witness contract changed')
if (eduarda.canonicalProjection.currentState.level.value !== 'CEFR A1') fail('Eduarda current teacher-corrected level must remain A1')
if (eduarda.canonicalProjection.currentState.targetLevel.value !== 'CEFR A2') fail('Eduarda teacher-corrected target must remain A2')
if (eduarda.canonicalProjection.currentState.level.status !== 'teacher-validated') fail('Eduarda current level must remain teacher-validated')
if (eduarda.canonicalProjection.currentState.targetLevel.status !== 'teacher-validated') fail('Eduarda target must remain teacher-validated')
if (eduarda.canonicalProjection.priorities.length !== 3) fail('Eduarda must retain three priorities')
if (eduarda.canonicalProjection.nextAction.title !== 'Six-question independence check') fail('Eduarda next action changed')

const july3 = eduarda.lessonRecords.find((item) => item.lessonId.includes('2026-07-03'))
if (!july3 || july3.status !== 'pending' || july3.report !== null) fail('Eduarda 3 July incomplete encounter must remain pending with no report')
if (eduarda.canonicalProjection.currentState.level.value === eduarda.canonicalProjection.currentState.targetLevel.value) fail('Eduarda current level cannot be silently promoted to target')
if (diego.canonicalProjection.nextAction.title === eduarda.canonicalProjection.nextAction.title) fail('Diego and Eduarda must keep distinct next actions')

function semanticChecks(fixture, label) {
  if (label === 'Eduarda') {
    if (fixture.canonicalProjection.currentState.level?.value !== 'CEFR A1') fail('Eduarda current level cannot change without a new teacher-authorized source correction')
    if (fixture.canonicalProjection.currentState.targetLevel?.value !== 'CEFR A2') fail('Eduarda target cannot change without a new teacher-authorized source correction')
  }
  if (fixture.lessonRecords.some((item) => item.status === 'pending' && item.report !== null)) fail(`${label} cannot create a report for a pending lesson`)
  if (fixture.canonicalProjection.nextAction?.status === 'completed') fail(`${label} cannot encode an unexecuted next action as completed`)
}

function expectSchemaFailure(label, mutate) {
  const copy = JSON.parse(JSON.stringify(mutate()))
  let failed = false
  try { validate(copy, schema, label) } catch { failed = true }
  if (!failed) fail(`${label} mutation was accepted`)
}
function expectSemanticFailure(label, mutate, targetLabel) {
  const copy = JSON.parse(JSON.stringify(mutate()))
  let failed = false
  try { semanticChecks(copy, targetLabel) } catch { failed = true }
  if (!failed) fail(`${label} mutation was accepted`)
}

expectSchemaFailure('missing dashboardSourcePolicy', () => { const x = structuredClone(diego); delete x.dashboardSourcePolicy; return x })
expectSchemaFailure('wrong contract version', () => { const x = structuredClone(diego); x.canonicalProjection.version = 'student-dashboard-v2.0'; return x })
expectSchemaFailure('wrong profile completeness', () => { const x = structuredClone(diego); x.profileCompleteness = 'partial'; return x })
expectSemanticFailure('Eduarda silent promotion to A2', () => { const x = structuredClone(eduarda); x.canonicalProjection.currentState.level.value = 'CEFR A2'; return x }, 'Eduarda')
expectSemanticFailure('Eduarda target mutation', () => { const x = structuredClone(eduarda); x.canonicalProjection.currentState.targetLevel.value = 'CEFR B1'; return x }, 'Eduarda')
expectSemanticFailure('completed unexecuted action', () => { const x = structuredClone(diego); x.canonicalProjection.nextAction.status = 'completed'; return x }, 'Diego')
expectSemanticFailure('invented 3 July report', () => { const x = structuredClone(eduarda); x.lessonRecords.find((item) => item.lessonId.includes('2026-07-03')).report = 'invented-report'; return x }, 'Eduarda')

const swappedAction = structuredClone(eduarda)
swappedAction.canonicalProjection.nextAction.title = diego.canonicalProjection.nextAction.title
if (swappedAction.canonicalProjection.nextAction.title === diego.canonicalProjection.nextAction.title) fail('cross-learner action swap was accepted')

console.log('Student Dashboard contract regression self-test passed: schema + Diego/Eduarda fixtures + teacher-corrected Eduarda A1→A2 state + negative semantic mutations.')
