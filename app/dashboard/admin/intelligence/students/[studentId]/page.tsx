import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from 'lucide-react'
import { getTeacherDecisionPackageByStudent } from '@/lib/teacher-decision-packages'

export default async function TeacherLearnerDecisionPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const pkg = getTeacherDecisionPackageByStudent(studentId)
  if (!pkg) notFound()

  return (
    <section className="space-y-5">
      <Link
        href="/dashboard/admin/intelligence/students"
        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to learners
      </Link>

      <header className="rounded-[28px] border border-emerald-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.07)] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Teacher-reviewed learning package</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0a235c]">{pkg.studentName}</h1>
            <p className="mt-2 text-sm text-[#60718d]">{pkg.studentEmail}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Reviewed by teacher</div>
            <p className="mt-1 text-xs">{pkg.teacher.name} · {pkg.decisionDate}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7184a1]">Learning update</p><p className="mt-2 font-bold text-[#0a235c]">Reviewed and accepted</p></div>
          <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7184a1]">Level</p><p className="mt-2 font-bold text-[#0a235c]">No CEFR change</p></div>
          <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7184a1]">Student view</p><p className="mt-2 font-bold text-[#0a235c]">Ready for student-facing use</p></div>
        </div>
      </header>

      <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Teacher decision</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0a235c]">Evidence supports the decision. The teacher decides what changes.</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-[#526783]">The system can organize lesson evidence and suggest patterns, while the teacher remains responsible for meaningful changes to learning focus, priorities and next actions.</p>
        <p className="mt-2 text-sm leading-7 text-[#526783]">Routine evidence organization can happen automatically. Teacher review is required when that evidence changes the learner&apos;s current state, priorities or next action.</p>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7184a1]">Lesson evidence</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0a235c]">Four lessons reviewed from the original source</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {pkg.sourceLessons.map((lesson) => (
            <article key={lesson.sourceDocumentId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-bold text-[#0a235c]">{lesson.date}</p>
              <p className="mt-2 break-all text-xs leading-5 text-[#60718d]">Original lesson source reviewed</p>
              <span className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800">source reviewed</span>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Lesson reports</p><h2 className="text-2xl font-bold text-[#0a235c]">Evidence → Pattern → Teacher interpretation → Next check</h2></div></div>
        <div className="space-y-4">
          {pkg.classReportsV2.map((report) => (
            <article key={report.date} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">{report.date}</p><h3 className="mt-1 text-xl font-bold text-[#0a235c]">{report.title}</h3></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">Teacher reviewed</span></div>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">Evidence</p><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{report.evidence.map((item) => <li key={item}>• {item}</li>)}</ul></div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">Learning pattern</p><p className="mt-3 text-sm leading-6 text-slate-700">{report.signal}</p></div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">Teacher interpretation</p><p className="mt-3 text-sm leading-6 text-slate-700">{report.interpretation}</p></div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Limits</p><p className="mt-3 text-sm leading-6 text-slate-700">{report.boundary}</p><p className="mt-4 border-t border-amber-200 pt-3 text-xs leading-5 text-slate-600"><strong>Check next:</strong> {report.nextVerification}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-2"><Waypoints className="h-5 w-5 text-indigo-600" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Learning patterns</p><h2 className="text-2xl font-bold text-[#0a235c]">Patterns confirmed for teaching use</h2></div></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {pkg.acceptedLongitudinalSignals.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
              <div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /><div><p className="font-bold text-[#0a235c]">{item.signal}</p><p className="mt-2 text-sm leading-6 text-[#60718d]">Limits: {item.boundary}</p></div></div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600" aria-hidden="true" /><h2 className="text-xl font-bold text-[#0a235c]">Current learning focus</h2></div>
          <dl className="mt-4 space-y-3 text-sm"><div><dt className="font-bold text-[#304d7d]">Current level</dt><dd className="mt-1 text-[#60718d]">{pkg.authorizedCurrentState.level}</dd></div><div><dt className="font-bold text-[#304d7d]">Target</dt><dd className="mt-1 text-[#60718d]">{pkg.authorizedCurrentState.targetLevel}</dd></div><div><dt className="font-bold text-[#304d7d]">Learning focus</dt><dd className="mt-1 text-[#60718d]">{pkg.authorizedCurrentState.learningFocus}</dd></div></dl>
          <div className="mt-4 space-y-2">{pkg.authorizedCurrentState.priorities.map((priority) => <p key={priority} className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-sm leading-6 text-slate-700">{priority}</p>)}</div>
        </article>

        <article className="rounded-[26px] border border-emerald-100 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" /><h2 className="text-xl font-bold text-[#0a235c]">Next teaching action</h2></div>
          <h3 className="mt-4 text-lg font-bold text-[#0a235c]">{pkg.authorizedNextAction.title}</h3>
          <div className="mt-3 space-y-2">{pkg.authorizedNextAction.steps.map((step, index) => <p key={step} className="text-sm leading-6 text-slate-700"><strong>{index + 1}.</strong> {step}</p>)}</div>
        </article>
      </section>

      <section className="rounded-[26px] border border-amber-200 bg-amber-50 p-5 md:p-6">
        <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" /><div><p className="font-bold text-amber-950">Keep under teacher review</p><div className="mt-3 space-y-2">{pkg.nonAutoPromotableClaims.map((item) => <p key={item} className="text-sm leading-6 text-amber-900">• {item}</p>)}</div></div></div>
      </section>
    </section>
  )
}
