import Link from 'next/link'
import { ArrowRight, Route } from 'lucide-react'
import type { ProjectionEvidenceStatus, ProjectionField } from '@/lib/student-data'

const evidenceStatusLabels: Record<ProjectionEvidenceStatus, string> = {
  'teacher-validated': 'Teacher validated',
  'portfolio-confirmed': 'Portfolio confirmed',
  qualified: 'Qualified insight',
  'not-available': 'Not available',
}

const evidenceStatusClasses: Record<ProjectionEvidenceStatus, string> = {
  'teacher-validated': 'border-emerald-300 bg-emerald-100 text-emerald-900',
  'portfolio-confirmed': 'border-blue-300 bg-blue-100 text-blue-900',
  qualified: 'border-amber-300 bg-amber-100 text-amber-900',
  'not-available': 'border-slate-300 bg-slate-100 text-slate-700',
}

function isExternalLink(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')
}

function compactText(value: string, max = 150) {
  if (value.length <= max) return { visible: value, overflow: false }
  return { visible: `${value.slice(0, max).trimEnd()}…`, overflow: true }
}

export function EvidenceStatus({ status }: { status: ProjectionEvidenceStatus }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${evidenceStatusClasses[status]}`}>
      {evidenceStatusLabels[status]}
    </span>
  )
}

export function CurrentStateCard({ label, field }: { label: string; field: ProjectionField }) {
  const value = field.value ?? 'Not yet established'
  const compact = compactText(value)

  return (
    <article className="flex min-h-[190px] flex-col rounded-2xl border border-slate-300 bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex min-h-8 items-start justify-between gap-3">
        <p className="pt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">{label}</p>
        <EvidenceStatus status={field.status} />
      </div>
      <p className="mt-4 break-words text-lg font-bold leading-7 text-[#0a235c]">{compact.visible}</p>
      {compact.overflow ? (
        <details className="mt-2 text-xs leading-5 text-slate-700">
          <summary className="cursor-pointer font-semibold text-blue-700">View full statement</summary>
          <p className="mt-2">{value}</p>
        </details>
      ) : null}
      {field.qualifier ? <p className="mt-auto border-t border-slate-200 pt-3 text-xs leading-5 text-slate-600">{field.qualifier}</p> : null}
    </article>
  )
}

export function DevelopmentTrajectory({ current, target }: { current?: ProjectionField; target?: ProjectionField }) {
  const currentValue = current?.value ?? 'Current level not yet established'
  const targetValue = target?.value ?? 'Target not yet validated'

  return (
    <section aria-label="Development trajectory" className="rounded-[24px] border border-indigo-200 bg-indigo-50/70 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Development trajectory</p>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
        <div className="rounded-xl border border-indigo-200 bg-white px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Current</p>
          <p className="mt-1 font-bold text-[#0a235c]">{currentValue}</p>
        </div>
        <span className="hidden text-xl font-bold text-indigo-400 md:block">→</span>
        <div className="rounded-xl border border-indigo-300 bg-indigo-100 px-4 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700">Development</p>
          <p className="mt-1 font-bold text-indigo-950">Evidence-led progression</p>
        </div>
        <span className="hidden text-xl font-bold text-indigo-400 md:block">→</span>
        <div className="rounded-xl border border-indigo-200 bg-white px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Target</p>
          <p className="mt-1 font-bold text-[#0a235c]">{targetValue}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600">Qualitative development only. No artificial percentage or gamified score is inferred.</p>
    </section>
  )
}

export function NextActionCard({
  title,
  description,
  evidence,
  destination,
}: {
  title?: string | null
  description?: string | null
  evidence?: string | null
  destination?: string | null
}) {
  const href = destination ?? '#next-action'
  const cta = (
    <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0a235c] shadow-sm transition hover:bg-blue-50 sm:w-auto">
      <ArrowRight className="h-4 w-4" /> Open action
    </span>
  )

  return (
    <section id="next-action" className="rounded-[26px] border border-[#0a235c] bg-[#0a235c] p-5 text-white shadow-xl md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div className="flex items-center gap-3"><Route className="h-5 w-5 text-blue-300" /><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Next action</p></div>
          {title ? <><h3 className="mt-3 text-2xl font-bold leading-tight">{title}</h3>{description ? <p className="mt-2 max-w-3xl text-sm leading-7 text-blue-50">{description}</p> : null}{evidence ? <p className="mt-4 border-t border-white/15 pt-3 text-xs leading-5 text-blue-200">Evidence: {evidence}</p> : null}</> : <h3 className="mt-3 text-xl font-semibold">No validated next action is available yet.</h3>}
        </div>
        {title ? isExternalLink(href) ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{cta}</a> : <Link href={href}>{cta}</Link> : null}
      </div>
    </section>
  )
}

type AttendanceEntry = { id: string; date: string }

export function AttendanceSummary({ lessons, scheduleLabel }: { lessons: AttendanceEntry[]; scheduleLabel?: string }) {
  const latest = lessons.length ? lessons[lessons.length - 1] : null
  return (
    <aside id="attendance-summary" className="rounded-[24px] border border-emerald-300 bg-emerald-50 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Attendance</p>
      <h3 className="mt-1 text-2xl font-bold text-[#0a235c]">{lessons.length} attended lesson{lessons.length === 1 ? '' : 's'}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">Only lessons actually completed with the student present are included.</p>
      {latest ? <p className="mt-4 text-xs font-semibold text-emerald-900">Latest attended: {latest.date}</p> : <p className="mt-4 text-xs text-slate-600">No attended lessons recorded yet.</p>}
      {lessons.length ? <details className="mt-3"><summary className="cursor-pointer text-xs font-bold text-emerald-800">View attended dates</summary><div className="mt-3 flex flex-wrap gap-2">{lessons.map((lesson) => <span key={lesson.id} className="rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-900">{lesson.date}</span>)}</div></details> : null}
      {scheduleLabel ? <p className="mt-4 border-t border-emerald-200 pt-3 text-xs leading-5 text-slate-600">Schedule: {scheduleLabel}</p> : null}
    </aside>
  )
}
