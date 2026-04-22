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

export const dashboardMetrics: DashboardMetric[] = [
  {
    title: 'Aulas concluídas',
    value: '12',
    subtitle: 'de 20 aulas planejadas',
    trend: '+2 esta semana',
  },
  {
    title: 'Progresso geral',
    value: '68%',
    subtitle: 'nível B1 em evolução',
    trend: '+5% neste mês',
  },
  {
    title: 'Metas atingidas',
    value: '8',
    subtitle: 'de 10 metas definidas',
    trend: '2 pendentes',
  },
  {
    title: 'Sequência ativa',
    value: '15',
    subtitle: 'dias consecutivos',
    trend: 'mantenha o ritmo',
  },
]

export const progressChartData: ProgressPoint[] = [
  { week: 'Sem 1', progress: 20 },
  { week: 'Sem 2', progress: 28 },
  { week: 'Sem 3', progress: 35 },
  { week: 'Sem 4', progress: 42 },
  { week: 'Sem 5', progress: 52 },
  { week: 'Sem 6', progress: 60 },
  { week: 'Sem 7', progress: 68 },
]

export const upcomingLessons: LessonItem[] = [
  {
    id: 1,
    title: 'Speaking & Confidence',
    time: 'Hoje às 19:00',
    level: 'B1',
  },
  {
    id: 2,
    title: 'Grammar Essentials',
    time: 'Amanhã às 18:30',
    level: 'B1',
  },
  {
    id: 3,
    title: 'Business English',
    time: 'Quinta às 20:00',
    level: 'B2',
  },
]

export const weeklyGoals: GoalItem[] = [
  {
    id: 1,
    title: 'Revisar vocabulário da semana',
    status: 'on-track',
    description: '15 novas palavras revisadas e aplicadas em frases.',
  },
  {
    id: 2,
    title: 'Participar da aula de conversação',
    status: 'completed',
    description: 'Sessão concluída com feedback positivo do professor.',
  },
  {
    id: 3,
    title: 'Finalizar exercício escrito',
    status: 'attention',
    description: 'Faltam 2 atividades curtas para concluir a meta.',
  },
]
