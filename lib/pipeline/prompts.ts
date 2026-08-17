import type {
  ClassReportOutput,
  CoachingGuidanceOutput,
  LessonTranscriptInput,
  PortfolioPatchOutput,
  PromptOneOutput,
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

function buildRequest(system: string, input: unknown): string {
  return `${system}\n\n${CANONICAL_CONTRACT}\n\nENTRADA JSON:\n${JSON.stringify(input)}`
}

async function invokeJson<T>(system: string, input: unknown, fallback: T): Promise<T> {
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
        { role: 'user', content: buildRequest('', input) },
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

export async function runPromptTwo(input: {
  lesson: LessonTranscriptInput
  promptOne: PromptOneOutput
  publishedTeacherInsight?: string
}): Promise<ClassReportOutput> {
  const fallback: ClassReportOutput = {
    title: 'Class Report',
    summary: input.promptOne.presentation_candidates.class_report_facts.join(' ') || 'Class report pending teacher review.',
    evidenceHighlights: input.promptOne.evidence_candidates.map((item) => item.content),
    grammarFocus: input.promptOne.presentation_candidates.grammar_focus_candidates,
    vocabulary: input.promptOne.presentation_candidates.vocabulary_candidates,
    homeworkRecommendation: input.promptOne.presentation_candidates.homework_recommendation?.task,
    teacherInsight: input.publishedTeacherInsight || null,
    sourceEvidenceIds: input.promptOne.evidence_candidates.map((item) => item.evidence_candidate_id),
    documentStatus: 'draft',
    implementationStatus: 'not_proven',
  }
  return invokeJson<ClassReportOutput>(
    'PROMPT 2 — Produce a student-facing Class Report projection only. Use supplied non-authoritative facts and authorized published insight when present. Do not claim official progress, attendance, decision, action or SER change.',
    input,
    fallback,
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
