import type { Session } from 'next-auth'
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
import { normalizeEmail } from '@/lib/student-data'
import { isAuthorizedLearner } from '@/lib/learner-eligibility'
import { getPrismaClient } from '@/lib/prisma'

type AuthenticatedUser = Session['user'] | null | undefined

export type StudentDirectoryEntry = {
  id: string
  studentEmail: string
  studentName: string
  currentLevel: string
  targetLevel: string
  attendanceRate: string
  publishedReportCount?: number
  latestPipelineStatus?: string | null
  dataSource?: 'firestore' | 'repository'
}

export type PipelineActivityEntry = {
  id: string
  studentEmail: string
  lessonId: string
  status: string
  source: string
  createdAt: string
  completedAt: string | null
  portfolioApplyStatus: string | null
  publishedReport: boolean
}

const repositoryStudentDirectory: StudentDirectoryEntry[] = [
  {
    id: 'rafael-copolillo-gmail-com',
    studentEmail: normalizeEmail(String(rafaelProfile.studentEmail)),
    studentName: String(rafaelProfile.studentName),
    currentLevel: String(rafaelProfile.currentLevel),
    targetLevel: String(rafaelProfile.targetLevel),
    attendanceRate: String(rafaelProfile.attendanceRate),
  },
  {
    id: 'louise-nogueira-hotmail-com',
    studentEmail: normalizeEmail(String(louiseProfile.studentEmail)),
    studentName: String(louiseProfile.studentName),
    currentLevel: String(louiseProfile.currentLevel),
    targetLevel: String(louiseProfile.targetLevel),
    attendanceRate: String(louiseProfile.attendanceRate),
  },
  {
    id: 'italo-pires-gmail-com',
    studentEmail: normalizeEmail(String(italoProfile.studentEmail)),
    studentName: String(italoProfile.studentName),
    currentLevel: String(italoProfile.currentLevel),
    targetLevel: String(italoProfile.targetLevel),
    attendanceRate: String(italoProfile.attendanceRate),
  },
  {
    id: 'eduarda-coelho-gabriel-hotmail-com',
    studentEmail: normalizeEmail(String(eduardaProfile.studentEmail)),
    studentName: String(eduardaProfile.studentName),
    currentLevel: String(eduardaProfile.currentLevel),
    targetLevel: String(eduardaProfile.targetLevel),
    attendanceRate: String(eduardaProfile.attendanceRate),
  },
  {
    id: 'lauramgcstemp-gmail-com',
    studentEmail: normalizeEmail(String(lauraProfile.studentEmail)),
    studentName: String(lauraProfile.studentName),
    currentLevel: String(lauraProfile.currentLevel),
    targetLevel: String(lauraProfile.targetLevel),
    attendanceRate: String(lauraProfile.attendanceRate),
  },
  {
    id: 'galvaonanda28-gmail-com',
    studentEmail: normalizeEmail(String(mariaFernandaProfile.studentEmail)),
    studentName: String(mariaFernandaProfile.studentName),
    currentLevel: String(mariaFernandaProfile.currentLevel),
    targetLevel: String(mariaFernandaProfile.targetLevel),
    attendanceRate: String(mariaFernandaProfile.attendanceRate),
  },
  {
    id: 'diegodasiro-gmail-com',
    studentEmail: normalizeEmail(String(diegoProfile.studentEmail)),
    studentName: String(diegoProfile.studentName),
    currentLevel: String(diegoProfile.currentLevel),
    targetLevel: String(diegoProfile.targetLevel),
    attendanceRate: String(diegoProfile.attendanceRate),
  },
  {
    id: 'claudio-bit-gmail-com',
    studentEmail: normalizeEmail(String(claudioProfile.studentEmail)),
    studentName: String(claudioProfile.studentName),
    currentLevel: String(claudioProfile.currentLevel),
    targetLevel: String(claudioProfile.targetLevel),
    attendanceRate: String(claudioProfile.attendanceRate),
  },
  {
    id: 'vcrlima89-gmail-com',
    studentEmail: normalizeEmail(String(valeriaProfile.studentEmail)),
    studentName: String(valeriaProfile.studentName),
    currentLevel: String(valeriaProfile.currentLevel),
    targetLevel: String(valeriaProfile.targetLevel),
    attendanceRate: String(valeriaProfile.attendanceRate),
  },
  {
    id: 'carolvdrummond-gmail-com',
    studentEmail: normalizeEmail(String(gustavoProfile.studentEmail)),
    studentName: String(gustavoProfile.studentName),
    currentLevel: String(gustavoProfile.currentLevel),
    targetLevel: String(gustavoProfile.targetLevel),
    attendanceRate: String(gustavoProfile.attendanceRate),
  },
]

function getRepositoryStudentDirectory(reason: string): StudentDirectoryEntry[] {
  console.warn(`[admin-dashboard] Using the repository student directory: ${reason}`)
  return repositoryStudentDirectory
    .filter((student) => isAuthorizedLearner(student.studentEmail))
    .map((student) => ({ ...student, dataSource: 'repository' as const }))
}

async function enrichWithPipelineState(students: StudentDirectoryEntry[]) {
  try {
    const prisma = getPrismaClient()
    return await Promise.all(
      students.map(async (student) => {
        const [publishedReportCount, latestRun] = await Promise.all([
          prisma.classReportProjection.count({
            where: { studentEmail: student.studentEmail, documentStatus: 'published' },
          }),
          prisma.pipelineRun.findFirst({
            where: { studentEmail: student.studentEmail },
            orderBy: { createdAt: 'desc' },
            select: { status: true },
          }),
        ])

        return {
          ...student,
          publishedReportCount,
          latestPipelineStatus: latestRun?.status ?? null,
        }
      })
    )
  } catch (error) {
    console.warn('[admin-dashboard] Pipeline status unavailable', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    })
    return students
  }
}

export async function listRecentPipelineActivity(limit = 12): Promise<PipelineActivityEntry[]> {
  try {
    const prisma = getPrismaClient()
    const runs = await prisma.pipelineRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        studentEmail: true,
        lessonId: true,
        status: true,
        createdAt: true,
        completedAt: true,
        portfolioApplyStatus: true,
        transcript: { select: { source: true } },
      },
    })
    const publishedReports = await prisma.classReportProjection.findMany({
      where: { pipelineRunId: { in: runs.map((run) => run.id) }, documentStatus: 'published' },
      select: { pipelineRunId: true },
    })
    const publishedRunIds = new Set(publishedReports.map((report) => report.pipelineRunId))

    return runs.map((run) => ({
      id: run.id,
      studentEmail: run.studentEmail,
      lessonId: run.lessonId,
      status: run.status,
      source: run.transcript?.source || 'unknown',
      createdAt: run.createdAt.toISOString(),
      completedAt: run.completedAt?.toISOString() || null,
      portfolioApplyStatus: run.portfolioApplyStatus,
      publishedReport: publishedRunIds.has(run.id),
    }))
  } catch (error) {
    console.warn('[admin-dashboard] Pipeline activity unavailable', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    })
    return []
  }
}

export async function listStudentsForAdmin(_user: AuthenticatedUser): Promise<StudentDirectoryEntry[]> {
  return enrichWithPipelineState(getRepositoryStudentDirectory('Eligibility boundary filters the canonical repository directory'))
}
