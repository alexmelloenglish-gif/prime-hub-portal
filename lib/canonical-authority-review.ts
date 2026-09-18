import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import {
  canonicalAuthorityDraftHash,
  type CanonicalAuthorityDraft,
} from '@/lib/canonicalization'
import {
  getTeacherDecisionPackageById,
  type TeacherDecisionPackage,
} from '@/lib/teacher-decision-packages'

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function sourceRefByDate(pkg: TeacherDecisionPackage) {
  return new Map(pkg.sourceLessons.map((lesson) => [lesson.date, lesson.sourceDocumentId]))
}

export function buildCanonicalAuthorityDraftFromTeacherPackage(
  pkg: TeacherDecisionPackage,
): CanonicalAuthorityDraft {
  if (pkg.status !== 'teacher_authorized') {
    throw new Error('Teacher decision package is not teacher-authorized')
  }
  if (pkg.canonicalizationStatus !== 'authorized_for_projection') {
    throw new Error('Teacher decision package is not authorized for canonicalization/projection')
  }

  const sourceByDate = sourceRefByDate(pkg)

  return {
    studentId: pkg.studentId,
    studentEmail: pkg.studentEmail.toLowerCase(),
    scopeType: 'longitudinal',
    scopeKey: `teacher-decision-package:${pkg.packageId}`,
    lessonId: null,
    sourceReferences: pkg.sourceLessons.map((lesson) => ({
      sourceType: 'google_drive_document',
      sourceRef: lesson.sourceDocumentId,
    })),
    transcriptId: null,
    pipelineRunId: null,
    proposalReferences: null,
    decisionType: 'accepted',
    authorityScope: `teacher-decision-package:${pkg.packageVersion}:current-state+next-action+longitudinal-signals`,
    pedagogicalPayload: {
      validatedEvidence: pkg.classReportsV2.flatMap((report, reportIndex) =>
        report.evidence.map((statement, evidenceIndex) => ({
          evidenceId: `pkg:${pkg.packageId}:${reportIndex + 1}:${evidenceIndex + 1}`,
          statement,
          sourceRefs: sourceByDate.get(report.date)
            ? [sourceByDate.get(report.date)!]
            : [],
          sourceSpan: null,
        })),
      ),
      learningSignals: pkg.acceptedLongitudinalSignals.map((signal) => ({
        signalId: signal.id,
        statement: signal.signal,
      })),
      teacherInsight: {
        statement: pkg.authorizedCurrentState.learningFocus,
      },
      evidenceBoundaries: [
        ...pkg.classReportsV2.map((report) => report.boundary),
        ...pkg.acceptedLongitudinalSignals.map((signal) => signal.boundary),
        ...pkg.nonAutoPromotableClaims.map((claim) => `Non-auto-promotable: ${claim}`),
      ],
      nextVerification: pkg.authorizedNextAction.title,
      learnerStateChange: {
        level: pkg.authorizedCurrentState.level,
        targetLevel: pkg.authorizedCurrentState.targetLevel,
        levelDecision: pkg.authorizedCurrentState.levelDecision,
        learningFocus: pkg.authorizedCurrentState.learningFocus,
      },
      priorityChange: {
        priorities: pkg.authorizedCurrentState.priorities,
      },
      nextAction: {
        text: [
          pkg.authorizedNextAction.title,
          ...pkg.authorizedNextAction.steps,
        ].join(' — '),
      },
    },
  }
}

export async function prepareCanonicalAuthorityValidationTask(
  packageId: string,
) {
  const pkg = getTeacherDecisionPackageById(packageId)
  if (!pkg) throw new Error('Teacher decision package not found')
  if (pkg.studentEmail.toLowerCase().endsWith('@invalid.test')) {
    throw new Error('Synthetic learner identities are not eligible for canonical authority review')
  }

  const draft = buildCanonicalAuthorityDraftFromTeacherPackage(pkg)
  const authorityPayloadHash = canonicalAuthorityDraftHash(draft)
  const prisma = getPrismaClient()

  const existing = await prisma.validationTask.findUnique({
    where: {
      type_entityType_entityId: {
        type: 'canonical_learning_record_authority',
        entityType: 'TeacherDecisionPackage',
        entityId: pkg.packageId,
      },
    },
  })

  if (existing) return existing

  return prisma.validationTask.create({
    data: {
      type: 'canonical_learning_record_authority',
      entityType: 'TeacherDecisionPackage',
      entityId: pkg.packageId,
      status: 'pending',
      priority: 150,
      studentEmail: pkg.studentEmail.toLowerCase(),
      lessonId: null,
      title: `Canonical learning authority review — ${pkg.studentName}`,
      description:
        'Review the exact teacher-authorized learning payload before it may become a Canonical Learning Record. Approval authorizes only this preserved suggestedValue; it does not canonicalize or project anything automatically.',
      evidence: {
        packageId: pkg.packageId,
        packageVersion: pkg.packageVersion,
        packageStatus: pkg.status,
        packageCanonicalizationStatus: pkg.canonicalizationStatus,
        originalDecisionDate: pkg.decisionDate,
        originalTeacher: pkg.teacher,
        sourceLessons: pkg.sourceLessons,
        authorityPayloadHash,
        historicalBoundary:
          'This is a new current ValidationTask referencing an existing teacher-reviewed package. It does not rewrite the package, Audit v1, or historical learner projections.',
      },
      suggestedValue: asJson(draft),
    },
  })
}
