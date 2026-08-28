import { getPrismaClient } from '@/lib/prisma'

export type TeacherIntelligenceAnalytics = {
  activity: {
    pipelineRuns: number
    transcripts: number
    classReports: number
    reviewTasks: number
    completedReviews: number
  }
  technicalRuntime: {
    completedRuns: number
    notProvenRuns: number
    failedRuns: number
    qualityGateRejected: number
    geminiGenerationFailed: number
  }
  cognitivePipeline: {
    evidenceCandidatesGenerated: number
    evidenceCandidatesAcceptedByTeacher: number
    evidenceCandidatesRejectedOrBlocked: number
    signalProposals: number
    insightProposals: number
    officialInsightRecords: number
    coachingProposals: number
  }
  canonicalStatus: {
    validatedEvidence: 'NOT_PROVEN'
    canonicalLearningSignal: 'NOT_PROVEN'
    pedagogicalDecision: 'NOT_PROVEN'
    educationalAction: 'NOT_PROVEN'
    learningStateTransition: 'NOT_PROVEN'
    longitudinalOutcome: 'NOT_PROVEN'
  }
}

export async function getTeacherIntelligenceAnalytics(): Promise<TeacherIntelligenceAnalytics> {
  const prisma = getPrismaClient()
  const [
    pipelineRuns,
    transcripts,
    classReports,
    reviewTasks,
    completedReviews,
    completedRuns,
    notProvenRuns,
    failedRuns,
    qualityGateRejected,
    geminiGenerationFailed,
    evidenceCandidatesGenerated,
    evidenceCandidatesAcceptedByTeacher,
    evidenceCandidatesRejectedOrBlocked,
    signalProposals,
    insightProposals,
    officialInsightRecords,
    coachingProposals,
  ] = await Promise.all([
    prisma.pipelineRun.count(),
    prisma.transcript.count(),
    prisma.classReportProjection.count(),
    prisma.reviewTask.count(),
    prisma.reviewTask.count({ where: { decision: { not: null } } }),
    prisma.pipelineRun.count({ where: { status: 'completed' } }),
    prisma.pipelineRun.count({ where: { status: 'not_proven' } }),
    prisma.pipelineRun.count({ where: { status: 'failed' } }),
    prisma.pipelineEvent.count({ where: { eventType: 'QualityGateRejected' } }),
    prisma.pipelineEvent.count({ where: { eventType: 'GeminiGenerationFailed' } }),
    prisma.evidenceCandidate.count(),
    prisma.evidenceCandidate.count({ where: { state: 'teacher_accepted_candidate' } }),
    prisma.evidenceCandidate.count({ where: { state: { in: ['rejected', 'blocked'] } } }),
    prisma.learningSignalProposal.count(),
    prisma.teacherInsightProposal.count(),
    prisma.teacherInsightProposal.count({ where: { isOfficial: true } }),
    prisma.coachingGuidance.count(),
  ])

  return {
    activity: {
      pipelineRuns,
      transcripts,
      classReports,
      reviewTasks,
      completedReviews,
    },
    technicalRuntime: {
      completedRuns,
      notProvenRuns,
      failedRuns,
      qualityGateRejected,
      geminiGenerationFailed,
    },
    cognitivePipeline: {
      evidenceCandidatesGenerated,
      evidenceCandidatesAcceptedByTeacher,
      evidenceCandidatesRejectedOrBlocked,
      signalProposals,
      insightProposals,
      officialInsightRecords,
      coachingProposals,
    },
    canonicalStatus: {
      validatedEvidence: 'NOT_PROVEN',
      canonicalLearningSignal: 'NOT_PROVEN',
      pedagogicalDecision: 'NOT_PROVEN',
      educationalAction: 'NOT_PROVEN',
      learningStateTransition: 'NOT_PROVEN',
      longitudinalOutcome: 'NOT_PROVEN',
    },
  }
}
