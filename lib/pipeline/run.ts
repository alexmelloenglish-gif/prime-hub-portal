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

function getStableSourceFileId(input: LessonTranscriptInput): string | null {
  const sourceFileId = input.metadata?.sourceFileId
  return typeof sourceFileId === 'string' && sourceFileId.trim() ? sourceFileId.trim() : null
}

function buildStoredInputMetadata(input: LessonTranscriptInput): Prisma.InputJsonValue {
  return {
    ...(input.metadata || {}),
    source: input.source || 'api',
    ...(input.transcriptId ? { transcriptId: input.transcriptId } : {}),
    ...(input.externalMeetingId ? { externalMeetingId: input.externalMeetingId } : {}),
  } as Prisma.InputJsonValue
}

function isTrustedSource(input: LessonTranscriptInput, authorityStatus: string): boolean {
  if (authorityStatus === 'authoritative') return true
  if (input.source === 'google_meet' && !!getStableSourceFileId(input)) return true
  return false
}

// ---------------------------------------------------------------------------
// Publication policy
// Normal (non-high-risk) runs are auto-published.
// A run requires human publication review only when the coaching contract
// explicitly marks the output as a pedagogical decision.
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
          content: candidate.content,
          evidenceType: candidate.evidence_type,
          provenance: candidate.provenance as Prisma.InputJsonValue,
          candidateStatus: candidate.candidate_status,
          requiresHumanReview: candidate.requires_human_review,
          pedagogicalRelevanceCandidate: candidate.pedagogical_relevance_candidate,
        },
        create: {
          transcriptId,
          candidateKey: candidate.evidence_candidate_id,
          studentEmail: normalizeEmail(promptOne.lesson_input.student_id),
          lessonId: promptOne.lesson_input.lesson_id,
          sourceSpan: candidate.source_span,
          content: candidate.content,
          evidenceType: candidate.evidence_type,
          provenance: candidate.provenance as Prisma.InputJsonValue,
          candidateStatus: candidate.candidate_status,
          requiresHumanReview: candidate.requires_human_review,
          pedagogicalRelevanceCandidate: candidate.pedagogical_relevance_candidate,
        },
      })
    }

    for (const proposal of promptOne.learning_signal_proposals) {
      await tx.learningSignalProposal.upsert({
        where: { proposalId: proposal.proposal_id },
        update: {
          studentEmail: normalizeEmail(promptOne.lesson_input.student_id),
          signalType: proposal.signal_type,
          signal: proposal.signal,
          evidenceReferenceIds: proposal.evidence_reference_ids,
          detectionRationale: proposal.detection_rationale,
          candidateStatus: proposal.candidate_status,
          isOfficial: proposal.is_official,
          requiresHumanReview: proposal.requires_human_review,
          confidence: proposal.confidence ?? null,
          suggestedDomainTransition: proposal.suggested_domain_transition as Prisma.InputJsonValue | undefined,
        },
        create: {
          proposalId: proposal.proposal_id,
          pipelineRunId: runId,
          studentEmail: normalizeEmail(promptOne.lesson_input.student_id),
          signalType: proposal.signal_type,
          signal: proposal.signal,
          evidenceReferenceIds: proposal.evidence_reference_ids,
          detectionRationale: proposal.detection_rationale,
          candidateStatus: proposal.candidate_status,
          isOfficial: proposal.is_official,
          requiresHumanReview: proposal.requires_human_review,
          confidence: proposal.confidence ?? null,
          suggestedDomainTransition: proposal.suggested_domain_transition as Prisma.InputJsonValue | undefined,
        },
      })
    }

    for (const insight of promptOne.teacher_insight_proposals) {
      await tx.teacherInsightProposal.upsert({
        where: { insightProposalId: insight.insight_proposal_id },
        update: {
          studentEmail: normalizeEmail(promptOne.lesson_input.student_id),
          lessonId: insight.lesson_id,
          insight: insight.insight,
          basis: insight.basis,
          evidenceReferenceIds: insight.evidence_reference_ids,
          isOfficial: insight.is_official,
          requiresHumanReview: insight.requires_human_review,
          authorType: insight.author_type,
        },
        create: {
          insightProposalId: insight.insight_proposal_id,
          pipelineRunId: runId,
          studentEmail: normalizeEmail(promptOne.lesson_input.student_id),
          lessonId: insight.lesson_id,
          insight: insight.insight,
          basis: insight.basis,
          evidenceReferenceIds: insight.evidence_reference_ids,
          isOfficial: insight.is_official,
          requiresHumanReview: insight.requires_human_review,
          authorType: insight.author_type,
        },
      })
    }
  })
}

async function createReviewTask(runId: string, input: LessonTranscriptInput, stage: string) {
  const prisma = getPrismaClient()
  return prisma.reviewTask.create({
    data: {
      pipelineRunId: runId,
      studentEmail: normalizeEmail(input.studentEmail),
      lessonId: input.lessonId,
      stage,
      decision: 'pending',
    },
  })
}

export async function processLessonTranscript(input: LessonTranscriptInput): Promise<PipelineResult> {
  const prisma = getPrismaClient()
  const normalizedInput = { ...input, studentEmail: normalizeEmail(input.studentEmail) }
  const sourceFileId = getStableSourceFileId(normalizedInput)
  const idempotencyKey = sourceFileId || normalizedInput.transcriptId || normalizedInput.externalMeetingId || `${normalizedInput.studentEmail}:${normalizedInput.lessonId}`

  let run
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
      const updatedRun = await prisma.pipelineRun.findUnique({ where: { id: run.id }, select: { status: true } })
      const finalStatus = updatedRun?.status || 'completed'
      if (finalStatus === 'awaiting_publication_review') {
        const publicationTask = await prisma.reviewTask.findFirst({ where: { pipelineRunId: run.id, stage: 'publication_review_required' } })
        return { pipelineRunId: run.id, status: finalStatus, duplicate: false, reviewTaskId: publicationTask?.id, nextReviewStage: publicationTask?.stage, report: result.report, coaching: result.coaching }
      }
      return { pipelineRunId: run.id, status: finalStatus, duplicate: false, report: result.report, coaching: result.coaching }
    }

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
  if (!run) throw new Error('pipeline run not found')
  if (run.status === 'completed') return { pipelineRunId: run.id, status: 'completed', duplicate: true }
  const transcript = run.transcript
  if (!transcript) throw new Error('pipeline transcript not found')
  const normalizedInput: LessonTranscriptInput = {
    lessonId: transcript.lessonId,
    studentEmail: normalizeEmail(transcript.studentEmail),
    transcript: transcript.content,
    source: transcript.source as LessonTranscriptInput['source'],
    transcriptId: transcript.externalId || undefined,
    effectiveAt: transcript.effectiveAt?.toISOString(),
    recordedAt: transcript.recordedAt?.toISOString(),
    metadata: transcript.metadata as Record<string, unknown> | undefined,
  }
  const latestTask = run.reviewTasks[0]
  if (!latestTask) throw new Error('review task not found')
  if (input.decision === 'rejected') {
    await prisma.reviewTask.update({ where: { id: latestTask.id }, data: { decision: 'rejected', reason: input.reason || null, reviewerId: input.reviewerId } })
    const rejectedStatus = latestTask.stage === 'identity_review_required' ? 'review_rejected' : 'publication_rejected'
    await prisma.pipelineRun.update({ where: { id: run.id }, data: { status: rejectedStatus } })
    return { pipelineRunId: run.id, status: rejectedStatus, duplicate: false, reviewTaskId: latestTask.id, nextReviewStage: latestTask.stage }
  }
  await prisma.reviewTask.update({ where: { id: latestTask.id }, data: { decision: 'approved', reason: input.reason || null, reviewerId: input.reviewerId } })
  if (latestTask.stage === 'identity_review_required') {
    const promptOne = run.promptOneArtifact as unknown as PromptOneOutput
    const result = await continueAfterReview(run.id, normalizedInput, transcript.id, promptOne)
    const updated = await prisma.pipelineRun.findUnique({ where: { id: run.id }, select: { status: true } })
    return { pipelineRunId: run.id, status: updated?.status || 'completed', duplicate: false, report: result.report, coaching: result.coaching }
  }
  await publishAfterReview(run.id, normalizedInput, latestTask.id, input.reviewerId)
  return { pipelineRunId: run.id, status: 'completed', duplicate: false }
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

async function continueAfterReview(runId: string, input: LessonTranscriptInput, transcriptId: string, promptOne: PromptOneOutput) {
  const prisma = getPrismaClient()
  const report = await runPromptTwo(input, promptOne, transcriptId)
  const patch = await runPromptThree(input, promptOne, report, transcriptId)
  const coaching = await runPromptFour(input, promptOne, report, patch, transcriptId)

  await prisma.classReportProjection.upsert({
    where: { reportId: report.reportId },
    update: { report: report as unknown as Prisma.InputJsonValue, documentStatus: 'draft' },
    create: { reportId: report.reportId, pipelineRunId: runId, studentEmail: normalizeEmail(input.studentEmail), lessonId: input.lessonId, report: report as unknown as Prisma.InputJsonValue, documentStatus: 'draft' },
  })
  await prisma.portfolioPatch.upsert({
    where: { patchId: patch.patch_id },
    update: { patch: patch as unknown as Prisma.InputJsonValue, portfolioApplyStatus: 'pending_publication_review' },
    create: { patchId: patch.patch_id, pipelineRunId: runId, studentEmail: normalizeEmail(input.studentEmail), lessonId: input.lessonId, patch: patch as unknown as Prisma.InputJsonValue, portfolioApplyStatus: 'pending_publication_review' },
  })
  await prisma.pipelineRun.update({ where: { id: runId }, data: { status: 'processing' } })

  if (shouldRequirePublicationReview(coaching)) {
    const publicationTask = await createReviewTask(runId, input, 'publication_review_required')
    await prisma.pipelineRun.update({ where: { id: runId }, data: { status: 'awaiting_publication_review' } })
    return { report, coaching, reviewTaskId: publicationTask.id }
  }

  await publishAfterReview(runId, input, undefined, 'system')
  return { report, coaching }
}

async function publishAfterReview(runId: string, input: LessonTranscriptInput, reviewTaskId?: string, reviewerId = 'system') {
  const prisma = getPrismaClient()
  const reportProjection = await prisma.classReportProjection.findFirst({ where: { pipelineRunId: runId } })
  const portfolioPatch = await prisma.portfolioPatch.findFirst({ where: { pipelineRunId: runId } })
  if (!reportProjection || !portfolioPatch) throw new Error('publication artifacts not found')

  await prisma.classReportProjection.update({ where: { id: reportProjection.id }, data: { documentStatus: 'published' } })
  await applyPortfolioPatch(runId, input, portfolioPatch.patch as unknown as PortfolioPatchOutput)
  if (reviewTaskId) {
    await prisma.reviewTask.update({ where: { id: reviewTaskId }, data: { decision: 'approved', reviewerId, reason: 'auto_published_no_exception' } })
  }
  await prisma.pipelineRun.update({ where: { id: runId }, data: { status: 'completed' } })
}

async function applyPortfolioPatch(runId: string, input: LessonTranscriptInput, patch: PortfolioPatchOutput) {
  const prisma = getPrismaClient()
  const studentEmail = normalizeEmail(input.studentEmail)
  for (const operation of patch.operations) {
    if (operation.type === 'append_class_report_reference') {
      if (operation.parameters.class_report_state !== 'projection_published') continue
    }
    // Portfolio application is delegated to the existing idempotent projection layer.
    await prisma.pipelineEvent.create({ data: { pipelineRunId: runId, eventType: 'PortfolioProjectionUpdated', payload: operation.parameters as Prisma.InputJsonValue } })
  }
  await prisma.pipelineEvent.create({ data: { pipelineRunId: runId, eventType: 'ClassReportProjectionPublished', payload: { studentEmail, publicationMode: 'automatic' } } })
}
