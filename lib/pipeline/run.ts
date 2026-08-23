import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import { runPromptFour, runPromptOne, runPromptThree, runPromptTwo } from './prompts'
import type {
  CoachingGuidanceOutput,
  ClassReportOutput,
  LessonTranscriptInput,
  PipelineResult,
  PortfolioPatchOutput,
  PromptOneOutput,
  PromptTwoInput,
} from './contracts'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function getStableSourceFileId(input: LessonTranscriptInput): string | undefined {
  const metadata = asRecord(input.metadata)
  return asOptionalString(metadata.sourceFileId)
}

function createIdempotencyKey(input: LessonTranscriptInput): string {
  const sourceFileId = getStableSourceFileId(input)
  if (sourceFileId) return `drive:${sourceFileId}`
  return `${normalizeEmail(input.studentEmail)}:${input.lessonId}:${input.transcriptId || input.externalMeetingId || 'transcript'}`
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

function safeArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function asAttendanceStatus(value: unknown): LessonTranscriptInput['attendanceStatus'] {
  return value === 'attended' || value === 'missed' || value === 'cancelled' || value === 'rescheduled' ? value : 'unknown'
}

function buildStoredInputMetadata(input: LessonTranscriptInput): Prisma.InputJsonValue {
  return {
    ...(input.metadata || {}),
    _pipelineInput: {
      studentId: input.studentId ?? null,
      studentName: input.studentName ?? null,
      teacherId: input.teacherId ?? null,
      teacherName: input.teacherName ?? null,
      program: input.program ?? null,
      classDate: input.classDate ?? null,
      transcriptId: input.transcriptId ?? null,
      source: input.source ?? 'google_meet',
      effectiveAt: input.effectiveAt ?? null,
      recordedAt: input.recordedAt ?? null,
      attendanceStatus: input.attendanceStatus ?? 'unknown',
      attendanceSource: input.attendanceSource ?? null,
      externalMeetingId: input.externalMeetingId ?? null,
    },
  } as Prisma.InputJsonValue
}

function rebuildInput(run: { studentEmail: string; lessonId: string }, transcript: { externalId: string | null; content: string; source: string; effectiveAt: Date | null; recordedAt: Date | null; metadata: Prisma.JsonValue | null }): LessonTranscriptInput {
  const metadata = asRecord(transcript.metadata)
  const stored = asRecord(metadata._pipelineInput)
  const source = stored.source === 'manual_upload' || stored.source === 'api' ? stored.source : transcript.source === 'manual_upload' || transcript.source === 'api' ? transcript.source : 'google_meet'
  return {
    lessonId: run.lessonId,
    studentEmail: normalizeEmail(run.studentEmail),
    studentId: asOptionalString(stored.studentId),
    studentName: asOptionalString(stored.studentName),
    teacherId: asOptionalString(stored.teacherId),
    teacherName: asOptionalString(stored.teacherName),
    program: asOptionalString(stored.program),
    classDate: asOptionalString(stored.classDate),
    transcriptId: asOptionalString(stored.transcriptId) || transcript.externalId || undefined,
    transcript: transcript.content,
    source,
    effectiveAt: asOptionalString(stored.effectiveAt) || transcript.effectiveAt?.toISOString(),
    recordedAt: asOptionalString(stored.recordedAt) || transcript.recordedAt?.toISOString(),
    attendanceStatus: asAttendanceStatus(stored.attendanceStatus),
    attendanceSource: asOptionalString(stored.attendanceSource),
    externalMeetingId: asOptionalString(stored.externalMeetingId),
    metadata,
  }
}

// ---------------------------------------------------------------------------
// Trusted-source heuristic
// A run is trusted (no identity gate) when:
//   1. Prompt 1 declared authority_status === 'authoritative', OR
//   2. Source is google_meet with valid Drive provenance (sourceFileId present)
// Any other combination goes to the identity review queue as before.
// ---------------------------------------------------------------------------
function isTrustedSource(input: LessonTranscriptInput, authorityStatus: string): boolean {
  if (authorityStatus === 'authoritative') return true
  if (input.source === 'google_meet' && !!getStableSourceFileId(input)) return true
  return false
}

// ---------------------------------------------------------------------------
// Publication policy
// Normal (non-high-risk) runs are auto-published.
// A run requires human publication review when coaching marks it as a
// pedagogical decision that also requires human review.
// ---------------------------------------------------------------------------
function shouldRequirePublicationReview(coaching: CoachingGuidanceOutput): boolean {
  return coaching.is_pedagogical_decision
}

async function persistPromptOne(runId: string, transcriptId: string, promptOne: PromptOneOutput) {
  const prisma = getPrismaClient()
  await prisma.$transaction(async (tx) => {
    for (const candidate of promptOne.evidence_candidates) {
      await tx.evidenceCandidate.upsert({
        where: { transcriptId_candidateKey: { transcriptId, candidateKey: candidate.evidence_candidate_id } },
        update: {
          sourceSpan: candidate.source_span,
          observation: candidate.content,
          category: candidate.evidence_type,
          state: candidate.candidate_status,
          requiresReview: candidate.requires_human_review,
        },
        create: {
          transcriptId,
          candidateKey: candidate.evidence_candidate_id,
          sourceSpan: candidate.source_span,
          observation: candidate.content,
          category: candidate.evidence_type,
          state: candidate.candidate_status,
          requiresReview: candidate.requires_human_review,
        },
      })
    }
    for (const signal of promptOne.learning_signal_proposals) {
      await tx.learningSignalProposal.upsert({
        where: { pipelineRunId_proposalKey: { pipelineRunId: runId, proposalKey: signal.proposal_id } },
        update: {
          signal: signal.signal,
          rationale: signal.detection_rationale,
          evidenceIds: signal.evidence_reference_ids,
          proposedState: signal.candidate_status,
          requiresReview: signal.requires_human_review,
        },
        create: {
          pipelineRunId: runId,
          proposalKey: signal.proposal_id,
          signal: signal.signal,
          rationale: signal.detection_rationale,
          evidenceIds: signal.evidence_reference_ids,
          proposedState: signal.candidate_status,
          requiresReview: signal.requires_human_review,
        },
      })
    }
    for (const insight of promptOne.teacher_insight_proposals) {
      await tx.teacherInsightProposal.upsert({
        where: { pipelineRunId: runId },
        update: {
          text: insight.insight,
          evidenceIds: insight.evidence_reference_ids,
          signalIds: [],
          authorType: insight.author_type,
          isOfficial: false,
          requiresReview: true,
          status: 'proposed',
        },
        create: {
          pipelineRunId: runId,
          text: insight.insight,
          evidenceIds: insight.evidence_reference_ids,
          signalIds: [],
          authorType: insight.author_type,
          isOfficial: false,
          requiresReview: true,
          status: 'proposed',
        },
      })
    }
    await tx.pipelineEvent.upsert({
      where: { pipelineRunId_eventType_aggregateId: { pipelineRunId: runId, eventType: 'Prompt1ArtifactCreated', aggregateId: transcriptId } },
      update: { payload: { schemaVersion: promptOne.schema_version, authorityStatus: promptOne.authority_status, candidateCount: promptOne.evidence_candidates.length } },
      create: {
        pipelineRunId: runId,
        eventType: 'Prompt1ArtifactCreated',
        aggregateType: 'Prompt1Artifact',
        aggregateId: transcriptId,
        payload: { schemaVersion: promptOne.schema_version, authorityStatus: promptOne.authority_status, candidateCount: promptOne.evidence_candidates.length },
      },
    })
  })
}

async function applyPortfolioPatch(input: LessonTranscriptInput, runId: string, patch: Awaited<ReturnType<typeof runPromptThree>>) {
  const prisma = getPrismaClient()
  const projectionKey = 'student-dashboard'
  return prisma.$transaction(async (tx) => {
    const current = await tx.portfolioProjection.findUnique({
      where: { studentEmail_projectionKey: { studentEmail: normalizeEmail(input.studentEmail), projectionKey } },
    })
    const currentVersion = current?.version || 0
    const currentState = current?.projection && typeof current.projection === 'object' && !Array.isArray(current.projection)
      ? current.projection as Record<string, unknown>
      : {}
    const appliedKeys = Array.isArray(currentState.appliedOperationKeys) ? currentState.appliedOperationKeys.filter((key): key is string => typeof key === 'string') : []
    if (appliedKeys.includes(patch.operation_key)) return { status: 'duplicate_ignored' as const, version: currentVersion }
    if (currentVersion !== patch.base_projection_version) return { status: 'version_rejected' as const, version: currentVersion }

    const next: Record<string, unknown> = {
      ...currentState,
      classReports: { ...(currentState.classReports && typeof currentState.classReports === 'object' && !Array.isArray(currentState.classReports) ? currentState.classReports as Record<string, unknown> : {}) },
      attendedClasses: Array.isArray(currentState.attendedClasses) ? [...currentState.attendedClasses] : [],
      vocabulary: { ...(currentState.vocabulary && typeof currentState.vocabulary === 'object' && !Array.isArray(currentState.vocabulary) ? currentState.vocabulary as Record<string, unknown> : {}) },
      corrections: { ...(currentState.corrections && typeof currentState.corrections === 'object' && !Array.isArray(currentState.corrections) ? currentState.corrections as Record<string, unknown> : {}) },
      appliedOperationKeys: [...appliedKeys, patch.operation_key],
    }
    for (const operation of patch.operations) {
      const parameters = operation.parameters
      if (operation.type === 'append_class_report_reference') {
        if (parameters.class_report_state !== 'projection_published') continue
        const reportId = String(parameters.report_id)
        ;(next.classReports as Record<string, unknown>)[reportId] = parameters
      }
      if (operation.type === 'append_unique_date') {
        const key = String(parameters.deduplication_key || parameters.date)
        if (!(next.attendedClasses as unknown[]).some((entry) => typeof entry === 'object' && entry !== null && (entry as Record<string, unknown>).deduplication_key === key)) next.attendedClasses = [...(next.attendedClasses as unknown[]), parameters]
      }
      if (operation.type === 'merge_unique_vocabulary_item') (next.vocabulary as Record<string, unknown>)[String(parameters.normalized_key || parameters.item)] = parameters
      if (operation.type === 'merge_unique_correction') (next.corrections as Record<string, unknown>)[String(parameters.normalized_key || parameters.original)] = parameters
      if (operation.type === 'conditional_update_projection') next[operation.target] = parameters
      if (operation.type === 'upsert_attendance_projection') next.attendance = parameters
    }
    const nextVersion = patch.expected_projection_version
    if (current) {
      const updated = await tx.portfolioProjection.updateMany({
        where: { id: current.id, version: currentVersion },
        data: { projection: next as Prisma.InputJsonValue, sourceRunId: runId, version: nextVersion },
      })
      if (updated.count !== 1) return { status: 'version_rejected' as const, version: currentVersion }
    } else {
      await tx.portfolioProjection.create({
        data: { studentEmail: normalizeEmail(input.studentEmail), projectionKey, projection: next as Prisma.InputJsonValue, sourceRunId: runId, version: nextVersion },
      })
    }
    return { status: 'applied' as const, version: nextVersion }
  })
}

// ---------------------------------------------------------------------------
// continueAfterReview
// Runs Prompts 2-4, persists artifacts.
// After Prompt 4:
//   - Normal path  → calls publishAfterReview internally (no human gate)
//   - Exception    → creates publication_review_required task as before
// ---------------------------------------------------------------------------
async function continueAfterReview(runId: string, normalizedInput: LessonTranscriptInput, transcriptId: string, promptOne: PromptOneOutput): Promise<{ report: ClassReportOutput; coaching: CoachingGuidanceOutput }> {
  const prisma = getPrismaClient()
  const promptTwoInput: PromptTwoInput = {
    report_context: {
      lesson_id: normalizedInput.lessonId,
      student_id: normalizedInput.studentId || normalizedInput.studentEmail,
      student_name: normalizedInput.studentName,
      teacher_id: normalizedInput.teacherId,
      teacher_name: normalizedInput.teacherName,
      program: normalizedInput.program,
      class_date: normalizedInput.classDate,
      attendance_status: normalizedInput.attendanceStatus,
      attendance_source: normalizedInput.attendanceSource,
      transcript_id: normalizedInput.transcriptId || transcriptId,
      report_id: `class-report-${normalizedInput.lessonId}`,
      effective_at: normalizedInput.effectiveAt,
      generated_at: new Date().toISOString(),
    },
    source_status: {
      lesson_status: 'LessonCompleted',
      evidence_status: null,
      evidence_classification_status: null,
      evidence_persistence_status: null,
      teacher_insight_status: null,
      pedagogical_decision_status: null,
      educational_action_status: null,
      ser_status: null,
    },
    authorized_facts: [],
    validated_evidence: [],
    published_teacher_insight: null,
    non_authoritative_proposals: {
      evidence_candidates: promptOne.evidence_candidates,
      learning_signal_proposals: promptOne.learning_signal_proposals,
      teacher_insight_proposals: promptOne.teacher_insight_proposals,
    },
    validated_learning_content: {
      vocabulary: [],
      corrections: [],
      grammar_focus: [],
      questions: [],
    },
  }
  const report = await runPromptTwo(promptTwoInput)
  await prisma.classReportProjection.upsert({
    where: { studentEmail_lessonId: { studentEmail: normalizedInput.studentEmail, lessonId: normalizedInput.lessonId } },
    update: {
      pipelineRunId: runId,
      studentId: report.studentId,
      generatedAt: new Date(report.generatedAt),
      promptVersion: report.promptVersion,
      projectionVersion: report.projectionVersion,
      sourceReferences: report.sourceReferences as unknown as Prisma.InputJsonValue,
      content: report as unknown as Prisma.InputJsonValue,
      documentStatus: report.documentStatus,
      implementationStatus: report.implementationStatus,
    },
    create: {
      pipelineRunId: runId,
      reportId: report.reportId,
      studentEmail: normalizedInput.studentEmail,
      studentId: report.studentId,
      lessonId: normalizedInput.lessonId,
      generatedAt: new Date(report.generatedAt),
      promptVersion: report.promptVersion,
      projectionVersion: report.projectionVersion,
      sourceReferences: report.sourceReferences as unknown as Prisma.InputJsonValue,
      sourceSnapshot: promptTwoInput as unknown as Prisma.InputJsonValue,
      content: report as unknown as Prisma.InputJsonValue,
      documentStatus: report.documentStatus,
      implementationStatus: report.implementationStatus,
    },
  })
  const currentPortfolio = await prisma.portfolioProjection.findUnique({
    where: { studentEmail_projectionKey: { studentEmail: normalizedInput.studentEmail, projectionKey: 'student-dashboard' } },
  })
  const projectionVersion = currentPortfolio?.version || 0
  const patch = await runPromptThree({
    lesson: normalizedInput,
    report,
    promptOne,
    portfolio_projection_context: {
      portfolio_id: currentPortfolio?.id || `portfolio-${normalizedInput.studentEmail}`,
      student_id: normalizedInput.studentId || normalizedInput.studentEmail,
      projection_version: projectionVersion,
      last_applied_source_event_id: undefined,
      requested_by: 'portfolio-projection-service',
    },
    authorized_source_records: {
      lesson: { lesson_id: normalizedInput.lessonId, state: 'LessonCompleted', source_event: 'LessonCompleted', source_event_id: `evt-lesson-completed-${normalizedInput.lessonId}` },
      ...(normalizedInput.attendanceSource && normalizedInput.attendanceStatus !== 'unknown' ? { attendance: { attendance_status: normalizedInput.attendanceStatus, source: normalizedInput.attendanceSource, is_authorized: true } } : {}),
      class_report: { report_id: report.reportId, lesson_id: report.lessonId, state: report.documentStatus === 'published' ? 'projection_published' : 'projection_draft', content_reference: `${report.reportId}#content-v1`, generated_at: report.generatedAt },
    },
  })
  await prisma.pipelineRun.update({ where: { id: runId }, data: { promptThreeSchemaVersion: patch.patch_schema_version, promptThreeArtifact: patch as unknown as Prisma.InputJsonValue, portfolioPatchId: patch.patch_id, portfolioApplyStatus: 'pending_publication' } })
  const coaching = await runPromptFour({
    lesson: normalizedInput,
    report,
    promptOne,
    portfolio_projection: currentPortfolio?.projection && typeof currentPortfolio.projection === 'object' && !Array.isArray(currentPortfolio.projection) ? currentPortfolio.projection as Record<string, unknown> : undefined,
    validated_evidence: [],
    validated_learning_signals: [],
    published_teacher_insight: null,
    class_report_reference: { report_id: report.reportId, state: report.documentStatus === 'published' ? 'projection_published' : 'projection_draft', content_reference: `${report.reportId}#content-v1` },
  })
  await prisma.coachingGuidance.upsert({
    where: { pipelineRunId: runId },
    update: { studentEmail: normalizedInput.studentEmail, studentId: coaching.student_id, teacherId: coaching.teacher_id, content: coaching, recommendationStatus: coaching.recommendationStatus, isPedagogicalDecision: coaching.is_pedagogical_decision, requiresHumanReview: coaching.requiresHumanReview, sourceReferences: coaching.source_references as unknown as Prisma.InputJsonValue, documentStatus: coaching.documentStatus, implementationStatus: coaching.implementationStatus },
    create: { pipelineRunId: runId, studentEmail: normalizedInput.studentEmail, studentId: coaching.student_id, teacherId: coaching.teacher_id, content: coaching, recommendationStatus: coaching.recommendationStatus, isPedagogicalDecision: coaching.is_pedagogical_decision, requiresHumanReview: coaching.requiresHumanReview, sourceReferences: coaching.source_references as unknown as Prisma.InputJsonValue, documentStatus: coaching.documentStatus, implementationStatus: coaching.implementationStatus },
  })

  // Publication policy: exception path only
  if (shouldRequirePublicationReview(coaching)) {
    const publicationTask = await createReviewTask(runId, normalizedInput, 'publication_review_required')
    await prisma.pipelineEvent.createMany({ data: [
      { pipelineRunId: runId, eventType: 'ClassReportProjectionDrafted', aggregateType: 'ClassReportProjection', aggregateId: normalizedInput.lessonId, payload: { documentStatus: report.documentStatus, requiresHumanReview: true, publicationReviewTaskId: publicationTask.id } },
      { pipelineRunId: runId, eventType: 'PortfolioProjectionPatchProposed', aggregateType: 'PortfolioProjection', aggregateId: normalizedInput.studentEmail, payload: { operationCount: patch.operations.length, patchId: patch.patch_id, operationKey: patch.operation_key, applyStatus: 'pending_publication_review' } },
      { pipelineRunId: runId, eventType: 'AIRecommendationGenerated', aggregateType: 'CoachingGuidance', aggregateId: runId, payload: { recommendationStatus: coaching.recommendationStatus, isPedagogicalDecision: coaching.is_pedagogical_decision, requiresHumanReview: coaching.requiresHumanReview } },
    ], skipDuplicates: true })
    return { report, coaching }
  }

  // Normal path: auto-publish without human gate
  await prisma.pipelineEvent.createMany({ data: [
    { pipelineRunId: runId, eventType: 'ClassReportProjectionDrafted', aggregateType: 'ClassReportProjection', aggregateId: normalizedInput.lessonId, payload: { documentStatus: report.documentStatus, requiresHumanReview: false, autoPublish: true } },
    { pipelineRunId: runId, eventType: 'PortfolioProjectionPatchProposed', aggregateType: 'PortfolioProjection', aggregateId: normalizedInput.studentEmail, payload: { operationCount: patch.operations.length, patchId: patch.patch_id, operationKey: patch.operation_key, applyStatus: 'pending_auto_publish' } },
    { pipelineRunId: runId, eventType: 'AIRecommendationGenerated', aggregateType: 'CoachingGuidance', aggregateId: runId, payload: { recommendationStatus: coaching.recommendationStatus, isPedagogicalDecision: coaching.is_pedagogical_decision, requiresHumanReview: false } },
  ], skipDuplicates: true })
  // Publish directly — synthetic task id keeps the same code path in publishAfterReview
  await publishAfterReview(runId, normalizedInput, `auto-publish-${runId}`, 'system', 'auto-publish: trusted source, non-pedagogical-decision')
  return { report, coaching }
}

async function publishAfterReview(runId: string, normalizedInput: LessonTranscriptInput, reviewTaskId: string, reviewerId: string, reason?: string): Promise<{ report: ClassReportOutput; coaching?: CoachingGuidanceOutput }> {
  const prisma = getPrismaClient()
  const projection = await prisma.classReportProjection.findUnique({
    where: { studentEmail_lessonId: { studentEmail: normalizedInput.studentEmail, lessonId: normalizedInput.lessonId } },
  })
  const coachingProjection = await prisma.coachingGuidance.findUnique({ where: { pipelineRunId: runId } })
  const run = await prisma.pipelineRun.findUnique({ where: { id: runId }, select: { promptThreeArtifact: true, portfolioPatchId: true } })
  if (!projection || !run) throw new Error('Draft publication artifacts not found')
  const report = asRecord(projection.content) as unknown as ClassReportOutput
  const patch = asRecord(run.promptThreeArtifact) as unknown as PortfolioPatchOutput
  if (!report.reportId || report.documentStatus !== 'draft' || !patch.patch_id || !Array.isArray(patch.operations)) throw new Error('Draft publication artifacts are invalid or already published')

  const publishedReport: ClassReportOutput = { ...report, documentStatus: 'published', implementationStatus: 'not_proven' }
  await prisma.classReportProjection.update({
    where: { id: projection.id },
    data: { content: publishedReport as unknown as Prisma.InputJsonValue, documentStatus: 'published', implementationStatus: 'not_proven' },
  })
  const publishedPatch: PortfolioPatchOutput = {
    ...patch,
    operations: patch.operations.map((operation) => operation.type === 'append_class_report_reference'
      ? { ...operation, parameters: { ...operation.parameters, class_report_state: 'projection_published' } }
      : operation),
    documentStatus: 'draft',
    implementationStatus: 'not_proven',
  }
  const portfolioApply = await applyPortfolioPatch(normalizedInput, runId, publishedPatch)
  if (portfolioApply.status === 'version_rejected') throw new Error('Portfolio projection version conflict; publication was not applied')

  await prisma.pipelineRun.update({ where: { id: runId }, data: { status: 'completed', completedAt: new Date(), promptThreeArtifact: publishedPatch as unknown as Prisma.InputJsonValue, portfolioApplyStatus: portfolioApply.status } })

  // Only update the ReviewTask record when this was triggered by a real human review task
  const isHumanReview = !reviewTaskId.startsWith('auto-publish-')
  if (isHumanReview) {
    await prisma.reviewTask.update({ where: { id: reviewTaskId }, data: { decision: 'approved', reviewerId, reviewedAt: new Date(), reason: reason?.trim() || null, stage: 'completed' } })
  }

  await prisma.pipelineEvent.createMany({ data: [
    { pipelineRunId: runId, eventType: 'ClassReportProjectionPublished', aggregateType: 'ClassReportProjection', aggregateId: projection.reportId, payload: { reviewerId, reviewTaskId, documentStatus: 'published', reason: reason || null, autoPublished: !isHumanReview } },
    { pipelineRunId: runId, eventType: 'PortfolioProjectionUpdated', aggregateType: 'PortfolioProjection', aggregateId: normalizedInput.studentEmail, payload: { reviewerId, reviewTaskId, patchId: publishedPatch.patch_id, operationKey: publishedPatch.operation_key, applyStatus: portfolioApply.status, projectionVersion: portfolioApply.version } },
  ], skipDuplicates: true })
  return { report: publishedReport, coaching: coachingProjection?.content as CoachingGuidanceOutput | undefined }
}

async function createReviewTask(runId: string, input: LessonTranscriptInput, stage: 'identity_review_required' | 'publication_review_required') {
  const prisma = getPrismaClient()
  const task = await prisma.reviewTask.upsert({
    where: { pipelineRunId_stage: { pipelineRunId: runId, stage } },
    update: {
      studentEmail: normalizeEmail(input.studentEmail),
      lessonId: input.lessonId,
    },
    create: {
      pipelineRunId: runId,
      studentEmail: normalizeEmail(input.studentEmail),
      lessonId: input.lessonId,
      stage,
    },
  })
  await prisma.pipelineRun.update({ where: { id: runId }, data: { status: stage === 'identity_review_required' ? 'awaiting_review' : 'awaiting_publication_review', completedAt: null } })
  await prisma.pipelineEvent.upsert({
    where: { pipelineRunId_eventType_aggregateId: { pipelineRunId: runId, eventType: 'HumanReviewRequired', aggregateId: task.id } },
    update: { payload: { stage: task.stage, reviewTaskId: task.id, authorityStatus: 'non_authoritative' } },
    create: { pipelineRunId: runId, eventType: 'HumanReviewRequired', aggregateType: 'ReviewTask', aggregateId: task.id, payload: { stage: task.stage, reviewTaskId: task.id, authorityStatus: 'non_authoritative' } },
  })
  return task
}

export async function processLessonTranscript(input: LessonTranscriptInput): Promise<PipelineResult> {
  const prisma = getPrismaClient()
  const normalizedInput = { ...input, studentEmail: normalizeEmail(input.studentEmail), source: input.source ?? 'google_meet' as const }
  const sourceFileId = getStableSourceFileId(normalizedInput)
  const idempotencyKey = createIdempotencyKey(normalizedInput)
  const existingBySourceFile = sourceFileId
    ? await prisma.transcript.findFirst({
        where: { sourceFileId, source: 'google_meet' },
        include: { pipelineRun: true },
      })
    : null
  if (existingBySourceFile && existingBySourceFile.pipelineRun.studentEmail !== normalizedInput.studentEmail) {
    throw new Error('sourceFileId is already bound to a different student')
  }
  const existing = existingBySourceFile?.pipelineRun || await prisma.pipelineRun.findUnique({ where: { idempotencyKey } })
  if (existing?.status === 'completed') {
    const storedReport = await prisma.classReportProjection.findUnique({ where: { studentEmail_lessonId: { studentEmail: normalizedInput.studentEmail, lessonId: normalizedInput.lessonId } } })
    const storedCoaching = await prisma.coachingGuidance.findUnique({ where: { pipelineRunId: existing.id } })
    return {
      pipelineRunId: existing.id,
      status: existing.status,
      duplicate: true,
      report: (storedReport?.content || undefined) as PipelineResult['report'],
      coaching: (storedCoaching?.content || undefined) as PipelineResult['coaching'],
    }
  }
  if (existing?.status === 'awaiting_review') {
    const task = await prisma.reviewTask.findFirst({ where: { pipelineRunId: existing.id, stage: 'identity_review_required' } })
    return { pipelineRunId: existing.id, status: existing.status, duplicate: true, reviewTaskId: task?.id, nextReviewStage: task?.stage }
  }
  if (existing && existing.status !== 'failed') {
    return { pipelineRunId: existing.id, status: existing.status, duplicate: true }
  }
  let run = existing
  if (!run) {
    try {
      run = await prisma.pipelineRun.create({ data: { idempotencyKey, studentEmail: normalizedInput.studentEmail, lessonId: normalizedInput.lessonId, status: 'received' } })
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error
      const concurrent = await prisma.pipelineRun.findUnique({ where: { idempotencyKey } })
      if (!concurrent) throw error
      if (concurrent.studentEmail !== normalizedInput.studentEmail) {
        throw new Error('idempotency key is already bound to a different student')
      }
      return { pipelineRunId: concurrent.id, status: concurrent.status, duplicate: true }
    }
  }
  try {
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'processing', errorCode: null, errorMessage: null } })
    const metadata = buildStoredInputMetadata(normalizedInput)
    const transcript = await prisma.transcript.upsert({
      where: { pipelineRunId: run.id },
      update: { sourceFileId: sourceFileId || null, content: normalizedInput.transcript, externalId: normalizedInput.transcriptId || normalizedInput.externalMeetingId, metadata, effectiveAt: normalizedInput.effectiveAt ? new Date(normalizedInput.effectiveAt) : null, recordedAt: normalizedInput.recordedAt ? new Date(normalizedInput.recordedAt) : null },
      create: { pipelineRunId: run.id, sourceFileId: sourceFileId || null, externalId: normalizedInput.transcriptId || normalizedInput.externalMeetingId, studentEmail: normalizedInput.studentEmail, lessonId: normalizedInput.lessonId, source: normalizedInput.source, content: normalizedInput.transcript, metadata, effectiveAt: normalizedInput.effectiveAt ? new Date(normalizedInput.effectiveAt) : null, recordedAt: normalizedInput.recordedAt ? new Date(normalizedInput.recordedAt) : null },
    })
    const promptOne = await runPromptOne(normalizedInput, transcript.id)
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { promptOneSchemaVersion: promptOne.schema_version, promptOneArtifact: promptOne as unknown as Prisma.InputJsonValue, authorityStatus: promptOne.authority_status } })
    await persistPromptOne(run.id, transcript.id, promptOne)

    // Identity check: trusted sources skip the identity review queue
    if (isTrustedSource(normalizedInput, promptOne.authority_status)) {
      const result = await continueAfterReview(run.id, normalizedInput, transcript.id, promptOne)
      // If continueAfterReview routed to publication_review_required (exception path), status is already updated
      const updatedRun = await prisma.pipelineRun.findUnique({ where: { id: run.id }, select: { status: true } })
      const finalStatus = updatedRun?.status || 'completed'
      if (finalStatus === 'awaiting_publication_review') {
        const publicationTask = await prisma.reviewTask.findFirst({ where: { pipelineRunId: run.id, stage: 'publication_review_required' } })
        return { pipelineRunId: run.id, status: finalStatus, duplicate: false, reviewTaskId: publicationTask?.id, nextReviewStage: publicationTask?.stage, report: result.report, coaching: result.coaching }
      }
      return { pipelineRunId: run.id, status: finalStatus, duplicate: false, report: result.report, coaching: result.coaching }
    }

    // Ambiguous identity: send to review queue (unchanged behaviour)
    const reviewTask = await createReviewTask(run.id, normalizedInput, 'identity_review_required')
    return { pipelineRunId: run.id, status: 'awaiting_review', duplicate: false, reviewTaskId: reviewTask.id, nextReviewStage: reviewTask.stage }
  } catch (error) {
    if (isUniqueConstraintError(error) && sourceFileId) {
      const concurrent = await prisma.pipelineRun.findUnique({ where: { idempotencyKey } })
      if (concurrent && concurrent.id !== run.id) {
        if (concurrent.studentEmail !== normalizedInput.studentEmail) {
          throw new Error('sourceFileId is already bound to a different student')
        }
        return { pipelineRunId: concurrent.id, status: concurrent.status, duplicate: true }
      }
    }
    const message = error instanceof Error ? error.message : 'Unknown pipeline failure'
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'failed', errorCode: 'PIPELINE_FAILED', errorMessage: message } })
    throw error
  }
}

export async function listPendingReviewTasks() {
  const prisma = getPrismaClient()
  const tasks = await prisma.reviewTask.findMany({
    where: { stage: { in: ['identity_review_required', 'publication_review_required', 'processing_approved'] } },
    orderBy: { createdAt: 'asc' },
    include: { pipelineRun: { select: { status: true, createdAt: true, authorityStatus: true, transcript: { select: { externalId: true, source: true, effectiveAt: true, recordedAt: true, metadata: true } } } } },
  })
  return tasks.map((task) => ({
    id: task.id,
    pipelineRunId: task.pipelineRunId,
    studentEmail: task.studentEmail,
    lessonId: task.lessonId,
    stage: task.stage,
    decision: task.decision,
    reason: task.reason,
    createdAt: task.createdAt.toISOString(),
    pipelineStatus: task.pipelineRun.status,
    authorityStatus: task.pipelineRun.authorityStatus,
    source: task.pipelineRun.transcript?.source || 'unknown',
    transcriptId: task.pipelineRun.transcript?.externalId || null,
    effectiveAt: task.pipelineRun.transcript?.effectiveAt?.toISOString() || null,
  }))
}

export async function reviewPipelineRun(input: { pipelineRunId: string; decision: 'approved' | 'rejected'; reason?: string; reviewerId: string }): Promise<PipelineResult> {
  const prisma = getPrismaClient()
  const run = await prisma.pipelineRun.findUnique({ where: { id: input.pipelineRunId }, include: { transcript: true, reviewTasks: { orderBy: { createdAt: 'desc' } } } })
  if (!run || !run.transcript) throw new Error('Pipeline run or transcript not found')

  const task = run.reviewTasks.find((item) => item.stage === 'identity_review_required')
    || run.reviewTasks.find((item) => item.stage === 'publication_review_required')
    || run.reviewTasks.find((item) => item.stage === 'processing_approved' && run.status === 'failed')
  if (!task) {
    const completedTask = run.reviewTasks.find((item) => item.stage === 'completed' || item.stage === 'review_rejected' || item.stage === 'publication_rejected')
    if (completedTask) return { pipelineRunId: run.id, status: run.status, duplicate: true, reviewTaskId: completedTask.id, nextReviewStage: completedTask.stage }
    throw new Error('No active review task found')
  }

  const reviewedAt = new Date()
  const isPublicationReview = task.stage === 'publication_review_required'
  const isContinuationRetry = task.stage === 'processing_approved'
  const rejectionStage = isPublicationReview ? 'publication_rejected' : 'review_rejected'
  if (input.decision === 'rejected') {
    await prisma.reviewTask.update({ where: { id: task.id }, data: { decision: 'rejected', reason: input.reason?.trim() || null, reviewerId: input.reviewerId, reviewedAt, stage: rejectionStage } })
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: rejectionStage, completedAt: reviewedAt } })
    await prisma.pipelineEvent.upsert({
      where: { pipelineRunId_eventType_aggregateId: { pipelineRunId: run.id, eventType: isPublicationReview ? 'PublicationReviewRejected' : 'HumanReviewRejected', aggregateId: task.id } },
      update: { payload: { reviewTaskId: task.id, reviewerId: input.reviewerId, reason: input.reason || null } },
      create: { pipelineRunId: run.id, eventType: isPublicationReview ? 'PublicationReviewRejected' : 'HumanReviewRejected', aggregateType: 'ReviewTask', aggregateId: task.id, payload: { reviewTaskId: task.id, reviewerId: input.reviewerId, reason: input.reason || null } },
    })
    return { pipelineRunId: run.id, status: rejectionStage, duplicate: false, reviewTaskId: task.id, nextReviewStage: rejectionStage }
  }

  const normalizedInput = rebuildInput(run, run.transcript)
  if (isPublicationReview) {
    await prisma.reviewTask.update({ where: { id: task.id }, data: { decision: 'approved', reason: input.reason?.trim() || null, reviewerId: input.reviewerId, reviewedAt, stage: 'publishing' } })
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'publishing', completedAt: null } })
    await prisma.pipelineEvent.upsert({
      where: { pipelineRunId_eventType_aggregateId: { pipelineRunId: run.id, eventType: 'PublicationReviewApproved', aggregateId: task.id } },
      update: { payload: { reviewTaskId: task.id, reviewerId: input.reviewerId, reason: input.reason || null } },
      create: { pipelineRunId: run.id, eventType: 'PublicationReviewApproved', aggregateType: 'ReviewTask', aggregateId: task.id, payload: { reviewTaskId: task.id, reviewerId: input.reviewerId, reason: input.reason || null } },
    })
    try {
      const result = await publishAfterReview(run.id, normalizedInput, task.id, input.reviewerId, input.reason)
      return { pipelineRunId: run.id, status: 'completed', duplicate: false, reviewTaskId: task.id, report: result.report, coaching: result.coaching }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown publication failure'
      await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'failed', errorCode: 'PIPELINE_PUBLICATION_FAILED', errorMessage: message } })
      await prisma.reviewTask.update({ where: { id: task.id }, data: { stage: 'publication_review_required' } })
      throw error
    }
  }

  const promptOne = asRecord(run.promptOneArtifact) as unknown as PromptOneOutput
  if (!promptOne.schema_version || !Array.isArray(promptOne.evidence_candidates)) throw new Error('Prompt 1 artifact is missing or invalid')
  if (!isContinuationRetry) {
    await prisma.reviewTask.update({ where: { id: task.id }, data: { decision: 'approved', reason: input.reason?.trim() || null, reviewerId: input.reviewerId, reviewedAt, stage: 'processing_approved' } })
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'processing', completedAt: null } })
    await prisma.pipelineEvent.upsert({
      where: { pipelineRunId_eventType_aggregateId: { pipelineRunId: run.id, eventType: 'HumanReviewApproved', aggregateId: task.id } },
      update: { payload: { reviewTaskId: task.id, reviewerId: input.reviewerId, reason: input.reason || null } },
      create: { pipelineRunId: run.id, eventType: 'HumanReviewApproved', aggregateType: 'ReviewTask', aggregateId: task.id, payload: { reviewTaskId: task.id, reviewerId: input.reviewerId, reason: input.reason || null } },
    })
  } else {
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'processing', completedAt: null } })
  }

  try {
    const result = await continueAfterReview(run.id, normalizedInput, run.transcript.id, promptOne)
    const updatedRun = await prisma.pipelineRun.findUnique({ where: { id: run.id }, select: { status: true } })
    const finalStatus = updatedRun?.status || 'completed'
    if (finalStatus === 'awaiting_publication_review') {
      const publicationTask = await prisma.reviewTask.findFirst({ where: { pipelineRunId: run.id, stage: 'publication_review_required' } })
      return { pipelineRunId: run.id, status: finalStatus, duplicate: false, reviewTaskId: publicationTask?.id, nextReviewStage: publicationTask?.stage, report: result.report, coaching: result.coaching }
    }
    return { pipelineRunId: run.id, status: finalStatus, duplicate: false, report: result.report, coaching: result.coaching }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown pipeline failure after identity review'
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'failed', errorCode: 'PIPELINE_REVIEW_CONTINUATION_FAILED', errorMessage: message } })
    await prisma.reviewTask.update({ where: { id: task.id }, data: { stage: 'processing_approved' } })
    throw error
  }
}

export function parseTranscriptPayload(body: unknown): LessonTranscriptInput {
  if (!body || typeof body !== 'object') throw new Error('Invalid JSON payload')
  const payload = body as Record<string, unknown>
  const lessonId = typeof payload.lessonId === 'string' ? payload.lessonId : ''
  const studentEmail = typeof payload.studentEmail === 'string' ? payload.studentEmail : ''
  const transcript = typeof payload.transcript === 'string' ? payload.transcript : ''
  if (!lessonId || !studentEmail || !transcript) throw new Error('lessonId, studentEmail and transcript are required')
  const source = payload.source === 'manual_upload' || payload.source === 'api' ? payload.source : 'google_meet'
  const metadata = payload.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
    ? payload.metadata as Record<string, unknown>
    : undefined
  const sourceFileId = asOptionalString(metadata?.sourceFileId)
  const sourceMimeType = asOptionalString(metadata?.sourceMimeType)
  const triageStatus = asOptionalString(metadata?.triageStatus)
  const carriesDriveProvenance = Boolean(sourceFileId || sourceMimeType || triageStatus)
  if (source === 'google_meet' && carriesDriveProvenance) {
    if (!sourceFileId) throw new Error('metadata.sourceFileId is required for Drive-origin Google Meet ingestion')
    if (sourceMimeType !== 'application/vnd.google-apps.document') throw new Error('Only Google Docs transcripts may enter the Drive-origin ingestion path')
    if (triageStatus !== 'usable_transcript') throw new Error('Only triageStatus=usable_transcript may enter the Drive-origin ingestion path')
  }
  return {
    lessonId,
    studentEmail,
    studentId: typeof payload.studentId === 'string' ? payload.studentId : undefined,
    studentName: typeof payload.studentName === 'string' ? payload.studentName : undefined,
    teacherId: typeof payload.teacherId === 'string' ? payload.teacherId : undefined,
    teacherName: typeof payload.teacherName === 'string' ? payload.teacherName : undefined,
    program: typeof payload.program === 'string' ? payload.program : undefined,
    classDate: typeof payload.classDate === 'string' ? payload.classDate : typeof payload.lessonDate === 'string' ? payload.lessonDate : undefined,
    transcriptId: typeof payload.transcriptId === 'string' ? payload.transcriptId : undefined,
    transcript,
    source,
    effectiveAt: typeof payload.effectiveAt === 'string' ? payload.effectiveAt : undefined,
    recordedAt: typeof payload.recordedAt === 'string' ? payload.recordedAt : undefined,
    attendanceStatus: payload.attendanceStatus === 'attended' || payload.attendanceStatus === 'missed' || payload.attendanceStatus === 'cancelled' || payload.attendanceStatus === 'rescheduled' ? payload.attendanceStatus : 'unknown',
    attendanceSource: typeof payload.attendanceSource === 'string' ? payload.attendanceSource : undefined,
    externalMeetingId: typeof payload.externalMeetingId === 'string' ? payload.externalMeetingId : undefined,
    metadata,
  }
}

export function summarizeReferences(value: unknown): string[] {
  return safeArray(value)
}
