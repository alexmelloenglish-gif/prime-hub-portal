import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const manifest = JSON.parse(
  readFileSync(
    new URL('../data/access/gustavo-account-learner-authorizations.json', import.meta.url),
    'utf8'
  )
)

function normalizedEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function authorizationHash(entry) {
  const payload = JSON.stringify({
    schemaVersion: manifest.schemaVersion,
    sourceType: manifest.decision.sourceType,
    sourceReference: manifest.decision.sourceReference,
    authorizedByEmail: normalizedEmail(manifest.decision.authorizedByEmail),
    studentId: manifest.learner.studentId,
    accountEmail: normalizedEmail(entry.email),
    relationType: entry.relationType,
  })
  return createHash('sha256').update(payload).digest('hex')
}

async function ensureUser(entry) {
  const email = normalizedEmail(entry.email)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return existing

  return prisma.user.create({
    data: {
      email,
      name: entry.name || null,
      role: 'student',
    },
  })
}

async function ensureRelation(actor, user, entry) {
  const studentId = String(manifest.learner.studentId)
  const existing = await prisma.accountLearnerRelation.findUnique({
    where: {
      userId_studentId: {
        userId: user.id,
        studentId,
      },
    },
  })

  if (existing) {
    if (existing.status !== 'ACTIVE') {
      throw new Error(
        `Existing relation ${existing.id} for ${user.email} is not ACTIVE; manual lifecycle review required.`
      )
    }
    if (existing.relationType !== entry.relationType) {
      throw new Error(
        `Existing relation ${existing.id} has relationType=${existing.relationType}; expected ${entry.relationType}.`
      )
    }
    return existing
  }

  const hash = authorizationHash(entry)
  const authorizedAt = new Date()

  return prisma.$transaction(async (tx) => {
    const relation = await tx.accountLearnerRelation.create({
      data: {
        userId: user.id,
        studentId,
        status: 'ACTIVE',
        relationType: entry.relationType,
        sourceType: manifest.decision.sourceType,
        sourceReference: manifest.decision.sourceReference,
        authorizationHash: hash,
        authorizedBy: actor.id,
        authorizedAt,
      },
    })

    await tx.accountLearnerRelationEvent.create({
      data: {
        relationId: relation.id,
        eventType: 'AUTHORIZED',
        actorUserId: actor.id,
        sourceType: manifest.decision.sourceType,
        sourceReference: manifest.decision.sourceReference,
        authorizationHash: hash,
        occurredAt: authorizedAt,
        metadata: {
          accountEmail: normalizedEmail(entry.email),
          learnerDisplayName: manifest.learner.displayName,
          relationshipContext: entry.relationshipContext,
          phase: 'phase3-runtime-authority-proof',
        },
      },
    })

    return relation
  })
}

async function main() {
  const actorEmail = normalizedEmail(manifest.decision.authorizedByEmail)
  const actor = await prisma.user.findUnique({ where: { email: actorEmail } })

  if (!actor || actor.role !== 'admin') {
    throw new Error(
      `Administrative authority missing: ${actorEmail} must exist with role=admin before provisioning.`
    )
  }

  const results = []

  for (const entry of manifest.accounts) {
    const user = await ensureUser(entry)
    const relation = await ensureRelation(actor, user, entry)

    const readBack = await prisma.accountLearnerRelation.findUnique({
      where: { id: relation.id },
      include: {
        events: {
          orderBy: { occurredAt: 'asc' },
        },
      },
    })

    if (!readBack) {
      throw new Error(`Read-back failed for relation ${relation.id}`)
    }

    if (
      readBack.userId !== user.id ||
      readBack.studentId !== manifest.learner.studentId ||
      readBack.status !== 'ACTIVE' ||
      readBack.relationType !== entry.relationType
    ) {
      throw new Error(`Field comparison failed for ${entry.email}`)
    }

    results.push({
      email: normalizedEmail(entry.email),
      userId: user.id,
      relationId: readBack.id,
      studentId: readBack.studentId,
      relationType: readBack.relationType,
      status: readBack.status,
      sourceType: readBack.sourceType,
      sourceReference: readBack.sourceReference,
      eventCount: readBack.events.length,
    })
  }

  console.log(JSON.stringify({
    phase: 'PHASE_3',
    learner: manifest.learner,
    authorizationSource: manifest.decision.sourceReference,
    readBack: 'PASS',
    results,
  }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
