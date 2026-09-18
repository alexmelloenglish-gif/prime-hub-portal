import Link from 'next/link'
import { Activity, ShieldCheck } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { listTeacherDecisionPackages } from '@/lib/teacher-decision-packages'

export default function TeacherLearningStatePage() {
  const packages = listTeacherDecisionPackages()

  return (
    <section className="space-y-5">
      <div className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Learning State</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Teacher-authorized bounded state packages</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">Teacher Intelligence may display a bounded state/priority package when the source chain and teacher authority are recorded. This does not manufacture a separate canonical LearningState entity or infer progress from a completed pipeline run.</p>
      </div>

      {packages.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {packages.map((pkg) => (
            <article key={pkg.packageId} className="glass-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Teacher authorized</div>
                  <h3 className="mt-1 text-lg font-semibold text-white">{pkg.studentName}</h3>
                  <p className="mt-1 text-xs text-prime-cream/45">{pkg.studentEmail}</p>
                </div>
                <IntelligenceStatusBadge label="AUTHORIZED" state="VERIFIED" />
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-prime-cream/70">
                <p><strong className="text-white">Level:</strong> {pkg.authorizedCurrentState.level}</p>
                <p><strong className="text-white">Target:</strong> {pkg.authorizedCurrentState.targetLevel}</p>
                <p className="mt-2"><strong className="text-white">Focus:</strong> {pkg.authorizedCurrentState.learningFocus}</p>
              </div>
              <Link href={`/dashboard/admin/intelligence/students/${encodeURIComponent(pkg.studentId)}`} className="mt-4 inline-flex rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-300/20">Open source-grounded package</Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-card p-5">
          <div className="flex flex-wrap items-center gap-3"><Activity className="h-5 w-5 text-prime-cream/50" aria-hidden="true" /><IntelligenceStatusBadge label="Learning State NOT PROVEN" state="NOT_PROVEN" /></div>
          <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-prime-cream/65">{`Required causal chain:\nprevious state\n+ source-grounded evidence\n+ bounded interpretation\n+ teacher decision\n→ authorized projection package\n\nNo state package is displayed until that chain is recorded and traceable.`}</pre>
        </div>
      )}
    </section>
  )
}
