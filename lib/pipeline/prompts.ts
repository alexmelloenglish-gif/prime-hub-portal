import type {
  ClassReportOutput,
  CoachingGuidanceOutput,
  LessonTranscriptInput,
  PortfolioPatchOutput,
  PromptOneOutput,
  PromptTwoInput,
} from './contracts'

const CANONICAL_CONTRACT = `
PROMPT 1 OFFICIAL — AI LESSON EXTRACTION AND PROPOSAL — LOCKED

Você está na etapa de extração e organização de dados da aula.
Observe, extraia, organize, correlacione e proponha. Não autorize, valide, publique,
execute, comitte, preserve nem altere estado canônico.

Você NÃO pode validar Evidence, validar Learning Signals, publicar Teacher Insights,
aprovar decisões, executar ações educacionais, alterar SER, Learning Journey ou
Institutional Memory. Não declare Domain Events como ocorridos.

Cada Evidence Candidate deve possuir student_id, lesson_id, source_transcript_id,
source_span, content e provenance rastreável. Todo Learning Signal Proposal precisa
de pelo menos uma Evidence Reference. Toda Teacher Insight Proposal deve conter
is_official=false, requires_human_review=true e author_type=ai.

Presença somente pode ser utilizada quando vier de attendance_source autorizada;
nunca infira presença pelo transcript. Use null, array vazio ou proposed quando não
houver comprovação. Uma suggested_domain_transition nunca é uma transição realizada.
A saída deve ser exatamente artifact_status=draft, authority_status=non_authoritative,
implementation_status=not_proven, sem mutação canônica.
`

const PROMPT_TWO_CONTRACT = `
PROMPT 2 — CLASS REPORT GENERATION — CANONICAL / LOCKED v2.0

Você está na camada de apresentação student-facing do PRIME.
Transforme somente dados educacionais autorizados em um Class Report claro, fiel,
compreensível e auditável. O Class Report é uma projeção documental, não uma fonte
 de verdade do domínio.

Apresente como fato somente aquilo que estiver explicitamente marcado como autorizado,
validado, persistido, publicado ou fornecido como fato de domínio. Evidence Candidates,
Learning Signals propostos/detectados, Teacher Insights em draft, decisões não validadas,
ações não executadas, SER não autorizado e mudanças de Learning Journey não podem ser
apresentados como fatos oficiais.

Teacher Insight somente pode ser apresentado como oficial quando o input contiver
teacher_insight.state=InsightPublished e a confirmação canônica correspondente.
Action Steps, Homework e Practice Suggestions são recomendações student-facing; nunca
os chame de EducationalAction ou EducationalActionExecuted sem registro autorizado.
Não infira presença, progresso, mudança de nível, MaterialChange, atualização de
portfólio ou qualquer mutação de domínio. Não crie estados ou eventos.

Preserve autoria, sourceReferences, reportId, lessonId, studentId, generatedAt,
promptVersion=prompt-2.v2.0, projectionVersion e authorityStatus=non_authoritative.
A saída é uma projeção idempotente e versionável.
`

function buildRequest(system: string, input: unknown, contract = CANONICAL_CONTRACT): string {
  return `${system}\n\n${contract}\n\nENTRADA JSON:\n${JSON.stringify(input)}`
}

async function invokeJson<T>(system: string, input: unknown, fallback: T, contract = CANONICAL_CONTRACT): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'
  const model = process.env.PRIME_PIPELINE_MODEL || 'gpt-4o-mini'
  if (!apiKey) return fallback

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: buildRequest('', input, contract) },
      ],
    }),
  })
  if (!response.ok) return fallback
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = payload.choices?.[0]?.message?.content
  if (!content) return fallback
  try {
    return JSON.parse(content) as T
  } catch {
    return fallback
  }
}

function fallbackPromptOne(input: LessonTranscriptInput, transcriptId: string): PromptOneOutput {
  const studentId = input.studentId || input.studentEmail
  const attendanceSource = input.attendanceSource || 'unknown'
  return {
    schema_version: 'phase-b-prompt-1.v3',
    artifact_status: 'draft',
    authority_status: 'non_authoritative',
    implementation_status: 'not_proven',
    lesson_input: {
      lesson_id: input.lessonId,
      student_id: studentId,
      student_name: input.studentName,
      teacher_id: input.teacherId,
      teacher_name: input.teacherName,
      transcript_id: transcriptId,
      program: input.program,
      class_date: input.classDate,
      effective_at: input.effectiveAt,
      recorded_at: input.recordedAt,
      attendance_status: input.attendanceStatus || 'unknown',
      attendance_source: attendanceSource,
    },
    lesson_observations: [],
    evidence_candidates: [],
    evidence_references: [],
    learning_signal_proposals: [],
    teacher_insight_proposals: [],
    presentation_candidates: {
      class_report_facts: [],
      vocabulary_candidates: [],
      grammar_focus_candidates: [],
    },
    domain_transition_requests: [],
    official_actions: [],
    ser_update: {
      requested: false,
      reason: 'No canonical mutation is authorized in Prompt 1.',
      new_ser_version_created: false,
    },
    learning_journey_update: {
      requested: false,
      reason: 'No official Learning Journey transition is authorized in Prompt 1.',
    },
    institutional_memory_update: {
      requested: false,
      reason: 'Institutional preservation requires its authorized service.',
    },
    traceability: {
      architecture_principles: ['AP-004', 'AP-005', 'AP-006', 'AP-008'],
      business_rules_candidates: ['BR-SIGNAL-001'],
      invariants_checked: [
        'INV-001: interpretations require traceable Evidence.',
        'INV-002: every Learning Signal Proposal requires an Evidence Reference.',
        'INV-012: AI recommendation does not replace human authority.',
        'INV-013: presentation is not domain truth.',
      ],
    },
  }
}

export async function runPromptOne(input: LessonTranscriptInput, transcriptId: string): Promise<PromptOneOutput> {
  return invokeJson<PromptOneOutput>(
    'PROMPT 1 — Generate only the official Phase B B1.1 v3 non-authoritative extraction artifact. Include observations, Evidence Candidates, Evidence References, Learning Signal Proposals, Teacher Insight Proposals and presentation candidates. Never emit a canonical mutation.',
    input,
    fallbackPromptOne(input, transcriptId),
  )
}

export async function runPromptTwo(input: PromptTwoInput): Promise<ClassReportOutput> {
  const context = input.report_context
  const publishedInsight = input.published_teacher_insight
  const evidence = input.validated_evidence
  const vocabulary = input.validated_learning_content.vocabulary
  const corrections = input.validated_learning_content.corrections
  const teacherInsightStatus = publishedInsight ? 'published' : 'omitted'
  const summary = input.authorized_facts.join(' ') || (evidence.length ? 'The lesson included validated learning content.' : 'Class report pending authorized source records.')
  const markdown = [
    `# Class Report — ${context.class_date || 'Lesson'}`,
    '',
    '## Lesson Summary',
    `- ${summary}`,
    evidence.length ? `- ${evidence.map((item) => item.content).join(' ')}` : '- No validated Evidence was supplied for this projection.',
    '',
    '## Action Steps',
    '- Review the authorized lesson content and practice the supplied examples.',
    publishedInsight ? '' : '## Lesson Observation\n\nThis section is based only on authorized lesson content; no published Teacher Insight was supplied.',
  ].filter(Boolean).join('\n')
  const fallback: ClassReportOutput = {
    reportId: context.report_id,
    lessonId: context.lesson_id,
    studentId: context.student_id,
    generatedAt: context.generated_at,
    promptVersion: 'prompt-2.v2.0',
    projectionVersion: 'projection-1',
    authorityStatus: 'non_authoritative',
    sourceReferences: [...evidence.map((item) => item.source_reference), ...corrections.flatMap((item) => item.evidence_ids)],
    title: 'Class Report',
    markdown,
    summary,
    evidenceHighlights: evidence.map((item) => item.content),
    grammarFocus: input.validated_learning_content.grammar_focus,
    vocabulary: vocabulary.map((item) => item.item),
    corrections: corrections.map((item) => ({ original: item.original, improved: item.improved, explanation: item.explanation, evidenceIds: item.evidence_ids })),
    homeworkRecommendation: 'Review the authorized lesson content and practice the supplied examples.',
    teacherInsight: publishedInsight?.text || null,
    teacherInsightStatus,
    sourceEvidenceIds: evidence.map((item) => item.evidence_id),
    documentStatus: 'draft',
    implementationStatus: 'not_proven',
  }
  return invokeJson<ClassReportOutput>(
    'PROMPT 2 — Produce only the student-facing Class Report projection. Respect source_status and never elevate proposal authority.',
    input,
    fallback,
    PROMPT_TWO_CONTRACT,
  )
}

export async function runPromptThree(input: {
  lesson: LessonTranscriptInput
  report: ClassReportOutput
  promptOne: PromptOneOutput
}): Promise<PortfolioPatchOutput> {
  const fallback: PortfolioPatchOutput = {
    operations: [
      {
        op: 'append_class_report',
        key: `${input.lesson.lessonId}:${input.lesson.transcriptId || 'current'}`,
        value: input.report,
        sourceIds: input.report.sourceEvidenceIds,
      },
    ],
    documentStatus: 'draft',
    implementationStatus: 'not_proven',
  }
  return invokeJson<PortfolioPatchOutput>(
    'PROMPT 3 — Produce only an idempotent PortfolioProjectionPatch. The portfolio is a read model, not domain truth. Attendance may be projected only from authorized metadata. Never rewrite the complete portfolio.',
    input,
    fallback,
  )
}

export async function runPromptFour(input: {
  lesson: LessonTranscriptInput
  report: ClassReportOutput
  promptOne: PromptOneOutput
  publishedTeacherInsight?: string
}): Promise<CoachingGuidanceOutput> {
  const fallback: CoachingGuidanceOutput = {
    studentSnapshot: [input.report.summary],
    topTeachingPriorities: input.promptOne.learning_signal_proposals.map((item) => ({
      text: item.signal,
      sourceIds: item.evidence_reference_ids,
    })),
    recurringErrorsToRecycle: [],
    vocabularyToRecycle: input.report.vocabulary,
    recommendedNextClassStrategy: input.report.homeworkRecommendation || 'Review the proposal with the teacher before selecting the next strategy.',
    suggestedHomeworkStrategy: input.report.homeworkRecommendation,
    teacherAlert: 'This is an AI recommendation and requires human review.',
    recommendationStatus: 'ai_proposed',
    requiresHumanReview: true,
  }
  return invokeJson<CoachingGuidanceOutput>(
    'PROMPT 4 — Produce internal teacher coaching only. Recommendations are non-binding and must not become a Pedagogical Decision, Educational Action, SER or Learning Journey update.',
    input,
    fallback,
  )
}
