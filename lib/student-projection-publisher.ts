import { createHash } from 'node:crypto'
import type { DocumentData } from 'firebase-admin/firestore'
import { getFirebaseFirestore } from '@/lib/firebase-admin'
import {
  buildRepositoryStudentForProjection,
  mergePipelineProjectionForPublication,
  normalizeEmail,
} from '@/lib/student-data'

export const FIRESTORE_PROJECTION_AUTHORITY = 'canonical-publish-v1'

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  const record = value as Record<string, unknown>
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(',')}}`
}

function projectionHash(value: unknown): string {
  return createHash('sha256').update(stableJson(value)).digest('hex')
}

export async function publishCanonicalStudentProjection(email: string) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) throw new Error('Student email is required')

  const repositoryStudent = buildRepositoryStudentForProjection(normalizedEmail)
  if (!repositoryStudent) {
    throw new Error(`No authorized repository snapshot exists for ${normalizedEmail}`)
  }

  const student = await mergePipelineProjectionForPublication(normalizedEmail, repositoryStudent)
  const firestore = getFirebaseFirestore()
  const collectionName = process.env.FIREBASE_STUDENT_COLLECTION || 'students'
  const documentId = normalizedEmail.replace(/[^a-z0-9]+/g, '-')
  const projection = {
    ...student,
    studentEmail: normalizedEmail,
    canonicalProjection: student.canonicalProjection,
  } as unknown as DocumentData
  const hash = projectionHash(projection)
  const now = new Date().toISOString()

  await firestore.collection(collectionName).doc(documentId).set(
    {
      dashboard: projection,
      studentId: student.studentId,
      studentName: student.studentName,
      studentEmail: normalizedEmail,
      projectionAuthority: FIRESTORE_PROJECTION_AUTHORITY,
      projectionVersion: student.canonicalProjection.version,
      projectionGeneratedAt: now,
      projectionHash: hash,
      projectionSource: 'canonical-student-projection-engine',
    },
    { merge: true },
  )

  return {
    studentId: student.studentId,
    studentEmail: normalizedEmail,
    documentId,
    projectionVersion: student.canonicalProjection.version,
    projectionAuthority: FIRESTORE_PROJECTION_AUTHORITY,
    projectionGeneratedAt: now,
    projectionHash: hash,
  }
}
