import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const registry = JSON.parse(await readFile(new URL('data/students/student-core-registry.json', root), 'utf8'))
const dataDir = new URL('data/students/', root)
const filenames = (await readdir(dataDir)).filter((name) => name.endsWith('.firestore.json'))
const profiles = new Map()

for (const filename of filenames) {
  const profile = JSON.parse(await readFile(new URL(`data/students/${filename}`, root), 'utf8'))
  if (typeof profile.studentEmail === 'string') profiles.set(profile.studentEmail.trim().toLowerCase(), { filename, profile })
}

const canonicalStates = new Set(['Strong', 'Improving', 'Needs Focus', 'Not Assessed'])
const knownLegacy = new Map([
  ['very strong', 'Strong'],
  ['secure', 'Strong'],
  ['established', 'Strong'],
  ['clear strength', 'Strong'],
  ['active growth', 'Improving'],
  ['developing', 'Improving'],
  ['progressing', 'Improving'],
  ['on track', 'Improving'],
  ['on-track', 'Improving'],
  ['needs attention', 'Needs Focus'],
  ['priority', 'Needs Focus'],
  ['needs practice', 'Needs Focus'],
  ['not assessed', 'Not Assessed'],
  ['not yet assessed', 'Not Assessed'],
  ['pending', 'Not Assessed'],
  ['unknown', 'Not Assessed'],
  ['not available', 'Not Assessed'],
  ['in progress', 'Not Assessed'],
])

function normalizeStatus(value) {
  const raw = String(value ?? '').trim()
  if (canonicalStates.has(raw)) return raw
  const key = raw.toLowerCase()
  if (knownLegacy.has(key)) return knownLegacy.get(key)
  if (/^(very\s+)?strong\b/.test(key) || key.includes('clear strength')) return 'Strong'
  if (key.includes('developing') || key.includes('improving') || key.includes('active growth') || key.includes('progressing')) return 'Improving'
  if (key.includes('needs focus') || key.includes('needs attention') || key.includes('needs practice')) return 'Needs Focus'
  return null
}

const emails = new Set()
const ids = new Set()
for (const student of registry.students) {
  const email = String(student.canonicalEmail ?? '').trim().toLowerCase()
  assert.ok(email, `Registry student is missing canonicalEmail: ${student.studentName}`)
  assert.ok(!emails.has(email), `Duplicate canonicalEmail in registry: ${email}`)
  emails.add(email)

  assert.ok(student.studentId, `Registry student is missing studentId: ${email}`)
  assert.ok(!ids.has(student.studentId), `Duplicate studentId in registry: ${student.studentId}`)
  ids.add(student.studentId)

  const repository = profiles.get(email)
  assert.ok(repository, `No repository profile found for registry student ${email}`)
  assert.equal(repository.profile.studentId, student.studentId, `studentId mismatch for ${email}`)

  const progress = Array.isArray(repository.profile.progressTracker) ? repository.profile.progressTracker : []
  for (const item of progress) {
    const normalized = normalizeStatus(item.status)
    assert.ok(normalized, `Unsupported progress state for ${email}: ${item.status}`)
    if (normalized === 'Not Assessed') {
      const insight = String(item.insight ?? '').trim().toLowerCase()
      const neutral = !insight || /not enough evidence|insufficient evidence|not yet assessed|assessment pending|evidence pending/.test(insight)
      assert.ok(neutral, `Not Assessed contains evaluative insight for ${email} / ${item.title}`)
    }
  }
}

const byEmail = Object.fromEntries(registry.students.map((student) => [String(student.canonicalEmail).toLowerCase(), student]))
assert.equal(
  byEmail['claudio.bit@gmail.com']?.links?.portfolio,
  'https://docs.google.com/document/d/1Drg6EnGyYF46neAxIaaa_BX2OE4Fb9CErbwRH1bczFc/edit',
  'Cláudio registry portfolio must be canonical'
)
assert.equal(
  byEmail['rafael.copolillo@gmail.com']?.links?.portfolio,
  'https://docs.google.com/document/d/1z2pEl13A7gD2ry41WcaGWRL-PM9klWtT7qyYYoW_FBo/edit',
  'Rafael registry portfolio must be canonical'
)

const legacyPortfolioIds = [
  '1wPKJP1dqe7APigZnMe6MOzpurJENuNV3nXJ5zQ3glN4',
  '1ZXPBlc34kkOcfqHWodI78_BwXuJfe-p7pU7uFLSk4bE',
]
for (const student of registry.students) {
  const portfolio = String(student.links?.portfolio ?? '')
  for (const legacyId of legacyPortfolioIds) {
    assert.ok(!portfolio.includes(legacyId), `Registry exposes a legacy portfolio for ${student.canonicalEmail}`)
  }
}

const vercelConfig = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'))
assert.ok(!Array.isArray(vercelConfig.crons) || vercelConfig.crons.length === 0, 'Legacy Vercel cron must remain disabled during repair')
assert.ok(!JSON.stringify(vercelConfig).includes('/api/ingest'), 'Legacy /api/ingest rewrite must remain removed')

const pipelineFreeze = await readFile(new URL('lib/pipeline-freeze.ts', root), 'utf8')
assert.ok(pipelineFreeze.includes('PIPELINE_AUTOMATION_FROZEN = true'), 'Pipeline freeze guard must remain active during repair')

const adminSource = await readFile(new URL('app/dashboard/admin/page.tsx', root), 'utf8')
assert.ok(!adminSource.includes('Publish Rafael canonical projection'), 'Rafael-only Firestore publisher must not return')
assert.ok(!adminSource.includes('Firestore is the source of truth'), 'Admin must not describe Firestore as active source of truth')
assert.ok(!adminSource.includes('ProcessDriveButton'), 'Manual Drive processing must remain unavailable during the freeze')

const dashboardSource = await readFile(new URL('app/dashboard/page.tsx', root), 'utf8')
assert.ok(dashboardSource.includes('resolveCanonicalManageSpaceLinks'), 'Dashboard must resolve portfolio links from core registry')
assert.ok(dashboardSource.includes("state === 'Not Assessed'"), 'Dashboard must neutralize Not Assessed insight text')

console.log(`Canonical student consistency audit passed for ${registry.students.length} registry students and ${profiles.size} repository profiles.`)
