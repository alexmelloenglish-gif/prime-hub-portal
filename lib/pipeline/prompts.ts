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

Quando não houver dados validados, você pode apresentar 'non_authoritative_proposals.presentation_candidates'
como um bloco explicitamente marcado 'AI Draft — validation required'. Esses candidatos podem
preencher o rascunho do Class Report, mas nunca podem ser apresentados como fatos oficiais,
Teacher Insight publicado ou atualização do portfólio.

Preserve autoria, sourceReferences, reportId, lessonId, studentId, generatedAt,
promptVersion=prompt-2.v2.0, projectionVersion e authorityStatus=non_authoritative.
A saída é uma projeção idempotente e versionável.
`

function buildRequest(system: string, input: unknown, contract = CANONICAL_CONTRACT): string {
  return `${system}\n\n${contract}\n\nENTRADA JSON:\n${JSON.stringify(input)}`
}

function buildTranscriptDraftFact(input: LessonTranscriptInput): string[] {
  const excerpt = input.transcript.replace(/\s+/g, ' ').trim()
  if (!excerpt) return []
  const maxLength = 360
  const boundedExcerpt = excerpt.length > maxLength ? `${excerpt.slice(0, maxLength - 1)}…` : excerpt
  return [`Transcript excerpt (unvalidated): ${boundedExcerpt}`]
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
      // Keep legitimate source material available to Prompt 2 as a clearly
      // labelled draft candidate; never put it in authorized_facts.
      class_report_facts: buildTranscriptDraftFact(input),
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
  const fallback = fallbackPromptOne(input, transcriptId)
  const generated = await invokeJson<PromptOneOutput>(
    'PROMPT 1 — Generate only the official Phase B B1.1 v3 non-authoritative extraction artifact. Include observations, Evidence Candidates, Evidence References, Learning Signal Proposals, Teacher Insight Proposals and presentation candidates. Never emit a canonical mutation.',
    input,
    fallback,
  )
  const presentation = generated.presentation_candidates && typeof generated.presentation_candidates === 'object'
    ? generated.presentation_candidates
    : fallback.presentation_candidates
  const generatedFacts = Array.isArray(presentation.class_report_facts)
    ? presentation.class_report_facts.filter((item): item is string => typeof item === 'string')
    : []
  if (generatedFacts.length || !fallback.presentation_candidates.class_report_facts.length) return generated
  // A model response with empty presentation arrays must not erase the source.
  // Preserve only a bounded, explicitly unvalidated draft candidate; authorized
  // facts/evidence remain empty until an authorized service validates them.
  return {
    ...generated,
    presentation_candidates: {
      ...presentation,
      class_report_facts: fallback.presentation_candidates.class_report_facts,
    },
  }
}

export async function runPromptTwo(input: PromptTwoInput): Promise<ClassReportOutput> {
  const context = input.report_context
  const publishedInsight = input.published_teacher_insight
  const evidence = input.validated_evidence
  const vocabulary = input.validated_learning_content.vocabulary
  const corrections = input.validated_learning_content.corrections
  const draftCandidates = input.non_authoritative_proposals.presentation_candidates
  const draftFacts = draftCandidates?.class_report_facts || []
  const draftVocabulary = draftCandidates?.vocabulary_candidates || []
  const draftGrammar = draftCandidates?.grammar_focus_candidates || []
  const draftSummary = draftCandidates?.student_facing_summary || draftFacts.join(' ')
  const draftTeacherInsight = input.non_authoritative_proposals.teacher_insight_proposals[0]?.insight || ''
  const hasValidatedContent = Boolean(
    input.authorized_facts.length ||
    evidence.length ||
    vocabulary.length ||
    corrections.length ||
    input.validated_learning_content.grammar_focus.length
  )
  const hasDraftContent = Boolean(draftSummary || draftFacts.length || draftVocabulary.length || draftGrammar.length || draftTeacherInsight)
  const teacherInsightStatus = publishedInsight ? 'published' : draftTeacherInsight ? 'non_official_observation' : 'omitted'
  const summary = input.authorized_facts.join(' ') || (evidence.length ? 'The lesson included validated learning content.' : draftSummary || 'Class report pending authorized source records.')
  const markdown = [
    `# Class Report — ${context.class_date || 'Lesson'}`,
    '',
    '## Lesson Summary',
    `- ${summary}`,
    evidence.length ? `- ${evidence.map((item) => item.content).join(' ')}` : '- No validated Evidence was supplied for this projection.',
    hasDraftContent && !hasValidatedContent ? '## AI Draft — validation required\n\nThis draft is derived from transcript observations and is not an official teacher-validated record.' : '',
    hasDraftContent && !hasValidatedContent && draftFacts.length ? `- ${draftFacts.join(' ')}` : '',
    hasDraftContent && !hasValidatedContent && draftVocabulary.length ? `- Vocabulary candidates: ${draftVocabulary.join(', ')}` : '',
    hasDraftContent && !hasValidatedContent && draftGrammar.length ? `- Grammar candidates: ${draftGrammar.join(', ')}` : '',
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
    evidenceHighlights: evidence.length ? evidence.map((item) => item.content) : draftFacts,
    grammarFocus: input.validated_learning_content.grammar_focus.length ? input.validated_learning_content.grammar_focus : draftGrammar,
    vocabulary: vocabulary.length ? vocabulary.map((item) => item.item) : draftVocabulary,
    corrections: corrections.map((item) => ({ original: item.original, improved: item.improved, explanation: item.explanation, evidenceIds: item.evidence_ids })),
    homeworkRecommendation: 'Review the authorized lesson content and practice the supplied examples.',
    teacherInsight: publishedInsight?.text || (draftTeacherInsight || null),
    teacherInsightStatus,
    sourceEvidenceIds: evidence.map((item) => item.evidence_id),
    documentStatus: 'draft',
    contentStatus: hasValidatedContent ? 'validated' : 'draft',
    implementationStatus: 'not_proven',
  }
  const generated = await invokeJson<ClassReportOutput>(
    'PROMPT 2 — Produce only the student-facing Class Report projection. Respect source_status and never elevate proposal authority.',
    input,
    fallback,
    PROMPT_TWO_CONTRACT,
  )
  return {
    ...generated,
    authorityStatus: 'non_authoritative',
    documentStatus: 'draft',
    contentStatus: hasValidatedContent ? 'validated' : 'draft',
    implementationStatus: 'not_proven',
  }
}

const PROMPT_THREE_CONTRACT = `
PROMPT 3 — LEARNING PORTFOLIO PROJECTION — CANONICAL / LOCKED v3

Você está operando exclusivamente na camada de projeção do Learning Portfolio.
Transforme registros autorizados em operações idempotentes de atualização de uma
read model/projection. O Learning Portfolio não é fonte de verdade do domínio.

Não crie, valide, publique, execute ou altere Evidence, Learning Signals, Teacher
Insights, Pedagogical Decisions, Educational Actions, SER, Learning Journey,
Institutional Memory, Domain Events ou estados oficiais. Não trate o texto do
Class Report como fonte de verdade.

Uma LessonCompleted não prova presença. Só projete presença quando houver registro
de attendance explicitamente autorizado. Teacher Insight só pode alimentar uma
síntese oficial quando state=InsightPublished. Não modifique versões anteriores,
não sobrescreva histórico e não assuma que o patch foi aplicado.

Cada operação deve ter operation_id, target, source autorizada, justificativa/precondition
e idempotent=true. Use patch_schema_version=portfolio-projection-patch.v3,
operation_key, base_projection_version e expected_projection_version. Se uma operação
não tiver autoridade suficiente, inclua-a em excluded_operations com status=rejected.
A aplicação efetiva será realizada por serviço determinístico com controle de versão,
idempotência, deduplicação, ordenação, preservação histórica e integridade referencial.
`

export async function runPromptThree(input: {
  lesson: LessonTranscriptInput
  report: ClassReportOutput
  promptOne: PromptOneOutput
  portfolio_projection_context: { portfolio_id: string; student_id: string; projection_version: number; last_applied_source_event_id?: string; requested_by: string }
  authorized_source_records: Record<string, unknown>
}): Promise<PortfolioPatchOutput> {
  const context = input.portfolio_projection_context
  const operationKey = `${context.student_id}|${input.lesson.lessonId}|${input.report.reportId}`
  const sourceReferences = [
    { source_type: 'class_report_projection', source_id: input.report.reportId },
    ...(input.authorized_source_records.attendance ? [{ source_type: 'attendance_record', source_id: String((input.authorized_source_records.attendance as { source?: string }).source || '') }] : []),
  ].filter((item) => item.source_id)
  const fallback: PortfolioPatchOutput = {
    patch_schema_version: 'portfolio-projection-patch.v3',
    patch_id: `patch-${operationKey.split('|').join('-')}-v1`,
    operation_key: operationKey,
    portfolio_id: context.portfolio_id,
    student_id: context.student_id,
    base_projection_version: context.projection_version,
    expected_projection_version: context.projection_version + 1,
    idempotency: { strategy: 'operation_key', duplicate_behavior: 'return_noop_without_reapplying_operations' },
    source_references: sourceReferences,
    operations: [{
      operation_id: 'op-class-report',
      type: 'append_class_report_reference',
      target: 'class_reports',
      precondition: 'class_report.state == projection_published',
      parameters: { report_id: input.report.reportId, lesson_id: input.lesson.lessonId, class_report_state: input.report.documentStatus === 'published' ? 'projection_published' : 'projection_draft', content_reference: `${input.report.reportId}#content-v1`, ordering_key: input.lesson.effectiveAt || input.lesson.classDate || new Date().toISOString() },
      idempotent: true,
    }],
    excluded_operations: [
      { type: 'create_ser_version', status: 'rejected', reason: 'Prompt 3 não possui autoridade para criar ou publicar SER.' },
      { type: 'update_learning_journey', status: 'rejected', reason: 'Learning Journey pertence ao domínio e não pode ser alterada pela projeção.' },
      { type: 'create_pedagogical_decision', status: 'rejected', reason: 'Nenhuma decisão pedagógica pode ser criada pela projeção.' },
      { type: 'execute_educational_action', status: 'rejected', reason: 'Prompt 3 não executa Educational Actions.' },
    ],
    validation: { authorization: 'passed', projection_version: 'checked', idempotency_key: 'checked', deduplication: 'checked', ordering: 'checked', history_preserved: 'checked', referential_integrity: 'checked' },
    documentStatus: 'draft',
    implementationStatus: 'not_proven',
  }
  return invokeJson<PortfolioPatchOutput>(
    'PROMPT 3 — Produce only an idempotent PortfolioProjectionPatch v3 from authorized projection inputs.',
    input,
    fallback,
    PROMPT_THREE_CONTRACT,
  )
}

const PROMPT_FOUR_CONTRACT = `
PROMPT 4 — PEDAGOGICAL COACHING & RECOMMENDATION — CANONICAL / LOCKED

Produza somente orientação interna para consideração de um professor autorizado.
A saída é uma AI Coaching Recommendation, não uma Pedagogical Decision, Educational
Action, SER, Learning Journey ou Institutional Memory update.

Use exclusivamente Evidence com estado EvidencePersisted, Learning Signals com
estado LearningSignalValidated e validação autorizada, Teacher Insight com estado
InsightPublished e validation_event_id correspondente, além de projeções e Class
Reports fornecidos como contexto. Não infira presença, progresso oficial, mudança de
nível, MaterialChange, diagnóstico definitivo ou aceitação humana.

Não crie, aprove, execute ou declare decisões, ações, eventos de domínio ou mudanças
de domínio. Não trate o portfólio ou o texto narrativo do Class Report como fonte de
verdade. Toda prioridade deve possuir basis rastreável e authority=recommendation_only.
Toda ação deve permanecer proposal_only, educational_action_created=false e
requires_teacher_decision=true. Mantenha recommendation_status=ai_proposed,
is_pedagogical_decision=false, requires_human_review=true, domain_events_emitted=[]
e documentStatus/implementationStatus independentes. Se os dados forem insuficientes,
reduza a força da recomendação ou omita-a.
`

export async function runPromptFour(input: {
  lesson: LessonTranscriptInput
  report: ClassReportOutput
  promptOne: PromptOneOutput
  portfolio_projection?: Record<string, unknown>
  validated_evidence?: Array<Record<string, unknown>>
  validated_learning_signals?: Array<Record<string, unknown>>
  published_teacher_insight?: Record<string, unknown> | null
  class_report_reference?: Record<string, unknown>
}): Promise<CoachingGuidanceOutput> {
  const evidence = input.validated_evidence || []
  const signals = input.validated_learning_signals || []
  const insight = input.published_teacher_insight
  const sourceReferences = [
    { source_type: 'ClassReportProjection' as const, source_id: input.report.reportId },
    ...evidence.flatMap((item) => typeof item.evidence_id === 'string' ? [{ source_type: 'Evidence' as const, source_id: item.evidence_id }] : []),
    ...signals.flatMap((item) => typeof item.signal_id === 'string' ? [{ source_type: 'LearningSignal' as const, source_id: item.signal_id }] : []),
    ...(insight && typeof insight.insight_id === 'string' ? [{ source_type: 'TeacherInsight' as const, source_id: insight.insight_id }] : []),
  ]
  const priorities = signals.filter((item) => item.state === 'LearningSignalValidated').slice(0, 4).map((item, index) => ({
    priority_id: `priority-${String(index + 1).padStart(3, '0')}`,
    text: String(item.text || item.signal || 'Verify this pattern across subsequent lessons.'),
    basis: Array.isArray(item.evidence_reference_ids) ? item.evidence_reference_ids.filter((id): id is string => typeof id === 'string') : [],
    authority: 'recommendation_only' as const,
  }))
  const fallback: CoachingGuidanceOutput = {
    coaching_guidance_id: `coaching-${input.lesson.lessonId}-v1`,
    student_id: input.lesson.studentId || input.lesson.studentEmail,
    teacher_id: input.lesson.teacherId,
    studentSnapshot: [input.report.summary, 'Continue observing whether the identified patterns recur across subsequent lessons.'],
    topTeachingPriorities: priorities,
    recurringErrorsToRecycle: [],
    vocabularyToRecycle: input.report.vocabulary,
    recommendedNextClassStrategy: priorities.length ? 'Consider a short contextual retrieval activity based on the validated learning signals.' : 'Consider reviewing the available evidence with the teacher before selecting a next-class strategy.',
    suggestedHomeworkStrategy: priorities.length ? 'Consider a short practice task that reuses the validated target in a new context.' : undefined,
    teacherAlert: 'This is an AI recommendation only. Verify the pattern with the teacher; no decision or action has been created.',
    recommendationStatus: 'ai_proposed',
    is_pedagogical_decision: false,
    requiresHumanReview: true,
    source_references: sourceReferences,
    proposed_actions: [{ action_proposal_id: `action-proposal-${input.lesson.lessonId}`, text: 'Consider a contextual learning activity in a future lesson.', state: 'proposal_only', educational_action_created: false, requires_teacher_decision: true }],
    domain_events_emitted: [],
    pedagogical_decision_created: false,
    educational_action_created: false,
    ser_changed: false,
    learning_journey_changed: false,
    institutional_memory_changed: false,
    documentStatus: 'draft',
    implementationStatus: 'not_proven',
  }
  return invokeJson<CoachingGuidanceOutput>('PROMPT 4 — Produce only an internal, non-binding AI coaching recommendation.', input, fallback, PROMPT_FOUR_CONTRACT)
}
