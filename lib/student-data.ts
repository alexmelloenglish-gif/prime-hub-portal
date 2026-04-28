import { cache } from 'react'
import type { Session } from 'next-auth'
import type { DocumentData } from 'firebase-admin/firestore'
import { getFirebaseFirestore, isFirebaseConfigured } from '@/lib/firebase-admin'

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
  status: 'present' | 'scheduled'
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
  source: 'firestore' | 'preview'
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

const previewManageSpace: ManageSpaceLink[] = [
  {
    id: 'portfolio',
    title: 'My Portfolio',
    href: 'https://docs.google.com/document/d/1ZXPBlc34kkOcfqHWodI78_BwXuJfe-p7pU7uFLSk4bE/edit?usp=sharing',
    description: 'Open the full portfolio document with progress, attendance, vocabulary and feedback.',
    icon: 'folder-open',
  },
  {
    id: 'live-class',
    title: 'Join My Live Class',
    href: 'https://meet.google.com/xjj-yqcc-wxb',
    description: 'Fast access to the live lesson room and weekly session flow.',
    icon: 'video',
  },
  {
    id: 'class-materials',
    title: 'Class Materials',
    href: 'https://drive.google.com/drive/folders/1uk3NeAMRyCKxlfryLYGiG9r9lybq3_an?usp=drive_link',
    description: 'Slides, lesson files and supporting resources organized for each class.',
    icon: 'book-open',
  },
  {
    id: 'homework',
    title: 'My Homework Page',
    href: 'https://docs.google.com/document/d/1dVtVNt5t8yIuPRT6CvmeRv2_zxv3NevBVJzAYSdtL68/edit?usp=drive_link',
    description: 'Action items, post-class practice and self-study tasks.',
    icon: 'clipboard-list',
  },
  {
    id: 'ai-mentor',
    title: 'My AI Speaking Mentor',
    href: 'https://chatgpt.com/gg/v/69d6f22fc1f481948eae7f49b44ace22?token=WUpdcx1iECMkOtDQnAyV6g',
    description: 'Practice speaking prompts and reflection support between classes.',
    icon: 'bot',
  },
  {
    id: 'calendar',
    title: 'My Lesson Calendar',
    href: 'https://stride.microsoft.com/agents/b1a8a526-7535-4cfb-a685-4ea39f3557f4#',
    description: 'Track your rhythm, dates and upcoming sessions in one place.',
    icon: 'calendar-days',
  },
  {
    id: 'support',
    title: 'Prime Support',
    href: 'https://wa.me/5521965147515?text=Oi!%20Gostaria%20de%20falar%20com%20o%20atendimento%2C%20pode%20me%20ajudar%3F',
    description: 'Get help with links, platform questions or class logistics.',
    icon: 'headphones',
  },
]

const previewPortfolioNavigation: PortfolioNavigationLink[] = [
  {
    id: 'nav-attendance',
    title: 'Attendance Overview',
    href: '#attendance-overview',
  },
  {
    id: 'nav-progress',
    title: 'Progress Tracker',
    href: '#progress-tracker',
  },
  {
    id: 'nav-vocabulary',
    title: 'Vocabulary Bank',
    href: '#vocabulary-bank',
  },
  {
    id: 'nav-grammar',
    title: 'Grammar Overview',
    href: '#grammar-overview',
  },
  {
    id: 'nav-feedback',
    title: 'Teacher Feedback',
    href: '#teacher-feedback',
  },
]

const previewProgressTracker: ProgressTrackerCard[] = [
  {
    id: 'fluency',
    title: 'Fluency',
    status: 'Strong',
    insight: 'Improved structure and clarity in extended speaking, especially when retelling trips, experiences and current events.',
    accent: 'green',
  },
  {
    id: 'listening',
    title: 'Listening',
    status: 'Strong',
    insight: 'Understands complex real-world input such as BBC news, AI discussions and political topics with effective verification strategies.',
    accent: 'green',
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    status: 'Active Growth',
    insight: 'Expanding with better nuance, emotional expression and precision across travel, geopolitics, business, cooking and daily life.',
    accent: 'yellow',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    status: 'Improving',
    insight: 'Clear progress in past tense accuracy, self-correction and sentence completion, with ongoing work on natural phrasing and consistency.',
    accent: 'pink',
  },
  {
    id: 'analytical-discussion',
    title: 'Analytical Discussion',
    status: 'Very Strong',
    insight: 'Explains, connects and evaluates complex ideas effectively, especially in geopolitics, public affairs and AI in business.',
    accent: 'blue',
  },
]

const previewAttendance: AttendanceEntry[] = [
  {
    id: 'class-2026-03-05',
    date: 'March 5, 2026',
    status: 'present',
    title: 'Italy trip storytelling and BBC current events',
    summary: 'Rafael shared his recent trip to Italy with clear chronological storytelling and strong communicative instinct. The lesson also introduced a BBC report about Iran, strengthening listening comprehension, memory recall and real-world retelling.',
  },
  {
    id: 'class-2026-03-12',
    date: 'March 12, 2026',
    status: 'present',
    title: 'Advanced fluency, geopolitics and international relations',
    summary: 'The class focused on advanced conversation fluency, narrative skills and geopolitical vocabulary. Rafael showed strong curiosity about global events and strong potential for advanced fluency development.',
  },
  {
    id: 'class-2026-03-23',
    date: 'March 23, 2026',
    status: 'present',
    title: 'Lifestyle, technology and political institutions',
    summary: 'The lesson moved from health, nutrition and technology into public institutions and political developments in Rio. Rafael communicated with confidence in familiar real-life topics while grammar precision became the next growth target.',
  },
  {
    id: 'class-2026-03-26',
    date: 'March 26, 2026',
    status: 'present',
    title: 'Dream storytelling plus AI in business and society',
    summary: 'Rafael handled spontaneous speaking, listening and interpretation around AI and business with strong analytical thinking. The key priority was improving verb accuracy and core sentence patterns without losing communicative power.',
  },
  {
    id: 'class-2026-04-06',
    date: 'April 6, 2026',
    status: 'present',
    title: 'Structured storytelling, emotions and family language dynamics',
    summary: 'This lesson developed guided speaking with scaffolding, emotional vocabulary and clarity in past forms. Rafael showed noticeable improvement in self-correction and stronger narrative organization when supported by structure.',
  },
  {
    id: 'class-2026-04-09',
    date: 'April 9, 2026',
    status: 'present',
    title: 'Homes, cooking processes and complex political explanation',
    summary: 'The class combined house and kitchen vocabulary with discussion of a complex political scenario at Alerj. Rafael explained a difficult real-world topic with very few gaps and showed stronger consolidation of the past simple.',
  },
]

const previewGoals: GoalEntry[] = [
  {
    id: 'goal-1',
    title: 'Increase structural precision without losing fluency',
    description: 'Keep the current communicative confidence while improving sentence control, clearer connectors and more refined vocabulary choices.',
    status: 'on-track',
  },
  {
    id: 'goal-2',
    title: 'Consolidate past tense consistency in storytelling',
    description: 'Strengthen past simple accuracy, reduce overuse of continuous forms and keep self-correction active in real speaking situations.',
    status: 'on-track',
  },
  {
    id: 'goal-3',
    title: 'Expand active vocabulary in high-value topics',
    description: 'Use cumulative vocabulary from travel, geopolitics, business, emotions and daily life more naturally during live classes.',
    status: 'on-track',
  },
]

const previewVocabulary: VocabularyEntry[] = [
  {
    id: 'vocab-1',
    term: 'birth certificate',
    meaning: 'official document proving birth',
    example: 'She needed her birth certificate to apply for a passport.',
  },
  {
    id: 'vocab-2',
    term: 'citizenship',
    meaning: 'legal status of belonging to a country',
    example: 'He applied for dual citizenship.',
  },
  {
    id: 'vocab-3',
    term: 'luggage',
    meaning: 'bags used for travel',
    example: 'We checked in our luggage before boarding.',
  },
  {
    id: 'vocab-4',
    term: 'asymmetry',
    meaning: 'lack of equality between sides',
    example: 'The conflict showed asymmetry.',
  },
  {
    id: 'vocab-5',
    term: 'demand forecasting',
    meaning: 'predicting customer demand',
    example: 'Demand forecasting improves planning.',
  },
  {
    id: 'vocab-6',
    term: 'sentimental',
    meaning: 'prompted by feelings of tenderness, sadness or nostalgia',
    example: "I felt sentimental when I visited my grandfather's hometown.",
  },
  {
    id: 'vocab-7',
    term: 'holiday home',
    meaning: 'vacation house used on weekends or holidays',
    example: 'We usually go to our holiday home in Teresopolis on weekends.',
  },
  {
    id: 'vocab-8',
    term: 'pizza dough',
    meaning: 'the prepared mixture used to make pizza',
    example: 'I make the pizza dough and leave it to rest for a few hours.',
  },
]

const previewTeacherFeedback: TeacherFeedbackEntry[] = [
  {
    id: 'feedback-1',
    title: 'Monthly teacher feedback',
    body: 'Rafael continues to demonstrate strong communicative ability and confidence when discussing complex real-world topics. His fluency and analytical thinking remain major strengths, and recent lessons show clear progress in grammatical awareness, particularly with past tense usage and self-correction.',
  },
  {
    id: 'feedback-2',
    title: 'Current growth priority',
    body: 'The next step is increasing consistency and precision in structure and vocabulary choice so his communication becomes more refined and advanced without losing spontaneity.',
  },
]

const previewClassReports: ClassReportEntry[] = [
  {
    id: 'report-2026-03-05',
    date: 'March 5, 2026',
    focus: ['Italy trip storytelling', 'BBC news listening and retelling', 'Simple past review'],
    teacherInsight:
      'Language used in real life stays alive. Rafael showed strong communicative instinct, focusing on meaning and interaction instead of perfection.',
  },
  {
    id: 'report-2026-03-12',
    date: 'March 12, 2026',
    focus: [
      'Advanced conversation fluency',
      'Geopolitics and international relations',
      'Analytical discussion of current events',
    ],
    teacherInsight:
      'Rafael is already capable of discussing professional experiences, international news and geopolitical analysis with excellent potential for advanced fluency development.',
  },
  {
    id: 'report-2026-03-23',
    date: 'March 23, 2026',
    focus: [
      'Lifestyle and health vocabulary',
      'Technology and education',
      'Political and institutional discussion',
    ],
    teacherInsight:
      'His fluency allows him to engage in complex discussions connected to his real life. The next step is grammatical precision while maintaining this level of communication.',
  },
  {
    id: 'report-2026-03-26',
    date: 'March 26, 2026',
    focus: ['Storytelling using past events', 'AI and business vocabulary', 'Say vs tell'],
    teacherInsight:
      'Rafael shows strong analytical thinking and can interpret challenging real-world content effectively. With more precision, his communication will become even stronger.',
  },
  {
    id: 'report-2026-04-06',
    date: 'April 6, 2026',
    focus: ['Structured storytelling', 'Emotional vocabulary', 'Past simple vs past continuous'],
    teacherInsight:
      'His emotional awareness and reflective thinking add depth to his communication. With structure, his speech becomes clearer, more organized and more natural.',
  },
  {
    id: 'report-2026-04-09',
    date: 'April 9, 2026',
    focus: [
      'Types of houses and cooking vocabulary',
      'Past simple consolidation',
      'Complex political explanation',
    ],
    teacherInsight:
      'Rafael showed significant progress explaining a highly complex political situation in English with very few gaps, while also consolidating the past simple through self-correction.',
  },
]

function normalizeEmailToDocId(email: string) {
  return email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function normalizeEmail(email?: string | null) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
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
    return previewManageSpace
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

  return links.length ? links : previewManageSpace
}

function parsePortfolioNavigation(value: unknown): PortfolioNavigationLink[] {
  if (!Array.isArray(value)) {
    return previewPortfolioNavigation
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

  return links.length ? links : previewPortfolioNavigation
}

function parseProgressTracker(value: unknown): ProgressTrackerCard[] {
  if (!Array.isArray(value)) {
    return previewProgressTracker
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

  return cards.length ? cards : previewProgressTracker
}

function parseAttendance(value: unknown): AttendanceEntry[] {
  if (!Array.isArray(value)) {
    return previewAttendance
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
        status: status === 'scheduled' ? 'scheduled' : 'present',
        title: asString(entry.title, `Lesson ${index + 1}`),
        summary: asString(entry.summary, 'Summary pending.'),
      }
    })
    .filter((item): item is AttendanceEntry => Boolean(item))

  return entries.length ? entries : previewAttendance
}

function parseClassReports(value: unknown): ClassReportEntry[] {
  if (!Array.isArray(value)) {
    return previewClassReports
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

  return reports.length ? reports : previewClassReports
}

function parseGoals(value: unknown): GoalEntry[] {
  if (!Array.isArray(value)) {
    return previewGoals
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

  return goals.length ? goals : previewGoals
}

function parseVocabulary(value: unknown): VocabularyEntry[] {
  if (!Array.isArray(value)) {
    return previewVocabulary
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

  return vocabulary.length ? vocabulary : previewVocabulary
}

function parseTeacherFeedback(value: unknown): TeacherFeedbackEntry[] {
  if (!Array.isArray(value)) {
    return previewTeacherFeedback
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

  return entries.length ? entries : previewTeacherFeedback
}

function buildPreviewStudent(email: string, name?: string | null): StudentDashboardData {
  return {
    studentName: name ?? 'Rafael Copolillo',
    studentEmail: email,
    currentLevel: 'B2 Upper-Intermediate',
    targetLevel: 'C1 Advanced',
    attendanceRate: '100%',
    attendanceLabel: 'Consistency: Excellent (6 attended, 0 missed)',
    focus: 'Fluency Development • Grammar Consolidation & Review',
    manageSpace: previewManageSpace,
    portfolioNavigation: previewPortfolioNavigation,
    progressTracker: previewProgressTracker,
    attendanceOverview: previewAttendance,
    classReports: previewClassReports,
    goals: previewGoals,
    vocabularyBank: previewVocabulary,
    grammarOverview: {
      title: 'Grammar Overview',
      summary: 'Rafael is moving from developing to improving in the most visible speaking structures. The portfolio shows real gains in self-correction, especially in past forms, while the next step is consistency and precision.',
      focusPoints: [
        'Past tense consistency: accurate use of past simple in storytelling with reduced overuse of continuous forms',
        'Sentence structure and completion: building complete, connected sentences without interruption',
        'Natural phrasing and comparatives: avoiding literal translation and choosing more natural English structures',
        'Passive voice for reporting: using more formal and news-style communication when discussing institutions and current events',
        'Say vs tell: using the correct structure for listener and message',
      ],
    },
    teacherFeedback: previewTeacherFeedback,
  }
}

function parseStudentDocument(
  data: DocumentData,
  email: string,
  name?: string | null
): StudentDashboardData {
  const root = asObject(data.dashboard) ?? (data as Record<string, unknown>)

  return {
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
        : buildPreviewStudent(email, name).grammarOverview.focusPoints,
    },
    teacherFeedback: parseTeacherFeedback(root.teacherFeedback),
  }
}

const getStudentDashboardStateCached = cache(
  async (email: string, name?: string | null): Promise<StudentDashboardState> => {
    if (!isFirebaseConfigured) {
      return {
        hasAccess: true,
        source: 'preview',
        student: buildPreviewStudent(email, name),
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
          student: parseStudentDocument(directDoc.data() ?? {}, normalizedEmail, name),
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
          student: parseStudentDocument(querySnapshot.docs[0].data(), normalizedEmail, name),
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
      return {
        hasAccess: true,
        source: 'preview',
        student: buildPreviewStudent(email, name),
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
