import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileCheck2,
  FolderOpen,
  Headphones,
  Link as LinkIcon,
  MessageSquareQuote,
  Route,
  Sparkles,
  Video,
} from 'lucide-react'
import { authOptions } from '@/lib/auth'
import {
  getStudentDashboardState,
  isAdminUser,
  type AttendanceEntry,
  type ManageSpaceLink,
  type PortfolioNavigationLink,
  type ProgressTrackerCard,
  type ProjectionEvidenceStatus,
  type ProjectionField,
} from '@/lib/student-data'

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

const progressAccentClasses: Record<ProgressTrackerCard['accent'], string> = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  yellow: 'border-amber-200 bg-amber-50 text-amber-700',
  pink: 'border-rose-200 bg-rose-50 text-rose-700',
  blue: 'border-sky-200 bg-sky-50 text-sky-700',
}

const vocabularyAccentClasses = [
  'border-amber-100 bg-gradient-to-br from-amber-50 to-white',
  'border-emerald-100 bg-gradient-to-br from-emerald-50 to-white',
  'border-sky-100 bg-gradient-to-br from-sky-50 to-white',
  'border-rose-100 bg-gradient-to-br from-rose-50 to-white',
]

const grammarAccentClasses = [
  'border-amber-100 bg-amber-50/70',
  'border-sky-100 bg-sky-50/70',
  'border-emerald-100 bg-emerald-50/70',
  'border-rose-100 bg-rose-50/70',
  'border-violet-100 bg-violet-50/70',
]

function getManageSpaceIcon(icon: string) {
  switch (icon) {
    case 'folder-open':
      return FolderOpen
    case 'video':
      return Video
    case 'book-open':
      return BookOpen
    case 'clipboard-list':
      return ClipboardList
    case 'calendar':
    case 'calendar-days':
      return CalendarDays
    case 'headphones':
      return Headphones
    default:
      return LinkIcon
  }
}

function getProfileImage(studentEmail: string) {
  const email = studentEmail.toLowerCase()
  if (email === 'rafael.copolillo@gmail.com') return '/assets/rafael-profile.svg'
  if (email === 'itallopires17@gmail.com') return '/assets/italo-profile.svg'
  if (email === 'louise_nogueira@hotmail.com' || email === 'louise.nogueira@hotmail.com') {
    return '/assets/louise-profile.svg'
  }
  return null
}

function isExternalLink(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')
}

function isHashLink(href: string) {
  return href.startsWith('#')
}

function EvidenceStatus({ status }: { status: ProjectionEvidenceStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${evidenceStatusClasses[status]}`}
    >
      {evidenceStatusLabels[status]}
    </span>
  )
}

function CurrentStateCard({ label, field }: { label: string; field: ProjectionField }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <EvidenceStatus status={field.status} />
      </div>
      <p className="mt-3 text-lg font-bold leading-6 text-[#0a235c]">{field.value ?? 'Not yet established'}</p>
      {field.qualifier ? <p className="mt-2 text-xs leading-5 text-slate-500">{field.qualifier}</p> : null}
    </article>
  )
}

function ManageSpaceCard({ link }: { link: ManageSpaceLink }) {
  const Icon = getManageSpaceIcon(link.icon)
  const className =
    'group flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,48,93,0.07)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_38px_rgba(15,48,93,0.12)]'
  const content = (
    <>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-[#0b2459]">{link.title}</h3>
        <p className="text-xs leading-5 text-slate-500">{link.description}</p>
      </div>
      <span className="mt-auto pt-1 text-xs font-semibold text-blue-600">Open →</span>
    </>
  )

  if (isExternalLink(link.href)) {
    return (
      <a href={link.href} className={className} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {content}
      </a>
    )
  }
  if (isHashLink(link.href)) return <a href={link.href} className={className}>{content}</a>
  return <Link href={link.href} className={className}>{content}</Link>
}

function buildPreviewAwareHref(href: string, previewStudentEmail?: string | null) {
  if (href.startsWith('#') || !previewStudentEmail || !href.startsWith('/dashboard')) return href
  const params = new URLSearchParams({ studentEmail: previewStudentEmail })
  return `${href}?${params.toString()}`
}

function PortfolioNavigationChip({
  item,
  previewStudentEmail,
}: {
  item: PortfolioNavigationLink
  previewStudentEmail?: string | null
}) {
  return (
    <a
      href={buildPreviewAwareHref(item.href, previewStudentEmail)}
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#16346d] shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/50"
    >
      {item.title}
      <span className="text-blue-600">→</span>
    </a>
  )
}

function attendanceStatus(entry: AttendanceEntry) {
  if (entry.status === 'present') return { label: 'Attended', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
  if (entry.status === 'absent') return { label: 'Absent', className: 'border-rose-200 bg-rose-50 text-rose-700' }
  if (entry.status === 'scheduled') return { label: 'Scheduled', className: 'border-blue-200 bg-blue-50 text-blue-700' }
  return { label: 'Pending', className: 'border-amber-200 bg-amber-50 text-amber-700' }
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
  const projection = student.canonicalProjection
  const profileImage = getProfileImage(student.studentEmail)
  const presentLessons = student.attendanceOverview.filter((entry) => entry.status === 'present').length
  const scheduleIsEmpty = projection.schedule.status === 'not-scheduled'

  return (
    <div className="dashboard-light space-y-5">
      {studentState.isPreviewingAnotherStudent ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm">
          <span className="font-semibold">Admin preview active.</span> Viewing {student.studentEmail} while signed in as {studentState.viewerEmail}.
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.95),transparent_28%),linear-gradient(120deg,#d8ecff_0%,#eff7ff_48%,#f8fbff_100%)] p-5 shadow-[0_22px_60px_rgba(25,74,135,0.12)] md:p-7">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="shrink-0">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={`${student.studentName} profile image`}
                width={144}
                height={144}
                priority
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-[0_14px_38px_rgba(15,52,110,0.20)] md:h-36 md:w-36"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-4xl font-bold text-white shadow-lg md:h-36 md:w-36">
                {student.studentName.charAt(0)}
              </div>
            )}
          </div>
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold text-blue-600">Your PRIME learning projection</p>
            <h2 className="text-[2rem] font-bold leading-[1.02] tracking-[-0.035em] text-[#0a235c] sm:text-4xl md:text-5xl">
              What matters now,
              <span className="block text-blue-600">{student.studentName}.</span>
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-[#304d7d] md:text-base">
              A truthful view of what PRIME currently knows, what changed in your learning record and the next useful action.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#244575]">
                {presentLessons} confirmed lesson{presentLessons === 1 ? '' : 's'}
              </span>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${scheduleIsEmpty ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                {scheduleIsEmpty ? 'Nothing currently scheduled' : projection.schedule.label}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="current-state-heading" className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Now</p>
          <h3 id="current-state-heading" className="mt-1 text-2xl font-bold text-[#0a235c]">Current State</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">The latest authorized view—not a prediction and not a complete history.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <CurrentStateCard label="Current level" field={projection.currentState.level} />
          <CurrentStateCard label="Target level" field={projection.currentState.targetLevel} />
          <CurrentStateCard label="Objective" field={projection.currentState.objective} />
          <CurrentStateCard label="Learning focus" field={projection.currentState.focus} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-[0_12px_34px_rgba(15,48,93,0.07)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm"><Sparkles className="h-5 w-5" /></div>
            {projection.whatChanged ? <EvidenceStatus status={projection.whatChanged.status} /> : null}
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">What changed</p>
          {projection.whatChanged ? (
            <>
              <h3 className="mt-1 text-xl font-bold text-[#0a235c]">{projection.whatChanged.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{projection.whatChanged.summary}</p>
              <p className="mt-4 border-t border-blue-100 pt-3 text-xs leading-5 text-slate-500">Evidence: {projection.whatChanged.evidence}</p>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">No validated change is available yet.</p>
          )}
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,48,93,0.07)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><Compass className="h-5 w-5" /></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Now</p><h3 className="text-xl font-bold text-[#0a235c]">What Matters Now</h3></div>
          </div>
          {projection.priorities.length ? (
            <div className="mt-5 space-y-3">
              {projection.priorities.map((priority, index) => (
                <div key={priority.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0a235c] text-xs font-bold text-white">{index + 1}</span>
                    <div>
                      <h4 className="font-semibold text-[#0a235c]">{priority.title}</h4>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">{priority.why}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{priority.evidence}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="mt-4 text-sm text-slate-500">No validated current priority is available yet.</p>}
        </article>
      </section>

      <section aria-labelledby="next-action-heading" className="rounded-[26px] border border-[#102f69] bg-[#0a235c] p-5 text-white shadow-[0_18px_42px_rgba(10,35,92,0.22)] md:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-3"><Route className="h-5 w-5 text-blue-300" /><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">What to do next</p></div>
            {projection.nextAction ? (
              <>
                <h3 id="next-action-heading" className="mt-3 text-2xl font-bold">{projection.nextAction.title}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-blue-100">{projection.nextAction.description}</p>
                <p className="mt-3 text-xs leading-5 text-blue-300">Why this action: {projection.nextAction.evidence}</p>
              </>
            ) : (
              <h3 id="next-action-heading" className="mt-3 text-xl font-semibold">No validated next action is available yet.</h3>
            )}
          </div>
          <a href="#vocabulary-bank" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a235c] transition-colors hover:bg-blue-50">
            Open supporting memory <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />
          <p className="text-xs leading-5 text-blue-100">{projection.schedule.label}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,48,93,0.07)]">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><FileCheck2 className="h-5 w-5" /></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Supporting evidence</p><h3 className="mt-1 text-xl font-bold text-[#0a235c]">{student.cumulativeImpact.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{student.cumulativeImpact.summary}</p></div>
          </div>
          {student.cumulativeImpact.evidence.length ? <div className="mt-5 grid gap-3 sm:grid-cols-3">{student.cumulativeImpact.evidence.map((item) => <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-3 text-sm font-medium text-[#315d59]">{item}</div>)}</div> : null}
        </article>
        {student.portfolioNavigation.length ? (
          <section id="portfolio-navigation" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,48,93,0.07)] scroll-mt-28">
            <h3 className="text-xl font-bold text-[#0a235c]">Portfolio Navigation</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Jump to recent evidence or the learner memory below.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">{student.portfolioNavigation.map((item) => <PortfolioNavigationChip key={item.id} item={item} previewStudentEmail={studentState.isPreviewingAnotherStudent ? student.studentEmail : null} />)}</div>
          </section>
        ) : null}
      </section>

      {student.manageSpace.length ? (
        <section id="manage-space" className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-[#f4faff] to-white p-4 shadow-[0_12px_34px_rgba(15,48,93,0.06)] scroll-mt-28 md:p-5">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600"><LinkIcon className="h-5 w-5" /></div><div><h3 className="text-xl font-bold text-[#0a235c]">My Learning Links</h3><p className="text-xs leading-5 text-slate-500">Only currently valid portfolio and support links.</p></div></div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{student.manageSpace.map((link) => <ManageSpaceCard key={link.id} link={link} />)}</div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Recent</p><h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Confirmed Lessons & Reports</h3><p className="mt-1 text-sm leading-6 text-slate-500">Recent authorized evidence. A recent observation does not automatically mean a state transition.</p></div>

        <section id="attendance-overview" className="space-y-3 scroll-mt-28">
          <div><h4 className="text-lg font-bold text-[#0a235c]">Attendance</h4><p className="text-xs leading-5 text-slate-500">{student.attendanceLabel}</p></div>
          {student.attendanceOverview.length ? <div className="grid gap-3 lg:grid-cols-2">{student.attendanceOverview.map((lesson) => {
            const status = attendanceStatus(lesson)
            return <article key={lesson.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.06)]"><div className="flex items-start justify-between gap-3"><div><p className="text-base font-semibold text-[#0a235c]">{lesson.date}</p><p className="mt-1 text-sm font-medium text-[#2f4b78]">{lesson.title}</p></div><span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${status.className}`}>{status.label}</span></div><p className="mt-3 text-sm leading-6 text-slate-500">{lesson.summary}</p></article>
          })}</div> : <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">No confirmed lesson is available yet.</p>}
        </section>

        {student.classReports.length ? (
          <section id="class-reports" className="space-y-3 scroll-mt-28">
            <div><h4 className="text-lg font-bold text-[#0a235c]">Published Class Reports</h4><p className="text-xs leading-5 text-slate-500">Only authorized reports appear here; AI drafts remain teacher-side.</p></div>
            <div className="grid gap-3 lg:grid-cols-2">{student.classReports.filter((report) => report.contentStatus === 'published' || report.contentStatus === 'legacy').map((report) => <article key={report.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.06)]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{report.date}</p><h4 className="mt-1 text-lg font-semibold text-[#0a235c]">{report.title}</h4><p className="mt-3 text-sm leading-6 text-slate-600">{report.summary}</p>{report.focus.length ? <div className="mt-3 flex flex-wrap gap-2">{report.focus.map((item) => <span key={item} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-[#345481]">{item}</span>)}</div> : null}{report.vocabulary.length ? <p className="mt-3 text-xs leading-5 text-slate-500">Vocabulary observed: {report.vocabulary.join(', ')}</p> : null}{report.teacherInsight ? <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-[#49617f]">{report.teacherInsight}</p> : null}</article>)}</div>
          </section>
        ) : null}
      </section>

      <section className="space-y-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Memory</p><h3 className="mt-1 text-2xl font-bold text-[#0a235c]">Learner Memory</h3><p className="mt-1 text-sm leading-6 text-slate-500">Longitudinal evidence remains available without crowding the current-state projection.</p></div>

        {student.progressTracker.length ? <section id="progress-tracker" className="space-y-3 scroll-mt-28"><div><h4 className="text-lg font-bold text-[#0a235c]">Evidence Snapshot</h4><p className="text-xs leading-5 text-slate-500">Qualitative observations only. No pseudo-percentages.</p></div><div className="grid gap-4 lg:grid-cols-2">{student.progressTracker.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.06)]"><div className="flex items-start justify-between gap-4"><div><h4 className="text-lg font-semibold text-[#0a235c]">{item.title}</h4><p className="mt-2.5 text-sm leading-6 text-slate-500">{item.insight}</p></div><span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${progressAccentClasses[item.accent]}`}>{item.status}</span></div></article>)}</div></section> : null}

        {student.vocabularyBank.length ? <section id="vocabulary-bank" className="space-y-3 scroll-mt-28"><div><h4 className="text-lg font-bold text-[#0a235c]">Vocabulary Bank</h4><p className="text-xs leading-5 text-slate-500">A curated set from confirmed lesson evidence—not an arbitrary quota.</p></div><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{student.vocabularyBank.map((item, index) => <article key={item.id} className={`rounded-2xl border p-4 shadow-sm ${vocabularyAccentClasses[index % vocabularyAccentClasses.length]}`}><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Recorded vocabulary</p><p className="mt-1.5 text-lg font-semibold text-[#0a235c]">{item.term}</p><p className="mt-3 text-sm leading-6 text-slate-600">{item.meaning}</p><p className="mt-3 rounded-xl border border-white bg-white/70 px-3 py-2.5 text-sm italic text-slate-500">{item.example}</p></article>)}</div></section> : null}

        {student.grammarOverview.focusPoints.length ? <section id="grammar-overview" className="space-y-3 scroll-mt-28"><div><h4 className="text-lg font-bold text-[#0a235c]">Grammar Overview</h4><p className="text-xs leading-5 text-slate-500">Current accuracy priorities grounded in the learning record.</p></div><article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,48,93,0.07)]"><h4 className="text-xl font-semibold text-[#0a235c]">{student.grammarOverview.title}</h4><p className="mt-3 text-sm leading-7 text-slate-600">{student.grammarOverview.summary}</p><ul className="mt-5 grid gap-3 lg:grid-cols-2">{student.grammarOverview.focusPoints.map((point, index) => <li key={point} className={`rounded-2xl border px-4 py-4 text-sm leading-6 text-[#3d5578] ${grammarAccentClasses[index % grammarAccentClasses.length]}`}><div className="flex gap-4"><span className="mt-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{String(index + 1).padStart(2, '0')}</span><span>{point}</span></div></li>)}</ul></article></section> : null}

        {student.teacherFeedback.length ? <section id="teacher-feedback" className="space-y-3 scroll-mt-28"><div><h4 className="text-lg font-bold text-[#0a235c]">Teacher Feedback</h4><p className="text-xs leading-5 text-slate-500">Validated teacher perspective connected to {student.studentName}&apos;s current learning priorities.</p></div><div className="grid gap-3 lg:grid-cols-2">{student.teacherFeedback.map((feedback, index) => <article key={feedback.id} className={`rounded-[24px] border p-5 shadow-[0_10px_30px_rgba(15,48,93,0.06)] ${index === 0 ? 'border-blue-100 bg-gradient-to-br from-blue-50 to-white' : 'border-rose-100 bg-gradient-to-br from-rose-50 to-white'}`}><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm"><MessageSquareQuote className="h-5 w-5" /></div><div><h4 className="text-lg font-semibold text-[#0a235c]">{feedback.title}</h4><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Teacher perspective</p></div></div><p className="mt-4 text-sm leading-7 text-slate-600">{feedback.body}</p></article>)}</div></section> : null}
      </section>

      <footer className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        Projection {projection.version}: template fixed, content individualized from authorized records.
      </footer>
    </div>
  )
}
