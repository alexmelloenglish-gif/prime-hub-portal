import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const portfolioDir = path.join(ROOT, 'docs/student-portfolios/family-edition')
const registry = JSON.parse(
  await readFile(path.join(ROOT, 'data/students/student-core-registry.json'), 'utf8')
)
const activeLearners = registry.students.filter(
  (student) => student.profileStatus === 'active' && student.operatingEligibility === 'learner'
)

const manifest = JSON.parse(await readFile(path.join(portfolioDir, 'manifest.json'), 'utf8'))
assert.equal(manifest.learnerCount, activeLearners.length)
assert.equal(activeLearners.length, 9, 'Expected the current nine active authorized learners')

const files = (await readdir(portfolioDir)).filter((name) => name.endsWith('-family-edition.md'))
assert.equal(files.length, activeLearners.length, 'Every active learner must have one family-edition portfolio')

const forbidden = [
  /\bcanonical\b/i,
  /\bprojection\b/i,
  /\bpipeline\b/i,
  /\brepository\b/i,
  /\bfirestore\b/i,
  /\bprisma\b/i,
  /\bschema\b/i,
  /\bruntime\b/i,
  /sourceFileId/i,
  /validationTask/i,
  /authorityStatus/i,
  /idempotenc/i,
  /non_authoritative/i,
  /teacher-validated/i,
  /portfolio-confirmed/i,
  /source-integrity/i,
  /learner model/i,
  /learning record update/i,
  /internal authoring/i,
  /technical processing/i,
]

const requiredSections = [
  '## 1. Student Learning Portfolio',
  '## 2. Your Learning Snapshot',
  '## 3. Quick Access',
  '## 4. Estado atual de aprendizagem / Current Learning State',
  '## 5. Forças e evidências / Strengths & Evidence',
  '## 6. Padrões de aprendizagem / Learning Patterns',
  '## 7. Prioridade pedagógica atual / Current Pedagogical Priority',
  '## 8. Próxima ação e acompanhamento / Next Action & Follow-up',
  '## 9. Memória pedagógica e próximo ciclo / Learning Memory & Next Cycle',
  '## 10. Leitura para a família / Family Guide',
  '## 11. Attendance & Class History',
  '## 12. Progress Tracker',
  '## 13. Current Goals',
  '## 14. Vocabulary Bank',
  '## 15. Grammar & Accuracy Overview',
  '## 16. Teacher Feedback & Growth Priorities',
  '## 17. Class Reports',
  '## 18. Recommended Next Steps',
  '## 19. PRIME DIGITAL HUB',
]

const allowedProgressStates = new Set(['Strong', 'Improving', 'Needs Focus', 'Not Assessed'])

for (const file of files) {
  const content = await readFile(path.join(portfolioDir, file), 'utf8')

  for (const section of requiredSections) {
    assert.ok(content.includes(section), `${file}: missing required family portfolio section ${section}`)
  }

  for (const pattern of forbidden) {
    assert.ok(!pattern.test(content), `${file}: internal implementation language leaked: ${pattern}`)
  }

  assert.ok(
    content.includes('### Resumo para o aluno e a família'),
    `${file}: family/student first-read summary is required`
  )

  const trackerBlock = content.split('## 12. Progress Tracker')[1]?.split('## 13. Current Goals')[0] ?? ''
  for (const line of trackerBlock.split('\n')) {
    if (!line.startsWith('|') || line.includes('---') || line.includes('Estado')) continue
    const cells = line.split('|').map((cell) => cell.trim()).filter(Boolean)
    if (cells.length >= 2) {
      assert.ok(
        allowedProgressStates.has(cells[1]),
        `${file}: unauthorized learner-facing progress label ${cells[1]}`
      )
    }
  }

  const manifestEntry = manifest.learners.find((entry) => entry.output.endsWith(file))
  assert.ok(manifestEntry, `${file}: missing manifest entry`)
  assert.ok(manifestEntry.externalPortfolio, `${file}: missing external portfolio destination reference`)

  const source = JSON.parse(await readFile(path.join(ROOT, manifestEntry.sourceSnapshot), 'utf8'))
  const expectedReports = Array.isArray(source.classReports) ? source.classReports.length : 0
  const renderedReports = [...content.matchAll(/^### Aula \d+ — /gm)].length
  assert.equal(
    renderedReports,
    expectedReports,
    `${file}: class-report history must match the current supervised source snapshot`
  )
}

console.log(
  `Family portfolio supervision self-test: PASS — ${files.length} active learner editions, plain-language guard, frozen progress labels, complete report history.`
)
