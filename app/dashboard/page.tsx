import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import {
  BookOpen,
  Compass,
  FileCheck2,
  MessageSquareQuote,
  Sparkles,
} from 'lucide-react'
import {
  AttendanceSummary,
  CurrentStateCard,
  DevelopmentTrajectory,
  EvidenceStatus,
  NextActionCard,
} from '@/components/dashboard/student-dashboard-primitives'
import { ProgressStateBadge } from '@/components/dashboard/progress-state-badge'
import { VocabularyReuseGrid } from '@/components/dashboard/vocabulary-reuse-grid'
import { authOptions } from '@/lib/auth'
import { canonicalLessonId } from '@/lib/canonical-student-projection'
import { resolveCanonicalManageSpaceLinks } from '@/lib/canonical-student-links'
import {
  DASHBOARD_DISPLAY_BUDGET,
  selectActiveVocabulary,
  selectCurrentFeedback,
  selectRecentReports,
} from '@/lib/dashboard-display-budget'
import { normalizeProgressState } from '@/lib/progress-states'
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
  const scheduleLabel = String((projection.schedule as { label?: unknown }).label ?? 'Schedule information is not available.')
  const learningLinks = resolveCanonicalManageSpaceLinks(student.studentEmail, student.manageSpace)

  return (
    <div className="dashboard-light space-y-7 pb-4">
      {studentState.isPreviewingAnotherStudent ? (
        <section className="rounded-2xl border border-blue-300 bg-blue-100 px-4 py-3 text-sm text-blue-950 shadow-sm">
          <span className="font-bold">Admin preview active.</span> Viewing {student.studentEmail} while signed in as {studentState.viewerEmail}.
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-[30px] border border-blue-200 bg-gradient-to-br from-blue-100 via-white to-sky-100 p-5 shadow-md md:p-7">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="shrink-0">
            {profileImage ? (
              <Image src={profileImage} alt={`${student.studentName} profile image`} width={144} height={144} priority className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg md:h-36 md:w-36" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-700 text-4xl font-bold text-white shadow-lg md:h-36 md:w-36">{student.studentName.charAt(0)}</div>
            )}
          </div>
          <div className="min-w-0 max-w-4xl space-y-3">
            <p className="text-sm font-bold text-blue-700">Your PRIME learning projection</p>
            <h2 className="break-words text-3xl font-bold tracking-tight text-[#0a235c] md:text-4xl">What matters now, <span className="text-blue-700">{student.studentName}.</span></h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-700 md:text-base">A focused view of your authorized learning record: current state, recent evidence, useful memory and the next action.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-950">{attendedLessons.length} attended lesson{attendedLessons.length === 1 ? '' : 's'}</span>
              <span className="rounded-full border border-violet-300 bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-950">Full class-report history available below</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">NOW</p><h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Current State</h3></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {current.level ? <CurrentStateCard label="Current level" field={current.level} /> : null}
          {current.targetLevel ? <CurrentStateCard label="Target level" field={current.targetLevel} /> : null}
          {current.objective ? <CurrentStateCard label="Objective" field={current.objective} /> : null}
          {current.focus ? <CurrentStateCard label="Learning focus" field={current.focus} /> : null}
        </div>
        <DevelopmentTrajectory current={current.level} target={current.targetLevel} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-blue-300 bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100">
          <div className="flex items-start justify-between gap-3"><Sparkles className="h-5 w-5 text-blue-700" />{whatChanged?.status ? <EvidenceStatus status={whatChanged.status} /> : null}</div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">What changed</p>
          {whatChanged?.title ? <h3 className="mt-1 text-xl font-bold leading-7 text-[#0a235c]">{whatChanged.title}</h3> : null}
          {whatChanged?.summary ? <p className="mt-3 text-sm leading-7 text-slate-700">{whatChanged.summary}</p> : <p className="mt-3 text-sm text-slate-600">No validated change is available yet.</p>}
          {whatChanged?.evidence ? <p className="mt-4 border-t border-blue-200 pt-3 text-xs leading-5 text-slate-600">Evidence: {whatChanged.evidence}</p> : null}
        </article>

        <article className="rounded-[24px] border border-amber-200 bg-amber-50/70 p-5 shadow-sm ring-1 ring-amber-100">
          <div className="flex items-center gap-3"><Compass className="h-5 w-5 text-amber-700" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">NOW</p><h3 className="text-xl font-bold text-[#0a235c]">What Matters Now</h3></div></div>
          <div className="mt-5 space-y-3">
            {visiblePriorities.length ? visiblePriorities.map((priority, index) => {
              const item = priority as { id?: string; title?: string; why?: string; evidence?: string; status?: ProjectionEvidenceStatus }
              return <div key={item.id ?? `priority-${index}`} className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0a235c] text-xs font-bold text-white">{index + 1}</span><div className="min-w-0"><h4 className="font-bold text-[#0a235c]">{item.title}</h4><p className="mt-1.5 text-sm leading-6 text-slate-700">{item.why}</p>{item.evidence ? <p className="mt-2 text-xs leading-5 text-slate-600">{item.evidence}</p> : null}</div></div></div>
            }) : <p className="text-sm text-slate-600">No validated current priority is available yet.</p>}
          </div>
        </article>
      </section>

      <NextActionCard title={nextAction?.title} description={nextAction?.description} evidence={nextAction?.evidence} destination={nextAction?.destination ?? undefined} />

      <section className="rounded-[28px] border border-blue-200 bg-blue-50/50 p-4 shadow-sm md:p-5">
        <div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">RECENT</p><h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Attended Lessons</h3><p className="mt-1 text-sm text-slate-700">Recent evidence stays concise here. Full published history remains available in the longitudinal section.</p></div>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="min-w-0 space-y-4">
            <section id="attendance-overview" className="space-y-3">
              {recentAttendance.length ? <div className="grid gap-3 lg:grid-cols-2">{recentAttendance.map((lesson) => <article key={lesson.id} className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-base font-bold text-[#0a235c]">{lesson.date}</p><p className="mt-1 text-sm font-semibold leading-5 text-[#2f4b78]">{lesson.title}</p></div><span className="shrink-0 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-900">{lesson.status === 'present' ? 'attended' : lesson.status}</span></div><p className="mt-3 text-sm leading-6 text-slate-700">{lesson.summary}</p></article>)}</div> : <p className="rounded-2xl border border-blue-200 bg-white p-4 text-sm text-slate-600">No recent attended lesson is available yet.</p>}
            </section>
            {recentReports.length ? <section className="space-y-3"><div><h4 className="text-lg font-bold text-[#0a235c]">Recent Report Highlights</h4></div><div className="grid gap-3 lg:grid-cols-2">{recentReports.map((report) => <article key={`recent-${report.id}`} className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{report.date}</p><h4 className="mt-1 text-lg font-bold leading-6 text-[#0a235c]">{report.title}</h4><p className="mt-3 text-sm leading-6 text-slate-700">{report.summary}</p></article>)}</div></section> : null}
          </div>
          <div className="xl:sticky xl:top-5"><AttendanceSummary lessons={attendedLessons} scheduleLabel={scheduleLabel} /></div>
        </div>
      </section>

      {allReports.length ? <section id="class-reports" className="rounded-[28px] border border-violet-200 bg-violet-50/55 p-4 shadow-sm md:p-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">LONGITUDINAL</p><h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Published Class Reports — Full History</h3><p className="mt-1 text-sm text-slate-700">Every published class report remains available here. New lessons never push older reports out of view.</p></div><div className="mt-4 grid gap-4 lg:grid-cols-2">{allReports.map((report) => <article key={report.id} className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">{report.date}</p><h4 className="mt-1 text-lg font-bold leading-6 text-[#0a235c]">{report.title}</h4><p className="mt-3 text-sm leading-6 text-slate-700">{report.summary}</p>{report.focus.length ? <div className="mt-3 flex flex-wrap gap-2">{report.focus.slice(0, DASHBOARD_DISPLAY_BUDGET.reportFocusItems).map((item) => <span key={item} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-900">{item}</span>)}</div> : null}{report.vocabulary.length ? <p className="mt-3 text-xs leading-5 text-slate-600">Vocabulary: {report.vocabulary.slice(0, DASHBOARD_DISPLAY_BUDGET.reportVocabularyItems).join(', ')}</p> : null}{report.teacherInsight ? <p className="mt-3 border-t border-violet-100 pt-3 text-sm leading-6 text-[#3d5578]">{report.teacherInsight}</p> : null}</article>)}</div></section> : null}

      <section className="rounded-[28px] border border-slate-300 bg-slate-100/70 p-4 shadow-sm md:p-5">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">MEMORY</p><h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Learner Memory</h3><p className="mt-1 text-sm text-slate-700">Useful memory stays visible in small doses, while complete class-report history remains preserved above and in the portfolio.</p></div>
        {visibleProgress.length ? <section id="progress-tracker" className="mt-4 grid gap-4 lg:grid-cols-2">{visibleProgress.map((item) => { const state = normalizeProgressState(item.status); return <article key={item.id} className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><h4 className="text-lg font-bold text-[#0a235c]">{item.title}</h4><ProgressStateBadge status={state} /></div>{state === 'Not Assessed' ? <p className="mt-2.5 text-sm leading-6 text-slate-500">There is not yet enough evidence to classify this skill.</p> : <p className="mt-2.5 text-sm leading-6 text-slate-700">{item.insight}</p>}</article> })}</section> : null}
        {activeVocabulary.length ? <section id="vocabulary-bank" className="mt-6 space-y-3"><div><h4 className="text-lg font-bold text-[#0a235c]">Vocabulary to Reuse</h4><p className="mt-1 text-sm text-slate-700">Five words at most. The sentence comes from you, not from the system.</p></div><VocabularyReuseGrid studentEmail={student.studentEmail} items={activeVocabulary} /></section> : null}
        {visibleGrammar.length ? <section id="grammar-overview" className="mt-6 space-y-3"><h4 className="text-lg font-bold text-[#0a235c]">{student.grammarOverview.title}</h4><p className="text-sm leading-7 text-slate-700">{student.grammarOverview.summary}</p><ul className="grid gap-3 lg:grid-cols-2">{visibleGrammar.map((point) => <li key={point} className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm leading-6 text-[#334b6d] shadow-sm">{point}</li>)}</ul></section> : null}
        {visibleFeedback.length ? <section id="teacher-feedback" className="mt-6 space-y-3"><h4 className="text-lg font-bold text-[#0a235c]">Teacher Feedback</h4><div className="grid gap-3">{visibleFeedback.map((feedback) => <article key={feedback.id} className="rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><MessageSquareQuote className="h-5 w-5 text-blue-700" /><div><h4 className="text-lg font-bold text-[#0a235c]">{feedback.title}</h4><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">Teacher perspective</p></div></div><p className="mt-4 text-sm leading-7 text-slate-700">{feedback.body}</p></article>)}</div></section> : null}
        {learningLinks.length ? <section id="manage-space" className="mt-6 rounded-[24px] border border-blue-200 bg-blue-50 p-5"><div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-blue-700" /><div><h4 className="text-lg font-bold text-[#0a235c]">My Learning Links</h4><p className="text-xs text-slate-600">Open your class, portfolio or support without adding more learning clutter.</p></div></div><div className="mt-4 grid gap-3 md:grid-cols-2">{learningLinks.slice(0, 3).map((link) => <a key={link.id} href={link.href} className="rounded-xl border border-blue-200 bg-white p-4 text-sm shadow-sm transition hover:border-blue-400 hover:shadow-md"><p className="font-bold text-[#0a235c]">{link.title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{link.description}</p></a>)}</div></section> : null}
      </section>

      <footer className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs leading-5 text-slate-600 shadow-sm"><FileCheck2 className="h-4 w-4 text-emerald-700" /> Projection {projection.version}: standardized STATE → PRIORITY → EVIDENCE → ACTION → HISTORY presentation with complete longitudinal reporting.</footer>
    </div>
  )
}
