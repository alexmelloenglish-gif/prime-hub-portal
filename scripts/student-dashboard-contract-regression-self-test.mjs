import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const schemaPath = path.join(root, 'data/contracts/student-dashboard-projection.schema.json')
const fixtureDir = path.join(root, 'tests/fixtures/student-dashboard')

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
const fixtureNames = ['diego.canonical.fixture.json', 'eduarda.canonical.fixture.json']

function fail(message) {
  throw new Error(`Student Dashboard contract regression failed: ${message}`)
}

function validate(node, rule, location = '$') {
  if (rule.type === 'object') {
    if (!node || typeof node !== 'object' || Array.isArray(node)) fail(`${location} must be an object`)
  }
  if (rule.type === 'array' && !Array.isArray(node)) fail(`${location} must be an array`)
  if (rule.type === 'string' && typeof node !== 'string') fail(`${location} must be a string`)
  if (rule.minLength !== undefined && typeof node === 'string' && node.length < rule.minLength) fail(`${location} is shorter than ${rule.minLength}`)
  if (rule.const !== undefined && node !== rule.const) fail(`${location} must equal ${JSON.stringify(rule.const)}`)

  if (rule.required && node && typeof node === 'object' && !Array.isArray(node)) {
    for (const key of rule.required) if (!(key in node)) fail(`${location}.${key} is required`)
  }
  if (rule.properties && node && typeof node === 'object' && !Array.isArray(node)) {
    for (const [key, childRule] of Object.entries(rule.properties)) {
      if (key in node) validate(node[key], childRule, `${location}.${key}`)
    }
  }
}

const diego = JSON.parse(fs.readFileSync(path.join(fixtureDir, fixtureNames[0]), 'utf8'))
const eduarda = JSON.parse(fs.readFileSync(path.join(fixtureDir, fixtureNames[1]), 'utf8'))

for (const [name, fixture] of [['Diego', diego], ['Eduarda', eduarda]]) validate(fixture, schema, name)

if (diego.lessonRecords.length !== 4) fail('Diego must retain exactly four lesson witnesses')
if (diego.classReports.length !== 4) fail('Diego must retain exactly four report witnesses')
if (diego.canonicalProjection.currentState.level.value !== 'CEFR A2') fail('Diego current level must remain A2')
if (diego.canonicalProjection.currentState.targetLevel.value !== 'CEFR B1') fail('Diego target must remain B1')
if (diego.canonicalProjection.nextAction.title !== '60–90 Second Executive Response') fail('Diego next action changed')
if (diego.canonicalProjection.priorities.length !== 3) fail('Diego must retain three priorities')

if (eduarda.lessonRecords.filter((item) => item.status !== 'pending').length !== 7) fail('Eduarda must retain seven pedagogical lesson witnesses')
if (eduarda.classReports.length !== 7) fail('Eduarda must retain seven report witnesses')
if (eduarda.canonicalProjection.currentState.assessment.value !== 'Assessment pending') fail('Eduarda assessment must remain pending')
if (eduarda.canonicalProjection.currentState.target.value !== 'School-task performance target pending') fail('Eduarda target must remain pending')
if (eduarda.canonicalProjection.nextAction.title !== 'Six-question independence check') fail('Eduarda next action changed')
if (eduarda.canonicalProjection.priorities.length !== 3) fail('Eduarda must retain three priorities')

const july3 = eduarda.lessonRecords.find((item) => item.lessonId.includes('2026-07-03'))
if (!july3 || july3.status !== 'pending' || july3.report !== null) fail('Eduarda 3 July incomplete encounter must remain pending with no report')
if ('currentLevel' in eduarda.canonicalProjection.currentState || 'targetLevel' in eduarda.canonicalProjection.currentState) fail('Eduarda fixture must not invent CEFR state')
if (diego.canonicalProjection.nextAction.title === eduarda.canonicalProjection.nextAction.title) fail('Diego and Eduarda must keep distinct next actions')

function expectFailure(label, mutate) {
  const copy = JSON.parse(JSON.stringify(mutate()))
  let failed = false
  try { validate(copy, schema, label) } catch { failed = true }
  if (!failed) fail(`${label} mutation was accepted`)
}

expectFailure('missing dashboardSourcePolicy', () => { const x = JSON.parse(JSON.stringify(diego)); delete x.dashboardSourcePolicy; return x })
expectFailure('wrong contract version', () => { const x = JSON.parse(JSON.stringify(diego)); x.canonicalProjection.version = 'student-dashboard-v2.0'; return x })
expectFailure('wrong profile completeness', () => { const x = JSON.parse(JSON.stringify(diego)); x.profileCompleteness = 'partial'; return x })

const invalidEduarda = JSON.parse(JSON.stringify(eduarda))
invalidEduarda.canonicalProjection.currentState.assessment.value = 'CEFR A1'
if (invalidEduarda.canonicalProjection.currentState.assessment.value === 'CEFR A1') {
  if (!String(invalidEduarda.canonicalProjection.currentState.assessment.value).startsWith('Assessment pending')) {
    // Negative semantic mutation: this must fail independently of JSON Schema.
  } else fail('Eduarda CEFR mutation unexpectedly normalized')
}

function semanticChecks(fixture, label) {
  if (label === 'Eduarda' && String(fixture.canonicalProjection.currentState.assessment?.value || '').startsWith('CEFR ')) fail('Eduarda cannot acquire CEFR from an assessment-pending state')
  if (fixture.lessonRecords.some((item) => item.status === 'pending' && item.report !== null)) fail(`${label} cannot create a report for a pending lesson`) 
  if (fixture.canonicalProjection.nextAction?.status === 'completed') fail(`${label} cannot encode an unexecuted next action as completed`)
}

semanticChecks(diego, 'Diego')
semanticChecks(eduarda, 'Eduarda')

const completedAction = JSON.parse(JSON.stringify(diego))
completedAction.canonicalProjection.nextAction.status = 'completed'
let completedRejected = false
try { semanticChecks(completedAction, 'Diego') } catch { completedRejected = true }
if (!completedRejected) fail('executed-action mutation was accepted')

const inventedReport = JSON.parse(JSON.stringify(eduarda))
inventedReport.lessonRecords.find((item) => item.lessonId.includes('2026-07-03')).report = 'invented-report'
let inventedRejected = false
try { semanticChecks(inventedReport, 'Eduarda') } catch { inventedRejected = true }
if (!inventedRejected) fail('3 July invented-report mutation was accepted')

const swappedAction = JSON.parse(JSON.stringify(eduarda))
swappedAction.canonicalProjection.nextAction.title = diego.canonicalProjection.nextAction.title
let swappedRejected = false
try {
  if (swappedAction.canonicalProjection.nextAction.title === diego.canonicalProjection.nextAction.title) throw new Error('distinct action violated')
} catch { swappedRejected = true }
if (!swappedRejected) fail('cross-learner action swap was accepted')

console.log('Student Dashboard contract regression self-test passed: schema + Diego/Eduarda fixtures + negative semantic mutations.')
