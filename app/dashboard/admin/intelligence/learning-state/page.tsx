import { Activity } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'

export default function TeacherLearningStatePage() {
  return (
    <section className="glass-card p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Learning State</p>
      <h2 className="mt-1 text-xl font-semibold text-white">No verified state transition</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">The current runtime does not yet prove a canonical Learning State transition store. This page intentionally represents that absence instead of deriving progress from Class Reports, proposals or completed pipeline runs.</p>
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="flex flex-wrap items-center gap-3"><Activity className="h-5 w-5 text-prime-cream/50" aria-hidden="true" /><IntelligenceStatusBadge label="Learning State NOT PROVEN" state="NOT_PROVEN" /></div>
        <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-prime-cream/65">{`Required causal chain:\nprevious state\n+ validated evidence\n+ authorized interpretation\n+ teacher decision\n→ new state\n\nNo transition is displayed until that chain is persisted and traceable.`}</pre>
      </div>
    </section>
  )
}
