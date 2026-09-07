import { createHash } from 'node:crypto'
import type { DocumentData } from 'firebase-admin/firestore'
import { getFirebaseFirestore } from '@/lib/firebase-admin'
import { parseStudentDocument, normalizeEmail } from '@/lib/student-data'
import rafaelProfile from '@/data/students/rafael-copolillo.firestore.json'
import louiseProfile from '@/data/students/louise-d-silva-nogueira.firestore.json'
import italoProfile from '@/data/students/italo-pires-gmail-com.firestore.json'
import eduardaProfile from '@/data/students/eduarda-coelho-gabriel-hotmail-com.firestore.json'
import lauraProfile from '@/data/students/lauramgcstemp-gmail-com.firestore.json'
import mariaFernandaProfile from '@/data/students/galvaonanda28-gmail-com.firestore.json'
import diegoProfile from '@/data/students/diegodasiro-gmail-com.firestore.json'
import claudioProfile from '@/data/students/claudio-bit-gmail-com.firestore.json'
import valeriaProfile from '@/data/students/vcrlima89-gmail-com.firestore.json'
import gustavoProfile from '@/data/students/carolvdrummond-gmail-com.firestore.json'

export const FIRESTORE_PROJECTION_AUTHORITY = 'canonical-publish-v1'

const authorizedProfiles: Record<string, DocumentData> = {
  'rafael.copolillo@gmail.com': rafaelProfile as unknown as DocumentData,
  'louise_nogueira@hotmail.com': louiseProfile as unknown as DocumentData,
  'louise.nogueira@hotmail.com': louiseProfile as unknown as DocumentData,
  'itallopires17@gmail.com': italoProfile as unknown as DocumentData,
  'midias83@hotmail.com': eduardaProfile as unknown as DocumentData,
  'lauramgcstemp@gmail.com': lauraProfile as unknown as DocumentData,
  'galvaonanda28@gmail.com': mariaFernandaProfile as unknown as DocumentData,
  'diegodasiro@gmail.com': diegoProfile as unknown as DocumentData,
  'claudio.bit@gmail.com': claudioProfile as unknown as DocumentData,
  'vcrlima89@gmail.com': valeriaProfile as unknown as DocumentData,
  'carolvdrummond@gmail.com': gustavoProfile as unknown as DocumentData,
}

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

  const source = authorizedProfiles[normalizedEmail]
  if (!source || source.dashboardSourcePolicy !== 'authorized_repository_snapshot') {
    throw new Error(`No authorized repository snapshot exists for ${normalizedEmail}`)
  }

  const sourceRoot = (source.dashboard && typeof source.dashboard === 'object' ? source.dashboard : source) as DocumentData
  const student = parseStudentDocument(sourceRoot, normalizedEmail, sourceRoot.studentName as string | undefined)
  const projection = {
    ...student,
    studentEmail: normalizedEmail,
    canonicalProjection: student.canonicalProjection,
  } as unknown as DocumentData

  const hash = projectionHash(projection)
  const generatedAt = new Date().toISOString()
  const firestore = getFirebaseFirestore()
  const collectionName = process.env.FIREBASE_STUDENT_COLLECTION || 'students'
  const documentId = normalizedEmail.replace(/[^a-z0-9]+/g, '-')

  await firestore.collection(collectionName).doc(documentId).set(
    {
      dashboard: projection,
      studentId: student.studentId,
      studentName: student.studentName,
      studentEmail: normalizedEmail,
      projectionAuthority: FIRESTORE_PROJECTION_AUTHORITY,
      projectionVersion: student.canonicalProjection.version,
      projectionGeneratedAt: generatedAt,
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
    projectionGeneratedAt: generatedAt,
    projectionHash: hash,
  }
}
