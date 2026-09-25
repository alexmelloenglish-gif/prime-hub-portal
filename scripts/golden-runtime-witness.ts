import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const STUDENT_ID = 'stu_4c4da6c04ac4'
const STUDENT_EMAIL = 'carolvdrummond@gmail.com'
const LESSON_ID = 'gustavo-golden-runtime-2026-09-25'
const TRANSCRIPT_ID = 'gustavo-golden-runtime-transcript-v1'
const SOURCE_FILE_ID = 'golden-runtime-disposable-source-2026-09-25'
const TEACHER_EMAIL = 'golden.teacher@invalid.test'
const FIXED_TIME = '2026-09-25T20:00:00.000Z'

function readPromptInput(body) {
  const text = body?.contents?.[0]?.parts?.[0]?.text || ''
  const marker = 'ENTRADA JSON:\n'
  const index = text.lastIndexOf(marker)
  if (index < 0) return {}
  return JSON.parse(text.slice(index + marker.length))
}

function promptOneFixture(input) {
  return {
    schema_version: 'phase-b-prompt-1.v3',
    artifact_status: 'draft',
    authority_status: 'non_authoritative',
    implementation_status: 'not_proven',
    lesson_input: {
      lesson_id: input.lessonId,
      student_id: input.studentId,
      student_name: input.studentName,
      teacher_id: input.teacherId,
      teacher_name: input.teacherName,
      transcript_id: input.transcriptId,
      program: input.program,
      class_date: input.classDate,
      effective_at: input.effectiveAt,
      recorded_at: input.recordedAt,
      attendance_status: input.attendanceStatus || 'unknown',
      attendance_source: input.attendanceSource || 'unknown',
    },
    lesson_observations: [{
      observation_id: 'obs-golden-1',
      source_span: 'Gustavo: No, I did not. I went to school and drank water.',
      observation: 'Gustavo repaired a past answer and reused irregular past forms in a personal sentence.',
      observation_type: 'language_use',
      evidence_candidate_ids: ['ev-golden-1'],
      confidence: 0.99,
    }],
    evidence_candidates: [{
      evidence_candidate_id: 'ev-golden-1',
      student_id: input.studentId,
      lesson_id: input.lessonId,
      source_transcript_id: input.transcriptId,
      source_span: 'Gustavo: No, I did not. I went to school and drank water.',
      content: 'Gustavo repaired a past answer and reused irregular past forms in a personal sentence.',
      evidence_type: 'observable_language_performance',
      provenance: {
        origin: 'runtime-witness-fixture',
        captured_at: FIXED_TIME,
        source_reference: SOURCE_FILE_ID,
      },
      candidate_status: 'proposed',
      requires_human_review: true,
      pedagogical_relevance_candidate: true,
    }],
    evidence_references: [{
      evidence_reference_id: 'eref-golden-1',
      evidence_candidate_id: 'ev-golden-1',
      relationship_type: 'supports',
    }],
    learning_signal_proposals: [{
      proposal_id: 'signal-golden-1',
      student_id: input.studentId,
      signal_type: 'past_simple_retrieval',
      signal: 'Past Simple retrieval is emerging across personal contexts.',
      evidence_reference_ids: ['eref-golden-1'],
      detection_rationale: 'The learner self-corrected and reused irregular past forms in one preserved transcript.',
      candidate_status: 'proposed',
      is_official: false,
      requires_human_review: true,
      confidence: 0.96,
    }],
    teacher_insight_proposals: [{
      insight_proposal_id: 'insight-golden-1',
      student_id: input.studentId,
      lesson_id: input.lessonId,
      insight: 'Preserve first-attempt evidence separately from the corrected final answer and verify retrieval again.',
      basis: 'One self-correction plus reuse of went and drank in the preserved transcript.',
      evidence_reference_ids: ['eref-golden-1'],
      is_official: false,
      requires_human_review: true,
      author_type: 'ai',
    }],
    presentation_candidates: {
      class_report_facts: ['Gustavo repaired a past answer and reused went and drank in a personal sentence.'],
      student_facing_summary: 'Gustavo practised Past Simple through a real personal example and corrected one answer.',
      vocabulary_candidates: ['retrieval', 'went', 'drank'],
      grammar_focus_candidates: ['Did + base form', 'Past Simple short answers'],
      homework_recommendation: {
        mode: 'short_retrieval',
        task: 'Tell one new past story and ask two did-questions.',
        is_official: false,
        requires_teacher_review: true,
      },
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
      invariants_checked: ['INV-001', 'INV-002', 'INV-012', 'INV-013'],
    },
  }
}

function promptTwoFixture(input) {
  const context = input.report_context
  const evidence = input.validated_evidence || []
  const candidateEvidence = input.non_authoritative_proposals?.evidence_candidates || []
  const sourceEvidenceIds = evidence.length
    ? evidence.map((item) => item.evidence_id)
    : candidateEvidence.map((item) => item.evidence_candidate_id)
  const evidenceHighlights = evidence.length
    ? evidence.map((item) => item.content)
    : candidateEvidence.map((item) => item.content)
  const sourceReferences = evidence.length
    ? evidence.map((item) => item.source_reference)
    : candidateEvidence.map((item) => item.provenance?.source_reference).filter(Boolean)
  return {
    reportId: context.report_id,
    lessonId: context.lesson_id,
    studentId: context.student_id,
    generatedAt: context.generated_at,
    promptVersion: 'prompt-2.v2.0',
    projectionVersion: 'projection-1',
    authorityStatus: 'non_authoritative',
    sourceReferences,
    title: 'Golden Runtime Class Report',
    markdown: '# Golden Runtime Class Report\n\nGustavo repaired a past answer and reused irregular past forms in a personal sentence.\n\nNext: retrieve the same pattern in a new story.',
    summary: 'Gustavo repaired a past answer and reused irregular past forms in a meaningful personal sentence.',
    evidenceHighlights: evidenceHighlights.length
      ? evidenceHighlights
      : ['Gustavo repaired a past answer and reused irregular past forms in a personal sentence.'],
    grammarFocus: ['Did + base form', 'Past Simple short answers'],
    vocabulary: ['retrieval', 'went', 'drank'],
    corrections: [{
      original: 'Did you rode?',
      improved: 'Did you ride?',
      explanation: 'Use the base form after did.',
      evidenceIds: sourceEvidenceIds,
    }],
    homeworkRecommendation: 'Tell one real past story and ask two did-questions.',
    teacherInsight: null,
    teacherInsightStatus: 'omitted',
    sourceEvidenceIds,
    documentStatus: 'draft',
    contentStatus: 'validated',
    implementationStatus: 'not_proven',
  }
}

function promptThreeFixture(input) {
  const context = input.portfolio_projection_context
  const report = input.report
  return {
    patch_schema_version: 'portfolio-projection-patch.v3',
    patch_id: 'patch-gustavo-golden-runtime-v1',
    operation_key: `${context.student_id}|${input.lesson.lessonId}|${report.reportId}`,
    portfolio_id: context.portfolio_id,
    student_id: context.student_id,
    base_projection_version: context.projection_version,
    expected_projection_version: context.projection_version + 1,
    idempotency: {
      strategy: 'operation_key',
      duplicate_behavior: 'return_noop_without_reapplying_operations',
    },
    source_references: [{
      source_type: 'class_report_projection',
      source_id: report.reportId,
    }],
    operations: [
      {
        operation_id: 'op-golden-report',
        type: 'append_class_report_reference',
        target: 'class_reports',
        precondition: 'class_report.state == projection_published',
        parameters: {
          report_id: report.reportId,
          lesson_id: input.lesson.lessonId,
          class_report_state: 'projection_published',
          content_reference: `${report.reportId}#content-v1`,
          ordering_key: FIXED_TIME,
        },
        idempotent: true,
      },
      {
        operation_id: 'op-golden-vocabulary',
        type: 'merge_unique_vocabulary_item',
        target: 'vocabulary',
        parameters: {
          item: 'retrieval',
          normalized_key: 'retrieval',
          meaning: 'remembering and producing language again',
        },
        idempotent: true,
      },
    ],
    excluded_operations: [{
      type: 'create_ser_version',
      status: 'rejected',
      reason: 'Projection cannot create SER state.',
    }],
    validation: {
      authorization: 'passed',
      projection_version: 'checked',
      idempotency_key: 'checked',
      deduplication: 'checked',
      ordering: 'checked',
      history_preserved: 'checked',
      referential_integrity: 'checked',
    },
    documentStatus: 'draft',
    implementationStatus: 'not_proven',
  }
}

function promptFourFixture(input) {
  return {
    coaching_guidance_id: 'coaching-gustavo-golden-runtime-v1',
    student_id: input.lesson.studentId,
    teacher_id: input.lesson.teacherId,
    studentSnapshot: [
      'Gustavo repaired a Past Simple answer and reused went and drank.',
      'Independent retrieval should be checked again in a new context.',
    ],
    topTeachingPriorities: [{
      priority_id: 'priority-golden-1',
      text: 'Verify Past Simple retrieval before giving a model.',
      basis: ['ev-golden-1'],
      authority: 'recommendation_only',
    }],
    recurringErrorsToRecycle: [{
      text: 'Did + base form',
      sourceIds: ['ev-golden-1'],
    }],
    vocabularyToRecycle: ['retrieval', 'went', 'drank'],
    recommendedNextClassStrategy: 'Ask for a new real past story, wait for first-attempt retrieval, then contrast Do and Did.',
    suggestedHomeworkStrategy: 'Tell one short past story and write two did-questions.',
    teacherAlert: 'Recommendation only; Teacher Authority is required before canonical publication.',
    recommendationStatus: 'ai_proposed',
    is_pedagogical_decision: false,
    requiresHumanReview: true,
    source_references: [{
      source_type: 'ClassReportProjection',
      source_id: input.report.reportId,
    }],
    proposed_actions: [{
      action_proposal_id: 'action-golden-1',
      text: 'Golden retrieval check — Tell one real past story, ask two did-questions and retry one answer independently.',
      state: 'proposal_only',
      educational_action_created: false,
      requires_teacher_decision: true,
    }],
    domain_events_emitted: [],
    pedagogical_decision_created: false,
    educational_action_created: false,
    ser_changed: false,
    learning_journey_changed: false,
    institutional_memory_changed: false,
    documentStatus: 'draft',
    implementationStatus: 'not_proven',
  }
}

globalThis.fetch = async (_url, init = {}) => {
  const request = JSON.parse(String(init.body || '{}'))
  const system = request?.systemInstruction?.parts?.[0]?.text || ''
  const input = readPromptInput(request)
  let output
  if (system.includes('PROMPT 1')) output = promptOneFixture(input)
  else if (system.includes('PROMPT 2')) output = promptTwoFixture(input)
  else if (system.includes('PROMPT 3')) output = promptThreeFixture(input)
  else if (system.includes('PROMPT 4')) output = promptFourFixture(input)
  else throw new Error(`Unexpected network call in runtime witness: ${system.slice(0, 80)}`)

  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: JSON.stringify(output) }] } }],
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

async function main() {
process.env.GOOGLE_AI_STUDIO_API_KEY = 'runtime-witness-mocked-provider'
process.env.PRIME_PIPELINE_MODEL = 'runtime-witness-deterministic'
delete process.env.FIREBASE_PROJECT_ID
delete process.env.FIREBASE_CLIENT_EMAIL
delete process.env.FIREBASE_PRIVATE_KEY

const [{ executeSharedLearningMachine }, { reviewPipelineRun }, { getPrismaClient }, { mergeCanonicalLearningIntelligenceRows }] = await Promise.all([
  import('../lib/learning-machine/shared-runner.ts'),
  import('../lib/pipeline/run.ts'),
  import('../lib/prisma.ts'),
  import('../lib/canonical-dashboard-bridge.ts'),
])

const prisma = getPrismaClient()
const teacher = await prisma.user.upsert({
  where: { email: TEACHER_EMAIL },
  update: { role: 'teacher', name: 'Golden Runtime Teacher' },
  create: {
    email: TEACHER_EMAIL,
    role: 'teacher',
    name: 'Golden Runtime Teacher',
  },
})

const transcript = {
  lessonId: LESSON_ID,
  studentEmail: STUDENT_EMAIL,
  studentId: STUDENT_ID,
  studentName: 'Gustavo Drummond de Andrade Salgado',
  teacherId: teacher.id,
  teacherName: 'Golden Runtime Teacher',
  program: 'English Learning — Golden Runtime Witness',
  classDate: '2026-09-25',
  transcriptId: TRANSCRIPT_ID,
  transcript: [
    'Teacher: Did you go to school yesterday?',
    'Gustavo: I do not... No, I did not.',
    'Teacher: Tell me one thing you did.',
    'Gustavo: I went to school and drank water.',
  ].join('\n'),
  source: 'google_meet',
  effectiveAt: FIXED_TIME,
  recordedAt: FIXED_TIME,
  attendanceStatus: 'attended',
  attendanceSource: 'runtime_witness_fixture',
  metadata: {
    sourceFileId: SOURCE_FILE_ID,
    sourceMimeType: 'application/vnd.google-apps.document',
    triageStatus: 'usable_transcript',
    witness: 'isolated_disposable_postgres',
  },
}

const first = await executeSharedLearningMachine({
  triggerOrigin: 'manual',
  requestedBy: teacher.id,
  transcript,
})

assert.equal(first.duplicate, false)
assert.equal(first.status, 'awaiting_publication_review')
assert.ok(first.reviewTaskId, 'Shared machine must create a publication Teacher Authority task')

const runBeforeApproval = await prisma.pipelineRun.findUnique({
  where: { id: first.pipelineRunId },
  include: { reviewTasks: true, transcript: true },
})
assert.ok(runBeforeApproval)
assert.equal(runBeforeApproval.executionMode, 'shared_learning_machine')
assert.equal(runBeforeApproval.resumePoint, 'awaiting_teacher_authority')
assert.equal(runBeforeApproval.reviewTasks.length, 1)

const approval = await reviewPipelineRun({
  pipelineRunId: first.pipelineRunId,
  decision: 'approved',
  reason: 'Golden runtime witness: explicit isolated Teacher Authority approval.',
  reviewerId: teacher.id,
})
assert.equal(approval.status, 'completed')

const run = await prisma.pipelineRun.findUnique({
  where: { id: first.pipelineRunId },
  include: {
    reviewTasks: true,
    transcript: true,
  },
})
assert.ok(run)
assert.equal(run.status, 'completed')
assert.equal(run.authorityStatus, 'teacher_authorized')
assert.ok(run.completedAt)
assert.ok(run.finalManifest)

const authorityTask = run.reviewTasks.find((item) => item.id === first.reviewTaskId)
assert.ok(authorityTask)
assert.equal(authorityTask.decision, 'approved')
assert.equal(authorityTask.stage, 'completed')
assert.equal(authorityTask.reviewerId, teacher.id)
assert.ok(authorityTask.reviewedAt)

const authorityEvent = await prisma.pipelineEvent.findUnique({
  where: {
    pipelineRunId_eventType_aggregateId: {
      pipelineRunId: run.id,
      eventType: 'PublicationReviewApproved',
      aggregateId: authorityTask.id,
    },
  },
})
assert.ok(authorityEvent)
assert.ok(authorityEvent.payload && typeof authorityEvent.payload === 'object')
assert.ok(authorityEvent.payload.canonicalAuthorityPayloadHash)

const canonicalRecords = await prisma.canonicalLearningRecord.findMany({
  where: { pipelineRunId: run.id },
  orderBy: { canonicalVersion: 'asc' },
})
assert.equal(canonicalRecords.length, 1)
const canonical = canonicalRecords[0]

const g3Rows = await prisma.canonicalLearningRecordVerification.findMany({
  where: { expectedCanonicalRecordId: canonical.canonicalRecordId },
})
assert.equal(g3Rows.length, 1)
assert.equal(g3Rows[0].verificationStatus, 'PASS')

const g4Rows = await prisma.canonicalLearningRecordProjection.findMany({
  where: { canonicalRecordId: canonical.canonicalRecordId, targetType: 'portfolio' },
})
assert.equal(g4Rows.length, 1)
assert.equal(g4Rows[0].projectionStatus, 'VERIFIED')

const g5Rows = await prisma.canonicalLearningIntelligenceProjection.findMany({
  where: { canonicalRecordId: canonical.canonicalRecordId, targetType: 'learning_intelligence' },
})
assert.equal(g5Rows.length, 1)
assert.equal(g5Rows[0].projectionStatus, 'VERIFIED')

const classReports = await prisma.classReportProjection.findMany({
  where: { pipelineRunId: run.id },
})
assert.equal(classReports.length, 1)
assert.equal(classReports[0].documentStatus, 'published')
assert.equal(classReports[0].implementationStatus, 'proven')

const portfolio = await prisma.portfolioProjection.findUnique({
  where: {
    studentEmail_projectionKey: {
      studentEmail: STUDENT_EMAIL,
      projectionKey: 'student-dashboard',
    },
  },
})
assert.ok(portfolio)

const publicationEvent = await prisma.pipelineEvent.findFirst({
  where: { pipelineRunId: run.id, eventType: 'ClassReportProjectionPublished' },
  orderBy: { createdAt: 'asc' },
})
assert.ok(publicationEvent)
assert.ok(publicationEvent.createdAt.getTime() <= run.completedAt.getTime())

const baseStudent = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'data/students/carolvdrummond-gmail-com.firestore.json'),
    'utf8',
  ),
)

const [verifiedIntelligenceRows, verifiedPortfolioRows] = await Promise.all([
  prisma.canonicalLearningIntelligenceProjection.findMany({
    where: {
      studentId: STUDENT_ID,
      targetType: 'learning_intelligence',
      projectionStatus: 'VERIFIED',
    },
    orderBy: [{ createdAt: 'asc' }, { projectionId: 'asc' }],
    select: {
      canonicalRecordId: true,
      lessonId: true,
      scopeType: true,
      projection: true,
      createdAt: true,
      verifiedAt: true,
    },
  }),
  prisma.canonicalLearningRecordProjection.findMany({
    where: {
      studentId: STUDENT_ID,
      targetType: 'portfolio',
      projectionStatus: 'VERIFIED',
    },
    select: { canonicalRecordId: true },
  }),
])

const verifiedPortfolioRecordIds = new Set(
  verifiedPortfolioRows.map((row) => row.canonicalRecordId),
)
const fullyVerifiedRows = verifiedIntelligenceRows.filter((row) =>
  verifiedPortfolioRecordIds.has(row.canonicalRecordId)
)
assert.equal(fullyVerifiedRows.length, 1)
assert.equal(fullyVerifiedRows[0].canonicalRecordId, canonical.canonicalRecordId)

const dashboardStudent = mergeCanonicalLearningIntelligenceRows(
  baseStudent,
  fullyVerifiedRows,
)
assert.equal(dashboardStudent.studentId, STUDENT_ID)
assert.equal(dashboardStudent.currentLevel, 'CEFR A1 — progressing toward A2')
assert.ok(dashboardStudent.canonicalProjection.priorities.length > 0)
assert.equal(dashboardStudent.canonicalProjection.nextAction?.title, 'Golden retrieval check')
assert.equal(dashboardStudent.canonicalProjection.nextAction?.authorizationStatus, 'teacher-validated')
assert.equal(
  dashboardStudent.vocabularyBank.some((item) => item.term.toLowerCase() === 'retrieval'),
  true,
)

const countsBeforeReplay = {
  pipelineRuns: await prisma.pipelineRun.count({ where: { lessonId: LESSON_ID, studentEmail: STUDENT_EMAIL } }),
  canonical: await prisma.canonicalLearningRecord.count({ where: { pipelineRunId: run.id } }),
  g3: await prisma.canonicalLearningRecordVerification.count({ where: { expectedCanonicalRecordId: canonical.canonicalRecordId } }),
  g4: await prisma.canonicalLearningRecordProjection.count({ where: { canonicalRecordId: canonical.canonicalRecordId } }),
  g5: await prisma.canonicalLearningIntelligenceProjection.count({ where: { canonicalRecordId: canonical.canonicalRecordId } }),
  classReports: await prisma.classReportProjection.count({ where: { pipelineRunId: run.id } }),
}

const replay = await executeSharedLearningMachine({
  triggerOrigin: 'automatic',
  requestedBy: 'runtime-witness-automatic-trigger',
  transcript,
})
assert.equal(replay.pipelineRunId, run.id)
assert.equal(replay.duplicate, true)

const countsAfterReplay = {
  pipelineRuns: await prisma.pipelineRun.count({ where: { lessonId: LESSON_ID, studentEmail: STUDENT_EMAIL } }),
  canonical: await prisma.canonicalLearningRecord.count({ where: { pipelineRunId: run.id } }),
  g3: await prisma.canonicalLearningRecordVerification.count({ where: { expectedCanonicalRecordId: canonical.canonicalRecordId } }),
  g4: await prisma.canonicalLearningRecordProjection.count({ where: { canonicalRecordId: canonical.canonicalRecordId } }),
  g5: await prisma.canonicalLearningIntelligenceProjection.count({ where: { canonicalRecordId: canonical.canonicalRecordId } }),
  classReports: await prisma.classReportProjection.count({ where: { pipelineRunId: run.id } }),
}
assert.deepEqual(countsAfterReplay, countsBeforeReplay)
assert.equal(countsAfterReplay.pipelineRuns, 1)

const triggerEvents = await prisma.pipelineEvent.findMany({
  where: { pipelineRunId: run.id, eventType: 'LearningMachineTriggerObserved' },
  orderBy: { createdAt: 'asc' },
})
assert.ok(triggerEvents.length >= 1)

const evidence = {
  verdict: 'GOLDEN RUNTIME WITNESS PASS',
  database: 'GitHub Actions disposable PostgreSQL service',
  productionTouched: false,
  fixture: {
    studentId: STUDENT_ID,
    studentEmail: STUDENT_EMAIL,
    lessonId: LESSON_ID,
    transcriptId: TRANSCRIPT_ID,
  },
  pipelineRun: {
    id: run.id,
    normalizedRunIdentity: run.normalizedRunIdentity,
    executionMode: run.executionMode,
    status: run.status,
    resumePoint: run.resumePoint,
    authorityStatus: run.authorityStatus,
    completedAt: run.completedAt.toISOString(),
    finalManifest: run.finalManifest,
  },
  teacherAuthority: {
    reviewTaskId: authorityTask.id,
    reviewerId: authorityTask.reviewerId,
    reviewedAt: authorityTask.reviewedAt?.toISOString(),
    approvalHash: authorityEvent.payload.canonicalAuthorityPayloadHash,
  },
  canonical: {
    canonicalRecordId: canonical.canonicalRecordId,
    canonicalVersion: canonical.canonicalVersion,
    canonicalHash: canonical.canonicalHash,
    readBackVerification: g3Rows[0].verificationStatus,
    portfolioProjection: g4Rows[0].projectionStatus,
    learningIntelligenceProjection: g5Rows[0].projectionStatus,
  },
  learnerProducts: {
    classReportId: classReports[0].reportId,
    classReportStatus: classReports[0].documentStatus,
    portfolioProjectionVersion: portfolio.version,
    publicationBeforeCompletion: publicationEvent.createdAt.getTime() <= run.completedAt.getTime(),
  },
  dashboard: {
    currentLevel: dashboardStudent.currentLevel,
    priorityCount: dashboardStudent.canonicalProjection.priorities.length,
    nextActionTitle: dashboardStudent.canonicalProjection.nextAction?.title,
    nextActionAuthorizationStatus: dashboardStudent.canonicalProjection.nextAction?.authorizationStatus,
    canonicalVocabularyVisible: dashboardStudent.vocabularyBank.some((item) => item.term.toLowerCase() === 'retrieval'),
    note: 'Canonical payload contained no learner-state or priority transition, so existing teacher-validated state/priorities were correctly preserved while canonical Next Action and memory enrichment became visible.',
  },
  idempotency: {
    replayTrigger: 'automatic',
    replayReturnedDuplicate: replay.duplicate,
    samePipelineRunId: replay.pipelineRunId === run.id,
    countsBeforeReplay,
    countsAfterReplay,
  },
}

fs.mkdirSync(path.join(process.cwd(), 'artifacts'), { recursive: true })
fs.writeFileSync(
  path.join(process.cwd(), 'artifacts', 'golden-runtime-witness.json'),
  JSON.stringify(evidence, null, 2) + '\n',
)
console.log(JSON.stringify(evidence, null, 2))
await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
