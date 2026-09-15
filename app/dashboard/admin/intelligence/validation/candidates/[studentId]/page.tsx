import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  FileText,
  ShieldCheck,
  Waypoints,
} from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { getTeacherIntelligenceCandidateByStudent } from '@/lib/teacher-intelligence-candidates'

export default async function TeacherCandidateValidationPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  if (!session?.user || (role !== 'admin' && role !== 'teacher')) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold text-slate-900">Candidate validation</h1>
        <p className="mt-2 text-slate-600">This workspace is restricted to teacher and administrator accounts.</p>
      </main>
    )
  }

  const { studentId } = await params
  const pkg = getTeacherIntelligenceCandidateByStudent(studentId)
  if (!pkg) notFound()

  return (
    <main className="mx-auto max-w-7xl space-y-7 p-6">
      <Link
        href="/dashboard/admin/intelligence/validation"
        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to validation
      </Link>

      <header className="rounded-[28px] border border-amber-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              <Clock3 className="h-4 w-4" aria-hidden="true" /> Pedagogical decision pending
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0a235c]">{pkg.studentName}</h1>
            <p className="mt-2 text-sm text-[#60718d]">{pkg.studentEmail}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Not teacher-authorized</div>
            <p className="mt-1 text-xs">Candidate package only · canonical projection remains blocked</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7184a1]">Primary-source lessons</p><p className="mt-2 text-2xl font-bold text-[#0a235c]">{pkg.sourceLessons.length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7184a1]">V2 reports</p><p className="mt-2 text-2xl font-bold text-[#0a235c]">{pkg.classReportsV2.length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7184a1]">Historical encounters</p><p className="mt-2 text-2xl font-bold text-[#0a235c]">{pkg.legacyLineage.historicalEncounters}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7184a1]">Projection</p><p className="mt-2 font-bold text-amber-800">NOT AUTHORIZED</p></div>
        </div>
      </header>

      <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Bounded teacher decision</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0a235c]">Validate the state transition — not every extracted sentence.</h2>
        <p className="mt-3 max-w-5xl text-sm leading-7 text-[#526783]">{pkg.governance.rule}</p>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Proposed current state</p>
            <p className="mt-3 text-sm text-slate-700"><strong>Level:</strong> {pkg.proposedCurrentState.level} → target {pkg.proposedCurrentState.targetLevel}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Focus:</strong> {pkg.proposedCurrentState.learningFocus}</p>
            <div className="mt-4 space-y-2">{pkg.proposedCurrentState.priorities.map((priority) => <p key={priority} className="rounded-xl border border-blue-100 bg-white p-3 text-sm leading-6 text-slate-700">{priority}</p>)}</div>
          </article>
          <article className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Proposed next action</p>
            <h3 className="mt-3 text-lg font-bold text-[#0a235c]">{pkg.proposedNextAction.title}</h3>
            <div className="mt-3 space-y-2">{pkg.proposedNextAction.steps.map((step, index) => <p key={step} className="text-sm leading-6 text-slate-700"><strong>{index + 1}.</strong> {step}</p>)}</div>
          </article>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Source-grounded Class Reports V2</p><h2 className="text-2xl font-bold text-[#0a235c]">Evidence → Signal → Interpretation → Boundary → Verification</h2></div></div>
        <div className="space-y-4">
          {pkg.classReportsV2.map((report) => (
            <article key={report.date} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">{report.date}</p><h3 className="mt-1 text-xl font-bold text-[#0a235c]">{report.title}</h3></div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Candidate · not projected</span>
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">Evidence</p><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{report.evidence.map((item) => <li key={item}>• {item}</li>)}</ul></div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">Learning signal</p><p className="mt-3 text-sm leading-6 text-slate-700">{report.signal}</p></div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">Teacher interpretation candidate</p><p className="mt-3 text-sm leading-6 text-slate-700">{report.interpretation}</p></div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Boundary</p><p className="mt-3 text-sm leading-6 text-slate-700">{report.boundary}</p><p className="mt-4 border-t border-amber-200 pt-3 text-xs leading-5 text-slate-600"><strong>Next verification:</strong> {report.nextVerification}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-2"><Waypoints className="h-5 w-5 text-indigo-600" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Candidate longitudinal signals</p><h2 className="text-2xl font-bold text-[#0a235c]">Patterns proposed for teacher authorization</h2></div></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {pkg.candidateLongitudinalSignals.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
              <p className="font-bold text-[#0a235c]">{item.signal}</p>
              <p className="mt-2 text-sm leading-6 text-[#60718d]">Boundary: {item.boundary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] border border-amber-200 bg-amber-50 p-5 md:p-6">
        <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" /><div><p className="font-bold text-amber-950">Publication firewall is active</p><p className="mt-2 text-sm leading-6 text-amber-900">This screen is a review surface. Until a teacher records the bounded decision, this candidate must not replace the canonical Portfolio, feed the learner-facing dashboard, or be described as teacher-authorized.</p></div></div>
      </section>
    </main>
  )
}
