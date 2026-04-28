import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Bot,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FolderOpen,
  Headphones,
  Link as LinkIcon,
  MessageSquareQuote,
  Video,
} from 'lucide-react'
import { authOptions } from '@/lib/auth'
import {
  getStudentDashboardState,
  isAdminUser,
  type ManageSpaceLink,
  type PortfolioNavigationLink,
  type ProgressTrackerCard,
} from '@/lib/student-data'

const progressAccentClasses: Record<ProgressTrackerCard['accent'], string> = {
  green: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  yellow: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  pink: 'border-pink-300/20 bg-pink-300/10 text-pink-100',
  blue: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
}

const progressBarClasses: Record<ProgressTrackerCard['accent'], string> = {
  green: 'bg-emerald-300',
  yellow: 'bg-amber-300',
  pink: 'bg-pink-300',
  blue: 'bg-sky-300',
}

const progressWidths: Record<string, string> = {
  'Very Strong': 'w-[92%]',
  Strong: 'w-[82%]',
  'Active Growth': 'w-[68%]',
  Improving: 'w-[58%]',
}

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
    case 'bot':
      return Bot
    case 'calendar-days':
      return CalendarDays
    case 'headphones':
      return Headphones
    default:
      return LinkIcon
  }
}

function isExternalLink(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')
}

function isHashLink(href: string) {
  return href.startsWith('#')
}

function ManageSpaceCard({ link }: { link: ManageSpaceLink }) {
  const Icon = getManageSpaceIcon(link.icon)
  const className =
    'glass-card group flex h-full flex-col gap-3 p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-white/30'

  const content = (
    <>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-prime-red/20 text-prime-cream">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">{link.title}</h3>
        <p className="text-sm leading-6 text-prime-cream/70">{link.description}</p>
      </div>
    </>
  )

  if (isExternalLink(link.href)) {
    return (
      <a href={link.href} className={className} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {content}
      </a>
    )
  }

  if (isHashLink(link.href)) {
    return (
      <a href={link.href} className={className}>
        {content}
      </a>
    )
  }

  return (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  )
}

function buildPreviewAwareHref(href: string, previewStudentEmail?: string | null) {
  if (href.startsWith('#') || !previewStudentEmail || !href.startsWith('/dashboard')) {
    return href
  }

  const params = new URLSearchParams()
  params.set('studentEmail', previewStudentEmail)
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
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-prime-cream/80 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
    >
      {item.title}
    </a>
  )
}

type DashboardPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  if (!session?.user) {
    redirect('/login')
  }

  const studentState = await getStudentDashboardState(
    session.user,
    resolvedSearchParams?.studentEmail
  )

  if (!studentState.hasAccess || !studentState.student) {
    if (isAdminUser(session.user)) {
      redirect('/dashboard/admin')
    }

    redirect('/pending-access')
  }

  const student = studentState.student

  return (
    <div className="space-y-6">
      {studentState.isPreviewingAnotherStudent ? (
        <section className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Admin preview active. You are logged in as {studentState.viewerEmail}, but viewing the
          dashboard for {student.studentEmail}.
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(246,235,207,0.12),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-6 shadow-2xl shadow-black/30 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-prime-cream/70">
                Personalized Learning Hub
              </span>
              <span className="rounded-full border border-prime-red/30 bg-prime-red/15 px-3 py-1 text-prime-cream">
                Source: {studentState.source === 'firestore' ? 'Firestore' : 'Preview mode'}
              </span>
            </div>
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-prime-cream/50">Prime Digital Hub</p>
              <h2 className="text-4xl font-bold text-white md:text-5xl">Welcome back, {student.studentName}!</h2>
              <p className="max-w-2xl text-base leading-7 text-prime-cream/80">
                This is your central learning hub with class access, progress indicators, attendance
                history and the key feedback points guiding your next level jump.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">Current level</p>
              <p className="mt-2 text-3xl font-bold text-white">{student.currentLevel}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">Target level</p>
              <p className="mt-2 text-3xl font-bold text-white">{student.targetLevel}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">Attendance</p>
              <p className="mt-2 text-3xl font-bold text-white">{student.attendanceRate}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-prime-cream/50">Learning focus</p>
          <p className="mt-2 text-lg font-medium text-prime-cream">{student.focus}</p>
          <p className="mt-2 text-sm text-prime-cream/65">{student.attendanceLabel}</p>
        </div>
      </section>

      <section id="portfolio-navigation" className="glass-card space-y-4 p-5 scroll-mt-28">
        <div>
          <h3 className="text-xl font-bold text-white">Portfolio Navigation</h3>
          <p className="text-sm text-prime-cream/70">
            Fast jump links to the core sections extracted from Rafael&apos;s portfolio.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {student.portfolioNavigation.map((item) => (
            <PortfolioNavigationChip
              key={item.id}
              item={item}
              previewStudentEmail={studentState.isPreviewingAnotherStudent ? student.studentEmail : null}
            />
          ))}
        </div>
      </section>

      <section id="manage-space" className="space-y-4 scroll-mt-28">
        <div>
          <h3 className="text-2xl font-bold text-white">My Learning Links</h3>
          <p className="text-sm text-prime-cream/70">
            The core links Rafael needs every week, organized for fast access.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {student.manageSpace.map((link) => (
            <ManageSpaceCard key={link.id} link={link} />
          ))}
        </div>
      </section>

      <section id="attendance-overview" className="space-y-4 scroll-mt-28">
        <div>
          <h3 className="text-2xl font-bold text-white">Attendance Overview</h3>
          <p className="text-sm text-prime-cream/70">
            Lesson dates with compact class summaries for quick academic recall.
          </p>
        </div>
        <div className="space-y-4">
          {student.attendanceOverview.map((lesson) => (
            <article key={lesson.id} className="glass-card p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{lesson.date}</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.18em] text-emerald-200">
                    {lesson.status}
                  </p>
                </div>
                <p className="max-w-2xl text-sm font-medium text-prime-cream">{lesson.title}</p>
              </div>
              <p className="mt-4 text-sm leading-7 text-prime-cream/80">{lesson.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="progress-tracker" className="space-y-4 scroll-mt-28">
        <div>
          <h3 className="text-2xl font-bold text-white">Progress Tracker</h3>
          <p className="text-sm text-prime-cream/70">
            A clear pedagogical snapshot combining fluency, grammar and analytical performance.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {student.progressTracker.map((item) => (
            <article key={item.id} className="glass-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-semibold text-white">{item.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-prime-cream/80">{item.insight}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${progressAccentClasses[item.accent]}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${progressBarClasses[item.accent]} ${progressWidths[item.status] ?? 'w-[50%]'}`}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="vocabulary-bank" className="space-y-4 scroll-mt-28">
        <div>
          <h3 className="text-2xl font-bold text-white">Vocabulary Bank</h3>
          <p className="text-sm text-prime-cream/70">
            High-value vocabulary gathered from Rafael&apos;s lessons for active reuse.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {student.vocabularyBank.map((item) => (
            <article key={item.id} className="glass-card p-6">
              <p className="text-xl font-semibold text-white">{item.term}</p>
              <p className="mt-3 text-sm leading-6 text-prime-cream/80">{item.meaning}</p>
              <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm italic text-prime-cream/65">
                {item.example}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="grammar-overview" className="space-y-4 scroll-mt-28">
        <div>
          <h3 className="text-2xl font-bold text-white">Grammar Overview</h3>
          <p className="text-sm text-prime-cream/70">
            Cumulative grammar focus points extracted from Rafael&apos;s portfolio and teacher review.
          </p>
        </div>
        <article className="glass-card p-6">
          <h4 className="text-xl font-semibold text-white">{student.grammarOverview.title}</h4>
          <p className="mt-3 text-sm leading-7 text-prime-cream/80">
            {student.grammarOverview.summary}
          </p>
          <ul className="mt-5 space-y-3">
            {student.grammarOverview.focusPoints.map((point) => (
              <li
                key={point}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-6 text-prime-cream/80"
              >
                {point}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section id="teacher-feedback" className="space-y-4 scroll-mt-28">
        <div>
          <h3 className="text-2xl font-bold text-white">Teacher Feedback</h3>
          <p className="text-sm text-prime-cream/70">
            Cumulative feedback blocks extracted from Rafael&apos;s portfolio and monthly review.
          </p>
        </div>
        <div className="space-y-4">
          {student.teacherFeedback.map((feedback) => (
            <article key={feedback.id} className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-prime-red/20 text-prime-cream">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>
                <h4 className="text-xl font-semibold text-white">{feedback.title}</h4>
              </div>
              <p className="mt-4 text-sm leading-7 text-prime-cream/80">{feedback.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
