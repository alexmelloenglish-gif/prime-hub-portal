import { ProgressChart } from '@/components/dashboard/progress-chart'
import { SectionShell } from '@/components/dashboard/section-shell'

export default function DashboardProgressPage() {
  return (
    <SectionShell
      title="Meu progresso"
      description="Acompanhe a evolução das últimas semanas com dados estáveis para a interface."
    >
      <ProgressChart />
    </SectionShell>
  )
}
