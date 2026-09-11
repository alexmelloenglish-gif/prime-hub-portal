import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Compass,
  FileCheck2,
  MessageSquareQuote,
  Route,
  Sparkles,
} from 'lucide-react'
import { VocabularyReuseGrid } from '@/components/dashboard/vocabulary-reuse-grid'
import { authOptions } from '@/lib/auth'
import { canonicalLessonId } from '@/lib/canonical-student-projection'
import {
  DASHBOARD_DISPLAY_BUDGET,
  selectActiveVocabulary,
  selectCurrentFeedback,
  selectRecentReports,
} from '@/lib/dashboard-display-budget'
import {
  getStudentDashboardState,
  isAdminUser,
  type ProjectionEvidenceStatus,
  type ProjectionField,
} from '@/lib/student-data'
import {
  buildDashboardProjection,
  reconcileAttendanceForProjection,
  reconcileClassReportsForProjection,
  resolveStudentProfileAsset,
} from '@/lib/canonical-dashboard'

const evidenceStatusLabels: Record<ProjectionEvidenceStatus, string> = {
  'teacher-validated': 'Teacher validated',
  'portfolio-confirmed': 'Portfolio confirmed',
  qualified: 'Qualified insight',
  'not-available': 'Not available',
}

const evidenceStatusClasses: Record<ProjectionEvidenceStatus, string> = {
  'teacher-validated': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'portfolio-confirmed': 'border-blue-200 bg-blue-50 text-blue-700',
  qualified: 'border-amber-200 bg-amber-50 text-amber-700',
  'not-available': 'border-slate-200 bg-slate-50 text-slate-500',
}

function isExternalLink(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')
}

function EvidenceStatus({ status }: { status: ProjectionEvidenceStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${evidenceStatusClasses[status]}`}>
      {evidenceStatusLabels[status]}
    </span>
  )
}

function CurrentStateCard({ label, field }: { label: string; field: ProjectionField }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <EvidenceStatus status={field.status} />
      </div>
      <p className="mt-3 text-lg font-bold text-[#0a235c]">{field.value ?? 'Not yet established'}</p>
      {field.qualifier ? <p className="mt-2 text-xs leading-5 text-slate-500">{field.qualifier}</p> : null}
    </article>
  )
}

function dateTimestamp(value: string) {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

function dedupeByDateAndTitle<T extends { date: string; title: string; id: string }>(items: T[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.date.trim().toLowerCase()}|${item.title.trim().toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function DashboardLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (isExternalLink(href)) {
    return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="font-semibold text-blue-600 hover:text-blue-700">{children}</a>
  }
  return <Link href={href} className="font-semibold text-blue-600 hover:text-blue-700">{children}</Link>
}

type DashboardPageProps = {
  searchParams?: Promise<{ studentEmail?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  if (!session?.user) redirect('/login')

  const studentState = await getStudentDashboardState(session.user, resolvedSearchParams?.studentEmail)
  if (!studentState.hasAccess || !studentState.student) {
    if (isAdminUser(session.user)) redirect('/dashboard/admin')
    redirect('/pending-access')
  }

  const student = studentState.student
  const projection = buildDashboardProjection(student)
  const current = projection.currentState as {
    level?: ProjectionField
    targetLevel?: ProjectionField
    objective?: ProjectionField
    focus?: ProjectionField
  }
  const whatChanged = projection.whatChanged as {
    title?: string
    summary?: string
    evidence?: string
    status?: ProjectionEvidenceStatus
  } | null

  const reconciledAttendance = reconcileAttendanceForProjection(student)
  const attendedLessons = [...reconciledAttendance]
    .filter((entry) => entry.status === 'present')
    .sort((a, b) => (dateTimestamp(a.date) ?? 0) - (dateTimestamp(b.date) ?? 0))

  const recentIds = new Set(projection.recentLessons.map((lesson) => lesson.lessonId))
  const recentAttendance = reconciledAttendance.filter(
    (entry) =>
      recentIds.has(canonicalLessonId(entry) ?? entry.id) ||
      projection.recentLessons.some((lesson) => lesson.sourceDocumentId === entry.id)
  )
  const allReports = dedupeByDateAndTitle(reconcileClassReportsForProjection(student.classReports))
    .filter((report) => report.status === 'published' || report.contentStatus === 'published')
    .sort((a, b) => (dateTimestamp(b.date) ?? 0) - (dateTimestamp(a.date) ?? 0))

  const latestLessonTimestamp = projection.recentLessons.length
    ? Math.max(...projection.recentLessons.map((lesson) => dateTimestamp(lesson.lessonDate) ?? 0))
    : null
  const recentReportCandidates = latestLessonTimestamp
    ? allReports.filter((report) => {
        const ts = dateTimestamp(report.date)
        return ts === null || latestLessonTimestamp - ts <= 30 * 24 * 60 * 60 * 1000
      })
    : allReports
  const recentReports = selectRecentReports(recentReportCandidates)
  const visiblePriorities = projection.priorities.slice(0, DASHBOARD_DISPLAY_BUDGET.priorities)
  const visibleProgress = student.progressTracker.slice(0, DASHBOARD_DISPLAY_BUDGET.progressItems)
  const activeVocabulary = selectActiveVocabulary(student.vocabularyBank, student.classReports)
  const visibleGrammar = student.grammarOverview.focusPoints.slice(0, DASHBOARD_DISPLAY_BUDGET.grammarItems)
  const visibleFeedback = selectCurrentFeedback(student.teacherFeedback)
  const profileImage = resolveStudentProfileAsset(student.studentId, session.user.image)
  const nextAction = projection.nextAction
  const nextActionDestination = nextAction?.destination ?? '#next-action'

  return (
    <div className="dashboard-light space-y-5">
      {studentState.isPreviewingAnotherStudent ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm">
          <span className="font-semibold">Admin preview active.</span> Viewing {student.studentEmail} while signed in as {studentState.viewerEmail}.
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5 shadow-sm md:p-7">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="shrink-0">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={`${student.studentName} profile image`}
                width={144}
                height={144}
                priority
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg md:h-36 md:w-36"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-4xl font-bold text-white shadow-lg md:h-36 md:w-36">
                {student.studentName.charAt(0)}
              </div>
            )}
          </div>
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold text-blue-600">Your PRIME learning projection</p>
            <h2 className="text-4xl font-bold tracking-tight text-[#0a235c]">What matters now, <span className="text-blue-600">{student.studentName}.</span></h2>
            <p className="text-sm leading-6 text-slate-600 md:text-base">A focused view of your authorized learning record: current state, recent evidence, useful memory and the next action.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#244575]">{attendedLessons.length} attended lesson{attendedLessons.length === 1 ? '' : 's'}</span>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">Full class-report history stays available below</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">NOW</p><h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Current State</h3></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {current.level ? <CurrentStateCard label="Current level" field={current.level} /> : null}
          {current.targetLevel ? <CurrentStateCard label="Target level" field={current.targetLevel} /> : null}
          {current.objective ? <CurrentStateCard label="Objective" field={current.objective} /> : null}
          {current.focus ? <CurrentStateCard label="Learning focus" field={current.focus} /> : null}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3"><Sparkles className="h-5 w-5 text-blue-600" />{whatChanged?.status ? <EvidenceStatus status={whatChanged.status} /> : null}</div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">What changed</p>
          {whatChanged?.title ? <h3 className="mt-1 text-xl font-bold text-[#0a235c]">{whatChanged.title}</h3> : null}
          {whatChanged?.summary ? <p className="mt-3 text-sm leading-7 text-slate-600">{whatChanged.summary}</p> : <p className="mt-3 text-sm text-slate-500">No validated change is available yet.</p>}
          {whatChanged?.evidence ? <p className="mt-4 border-t border-blue-100 pt-3 text-xs leading-5 text-slate-500">Evidence: {whatChanged.evidence}</p> : null}
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><Compass className="h-5 w-5 text-amber-600" /><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">NOW</p><h3 className="text-xl font-bold text-[#0a235c]">What Matters Now</h3></div></div>
          <div className="mt-5 space-y-3">
            {visiblePriorities.length ? visiblePriorities.map((priority, index) => {
              const item = priority as { id?: string; title?: string; why?: string; evidence?: string; status?: ProjectionEvidenceStatus }
              return <div key={item.id ?? `priority-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0a235c] text-xs font-bold text-white">{index + 1}</span><div><h4 className="font-semibold text-[#0a235c]">{item.title}</h4><p className="mt-1.5 text-sm leading-6 text-slate-600">{item.why}</p>{item.evidence ? <p className="mt-2 text-xs leading-5 text-slate-400">{item.evidence}</p> : null}</div></div></div>
            }) : <p className="text-sm text-slate-500">No validated current priority is available yet.</p>}
          </div>
        </article>
      </section>

      <section id="next-action" className="rounded-[26px] bg-[#0a235c] p-5 text-white shadow-lg md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><div className="flex items-center gap-3"><Route className="h-5 w-5 text-blue-300" /><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Canonical action</p></div>
            {nextAction ? <><h3 className="mt-3 text-2xl font-bold">{nextAction.title}</h3><p className="mt-2 max-w-3xl text-sm leading-7 text-blue-100">{nextAction.description}</p><p className="mt-3 text-xs leading-5 text-blue-300">Evidence: {nextAction.evidence}</p></> : <h3 className="mt-3 text-xl font-semibold">No validated next action is available yet.</h3>}
          </div>
          {nextAction ? <DashboardLink href={nextActionDestination}><span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a235c]"><ArrowRight className="h-4 w-4" />Open action destination</span></DashboardLink> : null}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" /><p className="text-xs leading-5 text-blue-100">{String((projection.schedule as { label?: unknown }).label ?? 'Schedule information is not available.')}</p></div>
      </section>

      <section id="attendance-summary" className="rounded-[24px] border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">ATTENDANCE SUMMARY</p>
            <h3 className="mt-1 text-2xl font-bold text-[#0a235c]">{attendedLessons.length} attended lesson{attendedLessons.length === 1 ? '' : 's'}</h3>
            <p className="mt-1 text-sm text-slate-500">Only lessons actually completed with the student present are included.</p>
          </div>
          {attendedLessons.length ? (
            <div className="flex max-w-3xl flex-wrap gap-2">
              {attendedLessons.map((lesson) => (
                <span key={`attendance-summary-${lesson.id}`} className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800">{lesson.date}</span>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500">No attended lessons recorded yet.</p>}
        </div>
      </section>

      <section className="space-y-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">RECENT</p><h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Attended Lessons</h3><p className="mt-1 text-sm text-slate-500">The most recent attended lesson evidence stays concise here. The complete published report history remains visible immediately below.</p></div>
        <section id="attendance-overview" className="space-y-3">
          {recentAttendance.length ? <div className="grid gap-3 lg:grid-cols-2">{recentAttendance.map((lesson) => <article key={lesson.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-base font-semibold text-[#0a235c]">{lesson.date}</p><p className="mt-1 text-sm font-medium text-[#2f4b78]">{lesson.title}</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">{lesson.status === 'present' ? 'attended' : lesson.status}</span></div><p className="mt-3 text-sm leading-6 text-slate-500">{lesson.summary}</p></article>)}</div> : <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">No recent attended lesson is available yet.</p>}
        </section>

        {recentReports.length ? <section className="space-y-3"><div><h4 className="text-lg font-bold text-[#0a235c]">Recent Report Highlights</h4></div><div className="grid gap-3 lg:grid-cols-2">{recentReports.map((report) => <article key={`recent-${report.id}`} className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{report.date}</p><h4 className="mt-1 text-lg font-semibold text-[#0a235c]">{report.title}</h4><p className="mt-3 text-sm leading-6 text-slate-600">{report.summary}</p></article>)}</div></section> : null}
      </section>

      {allReports.length ? <section id="class-reports" className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">LONGITUDINAL</p><h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Published Class Reports — Full History</h3><p className="mt-1 text-sm text-slate-500">Every published class report remains available here. New lessons never push older reports out of view.</p></div><div className="grid gap-3 lg:grid-cols-2">{allReports.map((report) => <article key={report.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{report.date}</p><h4 className="mt-1 text-lg font-semibold text-[#0a235c]">{report.title}</h4><p className="mt-3 text-sm leading-6 text-slate-600">{report.summary}</p>{report.focus.length ? <div className="mt-3 flex flex-wrap gap-2">{report.focus.slice(0, DASHBOARD_DISPLAY_BUDGET.reportFocusItems).map((item) => <span key={item} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-[#345481]">{item}</span>)}</div> : null}{report.vocabulary.length ? <p className="mt-3 text-xs leading-5 text-slate-500">Vocabulary: {report.vocabulary.slice(0, DASHBOARD_DISPLAY_BUDGET.reportVocabularyItems).join(', ')}</p> : null}{report.teacherInsight ? <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-[#49617f]">{report.teacherInsight}</p> : null}</article>)}</div></section> : null}

      <section className="space-y-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">MEMORY</p><h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Learner Memory</h3><p className="mt-1 text-sm text-slate-500">Useful memory stays visible in small doses, while the complete class-report history remains preserved above and in the portfolio.</p></div>

        {visibleProgress.length ? <section id="progress-tracker" className="grid gap-4 lg:grid-cols-2">{visibleProgress.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h4 className="text-lg font-semibold text-[#0a235c]">{item.title}</h4><p className="mt-2.5 text-sm leading-6 text-slate-500">{item.insight}</p><p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.status}</p></article>)}</section> : null}

        {activeVocabulary.length ? <section id="vocabulary-bank" className="space-y-3"><div><h4 className="text-lg font-bold text-[#0a235c]">Vocabulary to Reuse</h4><p className="mt-1 text-sm text-slate-500">Five words at most. The sentence comes from you, not from the system.</p></div><VocabularyReuseGrid studentEmail={student.studentEmail} items={activeVocabulary} /></section> : null}

        {visibleGrammar.length ? <section id="grammar-overview" className="space-y-3"><h4 className="text-lg font-bold text-[#0a235c]">{student.grammarOverview.title}</h4><p className="text-sm leading-7 text-slate-600">{student.grammarOverview.summary}</p><ul className="grid gap-3 lg:grid-cols-2">{visibleGrammar.map((point) => <li key={point} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-[#3d5578]">{point}</li>)}</ul></section> : null}

        {visibleFeedback.length ? <section id="teacher-feedback" className="space-y-3"><h4 className="text-lg font-bold text-[#0a235c]">Teacher Feedback</h4><div className="grid gap-3">{visibleFeedback.map((feedback) => <article key={feedback.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><MessageSquareQuote className="h-5 w-5 text-blue-600" /><div><h4 className="text-lg font-semibold text-[#0a235c]">{feedback.title}</h4><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Teacher perspective</p></div></div><p className="mt-4 text-sm leading-7 text-slate-600">{feedback.body}</p></article>)}</div></section> : null}

        {student.manageSpace.length ? <section id="manage-space" className="rounded-[24px] border border-blue-100 bg-blue-50/40 p-5"><div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-blue-600" /><div><h4 className="text-lg font-bold text-[#0a235c]">My Learning Links</h4><p className="text-xs text-slate-500">Open your class, portfolio or support without adding more learning clutter.</p></div></div><div className="mt-4 grid gap-3 md:grid-cols-2">{student.manageSpace.slice(0, 3).map((link) => <a key={link.id} href={link.href} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm hover:border-blue-200"><p className="font-semibold text-[#0a235c]">{link.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{link.description}</p></a>)}</div></section> : null}
      </section>

      <footer className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500"><FileCheck2 className="h-4 w-4 text-emerald-600" /> Projection {projection.version}: attended lesson summary + bounded NOW/RECENT view + complete published longitudinal class-report history.</footer>
    </div>
  )
}
