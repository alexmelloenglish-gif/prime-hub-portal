import type { ProgressSkill } from '@/lib/student-data'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  'Very Strong':   { label: 'Very Strong',   color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30',   bar: 'bg-blue-400' },
  'Strong':        { label: 'Strong',        color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30',  bar: 'bg-green-400' },
  'Active Growth': { label: 'Active Growth', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', bar: 'bg-yellow-400' },
  'Improving':     { label: 'Improving',     color: 'text-pink-400',   bg: 'bg-pink-400/10 border-pink-400/30',   bar: 'bg-pink-400' },
  'Developing':    { label: 'Developing',    color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30', bar: 'bg-orange-400' },
}

const statusBarWidth: Record<string, string> = {
  'Very Strong':   'w-[95%]',
  'Strong':        'w-[80%]',
  'Active Growth': 'w-[65%]',
  'Improving':     'w-[50%]',
  'Developing':    'w-[35%]',
}

type Props = {
  skills: ProgressSkill[]
}

export function ProgressTracker({ skills }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-prime-red">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <h2 className="font-display text-lg font-bold text-white">Progress Tracker</h2>
      </div>

      <div className="space-y-4">
        {skills.map((skill) => {
          const cfg = statusConfig[skill.status] ?? statusConfig['Developing']
          return (
            <div key={skill.skill} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-white text-sm">{skill.skill}</span>
                <span className={cn('shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold', cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>
              </div>
              {/* Barra de progresso */}
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div className={cn('h-1.5 rounded-full transition-all', cfg.bar, statusBarWidth[skill.status])} />
              </div>
              <p className="text-xs text-prime-cream/50 italic">{skill.insight}</p>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', cfg.bar)} />
            <span className="text-xs text-prime-cream/40">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
