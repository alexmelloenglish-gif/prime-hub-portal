'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { KPICard } from '@/components/dashboard/kpi-card'
import { ProgressChart } from '@/components/dashboard/progress-chart'
import { UpcomingLessons } from '@/components/dashboard/upcoming-lessons'
import { BookOpen, TrendingUp, Target, Zap } from 'lucide-react'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            icon={BookOpen}
            title="Aulas Concluídas"
            value="12"
            subtitle="de 20 aulas"
            trend="+2 esta semana"
          />
          <KPICard
            icon={TrendingUp}
            title="Progresso Geral"
            value="68%"
            subtitle="Nível B1"
            trend="+5% este mês"
          />
          <KPICard
            icon={Target}
            title="Metas Atingidas"
            value="8"
            subtitle="de 10 metas"
            trend="2 pendentes"
          />
          <KPICard
            icon={Zap}
            title="Sequência"
            value="15"
            subtitle="dias consecutivos"
            trend="Parabéns!"
          />
        </div>

        {/* Charts and Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProgressChart />
          </div>
          <div>
            <UpcomingLessons />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
