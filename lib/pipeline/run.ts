import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import { runPromptFour, runPromptOne, runPromptThree, runPromptTwo } from './prompts'
import type { LessonTranscriptInput, PipelineResult, PromptOneOutput, PromptTwoInput } from './contracts'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function createIdempotencyKey(input: LessonTranscriptInput): string {
  return `${normalizeEmail(input.studentEmail)}:${input.lessonId}:${input.transcriptId || input.externalMeetingId || 'transcript'}`
}

function safeArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
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

export async function processLessonTranscript(input: LessonTranscriptInput): Promise<PipelineResult> {
  const prisma = getPrismaClient()
  const normalizedInput = { ...input, studentEmail: normalizeEmail(input.studentEmail), source: input.source || 'google_meet' as const }
  const idempotencyKey = createIdempotencyKey(normalizedInput)
  const existing = await prisma.pipelineRun.findUnique({ where: { idempotencyKey } })
  if (existing?.status === 'completed') {
    const storedReport = await prisma.classReportProjection.findUnique({ where: { studentEmail_lessonId: { studentEmail: normalizedInput.studentEmail, lessonId: normalizedInput.lessonId } } })
    const storedCoaching = await prisma.coachingGuidance.findUnique({ where: { pipelineRunId: existing.id } })
    return {
      pipelineRunId: existing.id,
      status: existing.status,
      duplicate: true,
      report: (storedReport?.content || {}) as PipelineResult['report'],
      coaching: (storedCoaching?.content || {}) as PipelineResult['coaching'],
    }
  }
  const run = existing || await prisma.pipelineRun.create({ data: { idempotencyKey, studentEmail: normalizedInput.studentEmail, lessonId: normalizedInput.lessonId, status: 'received' } })
  try {
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'processing' } })
    const metadata = normalizedInput.metadata as Prisma.InputJsonValue | undefined
    const transcript = await prisma.transcript.upsert({
      where: { pipelineRunId: run.id },
      update: { content: normalizedInput.transcript, externalId: normalizedInput.transcriptId || normalizedInput.externalMeetingId, metadata, effectiveAt: normalizedInput.effectiveAt ? new Date(normalizedInput.effectiveAt) : null, recordedAt: normalizedInput.recordedAt ? new Date(normalizedInput.recordedAt) : null },
      create: { pipelineRunId: run.id, externalId: normalizedInput.transcriptId || normalizedInput.externalMeetingId, studentEmail: normalizedInput.studentEmail, lessonId: normalizedInput.lessonId, source: normalizedInput.source, content: normalizedInput.transcript, metadata, effectiveAt: normalizedInput.effectiveAt ? new Date(normalizedInput.effectiveAt) : null, recordedAt: normalizedInput.recordedAt ? new Date(normalizedInput.recordedAt) : null },
    })
    const promptOne = await runPromptOne(normalizedInput, transcript.id)
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { promptOneSchemaVersion: promptOne.schema_version, promptOneArtifact: promptOne as unknown as Prisma.InputJsonValue, authorityStatus: promptOne.authority_status } })
    await persistPromptOne(run.id, transcript.id, promptOne)
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
        transcript_id: normalizedInput.transcriptId || transcript.id,
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
        pipelineRunId: run.id,
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
        pipelineRunId: run.id,
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
    const portfolioApply = await applyPortfolioPatch(normalizedInput, run.id, patch)
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { promptThreeSchemaVersion: patch.patch_schema_version, promptThreeArtifact: patch as unknown as Prisma.InputJsonValue, portfolioPatchId: patch.patch_id, portfolioApplyStatus: portfolioApply.status } })
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
      where: { pipelineRunId: run.id },
      update: { studentEmail: normalizedInput.studentEmail, studentId: coaching.student_id, teacherId: coaching.teacher_id, content: coaching, recommendationStatus: coaching.recommendationStatus, isPedagogicalDecision: coaching.is_pedagogical_decision, requiresHumanReview: coaching.requiresHumanReview, sourceReferences: coaching.source_references as unknown as Prisma.InputJsonValue, documentStatus: coaching.documentStatus, implementationStatus: coaching.implementationStatus },
      create: { pipelineRunId: run.id, studentEmail: normalizedInput.studentEmail, studentId: coaching.student_id, teacherId: coaching.teacher_id, content: coaching, recommendationStatus: coaching.recommendationStatus, isPedagogicalDecision: coaching.is_pedagogical_decision, requiresHumanReview: coaching.requiresHumanReview, sourceReferences: coaching.source_references as unknown as Prisma.InputJsonValue, documentStatus: coaching.documentStatus, implementationStatus: coaching.implementationStatus },
    })
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'completed', completedAt: new Date() } })
    await prisma.pipelineEvent.createMany({ data: [
      { pipelineRunId: run.id, eventType: 'ClassReportProjectionPersisted', aggregateType: 'ClassReportProjection', aggregateId: normalizedInput.lessonId, payload: { documentStatus: report.documentStatus } },
      { pipelineRunId: run.id, eventType: 'PortfolioProjectionUpdated', aggregateType: 'PortfolioProjection', aggregateId: normalizedInput.studentEmail, payload: { operationCount: patch.operations.length, patchId: patch.patch_id, operationKey: patch.operation_key, applyStatus: portfolioApply.status, projectionVersion: portfolioApply.version } },
      { pipelineRunId: run.id, eventType: 'AIRecommendationGenerated', aggregateType: 'CoachingGuidance', aggregateId: run.id, payload: { recommendationStatus: coaching.recommendationStatus, isPedagogicalDecision: coaching.is_pedagogical_decision, requiresHumanReview: coaching.requiresHumanReview } },
    ], skipDuplicates: true })
    return { pipelineRunId: run.id, status: 'completed', duplicate: false, report, coaching }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown pipeline failure'
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'failed', errorCode: 'PIPELINE_FAILED', errorMessage: message } })
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
  return {
    lessonId,
    studentEmail,
    transcript,
    teacherId: typeof payload.teacherId === 'string' ? payload.teacherId : undefined,
    transcriptId: typeof payload.transcriptId === 'string' ? payload.transcriptId : undefined,
    source: payload.source === 'manual_upload' || payload.source === 'api' ? payload.source : 'google_meet',
    effectiveAt: typeof payload.effectiveAt === 'string' ? payload.effectiveAt : undefined,
    recordedAt: typeof payload.recordedAt === 'string' ? payload.recordedAt : undefined,
    attendanceStatus: payload.attendanceStatus === 'attended' || payload.attendanceStatus === 'missed' || payload.attendanceStatus === 'cancelled' || payload.attendanceStatus === 'rescheduled' ? payload.attendanceStatus : 'unknown',
    externalMeetingId: typeof payload.externalMeetingId === 'string' ? payload.externalMeetingId : undefined,
    metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata as Record<string, unknown> : undefined,
  }
}

export function summarizeReferences(value: unknown): string[] {
  return safeArray(value)
}
