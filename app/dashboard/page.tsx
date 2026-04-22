import { BookOpen, Target, TrendingUp, Zap } from 'lucide-react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { ProgressChart } from '@/components/dashboard/progress-chart'
import { UpcomingLessons } from '@/components/dashboard/upcoming-lessons'
import { dashboardMetrics } from '@/lib/dashboard-data'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-bold text-white">Visão geral</h2>
        <p className="max-w-2xl text-sm text-prime-cream/70">
          Painel principal com métricas estáveis, gráfico funcional e navegação pronta para expansão.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard icon={BookOpen} {...dashboardMetrics[0]} />
        <KPICard icon={TrendingUp} {...dashboardMetrics[1]} />
        <KPICard icon={Target} {...dashboardMetrics[2]} />
        <KPICard icon={Zap} {...dashboardMetrics[3]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProgressChart />
        </div>
        <div>
          <UpcomingLessons />
        </div>
      </div>
    </div>
  )
}
