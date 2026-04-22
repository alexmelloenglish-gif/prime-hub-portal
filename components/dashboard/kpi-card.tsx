'use client'

import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  icon: LucideIcon
  title: string
  value: string
  subtitle: string
  trend: string
}

export function KPICard({ icon: Icon, title, value, subtitle, trend }: KPICardProps) {
  return (
    <div className="glass-card p-6 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-prime-cream/60 text-sm font-medium">{title}</p>
          <h3 className="font-display text-3xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className="h-10 w-10 rounded-lg bg-prime-red/20 flex items-center justify-center">
          <Icon className="h-5 w-5 text-prime-red" />
        </div>
      </div>
      <p className="text-prime-cream/70 text-xs mb-2">{subtitle}</p>
      <p className="text-prime-red text-xs font-medium">{trend}</p>
    </div>
  )
}
