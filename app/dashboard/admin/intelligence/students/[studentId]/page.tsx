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
import studentRegistry from '@/data/students/student-core-registry.json'
import { getPrismaClient } from '@/lib/prisma'
import { getTeacherDecisionPackageByStudent } from '@/lib/teacher-decision-packages'

type JsonRecord = Record<string, unknown>

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : {}
}

function asText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function asTextArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : []
}

function canonicalDate(scopeKey: string | null | undefined, fallback: Date) {
  const match = scopeKey?.match(/(20\d{2}-\d{2}-\d{2})/)
  return match?.[1] || fallback.toISOString().slice(0, 10)
}

export default async function TeacherLearnerDecisionPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const registryStudent = studentRegistry.students.find((student) => student.studentId === studentId)
  const legacyPackage = getTeacherDecisionPackageByStudent(studentId)
  const prisma = getPrismaClient()

  const latestCanonical = await prisma.canonicalLearningRecord.findFirst({
    where: { studentId },
    orderBy: [{ canonicalVersion: 'desc' }, { canonicalizedAt: 'desc' }],
  })

  if (!registryStudent && !legacyPackage && !latestCanonical) notFound()

  const studentName =
    registryStudent?.studentName ||
    legacyPackage?.studentName ||
    latestCanonical?.studentEmail ||
    studentId
  const studentEmail =
    registryStudent?.canonicalEmail ||
    legacyPackage?.studentEmail ||
    latestCanonical?.studentEmail ||
    ''

  const canonicalPayload = asRecord(latestCanonical?.pedagogicalPayload)
  const canonicalState = asRecord(canonicalPayload.learnerStateChange)
  const canonicalPriority = asRecord(canonicalPayload.priorityChange)
  const canonicalNextAction = asRecord(canonicalPayload.nextAction)
  const canonicalInsight = asRecord(canonicalPayload.teacherInsight)
  const canonicalEvidence = Array.isArray(canonicalPayload.validatedEvidence)
    ? canonicalPayload.validatedEvidence.map(asRecord)
    : []
  const canonicalSignals = Array.isArray(canonicalPayload.learningSignals)
    ? canonicalPayload.learningSignals.map(asRecord)
    : []
  const canonicalBoundaries = asTextArray(canonicalPayload.evidenceBoundaries)

  const latestLevel = asText(canonicalState.level) || legacyPackage?.authorizedCurrentState.level || 'NOT PROVEN'
  const latestTarget = asText(canonicalState.targetLevel) || legacyPackage?.authorizedCurrentState.targetLevel || 'NOT PROVEN'
  const latestFocus = asText(canonicalState.learningFocus) || legacyPackage?.authorizedCurrentState.learningFocus || 'NOT PROVEN'
  const latestPriorities = asTextArray(canonicalPriority.priorities)
  const priorities = latestPriorities.length
    ? latestPriorities
    : legacyPackage?.authorizedCurrentState.priorities || []
  const nextActionText = asText(canonicalNextAction.text)
  const canonicalLessonDate = latestCanonical
    ? canonicalDate(latestCanonical.scopeKey, latestCanonical.canonicalizedAt)
    : null

  const latestSourceDocument = latestCanonical?.sourceReferences &&
    Array.isArray(latestCanonical.sourceReferences)
      ? latestCanonical.sourceReferences
          .map(asRecord)
          .find((ref) => asText(ref.sourceType) === 'google_drive_document')
      : null
  const latestSourceDocumentId = latestSourceDocument ? asText(latestSourceDocument.sourceRef) : null

  const historicalLessons = legacyPackage?.sourceLessons || []
  const latestLessonAlreadyHistorical = Boolean(
    latestSourceDocumentId && historicalLessons.some((lesson) => lesson.sourceDocumentId === latestSourceDocumentId),
  )
  const totalReviewedLessons =
    historicalLessons.length + (latestCanonical && latestSourceDocumentId && !latestLessonAlreadyHistorical ? 1 : 0)

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
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0a235c]">{studentName}</h1>
            <p className="mt-2 text-sm text-[#60718d]">{studentEmail}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Reviewed by teacher</div>
            <p className="mt-1 text-xs">
              {latestCanonical
                ? `Canonical v${latestCanonical.canonicalVersion} · ${new Date(latestCanonical.canonicalizedAt).toLocaleString('en-GB')}`
                : legacyPackage
                  ? `${legacyPackage.teacher.name} · ${legacyPackage.decisionDate}`
                  : 'Teacher-reviewed state'}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7184a1]">Learning update</p><p className="mt-2 font-bold text-[#0a235c]">Reviewed and accepted</p></div>
          <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7184a1]">Current level</p><p className="mt-2 font-bold text-[#0a235c]">{latestLevel}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7184a1]">Student view</p><p className="mt-2 font-bold text-[#0a235c]">Canonical state ready</p></div>
        </div>
      </header>

      {latestCanonical ? (
        <section className="rounded-[26px] border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Latest teacher-validated update</p>
              <h2 className="mt-1 text-2xl font-bold text-[#0a235c]">{canonicalLessonDate || 'Latest lesson'}</h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800">
              Canonical v{latestCanonical.canonicalVersion}
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-[#526783]">
            {asText(canonicalInsight.statement) || latestFocus}
          </p>

          {canonicalEvidence.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {canonicalEvidence.map((item, index) => (
                <article key={asText(item.evidenceId) || index} className="rounded-2xl border border-emerald-100 bg-white p-4">
                  <p className="text-sm leading-6 text-slate-700">{asText(item.statement) || 'Teacher-validated evidence'}</p>
                  {asText(item.sourceSpan) ? (
                    <p className="mt-2 text-xs leading-5 text-[#7184a1]">Lesson example: {asText(item.sourceSpan)}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {canonicalSignals.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {canonicalSignals.map((item, index) => (
                <div key={asText(item.signalId) || index} className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                  <p className="text-sm leading-6 text-slate-700">{asText(item.statement)}</p>
                </div>
              ))}
            </div>
          ) : null}

          {canonicalBoundaries.length ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Evidence limits</p>
              <div className="mt-2 space-y-1">
                {canonicalBoundaries.map((boundary) => <p key={boundary} className="text-sm leading-6 text-amber-950">• {boundary}</p>)}
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#60718d]">
            <span>Decision: {latestCanonical.teacherDecisionId}</span>
            {latestSourceDocumentId ? <span>· source reviewed</span> : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Teacher decision</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0a235c]">Evidence supports the decision. The teacher decides what changes.</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-[#526783]">The system can organize lesson evidence and suggest patterns, while the teacher remains responsible for meaningful changes to learning focus, priorities and next actions.</p>
      </section>

      {(historicalLessons.length || latestSourceDocumentId) ? (
        <section className="space-y-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7184a1]">Lesson evidence</p>
            <h2 className="mt-1 text-2xl font-bold text-[#0a235c]">{totalReviewedLessons} teacher-reviewed lesson source{totalReviewedLessons === 1 ? '' : 's'}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {historicalLessons.map((lesson) => (
              <article key={lesson.sourceDocumentId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-[#0a235c]">{lesson.date}</p>
                <p className="mt-2 text-xs leading-5 text-[#60718d]">Original lesson source reviewed</p>
                <span className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800">source reviewed</span>
              </article>
            ))}
            {latestCanonical && latestSourceDocumentId && !latestLessonAlreadyHistorical ? (
              <article className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                <p className="text-sm font-bold text-[#0a235c]">{canonicalLessonDate}</p>
                <p className="mt-2 text-xs leading-5 text-[#60718d]">Latest canonical lesson source reviewed</p>
                <span className="mt-3 inline-flex rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800">canonical update</span>
              </article>
            ) : null}
          </div>
        </section>
      ) : null}

      {legacyPackage?.classReportsV2.length ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Historical lesson reports</p><h2 className="text-2xl font-bold text-[#0a235c]">Evidence → Pattern → Teacher interpretation → Next check</h2></div></div>
          <div className="space-y-4">
            {legacyPackage.classReportsV2.map((report) => (
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
      ) : null}

      {legacyPackage?.acceptedLongitudinalSignals.length ? (
        <section className="rounded-[26px] border border-indigo-100 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-2"><Waypoints className="h-5 w-5 text-indigo-600" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Historical learning patterns</p><h2 className="text-2xl font-bold text-[#0a235c]">Previously confirmed patterns</h2></div></div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {legacyPackage.acceptedLongitudinalSignals.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
                <div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /><div><p className="font-bold text-[#0a235c]">{item.signal}</p><p className="mt-2 text-sm leading-6 text-[#60718d]">Limits: {item.boundary}</p></div></div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600" aria-hidden="true" /><h2 className="text-xl font-bold text-[#0a235c]">Current learning focus</h2></div>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="font-bold text-[#304d7d]">Current level</dt><dd className="mt-1 text-[#60718d]">{latestLevel}</dd></div>
            <div><dt className="font-bold text-[#304d7d]">Target</dt><dd className="mt-1 text-[#60718d]">{latestTarget}</dd></div>
            <div><dt className="font-bold text-[#304d7d]">Learning focus</dt><dd className="mt-1 text-[#60718d]">{latestFocus}</dd></div>
          </dl>
          <div className="mt-4 space-y-2">{priorities.map((priority) => <p key={priority} className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-sm leading-6 text-slate-700">{priority}</p>)}</div>
        </article>

        <article className="rounded-[26px] border border-emerald-100 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" /><h2 className="text-xl font-bold text-[#0a235c]">Next teaching action</h2></div>
          {nextActionText ? (
            <p className="mt-4 text-sm leading-7 text-slate-700">{nextActionText}</p>
          ) : legacyPackage ? (
            <>
              <h3 className="mt-4 text-lg font-bold text-[#0a235c]">{legacyPackage.authorizedNextAction.title}</h3>
              <div className="mt-3 space-y-2">{legacyPackage.authorizedNextAction.steps.map((step, index) => <p key={step} className="text-sm leading-6 text-slate-700"><strong>{index + 1}.</strong> {step}</p>)}</div>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-600">No teacher-authorized next action is currently available.</p>
          )}
        </article>
      </section>

      {legacyPackage?.nonAutoPromotableClaims.length ? (
        <section className="rounded-[26px] border border-amber-200 bg-amber-50 p-5 md:p-6">
          <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" /><div><p className="font-bold text-amber-950">Keep under teacher review</p><div className="mt-3 space-y-2">{legacyPackage.nonAutoPromotableClaims.map((item) => <p key={item} className="text-sm leading-6 text-amber-900">• {item}</p>)}</div></div></div>
        </section>
      ) : null}
    </section>
  )
}
