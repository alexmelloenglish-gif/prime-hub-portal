import { cache } from 'react'
import type { Session } from 'next-auth'
import type { DocumentData } from 'firebase-admin/firestore'
import rafaelProfile from '@/data/students/rafael-copolillo.firestore.json'
import louiseProfile from '@/data/students/louise-d-silva-nogueira.firestore.json'
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

export type ClassReportEntry = {
  id: string
  date: string
  focus: string[]
  teacherInsight: string
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
        focus: asStringArray(entry.focus),
        teacherInsight: asString(entry.teacherInsight, 'Teacher insight pending.'),
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
  }
}

async function mergePipelineProjection(email: string, student: StudentDashboardData): Promise<StudentDashboardData> {
  try {
    const projection = await getPrismaClient().portfolioProjection.findUnique({
      where: { studentEmail_projectionKey: { studentEmail: email, projectionKey: 'student-dashboard' } },
    })
    const root = asObject(projection?.projection)
    const reports = asObject(root?.classReports)
    if (!reports) return student
    const derivedReports = Object.entries(reports)
      .map(([key, value]) => {
        const report = asObject(value)
        if (report?.class_report_state !== 'projection_published') return null
        return {
          id: `pipeline-${key}`,
          date: asString(report?.date, key.split(':')[0] || 'Date pending'),
          focus: asStringArray(report?.grammarFocus).length
            ? asStringArray(report?.grammarFocus)
            : asStringArray(report?.evidenceHighlights),
          teacherInsight: asString(report?.teacherInsight, 'Teacher insight pending human review.'),
        }
      })
      .filter((item): item is { id: string; date: string; focus: string[]; teacherInsight: string } => Boolean(item))
    return {
      ...student,
      classReports: [...student.classReports, ...derivedReports.filter((item) => !student.classReports.some((existing) => existing.id === item.id))],
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
  }
}

const getStudentDashboardStateCached = cache(
  async (email: string, name?: string | null): Promise<StudentDashboardState> => {
    if (!isFirebaseConfigured) {
      const repositoryStudent = buildRepositoryStudent(email, name)
      return {
        hasAccess: Boolean(repositoryStudent),
        source: repositoryStudent ? 'repository' : 'preview',
        student: repositoryStudent,
        isPreviewingAnotherStudent: false,
        viewerEmail: email,
      }
    }

    try {
      const firestore = getFirebaseFirestore()
      const collectionName = process.env.FIREBASE_STUDENT_COLLECTION || 'students'
      const normalizedEmail = email.trim().toLowerCase()
      const directDoc = await firestore
        .collection(collectionName)
        .doc(normalizeEmailToDocId(normalizedEmail))
        .get()

      if (directDoc.exists) {
        return {
          hasAccess: true,
          source: 'firestore',
          student: await mergePipelineProjection(normalizedEmail, parseStudentDocument(directDoc.data() ?? {}, normalizedEmail, name)),
          isPreviewingAnotherStudent: false,
          viewerEmail: email,
        }
      }

      const querySnapshot = await firestore
        .collection(collectionName)
        .where('studentEmail', '==', normalizedEmail)
        .limit(1)
        .get()

      if (!querySnapshot.empty) {
        return {
          hasAccess: true,
          source: 'firestore',
          student: await mergePipelineProjection(normalizedEmail, parseStudentDocument(querySnapshot.docs[0].data(), normalizedEmail, name)),
          isPreviewingAnotherStudent: false,
          viewerEmail: email,
        }
      }

      return {
        hasAccess: false,
        source: 'firestore',
        student: null,
        isPreviewingAnotherStudent: false,
        viewerEmail: email,
      }
    } catch {
      const repositoryStudent = buildRepositoryStudent(email, name)
      return {
        hasAccess: Boolean(repositoryStudent),
        source: repositoryStudent ? 'repository' : 'preview',
        student: repositoryStudent,
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
