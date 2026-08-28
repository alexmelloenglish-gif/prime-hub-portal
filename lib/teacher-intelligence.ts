import { randomUUID } from 'node:crypto'
import { getPrismaClient } from '@/lib/prisma'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : []
}

function safeJson(value: unknown): unknown {
  if (value === null || value === undefined) return null
  return JSON.parse(JSON.stringify(value)) as unknown
}

function getPromptOneProvenance(promptOneArtifact: unknown) {
  const artifact = asRecord(promptOneArtifact)
  return asRecord(artifact.generationProvenance)
}

function hasValidGeminiProvenance(promptOneArtifact: unknown) {
  const provenance = getPromptOneProvenance(promptOneArtifact)
  return (
    provenance.provider === 'gemini' &&
    provenance.validationStatus === 'valid' &&
    Boolean(asString(provenance.model)) &&
    Boolean(asString(provenance.requestId)) &&
    Boolean(asString(provenance.promptVersion))
  )
}

function promptOneEvidenceByCandidateKey(promptOneArtifact: unknown) {
  const artifact = asRecord(promptOneArtifact)
  const raw = Array.isArray(artifact.evidence_candidates) ? artifact.evidence_candidates : []
  const map = new Map<string, Record<string, unknown>>()

  for (const item of raw) {
    const candidate = asRecord(item)
    const key = asString(candidate.evidence_candidate_id)
    if (key) map.set(key, candidate)
  }

  return map
}

export type VerificationState = 'VERIFIED' | 'NOT_PROVEN' | 'BLOCKED' | 'FAILED' | 'PRESENT'

export type TeacherLessonSummary = {
  pipelineRunId: string
  studentEmail: string
  lessonId: string
  technicalStatus: string
  cognitiveStatus: 'EVIDENCE_BEARING' | 'NOT_PROVEN'
  source: string
  sourceFileId: string | null
  transcriptId: string | null
  lessonDate: string | null
  processedAt: string
  completedAt: string | null
  aiStatus: VerificationState
  evidenceCount: number
  evidenceNeedsReview: number
  reviewStatus: string
  reportStatus: string
  projectionStatus: string
  signalProposalCount: number
  insightProposalCount: number
  errorCode: string | null
}

export type TeacherCommandCenter = {
  needsReview: {
    reviewTasks: number
    evidenceCandidates: number
    signalProposals: number
    insightProposals: number
    reportsAwaitingPublication: number
  }
  recentLessons: TeacherLessonSummary[]
}

export async function listTeacherLessons(limit = 50): Promise<TeacherLessonSummary[]> {
  const prisma = getPrismaClient()
  const runs = await prisma.pipelineRun.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 100),
    include: {
      transcript: {
        select: {
          id: true,
          source: true,
          sourceFileId: true,
          effectiveAt: true,
          recordedAt: true,
          evidence: { select: { id: true, state: true, requiresReview: true } },
        },
      },
      reviewTasks: {
        select: { id: true, stage: true, decision: true, reviewedAt: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!runs.length) return []
  const runIds = runs.map((run) => run.id)
  const [reports, signals, insights] = await Promise.all([
    prisma.classReportProjection.findMany({
      where: { pipelineRunId: { in: runIds } },
      select: { pipelineRunId: true, documentStatus: true, implementationStatus: true },
    }),
    prisma.learningSignalProposal.findMany({
      where: { pipelineRunId: { in: runIds } },
      select: { pipelineRunId: true },
    }),
    prisma.teacherInsightProposal.findMany({
      where: { pipelineRunId: { in: runIds } },
      select: { pipelineRunId: true },
    }),
  ])

  const reportByRun = new Map(reports.map((report) => [report.pipelineRunId, report]))
  const signalCount = new Map<string, number>()
  const insightCount = new Map<string, number>()
  for (const signal of signals) signalCount.set(signal.pipelineRunId, (signalCount.get(signal.pipelineRunId) || 0) + 1)
  for (const insight of insights) insightCount.set(insight.pipelineRunId, (insightCount.get(insight.pipelineRunId) || 0) + 1)

  return runs.map((run) => {
    const evidence = run.transcript?.evidence || []
    const evidenceNeedsReview = evidence.filter((item) => item.requiresReview).length
    const report = reportByRun.get(run.id)
    const pendingReview = run.reviewTasks.find((task) => !task.decision)
    const aiProven = hasValidGeminiProvenance(run.promptOneArtifact)
    const aiStatus: VerificationState = run.errorCode?.startsWith('GEMINI_')
      ? 'FAILED'
      : aiProven
        ? 'VERIFIED'
        : 'NOT_PROVEN'

    return {
      pipelineRunId: run.id,
      studentEmail: run.studentEmail,
      lessonId: run.lessonId,
      technicalStatus: run.status,
      cognitiveStatus: aiProven && evidence.length > 0 ? 'EVIDENCE_BEARING' : 'NOT_PROVEN',
      source: run.transcript?.source || 'unknown',
      sourceFileId: run.transcript?.sourceFileId || null,
      transcriptId: run.transcript?.id || null,
      lessonDate: (run.transcript?.effectiveAt || run.transcript?.recordedAt)?.toISOString() || null,
      processedAt: run.createdAt.toISOString(),
      completedAt: run.completedAt?.toISOString() || null,
      aiStatus,
      evidenceCount: evidence.length,
      evidenceNeedsReview,
      reviewStatus: pendingReview?.stage || (evidenceNeedsReview ? 'evidence_review_required' : 'no_pending_review'),
      reportStatus: report ? `${report.documentStatus}/${report.implementationStatus}` : 'no_report',
      projectionStatus: run.portfolioApplyStatus || 'not_applied',
      signalProposalCount: signalCount.get(run.id) || 0,
      insightProposalCount: insightCount.get(run.id) || 0,
      errorCode: run.errorCode,
    }
  })
}

export async function getTeacherCommandCenter(): Promise<TeacherCommandCenter> {
  const prisma = getPrismaClient()
  const [recentLessons, reviewTasks, evidenceCandidates, signalProposals, insightProposals, reportsAwaitingPublication] = await Promise.all([
    listTeacherLessons(12),
    prisma.reviewTask.count({ where: { decision: null } }),
    prisma.evidenceCandidate.count({ where: { requiresReview: true } }),
    prisma.learningSignalProposal.count({ where: { requiresReview: true } }),
    prisma.teacherInsightProposal.count({ where: { requiresReview: true, isOfficial: false } }),
    prisma.classReportProjection.count({ where: { documentStatus: 'draft' } }),
  ])

  return {
    needsReview: {
      reviewTasks,
      evidenceCandidates,
      signalProposals,
      insightProposals,
      reportsAwaitingPublication,
    },
    recentLessons,
  }
}

export async function listEvidenceReviewQueue(limit = 100) {
  const prisma = getPrismaClient()
  const candidates = await prisma.evidenceCandidate.findMany({
    where: { requiresReview: true },
    orderBy: { createdAt: 'asc' },
    take: Math.min(Math.max(limit, 1), 200),
    include: {
      transcript: {
        select: {
          id: true,
          studentEmail: true,
          lessonId: true,
          sourceFileId: true,
        },
      },
      pipelineRun: { select: { id: true, promptOneArtifact: true, status: true } },
    },
  })

  return candidates.map((candidate) => {
    const byKey = promptOneEvidenceByCandidateKey(candidate.pipelineRun.promptOneArtifact)
    const rawCandidate = byKey.get(candidate.candidateKey) || {}
    return {
      id: candidate.id,
      candidateKey: candidate.candidateKey,
      studentEmail: candidate.transcript.studentEmail,
      lessonId: candidate.transcript.lessonId,
      transcriptId: candidate.transcriptId,
      pipelineRunId: candidate.pipelineRun.id,
      sourceFileId: candidate.transcript.sourceFileId,
      sourceSpan: candidate.sourceSpan,
      observation: candidate.observation,
      category: candidate.category,
      confidence: candidate.confidence,
      state: candidate.state,
      requiresReview: candidate.requiresReview,
      createdAt: candidate.createdAt.toISOString(),
      provenance: safeJson(asRecord(rawCandidate.provenance)),
      aiProvenance: safeJson(getPromptOneProvenance(candidate.pipelineRun.promptOneArtifact)),
      runtimeStatus: candidate.pipelineRun.status,
    }
  })
}

export type EvidenceReviewDecision = 'accept' | 'reject' | 'return' | 'block'

const evidenceDecisionStates: Record<EvidenceReviewDecision, { state: string; requiresReview: boolean }> = {
  accept: { state: 'teacher_accepted_candidate', requiresReview: false },
  reject: { state: 'rejected', requiresReview: false },
  return: { state: 'returned_for_revision', requiresReview: true },
  block: { state: 'blocked', requiresReview: false },
}

export async function recordEvidenceReviewDecision(input: {
  evidenceId: string
  reviewerId: string
  reviewerRole: string
  decision: EvidenceReviewDecision
  reason?: string
}) {
  const prisma = getPrismaClient()
  const target = evidenceDecisionStates[input.decision]
  if (!target) throw new Error('Unsupported evidence review decision')
  const reason = input.reason?.trim() || null
  if ((input.decision === 'reject' || input.decision === 'return' || input.decision === 'block') && !reason) {
    throw new Error('A reason is required for reject, return, or block decisions')
  }

  return prisma.$transaction(async (tx) => {
    const candidate = await tx.evidenceCandidate.findUnique({
      where: { id: input.evidenceId },
      include: {
        transcript: { select: { id: true, studentEmail: true, lessonId: true } },
        pipelineRun: { select: { id: true } },
      },
    })
    if (!candidate) throw new Error('Evidence Candidate not found')

    const previousState = candidate.state
    const updated = await tx.evidenceCandidate.update({
      where: { id: candidate.id },
      data: { state: target.state, requiresReview: target.requiresReview },
    })

    const eventId = randomUUID()
    await tx.pipelineEvent.create({
      data: {
        pipelineRunId: candidate.pipelineRun.id,
        eventType: 'EvidenceCandidateReviewDecision',
        aggregateType: 'EvidenceCandidate',
        aggregateId: `${candidate.id}:${eventId}`,
        payload: {
          reviewerId: input.reviewerId,
          reviewerRole: input.reviewerRole,
          timestamp: new Date().toISOString(),
          decision: input.decision,
          previousState,
          newState: target.state,
          reason,
          sourceRunId: candidate.pipelineRun.id,
          sourceTranscriptId: candidate.transcript.id,
          targetArtifactId: candidate.id,
          selectedEvidenceIds: [candidate.id],
          canonicalEvidenceCreated: false,
          note: 'This decision changes the Evidence Candidate review state only. It does not create canonical validated Evidence.',
        },
      },
    })

    return { id: updated.id, state: updated.state, requiresReview: updated.requiresReview }
  })
}

export async function listSignalProposals(limit = 100) {
  const prisma = getPrismaClient()
  const signals = await prisma.learningSignalProposal.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 200),
  })
  return signals.map((signal) => ({
    id: signal.id,
    pipelineRunId: signal.pipelineRunId,
    proposalKey: signal.proposalKey,
    signal: signal.signal,
    rationale: signal.rationale,
    evidenceIds: asStringArray(signal.evidenceIds),
    proposedState: signal.proposedState,
    requiresReview: signal.requiresReview,
    createdAt: signal.createdAt.toISOString(),
  }))
}

export async function listInsightProposals(limit = 100) {
  const prisma = getPrismaClient()
  const insights = await prisma.teacherInsightProposal.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 200),
  })
  return insights.map((insight) => ({
    id: insight.id,
    pipelineRunId: insight.pipelineRunId,
    text: insight.text,
    evidenceIds: asStringArray(insight.evidenceIds),
    signalIds: asStringArray(insight.signalIds),
    authorType: insight.authorType,
    isOfficial: insight.isOfficial,
    requiresReview: insight.requiresReview,
    status: insight.status,
    createdAt: insight.createdAt.toISOString(),
  }))
}

export async function listCoachingProposals(limit = 100) {
  const prisma = getPrismaClient()
  const rows = await prisma.coachingGuidance.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 200),
  })
  return rows.map((row) => ({
    id: row.id,
    pipelineRunId: row.pipelineRunId,
    studentEmail: row.studentEmail,
    recommendationStatus: row.recommendationStatus,
    isPedagogicalDecision: row.isPedagogicalDecision,
    requiresHumanReview: row.requiresHumanReview,
    documentStatus: row.documentStatus,
    implementationStatus: row.implementationStatus,
    sourceReferences: safeJson(row.sourceReferences),
    content: safeJson(row.content),
    createdAt: row.createdAt.toISOString(),
  }))
}

export async function listPipelineAuditEvents(limit = 150) {
  const prisma = getPrismaClient()
  const events = await prisma.pipelineEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 300),
  })
  return events.map((event) => ({
    id: event.id,
    pipelineRunId: event.pipelineRunId,
    eventType: event.eventType,
    aggregateType: event.aggregateType,
    aggregateId: event.aggregateId,
    payload: safeJson(event.payload),
    createdAt: event.createdAt.toISOString(),
  }))
}

export async function getTeacherLessonTrace(pipelineRunId: string) {
  const prisma = getPrismaClient()
  const run = await prisma.pipelineRun.findUnique({
    where: { id: pipelineRunId },
    include: {
      transcript: {
        select: {
          id: true,
          externalId: true,
          sourceFileId: true,
          studentEmail: true,
          lessonId: true,
          source: true,
          effectiveAt: true,
          recordedAt: true,
          metadata: true,
          createdAt: true,
          evidence: { orderBy: { createdAt: 'asc' } },
        },
      },
      reviewTasks: { orderBy: { createdAt: 'asc' } },
    },
  })
  if (!run) return null

  const [signals, insight, report, coaching, portfolio, events] = await Promise.all([
    prisma.learningSignalProposal.findMany({ where: { pipelineRunId }, orderBy: { createdAt: 'asc' } }),
    prisma.teacherInsightProposal.findUnique({ where: { pipelineRunId } }),
    prisma.classReportProjection.findFirst({ where: { pipelineRunId } }),
    prisma.coachingGuidance.findUnique({ where: { pipelineRunId } }),
    prisma.portfolioProjection.findFirst({ where: { sourceRunId: pipelineRunId }, orderBy: { updatedAt: 'desc' } }),
    prisma.pipelineEvent.findMany({ where: { pipelineRunId }, orderBy: { createdAt: 'asc' } }),
  ])

  const promptOneArtifact = asRecord(run.promptOneArtifact)
  const provenance = getPromptOneProvenance(run.promptOneArtifact)
  const evidenceByKey = promptOneEvidenceByCandidateKey(run.promptOneArtifact)
  const evidence = (run.transcript?.evidence || []).map((candidate) => {
    const raw = evidenceByKey.get(candidate.candidateKey) || {}
    return {
      id: candidate.id,
      candidateKey: candidate.candidateKey,
      sourceSpan: candidate.sourceSpan,
      observation: candidate.observation,
      category: candidate.category,
      confidence: candidate.confidence,
      state: candidate.state,
      requiresReview: candidate.requiresReview,
      createdAt: candidate.createdAt.toISOString(),
      provenance: safeJson(asRecord(raw.provenance)),
    }
  })

  const hasPromptOne = Boolean(run.promptOneArtifact)
  const aiProvenanceValid = hasValidGeminiProvenance(run.promptOneArtifact)
  const qualityRejected = events.some((event) => event.eventType === 'QualityGateRejected')
  const stages: Array<{ key: string; label: string; state: VerificationState; id?: string | null; details?: string }> = [
    {
      key: 'source',
      label: 'SOURCE FILE',
      state: run.transcript?.sourceFileId ? 'VERIFIED' : 'NOT_PROVEN',
      id: run.transcript?.sourceFileId,
    },
    { key: 'run', label: 'PIPELINE RUN', state: 'VERIFIED', id: run.id },
    {
      key: 'transcript',
      label: 'TRANSCRIPT PERSISTED',
      state: run.transcript?.id ? 'VERIFIED' : 'NOT_PROVEN',
      id: run.transcript?.id,
    },
    {
      key: 'gemini',
      label: 'GEMINI PROVENANCE',
      state: run.errorCode?.startsWith('GEMINI_') ? 'FAILED' : aiProvenanceValid ? 'VERIFIED' : 'NOT_PROVEN',
      id: asString(provenance.requestId),
    },
    {
      key: 'prompt1',
      label: 'PROMPT 1 ARTIFACT',
      state: hasPromptOne ? 'PRESENT' : 'NOT_PROVEN',
      id: asString(provenance.artifactId),
      details: hasPromptOne ? 'Artifact is persisted; artifact presence alone is not cognitive verification.' : undefined,
    },
    {
      key: 'evidence',
      label: 'EVIDENCE CANDIDATES',
      state: evidence.length > 0 ? 'VERIFIED' : 'NOT_PROVEN',
      details: `${evidence.length} persisted candidate(s)`,
    },
    {
      key: 'gate',
      label: 'QUALITY GATE',
      state: qualityRejected ? 'BLOCKED' : 'NOT_PROVEN',
      details: qualityRejected ? 'QualityGateRejected persisted.' : 'No explicit QualityGatePassed event is persisted; do not infer PASS.',
    },
    {
      key: 'report',
      label: 'CLASS REPORT',
      state: report ? 'PRESENT' : 'NOT_PROVEN',
      id: report?.reportId,
      details: report ? `${report.documentStatus}/${report.implementationStatus}` : undefined,
    },
    {
      key: 'portfolio',
      label: 'PORTFOLIO PROJECTION',
      state: portfolio ? 'PRESENT' : 'NOT_PROVEN',
      id: portfolio?.id,
      details: portfolio ? `version ${portfolio.version}` : undefined,
    },
    {
      key: 'dashboard',
      label: 'DASHBOARD CONSISTENCY',
      state: 'NOT_PROVEN',
      details: 'Requires Production UI verification against the same persisted projection.',
    },
  ]

  const firstUnproven = stages.find((stage) => stage.state !== 'VERIFIED' && stage.key !== 'prompt1') || null

  return {
    run: {
      id: run.id,
      studentEmail: run.studentEmail,
      lessonId: run.lessonId,
      status: run.status,
      authorityStatus: run.authorityStatus,
      promptOneSchemaVersion: run.promptOneSchemaVersion,
      promptThreeSchemaVersion: run.promptThreeSchemaVersion,
      portfolioPatchId: run.portfolioPatchId,
      portfolioApplyStatus: run.portfolioApplyStatus,
      errorCode: run.errorCode,
      errorMessage: run.errorMessage,
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString() || null,
      createdAt: run.createdAt.toISOString(),
      updatedAt: run.updatedAt.toISOString(),
    },
    transcript: run.transcript
      ? {
          id: run.transcript.id,
          externalId: run.transcript.externalId,
          sourceFileId: run.transcript.sourceFileId,
          studentEmail: run.transcript.studentEmail,
          lessonId: run.transcript.lessonId,
          source: run.transcript.source,
          effectiveAt: run.transcript.effectiveAt?.toISOString() || null,
          recordedAt: run.transcript.recordedAt?.toISOString() || null,
          createdAt: run.transcript.createdAt.toISOString(),
          metadata: safeJson(run.transcript.metadata),
        }
      : null,
    promptOne: safeJson(promptOneArtifact),
    aiProvenance: safeJson(provenance),
    evidence,
    signals: signals.map((signal) => ({
      id: signal.id,
      proposalKey: signal.proposalKey,
      signal: signal.signal,
      rationale: signal.rationale,
      evidenceIds: asStringArray(signal.evidenceIds),
      proposedState: signal.proposedState,
      requiresReview: signal.requiresReview,
      createdAt: signal.createdAt.toISOString(),
    })),
    insight: insight
      ? {
          id: insight.id,
          text: insight.text,
          evidenceIds: asStringArray(insight.evidenceIds),
          signalIds: asStringArray(insight.signalIds),
          authorType: insight.authorType,
          isOfficial: insight.isOfficial,
          requiresReview: insight.requiresReview,
          status: insight.status,
          createdAt: insight.createdAt.toISOString(),
        }
      : null,
    report: report
      ? {
          id: report.id,
          reportId: report.reportId,
          generatedAt: report.generatedAt.toISOString(),
          promptVersion: report.promptVersion,
          projectionVersion: report.projectionVersion,
          sourceReferences: safeJson(report.sourceReferences),
          content: safeJson(report.content),
          documentStatus: report.documentStatus,
          implementationStatus: report.implementationStatus,
          updatedAt: report.updatedAt.toISOString(),
        }
      : null,
    coaching: coaching
      ? {
          id: coaching.id,
          recommendationStatus: coaching.recommendationStatus,
          isPedagogicalDecision: coaching.isPedagogicalDecision,
          requiresHumanReview: coaching.requiresHumanReview,
          documentStatus: coaching.documentStatus,
          implementationStatus: coaching.implementationStatus,
          sourceReferences: safeJson(coaching.sourceReferences),
          content: safeJson(coaching.content),
          createdAt: coaching.createdAt.toISOString(),
        }
      : null,
    portfolio: portfolio
      ? {
          id: portfolio.id,
          projectionKey: portfolio.projectionKey,
          version: portfolio.version,
          sourceRunId: portfolio.sourceRunId,
          projection: safeJson(portfolio.projection),
          createdAt: portfolio.createdAt.toISOString(),
          updatedAt: portfolio.updatedAt.toISOString(),
        }
      : null,
    reviewTasks: run.reviewTasks.map((task) => ({
      id: task.id,
      stage: task.stage,
      reviewerId: task.reviewerId,
      reviewedAt: task.reviewedAt?.toISOString() || null,
      decision: task.decision,
      reason: task.reason,
      createdAt: task.createdAt.toISOString(),
    })),
    events: events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: safeJson(event.payload),
      createdAt: event.createdAt.toISOString(),
    })),
    traceStages: stages,
    firstUnprovenStage: firstUnproven?.label || null,
  }
}

export async function getTeacherTranscript(pipelineRunId: string, evidenceId?: string) {
  const prisma = getPrismaClient()
  const run = await prisma.pipelineRun.findUnique({
    where: { id: pipelineRunId },
    include: { transcript: { include: { evidence: evidenceId ? { where: { id: evidenceId, pipelineRunId } } : false } } },
  })
  const transcript = run?.transcript
  if (!transcript) return null
  const selectedEvidence = evidenceId && Array.isArray(transcript.evidence) ? transcript.evidence[0] : null
  return {
    id: transcript.id,
    pipelineRunId,
    externalId: transcript.externalId,
    sourceFileId: transcript.sourceFileId,
    studentEmail: transcript.studentEmail,
    lessonId: transcript.lessonId,
    source: transcript.source,
    effectiveAt: transcript.effectiveAt?.toISOString() || null,
    recordedAt: transcript.recordedAt?.toISOString() || null,
    metadata: safeJson(transcript.metadata),
    content: transcript.content,
    createdAt: transcript.createdAt.toISOString(),
    selectedEvidence: selectedEvidence
      ? {
          id: selectedEvidence.id,
          sourceSpan: selectedEvidence.sourceSpan,
          observation: selectedEvidence.observation,
          category: selectedEvidence.category,
        }
      : null,
  }
}
