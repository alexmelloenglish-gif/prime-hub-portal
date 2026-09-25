import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const REGISTRY_PATH = path.join(ROOT, 'data/students/student-core-registry.json')
const OUTPUT_DIR = path.join(ROOT, 'docs/student-portfolios/family-edition')
const STUDENTS_DIR = path.join(ROOT, 'data/students')

const TECHNICAL_REPLACEMENTS = [
  [/current-state update before the next projection change/gi, 'Current learning check before the next update'],
  [/source-integrity reconstruction/gi, 'confirmed lesson record'],
  [/learner model/gi, 'learning picture'],
  [/without needing the dashboard to manufacture a progress claim/gi, 'while keeping the focus on meaningful communication rather than labels'],
  [/the dashboard now preserves/gi, 'The current learning record preserves'],
  [/the dashboard now uses/gi, 'The current learning record uses'],
  [/dashboard exposes only the current actionable projection/gi, 'this edition highlights the priorities that matter most now'],
  [/\bcanonical\b/gi, 'confirmed'],
  [/\bauthoritative\b/gi, 'confirmed'],
  [/\bprojection\b/gi, 'learning update'],
  [/\bpipeline\b/gi, 'learning process'],
  [/\brepository\b/gi, 'learning record'],
  [/\bfirestore\b/gi, 'learning record'],
  [/\bprisma\b/gi, 'learning system'],
  [/\bschema\b/gi, 'format'],
  [/\bruntime\b/gi, 'system'],
  [/\bsourceFileId\b/gi, 'source reference'],
  [/\bvalidationTask\b/gi, 'teacher review'],
  [/\bauthorityStatus\b/gi, 'review status'],
  [/\bidempotenc\w*\b/gi, 'duplicate-safe processing'],
  [/\bteacher-validated\b/gi, 'confirmed by the teacher'],
  [/\bportfolio-confirmed\b/gi, 'confirmed in the learning record'],
  [/\bqualified\b/gi, 'ready for the next cycle'],
  [/\bnon_authoritative\b/gi, 'draft'],
  [/\bvNext\b/gi, 'current'],
  [/\bG[1-6]\b/g, 'learning-system check'],
]

const FORBIDDEN_INTERNAL_TERMS = [
  'canonical',
  'projection',
  'pipeline',
  'repository',
  'firestore',
  'prisma',
  'schema',
  'runtime',
  'sourcefileid',
  'validationtask',
  'authoritystatus',
  'idempotenc',
  'non_authoritative',
  'teacher-validated',
  'portfolio-confirmed',
  'vnext',
]

function cleanText(value, fallback = '') {
  if (typeof value !== 'string') return fallback
  let text = value.trim()
  for (const [pattern, replacement] of TECHNICAL_REPLACEMENTS) {
    text = text.replace(pattern, replacement)
  }
  return text
}

function list(value) {
  return Array.isArray(value) ? value : []
}

function obj(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeProgressStatus(value) {
  const status = cleanText(value)
  const normalized = status.toLowerCase()
  if (['strong', 'very strong', 'secure', 'established'].includes(normalized)) return 'Strong'
  if (['improving', 'active growth', 'developing', 'progressing'].includes(normalized)) return 'Improving'
  if (['needs focus', 'needs attention', 'priority'].includes(normalized)) return 'Needs Focus'
  return 'Not Assessed'
}

function linkLabel(link) {
  const id = String(link?.id ?? '').toLowerCase()
  if (id.includes('portfolio')) return 'Meu Portfólio'
  if (id.includes('class') || id.includes('meet')) return 'Entrar na aula ao vivo'
  if (id.includes('material')) return 'Materiais de aula'
  if (id.includes('homework')) return 'Atividades'
  if (id.includes('calendar') || id.includes('schedule')) return 'Agenda de aulas'
  if (id.includes('support')) return 'Suporte PRIME'
  return cleanText(link?.title, 'Recurso de aprendizagem')
}

function markdownTable(headers, rows) {
  if (!rows.length) return '_Informação ainda não disponível no registro atual._'
  const esc = (value) => cleanText(String(value ?? '')).replace(/\|/g, '\\|').replace(/\n/g, ' ')
  return [
    `| ${headers.map(esc).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(esc).join(' | ')} |`),
  ].join('\n')
}

async function buildSnapshotIndex() {
  const index = new Map()
  const names = await readdir(STUDENTS_DIR)
  for (const name of names) {
    if (!name.endsWith('.json') || name === 'student-core-registry.json' || name === 'student-profile-assets.json') continue
    try {
      const fullPath = path.join(STUDENTS_DIR, name)
      const value = JSON.parse(await readFile(fullPath, 'utf8'))
      if (typeof value.studentId === 'string' && value.studentId.trim()) {
        index.set(value.studentId.trim(), {
          fullPath,
          relativePath: `data/students/${name}`,
        })
      }
    } catch {
      // Non-student JSON files are ignored by this studentId index.
    }
  }
  return index
}

function firstMeaningful(...values) {
  for (const value of values) {
    const text = cleanText(value)
    if (text) return text
  }
  return ''
}

function buildExecutiveSummary(student) {
  const reports = list(student.classReports)
  const focus = cleanText(student.focus, 'continuidade da aprendizagem de inglês')
  const changed = cleanText(obj(student.canonicalProjection).whatChanged?.summary)
  const nextAction = cleanText(obj(student.canonicalProjection).nextAction?.title)
  const count = reports.length
  const lessonPhrase = count === 1 ? '1 aula com relatório completo' : `${count} aulas com relatórios completos`
  return [
    `Este portfólio reúne ${lessonPhrase} e a memória de aprendizagem atualmente confirmada.`,
    `O foco atual é ${focus.charAt(0).toLowerCase()}${focus.slice(1)}.`,
    changed ? `O que ficou mais visível neste ciclo: ${changed}` : '',
    nextAction ? `Próximo passo: ${nextAction}.` : '',
  ].filter(Boolean).join(' ')
}

function buildPortfolio(student, registryEntry) {
  const projection = obj(student.canonicalProjection)
  const currentState = obj(projection.currentState)
  const whatChanged = obj(projection.whatChanged)
  const priorities = list(projection.priorities)
  const nextAction = obj(projection.nextAction)
  const attendance = list(student.attendanceOverview)
  const reports = list(student.classReports)
  const vocabulary = list(student.vocabularyBank)
  const grammar = obj(student.grammarOverview)
  const feedback = list(student.teacherFeedback)
  const progress = list(student.progressTracker)
  const goals = list(student.goals)
  const links = list(student.manageSpace)
  const impact = obj(student.cumulativeImpact)

  const strengths = progress
    .filter((item) => ['Strong', 'Improving'].includes(normalizeProgressStatus(item?.status)))
    .slice(0, 4)

  const familyBoundary = [
    'Este portfólio mostra apenas informações confirmadas e úteis para acompanhar a aprendizagem.',
    'Quando ainda não há evidência suficiente, o portfólio diz isso claramente em vez de preencher a lacuna por suposição.',
    'Uma aula pode consolidar, reativar ou aprofundar algo importante mesmo quando o nível registrado permanece o mesmo.',
  ].join(' ')

  const learningState = [
    firstMeaningful(currentState?.objective?.value, student.objective),
    firstMeaningful(currentState?.focus?.value, student.focus),
  ].filter(Boolean).join(' ')

  const patternsText = firstMeaningful(
    whatChanged.summary,
    feedback[0]?.body,
    'Ainda não há um padrão recorrente adicional que possa ser afirmado com segurança.'
  )

  const priorityRows = priorities.length
    ? priorities.map((item) => [
        cleanText(item?.title, 'Prioridade atual'),
        cleanText(item?.why, 'Mantida para o próximo ciclo.'),
      ])
    : goals.slice(0, 3).map((goal) => [
        cleanText(goal?.title, 'Meta atual'),
        cleanText(goal?.description, 'Mantida para o próximo ciclo.'),
      ])

  const attendanceRows = attendance.map((item) => [
    cleanText(item?.date, 'Data não informada'),
    cleanText(item?.title, cleanText(item?.summary, 'Aula registrada')),
    cleanText(item?.status, 'status não informado'),
  ])

  const vocabRows = vocabulary.map((item) => [
    cleanText(item?.term, item?.word ?? ''),
    cleanText(item?.meaning, 'Significado a revisar em aula.'),
    cleanText(item?.example, 'Exemplo a construir em contexto.'),
  ])

  const reportBlocks = reports.length
    ? reports.map((report, index) => {
        const focusItems = list(report?.focus).map((item) => cleanText(item)).filter(Boolean)
        const vocabItems = list(report?.vocabulary).map((item) => cleanText(item)).filter(Boolean)
        return [
          `### Aula ${index + 1} — ${cleanText(report?.date, 'data não informada')}`,
          `**Tema:** ${cleanText(report?.title, 'Aula de inglês')}`,
          '',
          cleanText(report?.summary, 'Resumo ainda não disponível.'),
          '',
          focusItems.length ? `**Foco da aula:** ${focusItems.join(' • ')}` : '',
          vocabItems.length ? `**Linguagem trabalhada:** ${vocabItems.join(' • ')}` : '',
          cleanText(report?.teacherInsight) ? `**Leitura do professor:** ${cleanText(report.teacherInsight)}` : '',
        ].filter(Boolean).join('\n')
      }).join('\n\n')
    : '_Ainda não há relatórios de aula disponíveis para esta edição._'

  const feedbackBlocks = feedback.length
    ? feedback.map((item) => `- **${cleanText(item?.title, 'Feedback do professor')}:** ${cleanText(item?.body)}`).join('\n')
    : '_Ainda não há um bloco de feedback acumulado disponível._'

  const progressRows = progress.map((item) => [
    cleanText(item?.title, 'Área de aprendizagem'),
    normalizeProgressStatus(item?.status),
    cleanText(item?.insight, 'Acompanhamento em andamento.'),
  ])

  const goalRows = goals.map((goal) => [
    cleanText(goal?.title, 'Meta'),
    cleanText(goal?.description, 'Continuidade da aprendizagem.'),
  ])

  const quickLinks = links
    .filter((link) => typeof link?.href === 'string' && link.href.trim())
    .map((link) => `- [${linkLabel(link)}](${link.href.trim()})`)
    .join('\n')

  const nextActionText = nextAction.title
    ? [
        `**${cleanText(nextAction.title)}**`,
        cleanText(nextAction.description),
        nextAction.outcome ? `**Resultado esperado:** ${cleanText(nextAction.outcome)}` : '',
      ].filter(Boolean).join('\n\n')
    : '_O próximo passo será definido pelo professor a partir da próxima evidência disponível._'

  const content = `# Student Learning Portfolio — ${cleanText(student.studentName, registryEntry.studentName)}

> **PRIME DIGITAL HUB**  
> Aprendizagem contínua, memória útil e próximos passos claros.

## 1. Student Learning Portfolio

**Aluno(a):** ${cleanText(student.studentName, registryEntry.studentName)}  
**Programa:** ${cleanText(student.program, 'Programa PRIME')}  
**Professor:** ${cleanText(student.teacherName, 'Alexandre Mello')}

### Resumo para o aluno e a família

${buildExecutiveSummary(student)}

## 2. Your Learning Snapshot

- **Nível atual:** ${cleanText(student.currentLevel, 'Ainda não definido')}
- **Objetivo de nível:** ${cleanText(student.targetLevel, 'Ainda não definido')}
- **Frequência de aulas:** ${cleanText(student.classFrequency, 'Ainda não confirmada')}
- **Foco atual:** ${cleanText(student.focus, 'Continuidade da aprendizagem de inglês')}
- **Presença registrada:** ${cleanText(student.attendanceRate, 'Ainda não consolidada')}

## 3. Quick Access

${quickLinks || '_Os links de aprendizagem disponíveis continuam acessíveis pelo Dashboard PRIME._'}

## 4. Estado atual de aprendizagem / Current Learning State

${learningState || cleanText(impact.summary, 'O estado atual continua sendo acompanhado a partir das aulas e do trabalho do professor.')}

## 5. Forças e evidências / Strengths & Evidence

${strengths.length ? strengths.map((item) => `- **${cleanText(item?.title)}:** ${cleanText(item?.insight)}`).join('\n') : '_As forças atuais continuarão sendo descritas à medida que houver evidência suficiente._'}

## 6. Padrões de aprendizagem / Learning Patterns

${patternsText}

## 7. Prioridade pedagógica atual / Current Pedagogical Priority

${markdownTable(['Prioridade', 'Por que importa agora'], priorityRows)}

## 8. Próxima ação e acompanhamento / Next Action & Follow-up

${nextActionText}

## 9. Memória pedagógica e próximo ciclo / Learning Memory & Next Cycle

${cleanText(impact.summary, 'As próximas aulas continuarão conectando o que já foi aprendido com novas oportunidades de uso do inglês.')}

## 10. Leitura para a família / Family Guide

${familyBoundary}

## 11. Attendance & Class History

${markdownTable(['Data', 'Aula / foco', 'Registro'], attendanceRows)}

## 12. Progress Tracker

${markdownTable(['Área', 'Estado', 'O que isso significa'], progressRows)}

## 13. Current Goals

${markdownTable(['Meta', 'Como aparece no próximo ciclo'], goalRows)}

## 14. Vocabulary Bank

${markdownTable(['Termo', 'Significado', 'Exemplo'], vocabRows)}

## 15. Grammar & Accuracy Overview

${cleanText(grammar.summary, 'A precisão gramatical continuará sendo acompanhada nas próximas aulas.')}

${list(grammar.focusPoints).length ? list(grammar.focusPoints).map((item) => `- ${cleanText(item)}`).join('\n') : '- Nenhum foco gramatical adicional precisa ser destacado nesta edição.'}

## 16. Teacher Feedback & Growth Priorities

${feedbackBlocks}

## 17. Class Reports

${reportBlocks}

## 18. Recommended Next Steps

${nextActionText}

## 19. PRIME DIGITAL HUB

**Your portfolio is designed to grow with every class.**
`

  return content
}

async function main() {
  const registry = JSON.parse(await readFile(REGISTRY_PATH, 'utf8'))
  const learners = list(registry.students).filter((student) =>
    student.operatingEligibility === 'learner' && student.profileStatus === 'active'
  )

  await mkdir(OUTPUT_DIR, { recursive: true })
  const snapshotIndex = await buildSnapshotIndex()

  const manifest = []
  for (const entry of learners) {
    const snapshot = snapshotIndex.get(entry.studentId)
    if (!snapshot) {
      throw new Error(`No student snapshot found for active learner ${entry.studentName} (${entry.studentId})`)
    }
    const student = JSON.parse(await readFile(snapshot.fullPath, 'utf8'))
    const outputName = `${slugify(entry.studentName)}-family-edition.md`
    const outputPath = path.join(OUTPUT_DIR, outputName)
    const content = buildPortfolio(student, entry)

    for (const term of FORBIDDEN_INTERNAL_TERMS) {
      if (content.toLowerCase().includes(term)) {
        throw new Error(
          `Student-facing portfolio for ${entry.studentName} still contains forbidden internal term: ${term}`,
        )
      }
    }

    await writeFile(outputPath, content, 'utf8')
    manifest.push({
      studentId: entry.studentId,
      studentName: entry.studentName,
      sourceSnapshot: snapshot.relativePath,
      output: `docs/student-portfolios/family-edition/${outputName}`,
      externalPortfolio: entry.links?.portfolio ?? null,
      classReportCount: list(student.classReports).length,
      generatedAt: new Date().toISOString(),
    })
  }

  await writeFile(
    path.join(OUTPUT_DIR, 'manifest.json'),
    JSON.stringify({
      version: 'family-portfolio-supervision-v1',
      learnerCount: manifest.length,
      learners: manifest,
    }, null, 2) + '\n',
    'utf8',
  )

  console.log(`Generated ${manifest.length} supervised family portfolio editions.`)
}

await main()
