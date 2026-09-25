import { createHash } from 'node:crypto'
import { Prisma } from '@prisma/client'
import {
  canonicalAuthorityDraftHash,
  canonicalizeLearningRecord,
  type CanonicalAuthorityDraft,
  type CanonicalizationCommand,
} from '@/lib/canonicalization'
import { verifyCanonicalLearningRecordReadBack } from '@/lib/canonical-readback-verification'
import { projectCanonicalPortfolio } from '@/lib/canonical-portfolio-projection'
import { projectCanonicalLearningIntelligence } from '@/lib/canonical-learning-intelligence-projection'
import type { CanonicalLearningRecordPayload } from '@/lib/canonical-learning-record-contract'
import { getPrismaClient } from '@/lib/prisma'
import {
  checkpointLearningMachine,
  listLearningMachineTriggerOrigins,
  persistLearningMachineManifest,
} from '@/lib/learning-machine/run-history'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function pipelineInputMetadata(metadata: Prisma.JsonValue | null) {
  const root = asRecord(metadata)
  return asRecord(root._pipelineInput)
}

function promptOneArtifact(value: Prisma.JsonValue | null) {
  return asRecord(value)
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : []
}

export async function buildCanonicalAuthorityDraftForPipelineRun(
  pipelineRunId: string,
): Promise<CanonicalAuthorityDraft> {
  const prisma = getPrismaClient()
  const run = await prisma.pipelineRun.findUnique({
    where: { id: pipelineRunId },
    include: {
      transcript: true,
      evidenceCandidates: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!run?.transcript) throw new Error('Shared runner pipeline run or transcript was not found')

  const [signals, insight, coaching] = await Promise.all([
    prisma.learningSignalProposal.findMany({
      where: { pipelineRunId },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.teacherInsightProposal.findUnique({ where: { pipelineRunId } }),
    prisma.coachingGuidance.findUnique({ where: { pipelineRunId } }),
  ])

  const stored = pipelineInputMetadata(run.transcript.metadata)
  const studentId = text(stored.studentId)
  if (!studentId) {
    throw new Error('Shared runner canonicalization requires an authorized studentId')
  }

  const sourceRef =
    run.transcript.sourceFileId
    || run.transcript.externalId
    || run.transcript.id
  const sourceHash = createHash('sha256').update(run.transcript.content).digest('hex')

  const promptOne = promptOneArtifact(run.promptOneArtifact)
  const presentation = asRecord(promptOne.presentation_candidates)
  const vocabulary = stringArray(presentation.vocabulary_candidates)
  const coachingContent = asRecord(coaching?.content)
  const proposedActions = Array.isArray(coachingContent.proposed_actions)
    ? coachingContent.proposed_actions.map(asRecord)
    : []
  const firstAction = proposedActions.map((item) => text(item.text)).find(Boolean) ?? null
  const nextVerification = text(coachingContent.recommendedNextClassStrategy)

  const pedagogicalPayload: CanonicalLearningRecordPayload = {
    validatedEvidence: run.evidenceCandidates.map((candidate) => ({
      evidenceId: candidate.id,
      statement: candidate.observation,
      sourceRefs: [sourceRef],
      sourceSpan: candidate.sourceSpan,
    })),
    learningSignals: signals.map((signal) => ({
      signalId: signal.id,
      statement: signal.signal,
      evidenceRefs: Array.isArray(signal.evidenceIds)
        ? signal.evidenceIds.filter((item): item is string => typeof item === 'string')
        : [],
    })),
    teacherInsight: insight
      ? {
          statement: insight.text,
          evidenceRefs: Array.isArray(insight.evidenceIds)
            ? insight.evidenceIds.filter((item): item is string => typeof item === 'string')
            : [],
          signalRefs: Array.isArray(insight.signalIds)
            ? insight.signalIds.filter((item): item is string => typeof item === 'string')
            : [],
        }
      : null,
    evidenceBoundaries: [
      'AI-generated candidates become canonical only through this exact teacher-authorized payload.',
      'Missing or ambiguous information remains unresolved rather than inferred.',
    ],
    nextVerification,
    vocabulary: vocabulary.map((term) => ({ term })),
    learnerStateChange: null,
    priorityChange: null,
    nextAction: firstAction ? { text: firstAction } : null,
  }

  return {
    studentId,
    studentEmail: run.studentEmail,
    scopeType: 'lesson',
    scopeKey: `lesson:${studentId}:${run.lessonId}`,
    lessonId: run.lessonId,
    sourceReferences: [{
      sourceType: run.transcript.source,
      sourceRef,
      sourceHash,
    }],
    transcriptId: run.transcript.id,
    pipelineRunId: run.id,
    proposalReferences: {
      evidenceCandidateIds: run.evidenceCandidates.map((candidate) => candidate.id),
      learningSignalProposalIds: signals.map((signal) => signal.id),
      teacherInsightProposalIds: insight ? [insight.id] : [],
    },
    decisionType: 'accepted',
    authorityScope: 'lesson_canonicalization',
    pedagogicalPayload,
  }
}

export async function canonicalAuthorityPayloadHashForPipelineRun(
  pipelineRunId: string,
) {
  const draft = await buildCanonicalAuthorityDraftForPipelineRun(pipelineRunId)
  return {
    draft,
    hash: canonicalAuthorityDraftHash(draft),
  }
}

async function resolveReviewer(reviewerRef: string) {
  const prisma = getPrismaClient()
  const normalized = reviewerRef.trim()
  const byId = await prisma.user.findUnique({
    where: { id: normalized },
    select: { id: true, role: true },
  })
  if (byId) return byId

  if (normalized.includes('@')) {
    const byEmail = await prisma.user.findUnique({
      where: { email: normalized.toLowerCase() },
      select: { id: true, role: true },
    })
    if (byEmail) return byEmail
  }

  throw new Error('Shared runner reviewer does not resolve to a persisted user')
}

async function assertPersistedPublicationAuthority(input: {
  pipelineRunId: string
  reviewTaskId: string
  reviewerId: string
  decisionTimestamp: Date
  authorityPayloadHash: string
}) {
  const prisma = getPrismaClient()
  const task = await prisma.reviewTask.findUnique({ where: { id: input.reviewTaskId } })
  if (
    !task
    || task.pipelineRunId !== input.pipelineRunId
    || task.decision !== 'approved'
    || !task.reviewerId
    || !task.reviewedAt
  ) {
    throw new Error('Shared runner Teacher Authority decision is not durably approved')
  }

  const persistedReviewer = await resolveReviewer(task.reviewerId)
  if (persistedReviewer.id !== input.reviewerId) {
    throw new Error('Shared runner Teacher Authority reviewer changed during resume')
  }
  if (task.reviewedAt.getTime() !== input.decisionTimestamp.getTime()) {
    throw new Error('Shared runner Teacher Authority timestamp changed during resume')
  }

  const approval = await prisma.pipelineEvent.findUnique({
    where: {
      pipelineRunId_eventType_aggregateId: {
        pipelineRunId: input.pipelineRunId,
        eventType: 'PublicationReviewApproved',
        aggregateId: input.reviewTaskId,
      },
    },
    select: { payload: true },
  })
  const payload = asRecord(approval?.payload)
  if (text(payload.canonicalAuthorityPayloadHash) !== input.authorityPayloadHash) {
    throw new Error('Shared runner Teacher Authority payload hash changed during resume')
  }
}

async function loadCanonicalizationResult(input: {
  pipelineRunId: string
  reviewTaskId: string
}) {
  const prisma = getPrismaClient()
  const record = await prisma.canonicalLearningRecord.findFirst({
    where: {
      pipelineRunId: input.pipelineRunId,
      teacherDecisionId: input.reviewTaskId,
    },
    orderBy: { canonicalVersion: 'desc' },
    include: { canonicalizationProvenance: true },
  })
  if (!record?.canonicalizationProvenance) {
    throw new Error('Shared runner resume expected an existing canonicalization result')
  }
  return {
    canonicalRecordId: record.canonicalRecordId,
    canonicalVersion: record.canonicalVersion,
    canonicalHash: record.canonicalHash,
    provenanceId: record.canonicalizationProvenance.id,
    idempotencyKey: record.canonicalizationProvenance.idempotencyKey,
    idempotentReplay: true,
  }
}

function jsonStringArray(value: Prisma.JsonValue) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

async function loadVerificationResult(input: {
  canonicalRecordId: string
  reviewTaskId: string
}) {
  const prisma = getPrismaClient()
  const verification = await prisma.canonicalLearningRecordVerification.findFirst({
    where: {
      expectedCanonicalRecordId: input.canonicalRecordId,
      expectedTeacherDecisionId: input.reviewTaskId,
      verificationStatus: 'PASS',
    },
    orderBy: { verifiedAt: 'desc' },
  })
  if (!verification) {
    throw new Error('Shared runner resume expected an existing canonical read-back PASS')
  }
  return {
    verificationId: verification.id,
    status: 'PASS' as const,
    mismatchFields: jsonStringArray(verification.mismatchFields),
  }
}

async function loadProjectionResults(canonicalRecordId: string) {
  const prisma = getPrismaClient()
  const [portfolio, learningIntelligence] = await Promise.all([
    prisma.canonicalLearningRecordProjection.findFirst({
      where: {
        canonicalRecordId,
        targetType: 'portfolio',
        projectionStatus: 'VERIFIED',
      },
      orderBy: { verifiedAt: 'desc' },
    }),
    prisma.canonicalLearningIntelligenceProjection.findFirst({
      where: {
        canonicalRecordId,
        targetType: 'learning_intelligence',
        projectionStatus: 'VERIFIED',
      },
      orderBy: { verifiedAt: 'desc' },
    }),
  ])
  if (!portfolio || !learningIntelligence) {
    throw new Error('Shared runner resume expected existing VERIFIED canonical projections')
  }
  return {
    portfolioProjection: {
      projectionId: portfolio.projectionId,
      projectionKey: portfolio.projectionKey,
      projectionHash: portfolio.projectionHash,
      projectionStatus: 'VERIFIED' as const,
      idempotentReplay: true,
    },
    learningIntelligenceProjection: {
      projectionId: learningIntelligence.projectionId,
      projectionKey: learningIntelligence.projectionKey,
      projectionHash: learningIntelligence.projectionHash,
      projectionStatus: 'VERIFIED' as const,
      idempotentReplay: true,
    },
  }
}

export async function executeCanonicalContinuation(input: {
  pipelineRunId: string
  reviewTaskId: string
  reviewerRef: string
  decisionTimestamp: Date
}) {
  const prisma = getPrismaClient()
  const run = await prisma.pipelineRun.findUnique({
    where: { id: input.pipelineRunId },
    select: {
      id: true,
      normalizedRunIdentity: true,
      machineVersion: true,
      machineContractVersion: true,
      attemptNumber: true,
      studentEmail: true,
      lessonId: true,
      resumePoint: true,
      status: true,
      finalManifest: true,
    },
  })
  if (!run?.normalizedRunIdentity) {
    throw new Error('Shared runner normalized identity is missing')
  }

  const reviewer = await resolveReviewer(input.reviewerRef)
  if (!['admin', 'teacher'].includes(reviewer.role)) {
    throw new Error('Shared runner canonical authority requires a persisted teacher or administrator')
  }

  const { draft, hash: authorityPayloadHash } =
    await canonicalAuthorityPayloadHashForPipelineRun(input.pipelineRunId)

  await assertPersistedPublicationAuthority({
    pipelineRunId: input.pipelineRunId,
    reviewTaskId: input.reviewTaskId,
    reviewerId: reviewer.id,
    decisionTimestamp: input.decisionTimestamp,
    authorityPayloadHash,
  })

  const command: CanonicalizationCommand = {
    ...draft,
    authoritySourceType: 'review_task',
    teacherDecisionId: input.reviewTaskId,
    reviewerId: reviewer.id,
    reviewerRole: reviewer.role,
    decisionTimestamp: input.decisionTimestamp.toISOString(),
  }

  const resumableStages = [
    'canonicalization',
    'canonical_verification',
    'canonical_projections',
    'communication_projection',
  ] as const
  type ResumableStage = (typeof resumableStages)[number]
  const requestedResume = resumableStages.includes(run.resumePoint as ResumableStage)
    ? run.resumePoint as ResumableStage
    : 'canonicalization'
  const shouldRun = (stage: ResumableStage) =>
    resumableStages.indexOf(stage) >= resumableStages.indexOf(requestedResume)

  let canonicalization: {
    canonicalRecordId: string
    canonicalVersion: number
    canonicalHash: string
    provenanceId: string
    idempotencyKey: string
    idempotentReplay: boolean
  }

  if (shouldRun('canonicalization')) {
    await checkpointLearningMachine({
      pipelineRunId: input.pipelineRunId,
      stage: 'canonicalization',
      status: 'canonicalizing',
      resumePoint: 'canonicalization',
      payload: {
        teacherDecisionId: input.reviewTaskId,
        authorityPayloadHash,
      },
    })
    canonicalization = await canonicalizeLearningRecord(command)
    await checkpointLearningMachine({
      pipelineRunId: input.pipelineRunId,
      stage: 'canonical_verification',
      status: 'verifying_canonical_record',
      resumePoint: 'canonical_verification',
      payload: {
        canonicalRecordId: canonicalization.canonicalRecordId,
        canonicalVersion: canonicalization.canonicalVersion,
        canonicalHash: canonicalization.canonicalHash,
      },
    })
  } else {
    canonicalization = await loadCanonicalizationResult({
      pipelineRunId: input.pipelineRunId,
      reviewTaskId: input.reviewTaskId,
    })
  }

  let verification: {
    verificationId: string
    status: 'PASS'
    mismatchFields: string[]
  }

  if (shouldRun('canonical_verification')) {
    const verified = await verifyCanonicalLearningRecordReadBack({
      command,
      writeResult: canonicalization,
    })
    if (verified.status !== 'PASS') {
      throw new Error(
        `Shared runner canonical read-back verification failed: ${verified.mismatchFields.join(', ')}`,
      )
    }
    verification = {
      verificationId: verified.verificationId,
      status: 'PASS',
      mismatchFields: verified.mismatchFields,
    }
    await checkpointLearningMachine({
      pipelineRunId: input.pipelineRunId,
      stage: 'canonical_projections',
      status: 'projecting_canonical_record',
      resumePoint: 'canonical_projections',
      payload: {
        canonicalRecordId: canonicalization.canonicalRecordId,
        verificationId: verification.verificationId,
      },
    })
  } else {
    verification = await loadVerificationResult({
      canonicalRecordId: canonicalization.canonicalRecordId,
      reviewTaskId: input.reviewTaskId,
    })
  }

  let portfolioProjection: {
    projectionId: string
    projectionKey: string
    projectionHash: string
    projectionStatus: 'VERIFIED'
    idempotentReplay: boolean
  }
  let learningIntelligenceProjection: {
    projectionId: string
    projectionKey: string
    projectionHash: string
    projectionStatus: 'VERIFIED'
    idempotentReplay: boolean
  }

  if (shouldRun('canonical_projections')) {
    const projected = await Promise.all([
      projectCanonicalPortfolio({
        canonicalRecordId: canonicalization.canonicalRecordId,
        requiredG3VerificationId: verification.verificationId,
      }),
      projectCanonicalLearningIntelligence({
        canonicalRecordId: canonicalization.canonicalRecordId,
        requiredG3VerificationId: verification.verificationId,
      }),
    ])
    portfolioProjection = projected[0]
    learningIntelligenceProjection = projected[1]
    if (
      portfolioProjection.projectionStatus !== 'VERIFIED'
      || learningIntelligenceProjection.projectionStatus !== 'VERIFIED'
    ) {
      throw new Error('Shared runner canonical projection verification failed')
    }
    await checkpointLearningMachine({
      pipelineRunId: input.pipelineRunId,
      stage: 'communication_projection',
      status: 'finalizing',
      resumePoint: 'communication_projection',
      payload: {
        canonicalRecordId: canonicalization.canonicalRecordId,
        verificationId: verification.verificationId,
        portfolioProjectionId: portfolioProjection.projectionId,
        learningIntelligenceProjectionId: learningIntelligenceProjection.projectionId,
      },
    })
  } else {
    const projected = await loadProjectionResults(canonicalization.canonicalRecordId)
    portfolioProjection = projected.portfolioProjection
    learningIntelligenceProjection = projected.learningIntelligenceProjection
  }

  const triggerOrigins = await listLearningMachineTriggerOrigins(input.pipelineRunId)
  const manifest = {
    manifestVersion: 'shared-runner-manifest-v1',
    normalizedRunIdentity: run.normalizedRunIdentity,
    machineVersion: run.machineVersion,
    machineContractVersion: run.machineContractVersion,
    pipelineRunId: run.id,
    attemptNumber: run.attemptNumber,
    studentEmail: run.studentEmail,
    lessonId: run.lessonId,
    triggerOrigins,
    teacherAuthority: {
      reviewTaskId: input.reviewTaskId,
      reviewerId: reviewer.id,
      reviewerRole: reviewer.role,
      decisionTimestamp: input.decisionTimestamp.toISOString(),
      canonicalAuthorityPayloadHash: authorityPayloadHash,
    },
    canonicalization: {
      canonicalRecordId: canonicalization.canonicalRecordId,
      canonicalVersion: canonicalization.canonicalVersion,
      canonicalHash: canonicalization.canonicalHash,
      idempotencyKey: canonicalization.idempotencyKey,
      idempotentReplay: canonicalization.idempotentReplay,
    },
    verification: {
      verificationId: verification.verificationId,
      status: verification.status,
      mismatchFields: verification.mismatchFields,
    },
    projections: {
      portfolio: {
        projectionId: portfolioProjection.projectionId,
        projectionKey: portfolioProjection.projectionKey,
        projectionHash: portfolioProjection.projectionHash,
        status: portfolioProjection.projectionStatus,
        idempotentReplay: portfolioProjection.idempotentReplay,
      },
      learningIntelligence: {
        projectionId: learningIntelligenceProjection.projectionId,
        projectionKey: learningIntelligenceProjection.projectionKey,
        projectionHash: learningIntelligenceProjection.projectionHash,
        status: learningIntelligenceProjection.projectionStatus,
        idempotentReplay: learningIntelligenceProjection.idempotentReplay,
      },
    },
    resumePoint: null,
    completedAt: new Date().toISOString(),
  }

  await persistLearningMachineManifest({
    pipelineRunId: input.pipelineRunId,
    manifest,
    status: 'completed',
    completed: true,
  })

  await checkpointLearningMachine({
    pipelineRunId: input.pipelineRunId,
    stage: 'completed',
    status: 'completed',
    resumePoint: null,
    payload: {
      canonicalRecordId: canonicalization.canonicalRecordId,
      verificationId: verification.verificationId,
      portfolioProjectionId: portfolioProjection.projectionId,
      learningIntelligenceProjectionId: learningIntelligenceProjection.projectionId,
    },
  })

  return {
    canonicalization,
    verification,
    portfolioProjection,
    learningIntelligenceProjection,
    manifest,
  }
}
