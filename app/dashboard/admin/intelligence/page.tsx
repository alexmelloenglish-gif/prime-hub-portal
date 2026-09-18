import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Users,
  Waypoints,
} from 'lucide-react'
import { getTeacherCommandCenter } from '@/lib/teacher-intelligence'

function formatLessonDate(value: string | null) {
  if (!value) return 'Date unavailable'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function TeacherIntelligenceHomePage() {
  const data = await getTeacherCommandCenter()
  const recentLearners = new Set(data.recentLessons.map((lesson) => lesson.studentEmail)).size
  const attentionTotal =
    data.needsReview.reviewTasks +
    data.needsReview.evidenceCandidates +
    data.needsReview.signalProposals +
    data.needsReview.insightProposals +
    data.needsReview.reportsAwaitingPublication

  const attentionCards = [
    {
      label: 'Review queue',
      value: data.needsReview.reviewTasks,
      description: 'Items waiting for a teacher or administrator decision.',
      href: '/dashboard/admin/intelligence/review',
      icon: ClipboardCheck,
      accent: 'border-amber-100 bg-amber-50/70 text-amber-800',
    },
    {
      label: 'Evidence review',
      value: data.needsReview.evidenceCandidates,
      description: 'Lesson evidence that needs a closer look.',
      href: '/dashboard/admin/intelligence/review',
      icon: Sparkles,
      accent: 'border-sky-100 bg-sky-50/70 text-sky-800',
    },
    {
      label: 'Learning patterns',
      value: data.needsReview.signalProposals,
      description: 'Patterns suggested from lesson evidence.',
      href: '/dashboard/admin/intelligence/signals',
      icon: Waypoints,
      accent: 'border-indigo-100 bg-indigo-50/70 text-indigo-800',
    },
    {
      label: 'Teaching insights',
      value: data.needsReview.insightProposals,
      description: 'Interpretations waiting for teacher review.',
      href: '/dashboard/admin/intelligence/insights',
      icon: Lightbulb,
      accent: 'border-violet-100 bg-violet-50/70 text-violet-800',
    },
    {
      label: 'Draft reports',
      value: data.needsReview.reportsAwaitingPublication,
      description: 'Class reports that are not yet finalized.',
      href: '/dashboard/admin/intelligence/lessons',
      icon: FileText,
      accent: 'border-rose-100 bg-rose-50/70 text-rose-800',
    },
  ]

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[30px] border border-indigo-100 bg-white p-5 shadow-[0_18px_50px_rgba(37,55,120,0.08)] md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1.35fr_0.65fr] xl:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">Teaching cockpit</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.035em] text-[#0a235c] md:text-4xl">
              Start with the learner. Use evidence to decide what comes next.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#49617f] md:text-base">
              Review learners, lesson evidence, emerging patterns and next teaching priorities in one place.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard/admin/intelligence/students"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#263c86] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(38,60,134,0.22)] transition hover:-translate-y-0.5 hover:bg-[#1f3272]"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                Open learners
              </Link>
              <Link
                href="/dashboard/admin/intelligence/review"
                className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-bold text-[#263c86] transition hover:border-indigo-200 hover:bg-indigo-100"
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Review items
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7184a1]">Recent learners</p>
              <p className="mt-2 text-3xl font-bold text-[#0a235c]">{recentLearners}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7184a1]">Recent lessons</p>
              <p className="mt-2 text-3xl font-bold text-[#0a235c]">{data.recentLessons.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Needs attention</p>
              <p className="mt-2 text-3xl font-bold text-amber-900">{attentionTotal}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="attention-heading" className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Teacher attention</p>
            <h2 id="attention-heading" className="mt-1 text-2xl font-bold text-[#0a235c]">What deserves review now?</h2>
          </div>
          <p className="text-sm text-[#60718d]">Suggestions remain separate from the learner&apos;s current state until a teacher reviews them.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {attentionCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,48,93,0.06)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_16px_36px_rgba(37,55,120,0.10)]"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.accent}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-3xl font-bold text-[#0a235c]">{card.value}</p>
                <p className="mt-1 text-sm font-bold text-[#1f3b68]">{card.label}</p>
                <p className="mt-2 text-xs leading-5 text-[#60718d]">{card.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                  Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr_0.8fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,48,93,0.07)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7184a1]">Recent learning activity</p>
              <h2 className="mt-1 text-2xl font-bold text-[#0a235c]">Recent lessons</h2>
              <p className="mt-1 text-sm text-[#60718d]">Each lesson appears once. Technical retries are kept out of this summary.</p>
            </div>
            <Link
              href="/dashboard/admin/intelligence/lessons"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2 text-sm font-bold text-[#263c86] transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              All lessons
            </Link>
          </div>

          {data.recentLessons.length ? (
            <div className="mt-5 space-y-3">
              {data.recentLessons.map((lesson) => (
                <Link
                  key={`${lesson.studentEmail}:${lesson.lessonId}`}
                  href={`/dashboard/admin/intelligence/lessons/${lesson.pipelineRunId}`}
                  className="group block rounded-2xl border border-slate-200 bg-[#fbfdff] p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                        <p className="truncate text-sm font-bold text-[#0a235c]">{lesson.studentEmail}</p>
                        <span className="text-xs text-[#7184a1]">{formatLessonDate(lesson.lessonDate)}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-[#7184a1]">Lesson {lesson.lessonId}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 font-semibold text-sky-700">
                        {lesson.evidenceCount} evidence item{lesson.evidenceCount === 1 ? '' : 's'}
                      </span>
                      {lesson.signalProposalCount ? (
                        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">
                          {lesson.signalProposalCount} pattern{lesson.signalProposalCount === 1 ? '' : 's'}
                        </span>
                      ) : null}
                      {lesson.insightProposalCount ? (
                        <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 font-semibold text-violet-700">
                          {lesson.insightProposalCount} insight{lesson.insightProposalCount === 1 ? '' : 's'}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-600">
                        Open lesson <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-slate-200 bg-[#f8fbff] p-4 text-sm text-[#60718d]">No recent lesson activity is available yet.</p>
          )}
        </article>

        <aside className="space-y-4">
          <article className="rounded-[28px] border border-indigo-100 bg-[linear-gradient(145deg,#eef2ff,#ffffff)] p-5 shadow-[0_16px_42px_rgba(37,55,120,0.08)] md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Teacher workflow</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0a235c]">From evidence to the next lesson</h2>
            <div className="mt-5 space-y-4">
              {[
                ['01', 'Review evidence', 'Check what the learner actually demonstrated in the lesson.'],
                ['02', 'Notice patterns', 'Look for recurring strengths, difficulties and changes over time.'],
                ['03', 'Interpret', 'Decide what the evidence means pedagogically.'],
                ['04', 'Plan next', 'Use the reviewed information to guide feedback and the next lesson.'],
              ].map(([number, title, body]) => (
                <div key={number} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#263c86] text-xs font-bold text-white">{number}</span>
                  <div>
                    <p className="text-sm font-bold text-[#0a235c]">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-[#60718d]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-900">Teacher authority</p>
            <p className="mt-2 text-xs leading-5 text-emerald-800">
              Only teacher-reviewed learning judgments are treated as part of the learner&apos;s current learning state.
            </p>
          </article>
        </aside>
      </section>
    </div>
  )
}
