export type DashboardMetric = {
  title: string
  value: string
  subtitle: string
  trend: string
}

export type ProgressPoint = {
  week: string
  progress: number
}

export type LessonItem = {
  id: number
  title: string
  time: string
  level: string
}

export type GoalItem = {
  id: number
  title: string
  status: 'on-track' | 'attention' | 'completed'
  description: string
}

export type DashboardSnapshot = {
  metrics: DashboardMetric[]
  progressChartData: ProgressPoint[]
  upcomingLessons: LessonItem[]
  weeklyGoals: GoalItem[]
  isUsingDatabase: boolean
}

const mockMetrics: DashboardMetric[] = [
  {
    title: 'Lessons completed',
    value: '12',
    subtitle: 'of 20 planned lessons',
    trend: '+2 this week',
  },
  {
    title: 'Overall progress',
    value: '68%',
    subtitle: 'B1 level in motion',
    trend: '+5% this month',
  },
  {
    title: 'Goals reached',
    value: '8',
    subtitle: 'of 10 weekly targets',
    trend: '2 still pending',
  },
  {
    title: 'Active streak',
    value: '15',
    subtitle: 'days in a row',
    trend: 'keep the pace',
  },
]

const mockProgressChartData: ProgressPoint[] = [
  { week: 'W1', progress: 20 },
  { week: 'W2', progress: 28 },
  { week: 'W3', progress: 35 },
  { week: 'W4', progress: 42 },
  { week: 'W5', progress: 52 },
  { week: 'W6', progress: 60 },
  { week: 'W7', progress: 68 },
]

const mockUpcomingLessons: LessonItem[] = [
  {
    id: 1,
    title: 'Speaking and Confidence',
    time: 'Today at 19:00',
    level: 'B1',
  },
  {
    id: 2,
    title: 'Grammar Essentials',
    time: 'Tomorrow at 18:30',
    level: 'B1',
  },
  {
    id: 3,
    title: 'Business English',
    time: 'Thursday at 20:00',
    level: 'B2',
  },
]

const mockWeeklyGoals: GoalItem[] = [
  {
    id: 1,
    title: 'Review this week vocabulary',
    status: 'on-track',
    description: '15 new words already revised and used in sentences.',
  },
  {
    id: 2,
    title: 'Join the speaking lesson',
    status: 'completed',
    description: 'Session completed with positive teacher feedback.',
  },
  {
    id: 3,
    title: 'Finish the writing drill',
    status: 'attention',
    description: 'Two short activities are still pending.',
  },
]

export function getMockDashboardSnapshot(): DashboardSnapshot {
  return {
    metrics: mockMetrics.map((metric) => ({ ...metric })),
    progressChartData: mockProgressChartData.map((point) => ({ ...point })),
    upcomingLessons: mockUpcomingLessons.map((lesson) => ({ ...lesson })),
    weeklyGoals: mockWeeklyGoals.map((goal) => ({ ...goal })),
    isUsingDatabase: false,
  }
}
