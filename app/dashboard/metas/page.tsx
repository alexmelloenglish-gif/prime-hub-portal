import { weeklyGoals } from '@/lib/dashboard-data'
import { SectionShell } from '@/components/dashboard/section-shell'
import { cn } from '@/lib/utils'

const statusLabel: Record<(typeof weeklyGoals)[number]['status'], string> = {
  'on-track': 'Em andamento',
  attention: 'Requer atenção',
  completed: 'Concluída',
}

export default function DashboardGoalsPage() {
  return (
    <SectionShell
      title="Metas"
      description="Metas semanais organizadas para manter clareza de execução e acompanhamento."
    >
      <div className="space-y-4">
        {weeklyGoals.map((goal) => (
          <article key={goal.id} className="glass-card p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-white">{goal.title}</h3>
                <p className="mt-2 text-sm text-prime-cream/70">{goal.description}</p>
              </div>
              <span
                className={cn(
                  'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                  goal.status === 'completed' && 'bg-emerald-500/20 text-emerald-300',
                  goal.status === 'on-track' && 'bg-sky-500/20 text-sky-300',
                  goal.status === 'attention' && 'bg-amber-500/20 text-amber-200'
                )}
              >
                {statusLabel[goal.status]}
              </span>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
