import type { ProgressSkill } from '@/lib/student-data'
import { TrendingUp } from 'lucide-react'
import { ProgressStateBadge } from '@/components/dashboard/progress-state-badge'
import {
  PRIME_PROGRESS_STATES,
  PRIME_PROGRESS_STATE_MEANINGS,
  normalizeProgressState,
} from '@/lib/progress-states'

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
        <div>
          <h2 className="font-display text-lg font-bold text-white">Progress Tracker</h2>
          <p className="mt-0.5 text-xs text-prime-cream/55">Qualitative evidence states — no artificial percentage or score.</p>
        </div>
      </div>

      <div className="space-y-4">
        {skills.map((skill) => {
          const state = normalizeProgressState(skill.status)
          return (
            <div key={skill.skill} className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <span className="text-sm font-medium text-white">{skill.skill}</span>
                <ProgressStateBadge status={state} tone="dark" />
              </div>
              <p className="mt-3 text-xs leading-5 text-prime-cream/70">{skill.insight}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
        {PRIME_PROGRESS_STATES.map((state) => (
          <div key={state} className="rounded-xl border border-white/10 bg-black/10 p-3">
            <ProgressStateBadge status={state} tone="dark" />
            <p className="mt-2 text-[11px] leading-5 text-prime-cream/55">{PRIME_PROGRESS_STATE_MEANINGS[state]}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
