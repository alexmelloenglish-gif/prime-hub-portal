import { NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const TARGET_STUDENT_ID = 'stu_4c4da6c04ac4'
const ADMIN_EMAIL = 'alexandre@primedigitalhub.com.br'
const GUSTAVO_EMAIL = 'gugasalgado7@gmail.com'
const CAROL_EMAIL = 'carolvdrummond@gmail.com'

function compactUser(
  user: { id: string; email: string | null; name: string | null; role: string } | null
) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

export async function GET() {
  if (process.env.VERCEL_ENV !== 'preview') {
    return new NextResponse('Not found', { status: 404 })
  }

  const prisma = getPrismaClient()

  try {
    const [admin, gustavo, carol] = await Promise.all([
      prisma.user.findUnique({
        where: { email: ADMIN_EMAIL },
        select: { id: true, email: true, name: true, role: true },
      }),
      prisma.user.findUnique({
        where: { email: GUSTAVO_EMAIL },
        select: { id: true, email: true, name: true, role: true },
      }),
      prisma.user.findUnique({
        where: { email: CAROL_EMAIL },
        select: { id: true, email: true, name: true, role: true },
      }),
    ])

    const pilotUserIds = [gustavo?.id, carol?.id].filter(
      (value): value is string => Boolean(value)
    )

    const relations = await prisma.accountLearnerRelation.findMany({
      where: {
        OR: [
          { studentId: TARGET_STUDENT_ID },
          ...(pilotUserIds.length ? [{ userId: { in: pilotUserIds } }] : []),
        ],
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        userId: true,
        studentId: true,
        status: true,
        relationType: true,
        sourceType: true,
        sourceReference: true,
        authorizationHash: true,
        authorizedBy: true,
        authorizedAt: true,
        validFrom: true,
        validUntil: true,
        revokedAt: true,
      },
    })

    const relationIds = relations.map((relation) => relation.id)
    const events = relationIds.length
      ? await prisma.accountLearnerRelationEvent.findMany({
          where: { relationId: { in: relationIds } },
          orderBy: { occurredAt: 'asc' },
          select: {
            id: true,
            relationId: true,
            eventType: true,
            actorUserId: true,
            sourceType: true,
            sourceReference: true,
            authorizationHash: true,
            occurredAt: true,
          },
        })
      : []

    const g5 = await prisma.canonicalLearningIntelligenceProjection.findFirst({
      where: {
        studentId: TARGET_STUDENT_ID,
        targetType: 'learning_intelligence',
        projectionStatus: 'VERIFIED',
      },
      orderBy: [{ canonicalVersion: 'desc' }, { createdAt: 'desc' }],
      select: {
        projectionId: true,
        projectionKey: true,
        projectionHash: true,
        projectionVersion: true,
        projectionStatus: true,
        canonicalRecordId: true,
        canonicalVersion: true,
        canonicalHash: true,
        studentId: true,
        teacherDecisionId: true,
        authorityScope: true,
        g3VerificationId: true,
      },
    })

    const clr = g5
      ? await prisma.canonicalLearningRecord.findUnique({
          where: { canonicalRecordId: g5.canonicalRecordId },
          select: {
            canonicalRecordId: true,
            canonicalVersion: true,
            canonicalHash: true,
            studentId: true,
            teacherDecisionId: true,
            authorityScope: true,
          },
        })
      : null

    const g3 = g5
      ? await prisma.canonicalLearningRecordVerification.findUnique({
          where: { id: g5.g3VerificationId },
          select: {
            id: true,
            verificationStatus: true,
            expectedCanonicalRecordId: true,
            observedCanonicalRecordId: true,
            expectedCanonicalVersion: true,
            observedCanonicalVersion: true,
            expectedCanonicalHash: true,
            observedCanonicalHash: true,
          },
        })
      : null

    const wrongStudentIdRelations = relations.filter(
      (relation) =>
        pilotUserIds.includes(relation.userId) &&
        relation.studentId !== TARGET_STUDENT_ID
    )

    const proof = {
      marker: 'G6_RUNTIME_PREFLIGHT_V1',
      environment: process.env.VERCEL_ENV,
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      targetStudentId: TARGET_STUDENT_ID,
      users: {
        admin: compactUser(admin),
        gustavo: compactUser(gustavo),
        carol: compactUser(carol),
      },
      adminAuthority: {
        present: Boolean(admin),
        roleIsAdmin: admin?.role === 'admin',
      },
      relations,
      events,
      invariants: {
        relationCount: relations.length,
        eventCount: events.length,
        wrongStudentIdRelationCount: wrongStudentIdRelations.length,
        duplicatePilotUserIdentity:
          Boolean(gustavo && carol && gustavo.id === carol.id),
      },
      canonicalWitness: {
        g5,
        clr,
        g3,
        lineageMatches: Boolean(
          g5 &&
            clr &&
            g5.studentId === TARGET_STUDENT_ID &&
            clr.studentId === TARGET_STUDENT_ID &&
            g5.canonicalRecordId === clr.canonicalRecordId &&
            g5.canonicalVersion === clr.canonicalVersion &&
            g5.canonicalHash === clr.canonicalHash
        ),
        g3Pass: Boolean(
          g5 &&
            clr &&
            g3 &&
            g3.verificationStatus === 'PASS' &&
            g3.expectedCanonicalRecordId === clr.canonicalRecordId &&
            g3.expectedCanonicalVersion === clr.canonicalVersion &&
            g3.expectedCanonicalHash === clr.canonicalHash
        ),
      },
    }

    console.info('G6_RUNTIME_PREFLIGHT', JSON.stringify(proof))

    return NextResponse.json({
      ok: true,
      marker: proof.marker,
      gitCommitSha: proof.gitCommitSha,
      preflight: {
        adminPresent: proof.adminAuthority.present,
        adminRoleIsAdmin: proof.adminAuthority.roleIsAdmin,
        gustavoUserPresent: Boolean(gustavo),
        carolUserPresent: Boolean(carol),
        relationCount: proof.invariants.relationCount,
        eventCount: proof.invariants.eventCount,
        wrongStudentIdRelationCount: proof.invariants.wrongStudentIdRelationCount,
        duplicatePilotUserIdentity: proof.invariants.duplicatePilotUserIdentity,
        g5VerifiedPresent: Boolean(g5),
        clrPresent: Boolean(clr),
        g3Present: Boolean(g3),
        lineageMatches: proof.canonicalWitness.lineageMatches,
        g3Pass: proof.canonicalWitness.g3Pass,
      },
    })
  } catch (error) {
    console.error(
      'G6_RUNTIME_PREFLIGHT_ERROR',
      error instanceof Error ? error.message : String(error)
    )

    return NextResponse.json(
      {
        ok: false,
        marker: 'G6_RUNTIME_PREFLIGHT_V1',
        error: 'DATABASE_PREFLIGHT_FAILED',
      },
      { status: 503 }
    )
  }
}
