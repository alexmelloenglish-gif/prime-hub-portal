import { cache } from 'react'
import type { Session } from 'next-auth'
import type { DocumentData } from 'firebase-admin/firestore'
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
import { getFirebaseFirestore, isFirebaseConfigured } from '@/lib/firebase-admin'
import { getPrismaClient } from '@/lib/prisma'

type AuthenticatedUser = Session['user'] | null | undefined

type ProgressAccent = 'green' | 'yellow' | 'pink' | 'blue'
type GoalStatus = 'on-track' | 'attention' | 'completed'

export type ManageSpaceLink = {
  id: string
  title: string
  href: string
  description: string
  icon: string
}

export type PortfolioNavigationLink = {
  id: string
  title: string
  href: string
}

export type ProgressTrackerCard = {
  id: string
  title: string
  status: string
  insight: string
  accent: ProgressAccent
}

export type AttendanceEntry = {
  id: string
  date: string
  status: 'present' | 'scheduled' | 'pending'
  title: string
  summary: string
}

export type GoalEntry = {
  id: string
  title: string
  description: string
  status: GoalStatus
}

export type VocabularyEntry = {
  id: string
  term: string
  meaning: string
  example: string
}

export type TeacherFeedbackEntry = {
  id: string
  title: string
  body: string
}

export type CumulativeImpactData = {
  title: string
  summary: string
  evidence: string[]
}

export type ClassReportEntry = {
  id: string
  date: string
  title: string
  summary: string
  focus: string[]
  vocabulary: string[]
  teacherInsight: string
  status: 'published' | 'legacy'
}

export type StudentDashboardData = {
  studentId?: string
  profileStatus?: string
  identityVersion?: string
  studentName: string
  studentEmail: string
  currentLevel: string
  targetLevel: string
  attendanceRate: string
  attendanceLabel: string
  focus: string
  manageSpace: ManageSpaceLink[]
  portfolioNavigation: PortfolioNavigationLink[]
  progressTracker: ProgressTrackerCard[]
  attendanceOverview: AttendanceEntry[]
  classReports: ClassReportEntry[]
  goals: GoalEntry[]
  vocabularyBank: VocabularyEntry[]
  grammarOverview: {
    title: string
    summary: string
    focusPoints: string[]
  }
  teacherFeedback: TeacherFeedbackEntry[]
  cumulativeImpact: CumulativeImpactData
}

export type StudentDashboardState = {
  hasAccess: boolean
  source: 'firestore' | 'repository' | 'preview'
  student: StudentDashboardData | null
  isPreviewingAnotherStudent: boolean
  viewerEmail: string | null
}

const portfolioHrefMap: Record<string, string> = {
  '/dashboard/aulas': '#attendance-overview',
  '/dashboard/progresso': '#progress-tracker',
  '/dashboard/metas': '#vocabulary-bank',
  '/dashboard/conversacao': '#grammar-overview',
  '/dashboard/configuracoes': '#teacher-feedback',
}

function normalizePortfolioHref(href: string) {
  return portfolioHrefMap[href] ?? href
}

function normalizeEmailToDocId(email: string) {
  return email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function normalizeEmail(email?: string | null) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

const verifiedRepositoryProfiles: Record<string, DocumentData> = {
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

function getAdminPreviewEmails() {
  return new Set(
    (process.env.ADMIN_PREVIEW_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

export function isAdminUser(user: AuthenticatedUser) {
  const viewerEmail = normalizeEmail(user?.email)

  if (!viewerEmail) {
    return false
  }

  if (user?.role === 'admin') {
    return true
  }

  return getAdminPreviewEmails().has(viewerEmail)
}

function canPreviewAnotherStudent(user: AuthenticatedUser, requestedStudentEmail?: string | null) {
  const viewerEmail = normalizeEmail(user?.email)
  const targetEmail = normalizeEmail(requestedStudentEmail)

  if (!viewerEmail || !targetEmail || viewerEmail === targetEmail) {
    return false
  }

  if (process.env.NODE_ENV === 'development') {
    return true
  }

  return isAdminUser(user)
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : []
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function parseManageSpace(value: unknown): ManageSpaceLink[] {
  if (!Array.isArray(value)) {
    return []
  }

  const links = value
    .map((item, index) => {
      const entry = asObject(item)
      if (!entry) {
        return null
      }

      return {
        id: asString(entry.id, `manage-${index + 1}`),
        title: asString(entry.title, `Resource ${index + 1}`),
        href: asString(entry.href, '#'),
        description: asString(entry.description, 'Quick access resource.'),
        icon: asString(entry.icon, 'link'),
      }
    })
    .filter((item): item is ManageSpaceLink => Boolean(item))

  return links
}

function parsePortfolioNavigation(value: unknown): PortfolioNavigationLink[] {
  if (!Array.isArray(value)) {
    return []
  }

  const links = value
    .map((item, index) => {
      const entry = asObject(item)
      if (!entry) {
        return null
      }

        return {
          id: asString(entry.id, `portfolio-nav-${index + 1}`),
          title: asString(entry.title, `Section ${index + 1}`),
          href: normalizePortfolioHref(asString(entry.href, '#')),
        }
      })
    .filter((item): item is PortfolioNavigationLink => Boolean(item))

  return links
}

function parseProgressTracker(value: unknown): ProgressTrackerCard[] {
  if (!Array.isArray(value)) {
    return []
  }

  const cards = value
    .map((item, index) => {
      const entry = asObject(item)
      if (!entry) {
        return null
      }

      const accent = asString(entry.accent, 'green')
      const safeAccent: ProgressAccent =
        accent === 'yellow' || accent === 'pink' || accent === 'blue' ? accent : 'green'

      return {
        id: asString(entry.id, `progress-${index + 1}`),
        title: asString(entry.title, `Skill ${index + 1}`),
        status: asString(entry.status, 'In progress'),
        insight: asString(entry.insight, 'Performance data will appear here.'),
        accent: safeAccent,
      }
    })
    .filter((item): item is ProgressTrackerCard => Boolean(item))

  return cards
}

function parseAttendance(value: unknown): AttendanceEntry[] {
  if (!Array.isArray(value)) {
    return []
  }

  const entries = value
    .map((item, index) => {
      const entry = asObject(item)
      if (!entry) {
        return null
      }

      const status = asString(entry.status, 'present')

      return {
        id: asString(entry.id, `attendance-${index + 1}`),
        date: asString(entry.date, 'Date pending'),
        status: status === 'scheduled' ? 'scheduled' : status === 'pending' ? 'pending' : 'present',
        title: asString(entry.title, `Lesson ${index + 1}`),
        summary: asString(entry.summary, 'Summary pending.'),
      }
    })
    .filter((item): item is AttendanceEntry => Boolean(item))

  return entries
}

function parseClassReports(value: unknown): ClassReportEntry[] {
  if (!Array.isArray(value)) {
    return []
  }

  const reports = value
    .map((item, index) => {
      const entry = asObject(item)
      if (!entry) {
        return null
      }

      return {
        id: asString(entry.id, `class-report-${index + 1}`),
        date: asString(entry.date, 'Date pending'),
        title: asString(entry.title, 'Class report'),
        summary: asString(entry.summary, 'Summary pending.'),
        focus: asStringArray(entry.focus),
        vocabulary: asStringArray(entry.vocabulary),
        teacherInsight: asString(entry.teacherInsight, 'Teacher insight pending.'),
        status: 'legacy' as 'published' | 'legacy',
      }
    })
    .filter((item): item is ClassReportEntry => Boolean(item))

  return reports
}

function parseGoals(value: unknown): GoalEntry[] {
  if (!Array.isArray(value)) {
    return []
  }

  const goals = value
    .map((item, index) => {
      const entry = asObject(item)
      if (!entry) {
        return null
      }

      const status = asString(entry.status, 'on-track')
      const safeStatus: GoalStatus =
        status === 'attention' || status === 'completed' ? status : 'on-track'

      return {
        id: asString(entry.id, `goal-${index + 1}`),
        title: asString(entry.title, `Goal ${index + 1}`),
        description: asString(entry.description, 'Goal details pending.'),
        status: safeStatus,
      }
    })
    .filter((item): item is GoalEntry => Boolean(item))

  return goals
}

function parseVocabulary(value: unknown): VocabularyEntry[] {
  if (!Array.isArray(value)) {
    return []
  }

  const vocabulary = value
    .map((item, index) => {
      const entry = asObject(item)
      if (!entry) {
        return null
      }

      return {
        id: asString(entry.id, `vocabulary-${index + 1}`),
        term: asString(entry.term, `Term ${index + 1}`),
        meaning: asString(entry.meaning, 'Meaning pending.'),
        example: asString(entry.example, 'Usage example pending.'),
      }
    })
    .filter((item): item is VocabularyEntry => Boolean(item))

  return vocabulary
}

function parseTeacherFeedback(value: unknown): TeacherFeedbackEntry[] {
  if (!Array.isArray(value)) {
    return []
  }

  const entries = value
    .map((item, index) => {
      const entry = asObject(item)
      if (!entry) {
        return null
      }

      return {
        id: asString(entry.id, `feedback-${index + 1}`),
        title: asString(entry.title, `Feedback ${index + 1}`),
        body: asString(entry.body, 'Feedback pending.'),
      }
    })
    .filter((item): item is TeacherFeedbackEntry => Boolean(item))

  return entries
}

function parseCumulativeImpact(value: unknown): CumulativeImpactData {
  const entry = asObject(value)
  return {
    title: asString(entry?.title, 'Cumulative Learning Impact'),
    summary: asString(entry?.summary, 'Published learning impact will appear here.'),
    evidence: asStringArray(entry?.evidence),
  }
}

function buildRepositoryStudent(email: string, name?: string | null): StudentDashboardData | null {
  const normalizedEmail = normalizeEmail(email)
  const profile = verifiedRepositoryProfiles[normalizedEmail]
  if (!profile) return null

  const profileEmail = asString(profile.studentEmail, normalizedEmail)
  const profileName = asString(profile.studentName, name ?? 'Prime Student')
  return parseStudentDocument(profile, profileEmail, profileName)
}

function buildPreviewStudent(email: string, name?: string | null): StudentDashboardData {
  return {
    studentName: name ?? 'Prime Student',
    studentEmail: email,
    currentLevel: 'Assessment pending',
    targetLevel: 'Not yet established',
    attendanceRate: 'Pending verification',
    attendanceLabel: 'Attendance data pending.',
    focus: 'Learning focus pending human review',
    manageSpace: [],
    portfolioNavigation: [],
    progressTracker: [],
    attendanceOverview: [],
    classReports: [],
    goals: [],
    vocabularyBank: [],
    grammarOverview: {
      title: 'Grammar Overview',
      summary: 'Awaiting validated evidence and published teacher insight.',
      focusPoints: [],
    },
    teacherFeedback: [],
    cumulativeImpact: {
      title: 'Cumulative Learning Impact',
      summary: 'Published learning impact will appear here.',
      evidence: [],
    },
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }
}

async function mergePipelineProjection(email: string, student: StudentDashboardData): Promise<StudentDashboardData> {
  try {
    const normalizedEmail = normalizeEmail(email)
    const prisma = getPrismaClient()
    const [portfolioProjection, publishedReports] = await Promise.all([
      prisma.portfolioProjection.findUnique({
        where: { studentEmail_projectionKey: { studentEmail: normalizedEmail, projectionKey: 'student-dashboard' } },
      }),
      prisma.classReportProjection.findMany({
        where: { studentEmail: normalizedEmail, documentStatus: 'published' },
        orderBy: [{ generatedAt: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          reportId: true,
          lessonId: true,
          generatedAt: true,
          content: true,
          sourceSnapshot: true,
          documentStatus: true,
        },
      }),
    ])

    const root = asObject(portfolioProjection?.projection)
    const reportRecords = publishedReports
      .map((projection) => {
        const content = asObject(projection.content)
        if (!content || projection.documentStatus !== 'published') return null
        const snapshot = asObject(projection.sourceSnapshot)
        const reportContext = asObject(snapshot?.report_context)
        const reportId = asString(content.reportId, projection.reportId)
        const focus = asStringArray(content.grammarFocus)
        const evidenceHighlights = asStringArray(content.evidenceHighlights)
        const vocabulary = asStringArray(content.vocabulary)
        const teacherInsightIsPublished = asString(content.teacherInsightStatus) === 'published'
        return {
          id: `pipeline-${reportId}`,
          reportId,
          lessonId: projection.lessonId,
          date: asString(
            reportContext?.class_date,
            asString(content.classDate, projection.generatedAt.toISOString().slice(0, 10))
          ),
          title: asString(content.title, `Lesson ${projection.lessonId}`),
          summary: asString(content.summary, 'Published class report available.'),
          focus: focus.length ? focus : evidenceHighlights,
          vocabulary,
          teacherInsight: teacherInsightIsPublished ? asString(content.teacherInsight) : '',
          attendanceStatus: asString(reportContext?.attendance_status),
          attendanceSource: asString(reportContext?.attendance_source),
        }
      })
      .filter(
        (
          item
        ): item is {
          id: string
          reportId: string
          lessonId: string
          date: string
          title: string
          summary: string
          focus: string[]
          vocabulary: string[]
          teacherInsight: string
          attendanceStatus: string
          attendanceSource: string
        } => Boolean(item)
      )

    const reportEntries = reportRecords.map((report) => ({
      id: report.id,
      date: report.date,
      title: report.title,
      summary: report.summary,
      focus: report.focus,
      vocabulary: report.vocabulary,
      teacherInsight: report.teacherInsight || 'Teacher insight is pending authorized publication.',
      status: 'published' as const,
    }))
    const newClassReports = reportEntries.filter(
      (report) => !student.classReports.some((existing) => existing.id === report.id)
    )
    const classReports = [...student.classReports, ...newClassReports]

    const pipelineAttendance = reportRecords.map((report) => ({
      id: `pipeline-attendance-${report.reportId}`,
      date: report.date,
      status: report.attendanceStatus === 'attended' && report.attendanceSource ? ('present' as const) : ('pending' as const),
      title: report.title,
      summary: report.summary,
    }))
    const newAttendance = pipelineAttendance.filter(
      (lesson) => !student.attendanceOverview.some((existing) => existing.id === lesson.id)
    )
    const attendanceOverview = [...student.attendanceOverview, ...newAttendance]

    const projectionVocabulary = Object.values(asObject(root?.vocabulary) ?? {})
      .map((value, index) => {
        const entry = asObject(value)
        const term = asString(entry?.item, asString(entry?.term, asString(entry?.word)))
        if (!term) return null
        return {
          id: `pipeline-vocabulary-${index + 1}-${term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          term,
          meaning: asString(entry?.meaning, 'Recorded in the published class report.'),
          example: asString(entry?.example, 'Reuse this item in a future class context.'),
        }
      })
      .filter((item): item is VocabularyEntry => Boolean(item))
    const reportVocabulary = reportRecords.flatMap((report) =>
      report.vocabulary.map((term) => ({
        id: `pipeline-report-vocabulary-${report.reportId}-${term}`,
        term,
        meaning: 'Recorded in the published class report.',
        example: 'Reuse this item in a future class context.',
      }))
    )
    const vocabularyBank = [...student.vocabularyBank]
    for (const item of [...projectionVocabulary, ...reportVocabulary]) {
      if (!vocabularyBank.some((existing) => existing.term.toLowerCase() === item.term.toLowerCase())) {
        vocabularyBank.push(item)
      }
    }

    const projectionCorrections = Object.values(asObject(root?.corrections) ?? {})
      .map((value) => asObject(value))
      .filter((value): value is Record<string, unknown> => Boolean(value))
    const reportCorrections = publishedReports.flatMap((projection) => {
      const content = asObject(projection.content)
      return Array.isArray(content?.corrections) ? content.corrections : []
    })
    const correctionCount = projectionCorrections.length + reportCorrections.length
    const grammarFocus = Array.from(
      new Set([
        ...student.grammarOverview.focusPoints,
        ...reportRecords.flatMap((report) => report.focus),
      ])
    )
    const progressTracker = student.progressTracker.length
      ? student.progressTracker
      : [
          reportRecords.length
            ? {
                id: 'pipeline-published-classes',
                title: 'Published class reports',
                status: 'Active Growth',
                insight: `${reportRecords.length} published class report${reportRecords.length === 1 ? '' : 's'} connected to this student portfolio.`,
                accent: 'green' as const,
              }
            : null,
          vocabularyBank.length
            ? {
                id: 'pipeline-vocabulary',
                title: 'Vocabulary',
                status: 'Active Growth',
                insight: `${vocabularyBank.length} vocabulary item${vocabularyBank.length === 1 ? '' : 's'} recorded from published learning content.`,
                accent: 'yellow' as const,
              }
            : null,
          grammarFocus.length
            ? {
                id: 'pipeline-grammar',
                title: 'Grammar focus',
                status: 'Improving',
                insight: `${grammarFocus.length} grammar focus point${grammarFocus.length === 1 ? '' : 's'} connected to published class content.`,
                accent: 'pink' as const,
              }
            : null,
          correctionCount
            ? {
                id: 'pipeline-corrections',
                title: 'Corrections to recycle',
                status: 'Improving',
                insight: `${correctionCount} correction${correctionCount === 1 ? '' : 's'} recorded for future teacher-led practice.`,
                accent: 'blue' as const,
              }
            : null,
        ].filter((item): item is ProgressTrackerCard => Boolean(item))

    const publishedFeedback = reportRecords
      .filter((report) => report.teacherInsight)
      .map((report) => ({
        id: `pipeline-feedback-${report.reportId}`,
        title: `Teacher insight — ${report.date}`,
        body: report.teacherInsight,
      }))
    const teacherFeedback = [...student.teacherFeedback]
    for (const feedback of publishedFeedback) {
      if (!teacherFeedback.some((existing) => existing.id === feedback.id)) teacherFeedback.push(feedback)
    }

    if (!reportRecords.length && !projectionVocabulary.length && !correctionCount) return student

    const presentCount = attendanceOverview.filter((lesson) => lesson.status === 'present').length
    const pipelineSummary = `${reportRecords.length} published class report${reportRecords.length === 1 ? '' : 's'}, ${vocabularyBank.length} vocabulary item${vocabularyBank.length === 1 ? '' : 's'} and ${correctionCount} correction${correctionCount === 1 ? '' : 's'} connected to the longitudinal projection.`
    const cumulativeImpact: CumulativeImpactData = {
      title: 'Cumulative Learning Impact',
      summary: pipelineSummary,
      evidence: [
        reportRecords.length
          ? `${reportRecords.length} published class report${reportRecords.length === 1 ? '' : 's'} available`
          : 'No published class report available',
        `${vocabularyBank.length} vocabulary item${vocabularyBank.length === 1 ? '' : 's'} recorded`,
        `${correctionCount} correction${correctionCount === 1 ? '' : 's'} recorded for teacher-led recycling`,
      ],
    }

    return {
      ...student,
      attendanceRate:
        student.attendanceRate.toLowerCase().includes('pending') && attendanceOverview.length
          ? `${presentCount}/${attendanceOverview.length} confirmed`
          : student.attendanceRate,
      attendanceLabel:
        student.attendanceLabel.toLowerCase().includes('pending') && attendanceOverview.length
          ? `Consistency: ${presentCount} of ${attendanceOverview.length} pipeline-linked lessons confirmed`
          : student.attendanceLabel,
      focus: student.focus.toLowerCase().includes('pending')
        ? 'Published class reports are now feeding the longitudinal student portfolio.'
        : student.focus,
      progressTracker,
      attendanceOverview,
      classReports,
      vocabularyBank,
      grammarOverview: {
        ...student.grammarOverview,
        summary: student.grammarOverview.summary.toLowerCase().includes('awaiting') && grammarFocus.length
          ? `Grammar focus consolidated from ${reportRecords.length} published class report${reportRecords.length === 1 ? '' : 's'}.`
          : student.grammarOverview.summary,
        focusPoints: grammarFocus,
      },
      teacherFeedback,
      cumulativeImpact,
    }
  } catch {
    return student
  }
}

function parseStudentDocument(
  data: DocumentData,
  email: string,
  name?: string | null
): StudentDashboardData {
  const root = asObject(data.dashboard) ?? (data as Record<string, unknown>)

  return {
    studentId: asString(root.studentId, normalizeEmailToDocId(email)),
    profileStatus: asString(root.profileStatus, 'active'),
    identityVersion: asString(root.identityVersion, 'legacy-email-v1'),
    studentName: asString(root.studentName, name ?? 'Prime Student'),
    studentEmail: asString(root.studentEmail, email),
    currentLevel: asString(root.currentLevel, 'B2 Upper-Intermediate'),
    targetLevel: asString(root.targetLevel, 'C1 Advanced'),
    attendanceRate: asString(root.attendanceRate, '0%'),
    attendanceLabel: asString(root.attendanceLabel, 'Attendance data pending.'),
    focus: asString(root.focus, 'Learning focus pending.'),
    manageSpace: parseManageSpace(root.manageSpace),
    portfolioNavigation: parsePortfolioNavigation(root.portfolioNavigation),
    progressTracker: parseProgressTracker(root.progressTracker),
    attendanceOverview: parseAttendance(root.attendanceOverview),
    classReports: parseClassReports(root.classReports),
    goals: parseGoals(root.goals),
    vocabularyBank: parseVocabulary(root.vocabularyBank),
    grammarOverview: {
      title: asString(asObject(root.grammarOverview)?.title, 'Grammar Overview'),
      summary: asString(asObject(root.grammarOverview)?.summary, 'Grammar focus pending.'),
      focusPoints: asStringArray(asObject(root.grammarOverview)?.focusPoints).length
        ? asStringArray(asObject(root.grammarOverview)?.focusPoints)
        : [],
    },
    teacherFeedback: parseTeacherFeedback(root.teacherFeedback),
    cumulativeImpact: parseCumulativeImpact(root.cumulativeImpact),
  }
}

const getStudentDashboardStateCached = cache(
  async (email: string, name?: string | null): Promise<StudentDashboardState> => {
    if (!isFirebaseConfigured) {
      const repositoryStudent = buildRepositoryStudent(email, name)
      const mergedStudent = repositoryStudent ? await mergePipelineProjection(email, repositoryStudent) : null
      return {
        hasAccess: Boolean(mergedStudent),
        source: mergedStudent ? 'repository' : 'preview',
        student: mergedStudent,
        isPreviewingAnotherStudent: false,
        viewerEmail: email,
      }
    }

    try {
      const firestore = getFirebaseFirestore()
      const collectionName = process.env.FIREBASE_STUDENT_COLLECTION || 'students'
      const normalizedEmail = email.trim().toLowerCase()
      const directDoc = await withTimeout(
        firestore.collection(collectionName).doc(normalizeEmailToDocId(normalizedEmail)).get(),
        8000,
        'Firestore direct student lookup'
      )

      if (directDoc.exists) {
        return {
          hasAccess: true,
          source: 'firestore',
          student: await mergePipelineProjection(normalizedEmail, parseStudentDocument(directDoc.data() ?? {}, normalizedEmail, name)),
          isPreviewingAnotherStudent: false,
          viewerEmail: email,
        }
      }

      const querySnapshot = await withTimeout(
        firestore.collection(collectionName).where('studentEmail', '==', normalizedEmail).limit(1).get(),
        8000,
        'Firestore email student lookup'
      )

      if (!querySnapshot.empty) {
        return {
          hasAccess: true,
          source: 'firestore',
          student: await mergePipelineProjection(normalizedEmail, parseStudentDocument(querySnapshot.docs[0].data(), normalizedEmail, name)),
          isPreviewingAnotherStudent: false,
          viewerEmail: email,
        }
      }

      const repositoryStudent = buildRepositoryStudent(normalizedEmail, name)
      const mergedStudent = repositoryStudent ? await mergePipelineProjection(normalizedEmail, repositoryStudent) : null
      return {
        hasAccess: Boolean(mergedStudent),
        source: mergedStudent ? 'repository' : 'firestore',
        student: mergedStudent,
        isPreviewingAnotherStudent: false,
        viewerEmail: email,
      }
    } catch {
      const repositoryStudent = buildRepositoryStudent(email, name)
      const mergedStudent = repositoryStudent ? await mergePipelineProjection(email, repositoryStudent) : null
      return {
        hasAccess: Boolean(mergedStudent),
        source: mergedStudent ? 'repository' : 'preview',
        student: mergedStudent,
        isPreviewingAnotherStudent: false,
        viewerEmail: email,
      }
    }
  }
)

export async function getStudentDashboardState(
  user: AuthenticatedUser,
  requestedStudentEmail?: string | null
): Promise<StudentDashboardState> {
  if (!user?.email) {
    return {
      hasAccess: false,
      source: 'preview',
      student: null,
      isPreviewingAnotherStudent: false,
      viewerEmail: null,
    }
  }

  const viewerEmail = normalizeEmail(user.email)
  const targetEmail = canPreviewAnotherStudent(user, requestedStudentEmail)
    ? normalizeEmail(requestedStudentEmail)
    : viewerEmail

  const state = await getStudentDashboardStateCached(targetEmail, user.name)

  return {
    ...state,
    isPreviewingAnotherStudent: targetEmail !== viewerEmail,
    viewerEmail,
  }
}

export type AttendanceData = {
  total: number
  attended: number
  missed: number
  consistency: string
}

export type ClassReport = {
  date: string
  summary: string
  grammarFocus: string
  goals: string[]
  vocabulary: string[]
}

export type VocabularyItem = {
  word: string
  meaning: string
  example: string
  category: string
}

export type GrammarItem = {
  focusArea: string
  description: string
  status: string
}

export type ManageLink = {
  label: string
  url: string
  icon: string
}

export type ProgressSkill = {
  skill: string
  status: string
  insight: string
}

export type StudentInfo = {
  name: string
  teacher: string
  program: string
  frequency: string
  learningFocus: string
  currentLevel: string
  targetLevel: string
}

export type LegacyStudentData = {
  links: Array<{
    label: string
    url: string
  }>
  vocabularyBank: VocabularyItem[]
  grammarOverview: GrammarItem[]
  teacherFeedback: string
  teacherFeedbackMonth: string
  attendance: AttendanceData
  classReports: ClassReport[]
}

function buildLegacyStudentData(student: StudentDashboardData): LegacyStudentData {
  const attended = student.attendanceOverview.filter((entry) => entry.status === 'present').length
  const total = student.attendanceOverview.length
  const missed = Math.max(total - attended, 0)
  const consistencyMatch = student.attendanceLabel.match(/Consistency:\s*([^(]+)/i)
  const consistency = consistencyMatch?.[1]?.trim() || student.attendanceLabel

  return {
    links: student.manageSpace.map((link) => ({
      label: link.title,
      url: link.href,
    })),
    vocabularyBank: student.vocabularyBank.map((item, index) => ({
      word: item.term,
      meaning: item.meaning,
      example: item.example,
      category: index < 3 ? 'Travel & Documentation' : 'Portfolio Vocabulary',
    })),
    grammarOverview: student.grammarOverview.focusPoints.map((point, index) => {
      const [focusArea, ...descriptionParts] = point.split(':')
      return {
        focusArea: focusArea.trim() || `Focus Area ${index + 1}`,
        description: descriptionParts.join(':').trim() || point,
        status: index < 2 ? 'Improving' : 'Developing',
      }
    }),
    teacherFeedback: student.teacherFeedback.map((entry) => entry.body).join(' '),
    teacherFeedbackMonth: 'April 2026',
    attendance: {
      total,
      attended,
      missed,
      consistency,
    },
    classReports: student.attendanceOverview.map((entry, index) => ({
      date: entry.date,
      summary: entry.summary,
      grammarFocus:
        student.classReports[index]?.focus.join(', ') ||
        student.grammarOverview.focusPoints[0] ||
        'Grammar focus pending.',
      goals: student.goals.map((goal) => goal.title),
      vocabulary: student.vocabularyBank.slice(0, 4).map((item) => item.term),
    })),
  }
}

export const rafaelData = buildLegacyStudentData(
  buildPreviewStudent('rafael.copolillo@gmail.com', 'Rafael Copolillo')
)

export async function getStudentData(email: string): Promise<LegacyStudentData | null> {
  const normalizedEmail = normalizeEmail(email)
  const state = await getStudentDashboardStateCached(
    normalizedEmail || 'rafael.copolillo@gmail.com',
    'Rafael Copolillo'
  )

  if (!state.student) {
    return null
  }

  return buildLegacyStudentData(state.student)
}
