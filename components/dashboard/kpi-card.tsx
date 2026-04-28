import { BookOpen, Target, TrendingUp, Zap } from 'lucide-react'

type KPIIconName = 'book-open' | 'trending-up' | 'target' | 'zap'

interface KPICardProps {
  icon: KPIIconName
  title: string
  value: string
  subtitle: string
  trend: string
}

const iconMap = {
  'book-open': BookOpen,
  'trending-up': TrendingUp,
  target: Target,
  zap: Zap,
} as const

export function KPICard({ icon, title, value, subtitle, trend }: KPICardProps) {
  const Icon = iconMap[icon]

  return (
    <div className="glass-card p-6 transition-all duration-300 hover:bg-white/15">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-prime-cream/60">{title}</p>
          <h3 className="mt-1 font-display text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-prime-red/20">
          <Icon className="h-5 w-5 text-prime-red" />
        </div>
      </div>
      <p className="mb-2 text-xs text-prime-cream/70">{subtitle}</p>
      <p className="text-xs font-medium text-prime-red">{trend}</p>
    </div>
  )
}
