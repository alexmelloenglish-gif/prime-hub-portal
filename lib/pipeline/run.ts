import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import { runPromptFour, runPromptOne, runPromptThree, runPromptTwo } from './prompts'
import type { LessonTranscriptInput, PipelineResult, PromptOneOutput } from './contracts'

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
  const current = await prisma.portfolioProjection.findUnique({
    where: { studentEmail_projectionKey: { studentEmail: normalizeEmail(input.studentEmail), projectionKey } },
  })
  const state = current?.projection && typeof current.projection === 'object' && !Array.isArray(current.projection)
    ? current.projection as { classReports?: Record<string, unknown>; vocabulary?: Record<string, unknown>; feedback?: unknown }
    : {}
  const next = {
    ...state,
    classReports: { ...(state.classReports || {}) },
    vocabulary: { ...(state.vocabulary || {}) },
  }
  for (const operation of patch.operations) {
    if (operation.op === 'append_class_report') next.classReports[operation.key] = operation.value
    if (operation.op === 'merge_vocabulary_item') next.vocabulary[operation.key] = operation.value
    if (operation.op === 'update_feedback_projection') next.feedback = operation.value
  }
  await prisma.portfolioProjection.upsert({
    where: { studentEmail_projectionKey: { studentEmail: normalizeEmail(input.studentEmail), projectionKey } },
    update: { projection: next as Prisma.InputJsonValue, sourceRunId: runId, version: { increment: 1 } },
    create: { studentEmail: normalizeEmail(input.studentEmail), projectionKey, projection: next as Prisma.InputJsonValue, sourceRunId: runId },
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
    const report = await runPromptTwo({ lesson: normalizedInput, promptOne })
    await prisma.classReportProjection.upsert({
      where: { studentEmail_lessonId: { studentEmail: normalizedInput.studentEmail, lessonId: normalizedInput.lessonId } },
      update: { content: report, pipelineRunId: run.id, documentStatus: report.documentStatus, implementationStatus: report.implementationStatus },
      create: { pipelineRunId: run.id, studentEmail: normalizedInput.studentEmail, lessonId: normalizedInput.lessonId, content: report, documentStatus: report.documentStatus, implementationStatus: report.implementationStatus },
    })
    const patch = await runPromptThree({ lesson: normalizedInput, report, promptOne })
    await applyPortfolioPatch(normalizedInput, run.id, patch)
    const coaching = await runPromptFour({ lesson: normalizedInput, report, promptOne })
    await prisma.coachingGuidance.upsert({
      where: { pipelineRunId: run.id },
      update: { studentEmail: normalizedInput.studentEmail, content: coaching, recommendationStatus: 'ai_proposed', requiresHumanReview: true },
      create: { pipelineRunId: run.id, studentEmail: normalizedInput.studentEmail, content: coaching, recommendationStatus: 'ai_proposed', requiresHumanReview: true },
    })
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: 'completed', completedAt: new Date() } })
    await prisma.pipelineEvent.createMany({ data: [
      { pipelineRunId: run.id, eventType: 'ClassReportProjectionPublished', aggregateType: 'ClassReportProjection', aggregateId: normalizedInput.lessonId, payload: { documentStatus: report.documentStatus } },
      { pipelineRunId: run.id, eventType: 'PortfolioProjectionUpdated', aggregateType: 'PortfolioProjection', aggregateId: normalizedInput.studentEmail, payload: { operationCount: patch.operations.length } },
      { pipelineRunId: run.id, eventType: 'CoachingGuidanceCreated', aggregateType: 'CoachingGuidance', aggregateId: run.id, payload: { recommendationStatus: 'ai_proposed' } },
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
