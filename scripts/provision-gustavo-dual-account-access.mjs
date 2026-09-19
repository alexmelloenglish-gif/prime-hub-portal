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

function normalizedName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
}

function requireManifestIntegrity() {
  const studentId = String(manifest?.learner?.studentId ?? '').trim()
  const accounts = Array.isArray(manifest?.accounts) ? manifest.accounts : []

  if (!studentId) throw new Error('Manifest learner.studentId is required.')
  if (accounts.length !== 2) {
    throw new Error(`Pilot manifest must contain exactly 2 accounts; observed ${accounts.length}.`)
  }

  const emails = accounts.map((entry) => normalizedEmail(entry.email))
  if (emails.some((email) => !email)) throw new Error('Every pilot account must have an email.')
  if (new Set(emails).size !== accounts.length) {
    throw new Error('Pilot account emails must be unique.')
  }

  for (const entry of accounts) {
    if (!String(entry.name ?? '').trim()) {
      throw new Error(`Pilot account ${entry.email} must have an explicit expected name.`)
    }
    if (!['LEARNER_SELF', 'AUTHORIZED_ACCESS', 'OTHER_AUTHORIZED'].includes(entry.relationType)) {
      throw new Error(`Unsupported relationType for ${entry.email}: ${entry.relationType}`)
    }
  }
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

function assertExistingUserCompatible(existing, entry) {
  const expectedEmail = normalizedEmail(entry.email)
  const observedEmail = normalizedEmail(existing.email)

  if (!String(existing.id ?? '').trim()) {
    throw new Error(`Existing User for ${expectedEmail} has no userId; manual identity review required.`)
  }

  if (observedEmail !== expectedEmail) {
    throw new Error(
      `Existing User ${existing.id} email mismatch: observed=${observedEmail}, expected=${expectedEmail}.`
    )
  }

  if (existing.role !== 'student') {
    throw new Error(
      `Existing User ${existing.id} for ${expectedEmail} has role=${existing.role}; expected student.`
    )
  }

  const observedName = normalizedName(existing.name)
  const expectedName = normalizedName(entry.name)
  if (!observedName || observedName !== expectedName) {
    throw new Error(
      `Existing User ${existing.id} for ${expectedEmail} has incompatible name=${existing.name ?? 'NULL'}; expected ${entry.name}.`
    )
  }
}

async function preflightExistingUsers(tx) {
  const emails = manifest.accounts.map((entry) => normalizedEmail(entry.email))
  const existingUsers = await tx.user.findMany({
    where: { email: { in: emails } },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  const byEmail = new Map(existingUsers.map((user) => [normalizedEmail(user.email), user]))

  for (const entry of manifest.accounts) {
    const existing = byEmail.get(normalizedEmail(entry.email))
    if (existing) assertExistingUserCompatible(existing, entry)
  }

  const existingIds = existingUsers.map((user) => user.id)
  if (new Set(existingIds).size !== existingIds.length) {
    throw new Error('Preflight found duplicate userId values across pilot identities.')
  }

  return byEmail
}

async function ensureUser(tx, existingByEmail, entry) {
  const email = normalizedEmail(entry.email)
  const existing = existingByEmail.get(email)
  if (existing) return existing

  const created = await tx.user.create({
    data: {
      email,
      name: entry.name,
      role: 'student',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  assertExistingUserCompatible(created, entry)
  return created
}

async function ensureRelation(tx, actor, user, entry) {
  const studentId = String(manifest.learner.studentId)
  const expectedHash = authorizationHash(entry)
  const existing = await tx.accountLearnerRelation.findUnique({
    where: {
      userId_studentId: {
        userId: user.id,
        studentId,
      },
    },
  })

  if (existing) {
    const mismatches = []

    if (existing.status !== 'ACTIVE') mismatches.push(`status=${existing.status}`)
    if (existing.relationType !== entry.relationType) {
      mismatches.push(`relationType=${existing.relationType}`)
    }
    if (existing.sourceType !== manifest.decision.sourceType) {
      mismatches.push(`sourceType=${existing.sourceType}`)
    }
    if (existing.sourceReference !== manifest.decision.sourceReference) {
      mismatches.push(`sourceReference=${existing.sourceReference}`)
    }
    if (existing.authorizationHash !== expectedHash) {
      mismatches.push('authorizationHash mismatch')
    }
    if (existing.authorizedBy !== actor.id) {
      mismatches.push(`authorizedBy=${existing.authorizedBy}`)
    }

    if (mismatches.length) {
      throw new Error(
        `Existing relation ${existing.id} for ${user.email} is incompatible: ${mismatches.join(', ')}. Manual lifecycle review required.`
      )
    }

    const authorizationEvent = await tx.accountLearnerRelationEvent.findFirst({
      where: {
        relationId: existing.id,
        eventType: 'AUTHORIZED',
        sourceType: manifest.decision.sourceType,
        sourceReference: manifest.decision.sourceReference,
        authorizationHash: expectedHash,
      },
      orderBy: { occurredAt: 'asc' },
    })

    if (!authorizationEvent) {
      throw new Error(
        `Existing relation ${existing.id} for ${user.email} has no matching AUTHORIZED lifecycle event.`
      )
    }

    return existing
  }

  const authorizedAt = new Date()
  const relation = await tx.accountLearnerRelation.create({
    data: {
      userId: user.id,
      studentId,
      status: 'ACTIVE',
      relationType: entry.relationType,
      sourceType: manifest.decision.sourceType,
      sourceReference: manifest.decision.sourceReference,
      authorizationHash: expectedHash,
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
      authorizationHash: expectedHash,
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
}

function assertReadBackUser(user, entry) {
  assertExistingUserCompatible(user, entry)
}

function assertReadBackRelation(readBack, user, entry) {
  const expectedHash = authorizationHash(entry)

  if (!readBack) {
    throw new Error(`Read-back failed for ${entry.email}: relation missing.`)
  }

  const mismatches = []
  if (readBack.userId !== user.id) mismatches.push('userId')
  if (readBack.studentId !== manifest.learner.studentId) mismatches.push('studentId')
  if (readBack.status !== 'ACTIVE') mismatches.push('status')
  if (readBack.relationType !== entry.relationType) mismatches.push('relationType')
  if (readBack.sourceType !== manifest.decision.sourceType) mismatches.push('sourceType')
  if (readBack.sourceReference !== manifest.decision.sourceReference) mismatches.push('sourceReference')
  if (readBack.authorizationHash !== expectedHash) mismatches.push('authorizationHash')
  if (!readBack.events.some((event) =>
    event.eventType === 'AUTHORIZED' &&
    event.sourceType === manifest.decision.sourceType &&
    event.sourceReference === manifest.decision.sourceReference &&
    event.authorizationHash === expectedHash
  )) {
    mismatches.push('AUTHORIZED event')
  }

  if (mismatches.length) {
    throw new Error(
      `Field comparison failed for ${entry.email}: ${mismatches.join(', ')}.`
    )
  }
}

async function main() {
  requireManifestIntegrity()

  const result = await prisma.$transaction(async (tx) => {
    const actorEmail = normalizedEmail(manifest.decision.authorizedByEmail)
    const actor = await tx.user.findUnique({
      where: { email: actorEmail },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!actor || actor.role !== 'admin' || !String(actor.id ?? '').trim()) {
      throw new Error(
        `Administrative authority missing or incompatible: ${actorEmail} must exist with role=admin and a stable userId before provisioning.`
      )
    }

    // PRE-FLIGHT: validate every already-persisted pilot identity before the
    // transaction performs any write. If either existing identity is
    // incompatible, the whole pilot aborts.
    const existingByEmail = await preflightExistingUsers(tx)

    const staged = []
    for (const entry of manifest.accounts) {
      const user = await ensureUser(tx, existingByEmail, entry)
      const relation = await ensureRelation(tx, actor, user, entry)
      staged.push({ entry, user, relation })
    }

    if (new Set(staged.map((item) => item.user.id)).size !== staged.length) {
      throw new Error('Pilot accounts resolved to the same userId; transaction aborted.')
    }

    // READ-BACK BOTH USERS + BOTH RELATIONS INSIDE THE SAME TRANSACTION.
    // Any mismatch throws and rolls back every User/Relation/Event write.
    const readBackResults = []
    for (const item of staged) {
      const userReadBack = await tx.user.findUnique({
        where: { id: item.user.id },
        select: { id: true, email: true, name: true, role: true },
      })

      if (!userReadBack) {
        throw new Error(`Read-back failed for ${item.entry.email}: User missing.`)
      }
      assertReadBackUser(userReadBack, item.entry)

      const relationReadBack = await tx.accountLearnerRelation.findUnique({
        where: { id: item.relation.id },
        include: {
          events: {
            orderBy: { occurredAt: 'asc' },
          },
        },
      })

      assertReadBackRelation(relationReadBack, userReadBack, item.entry)

      readBackResults.push({
        email: normalizedEmail(item.entry.email),
        name: userReadBack.name,
        role: userReadBack.role,
        userId: userReadBack.id,
        relationId: relationReadBack.id,
        studentId: relationReadBack.studentId,
        relationType: relationReadBack.relationType,
        status: relationReadBack.status,
        sourceType: relationReadBack.sourceType,
        sourceReference: relationReadBack.sourceReference,
        eventCount: relationReadBack.events.length,
      })
    }

    if (readBackResults.length !== manifest.accounts.length) {
      throw new Error(
        `Pilot read-back incomplete: expected ${manifest.accounts.length}, observed ${readBackResults.length}.`
      )
    }

    return {
      phase: 'PHASE_3',
      transactionScope: 'GUSTAVO_CAROL_ALL_OR_NOTHING',
      learner: manifest.learner,
      authorizationSource: manifest.decision.sourceReference,
      authorizedByUserId: actor.id,
      readBack: 'PASS',
      results: readBackResults,
    }
  }, {
    maxWait: 10000,
    timeout: 30000,
  })

  console.log(JSON.stringify(result, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
