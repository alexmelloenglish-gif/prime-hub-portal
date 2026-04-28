import type { Session } from 'next-auth'
import { isDatabaseConfigured } from '@/lib/auth'
import { getMockDashboardSnapshot, type DashboardSnapshot, type ProgressPoint } from '@/lib/dashboard-data'
import { getPrismaClient } from '@/lib/prisma'

type AuthenticatedUser = Session['user'] | null | undefined

type StarterCourse = {
  title: string
  description: string
  level: string
  lessons: Array<{
    title: string
    description: string
    dayOffset: number
    hour: number
    minute: number
  }>
}

export type DashboardDatabaseStatus = {
  enabled: boolean
  connected: boolean
  userSynced: boolean
  courseCount: number
  lessonCount: number
  progressCount: number
}

const starterCourses: StarterCourse[] = [
  {
    title: 'Speaking and Confidence',
    description: 'Practical speaking drills to unlock fluency in real conversations.',
    level: 'B1',
    lessons: [
      { title: 'Everyday Introductions', description: 'Build quick, natural introductions.', dayOffset: 0, hour: 19, minute: 0 },
      { title: 'Ask Better Questions', description: 'Keep conversations moving with confidence.', dayOffset: 2, hour: 18, minute: 30 },
      { title: 'Opinion Patterns', description: 'Share ideas without freezing.', dayOffset: 5, hour: 20, minute: 0 },
      { title: 'Storytelling Basics', description: 'Describe past events with clarity.', dayOffset: 7, hour: 19, minute: 30 },
      { title: 'Fast Response Practice', description: 'Answer without overthinking every sentence.', dayOffset: 9, hour: 18, minute: 0 },
    ],
  },
  {
    title: 'Grammar Essentials',
    description: 'Core grammar blocks to improve accuracy without killing flow.',
    level: 'B1',
    lessons: [
      { title: 'Present and Past Review', description: 'Stabilize the most used verb forms.', dayOffset: 1, hour: 18, minute: 30 },
      { title: 'Question Structure', description: 'Organize questions faster in speech.', dayOffset: 3, hour: 19, minute: 0 },
      { title: 'Modal Verbs in Context', description: 'Use can, should and must naturally.', dayOffset: 6, hour: 19, minute: 30 },
      { title: 'Connecting Ideas', description: 'Link short phrases into stronger answers.', dayOffset: 8, hour: 20, minute: 0 },
      { title: 'Error Cleanup Session', description: 'Fix repeated slips that slow your progress.', dayOffset: 10, hour: 18, minute: 30 },
    ],
  },
  {
    title: 'Business English',
    description: 'Professional communication for meetings, updates and networking.',
    level: 'B2',
    lessons: [
      { title: 'Meeting Openers', description: 'Start meetings clearly and with authority.', dayOffset: 4, hour: 20, minute: 0 },
      { title: 'Status Updates', description: 'Explain progress and blockers in English.', dayOffset: 6, hour: 18, minute: 0 },
      { title: 'Polite Negotiation', description: 'Disagree without sounding rigid.', dayOffset: 9, hour: 19, minute: 0 },
      { title: 'Presentation Language', description: 'Guide an audience through your ideas.', dayOffset: 12, hour: 20, minute: 0 },
      { title: 'Follow-up Messages', description: 'Write clear and concise professional emails.', dayOffset: 14, hour: 18, minute: 30 },
    ],
  },
  {
    title: 'Listening and Vocabulary',
    description: 'Vocabulary retention with guided listening and repetition.',
    level: 'B1',
    lessons: [
      { title: 'Keyword Listening', description: 'Capture the message before every detail.', dayOffset: 2, hour: 20, minute: 0 },
      { title: 'Daily Vocabulary Pack', description: 'Review the expressions that matter this week.', dayOffset: 4, hour: 18, minute: 30 },
      { title: 'Collocations in Action', description: 'Combine words the way native speakers do.', dayOffset: 7, hour: 18, minute: 0 },
      { title: 'Short Audio Breakdown', description: 'Train comprehension with compact audio loops.', dayOffset: 11, hour: 19, minute: 30 },
      { title: 'Retention Review', description: 'Lock the vocabulary through active recall.', dayOffset: 13, hour: 20, minute: 0 },
    ],
  },
]

const starterCompletedLessons = [4, 3, 2, 3]
const starterProgressStatus = ['completed', 'in_progress', 'in_progress', 'in_progress'] as const

function createScheduledDate(dayOffset: number, hour: number, minute: number) {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, value))
}

function buildProgressSeries(overallProgress: number): ProgressPoint[] {
  const checkpoints = [-42, -28, -20, -14, -8, -4, 0]

  return checkpoints.map((offset, index) => ({
    week: `W${index + 1}`,
    progress: clampProgress(overallProgress + offset),
  }))
}

function formatLessonTime(date: Date) {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)

  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  return `${formattedDate} at ${formattedTime}`
}

async function ensureStarterCatalog() {
  const prisma = getPrismaClient()

  for (const course of starterCourses) {
    const savedCourse = await prisma.course.upsert({
      where: { title: course.title },
      update: {
        description: course.description,
        level: course.level,
      },
      create: {
        title: course.title,
        description: course.description,
        level: course.level,
      },
    })

    for (const [index, lesson] of course.lessons.entries()) {
      await prisma.lesson.upsert({
        where: {
          courseId_order: {
            courseId: savedCourse.id,
            order: index + 1,
          },
        },
        update: {
          title: lesson.title,
          description: lesson.description,
        },
        create: {
          title: lesson.title,
          description: lesson.description,
          order: index + 1,
          scheduledAt: createScheduledDate(lesson.dayOffset, lesson.hour, lesson.minute),
          courseId: savedCourse.id,
        },
      })
    }
  }
}

async function ensureAuthenticatedUser(user: AuthenticatedUser) {
  if (!isDatabaseConfigured || !user?.email) {
    return null
  }

  const prisma = getPrismaClient()

  await ensureStarterCatalog()

  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      image: user.image,
    },
    create: {
      email: user.email,
      name: user.name,
      image: user.image,
      role: 'student',
    },
  })

  const courses = await prisma.course.findMany({
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })

  if (courses.length) {
    await prisma.progress.createMany({
      data: courses.map((course, index) => ({
        userId: dbUser.id,
        courseId: course.id,
        completed: starterCompletedLessons[index] ?? 0,
        status: starterProgressStatus[index] ?? 'in_progress',
      })),
      skipDuplicates: true,
    })
  }

  return dbUser
}

export async function getDashboardSnapshot(user: AuthenticatedUser): Promise<DashboardSnapshot> {
  const fallback = getMockDashboardSnapshot()

  if (!isDatabaseConfigured || !user?.email) {
    return fallback
  }

  try {
    const prisma = getPrismaClient()
    const dbUser = await ensureAuthenticatedUser(user)

    if (!dbUser) {
      return fallback
    }

    const [lessonCount, progressEntries, upcomingLessons] = await Promise.all([
      prisma.lesson.count(),
      prisma.progress.findMany({
        where: { userId: dbUser.id },
        include: { course: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.lesson.findMany({
        where: {
          scheduledAt: {
            gte: new Date(),
          },
        },
        include: { course: true },
        orderBy: [{ scheduledAt: 'asc' }, { order: 'asc' }],
        take: 3,
      }),
    ])

    if (!lessonCount || !progressEntries.length) {
      return fallback
    }

    const completedLessons = Math.min(
      lessonCount,
      progressEntries.reduce((total, entry) => total + entry.completed, 0)
    )
    const overallProgress = Math.round((completedLessons / lessonCount) * 100)
    const activeTracks = progressEntries.filter((entry) => entry.status !== 'completed').length
    const completedTracks = progressEntries.filter((entry) => entry.status === 'completed').length

    return {
      metrics: [
        {
          title: 'Lessons completed',
          value: `${completedLessons}`,
          subtitle: `of ${lessonCount} mapped lessons`,
          trend: `${Math.max(lessonCount - completedLessons, 0)} still pending`,
        },
        {
          title: 'Overall progress',
          value: `${overallProgress}%`,
          subtitle: `${progressEntries.length} learning tracks connected`,
          trend: `${completedTracks} tracks completed`,
        },
        {
          title: 'Tracks in motion',
          value: `${activeTracks}`,
          subtitle: 'active tracks tied to the database',
          trend: 'data synced with PostgreSQL',
        },
        {
          title: 'Next classes',
          value: `${upcomingLessons.length}`,
          subtitle: 'upcoming sessions already scheduled',
          trend: upcomingLessons[0]?.course.level ?? 'calendar ready',
        },
      ],
      progressChartData: buildProgressSeries(overallProgress),
      upcomingLessons: upcomingLessons.length
        ? upcomingLessons.map((lesson, index) => ({
            id: index + 1,
            title: lesson.title,
            time: lesson.scheduledAt ? formatLessonTime(lesson.scheduledAt) : 'Schedule pending',
            level: lesson.course.level,
          }))
        : fallback.upcomingLessons,
      weeklyGoals: fallback.weeklyGoals,
      isUsingDatabase: true,
    }
  } catch {
    return fallback
  }
}

export async function getDashboardDatabaseStatus(
  user: AuthenticatedUser
): Promise<DashboardDatabaseStatus> {
  if (!isDatabaseConfigured || !user?.email) {
    return {
      enabled: false,
      connected: false,
      userSynced: false,
      courseCount: 0,
      lessonCount: 0,
      progressCount: 0,
    }
  }

  try {
    const prisma = getPrismaClient()
    const dbUser = await ensureAuthenticatedUser(user)
    const [courseCount, lessonCount, progressCount] = await Promise.all([
      prisma.course.count(),
      prisma.lesson.count(),
      dbUser ? prisma.progress.count({ where: { userId: dbUser.id } }) : Promise.resolve(0),
    ])

    return {
      enabled: true,
      connected: true,
      userSynced: Boolean(dbUser),
      courseCount,
      lessonCount,
      progressCount,
    }
  } catch {
    return {
      enabled: true,
      connected: false,
      userSynced: false,
      courseCount: 0,
      lessonCount: 0,
      progressCount: 0,
    }
  }
}
