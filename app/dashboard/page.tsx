import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BarChart3,
  Bot,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  Headphones,
  Link as LinkIcon,
  MessageSquareQuote,
  Target,
  UsersRound,
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
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  yellow: 'border-amber-200 bg-amber-50 text-amber-700',
  pink: 'border-rose-200 bg-rose-50 text-rose-700',
  blue: 'border-sky-200 bg-sky-50 text-sky-700',
}

const progressBarClasses: Record<ProgressTrackerCard['accent'], string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  pink: 'bg-rose-500',
  blue: 'bg-sky-500',
}

const progressWidths: Record<string, string> = {
  'Very Strong': 'w-[92%]',
  Strong: 'w-[82%]',
  'Active Growth': 'w-[68%]',
  Improving: 'w-[58%]',
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
      <span className="mt-auto pt-1 text-xs font-semibold text-blue-600 transition-transform group-hover:translate-x-1">
        Open →
      </span>
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
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#16346d] shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/50"
    >
      {item.title}
      <span className="text-blue-600">→</span>
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

  const baseStudent = studentState.student
  const isRafael = baseStudent.studentEmail.toLowerCase() === 'rafael.copolillo@gmail.com'

  const student = isRafael
    ? {
        ...baseStudent,
        attendanceRate: '73%',
        attendanceLabel: '15 scheduled • 11 attended • 4 absences',
        manageSpace: baseStudent.manageSpace.map((link) => {
          if (link.id === 'portfolio') {
            return {
              ...link,
              href: 'https://docs.google.com/document/d/1ZXPBlc34kkOcfqHWodI78_BwXuJfe-p7pU7uFLSk4bE',
            }
          }

          if (link.id === 'live-class') {
            return {
              ...link,
              href: 'https://meet.google.com/ftt-pyvc-nqp',
            }
          }

          return link
        }),
        attendanceOverview: [
          {
            id: 'class-2026-03-05',
            date: 'March 5, 2026',
            status: 'present',
            title: 'Italy trip storytelling and BBC current events',
            summary:
              'Rafael shared his recent trip to Italy with clear chronological storytelling and strong communicative instinct. The lesson also introduced a BBC report about Iran, strengthening listening comprehension, memory recall and real-world retelling.',
          },
          {
            id: 'class-2026-03-12',
            date: 'March 12, 2026',
            status: 'present',
            title: 'Advanced fluency, geopolitics and international relations',
            summary:
              'The class focused on advanced conversation fluency, narrative skills and geopolitical vocabulary. Rafael showed strong curiosity about global events and strong potential for advanced fluency development.',
          },
          {
            id: 'class-2026-03-23',
            date: 'March 23, 2026',
            status: 'present',
            title: 'Lifestyle, technology and political institutions',
            summary:
              'The lesson moved from health, nutrition and technology into public institutions and political developments in Rio. Rafael communicated with confidence in familiar real-life topics while grammar precision became the next growth target.',
          },
          {
            id: 'class-2026-03-26',
            date: 'March 26, 2026',
            status: 'present',
            title: 'Dream storytelling plus AI in business and society',
            summary:
              'Rafael handled spontaneous speaking, listening and interpretation around AI and business with strong analytical thinking. The key priority was improving verb accuracy and core sentence patterns without losing communicative power.',
          },
          {
            id: 'class-2026-04-06',
            date: 'April 6, 2026',
            status: 'present',
            title: 'Structured storytelling, emotions and family language dynamics',
            summary:
              'This lesson developed guided speaking with scaffolding, emotional vocabulary and clarity in past forms. Rafael showed noticeable improvement in self-correction and stronger narrative organization when supported by structure.',
          },
          {
            id: 'class-2026-04-09',
            date: 'April 9, 2026',
            status: 'present',
            title: 'Homes, cooking processes and complex political explanation',
            summary:
              'The class combined house and kitchen vocabulary with discussion of a complex political scenario at Alerj. Rafael explained a difficult real-world topic with very few gaps and showed stronger consolidation of the past simple.',
          },
          {
            id: 'class-2026-05-26',
            date: 'May 26, 2026',
            status: 'present',
            title: 'Political polarization, civic participation and advanced expression',
            summary:
              'Rafael discussed sophisticated political and social issues with strong analytical thinking. The lesson reinforced third conditional structures, political vocabulary and clear argumentation.',
          },
          {
            id: 'class-2026-06-18',
            date: 'June 18, 2026',
            status: 'present',
            title: 'Education, career challenges and public administration vocabulary',
            summary:
              'Rafael discussed education, family responsibilities and career paths while expanding tax law and public administration vocabulary and consolidating past simple usage.',
          },
          {
            id: 'class-2026-06-25',
            date: 'June 25, 2026',
            status: 'absent',
            title: 'Absence recorded',
            summary: 'Official portfolio attendance record: absent. No class report is generated for this date.',
          },
          {
            id: 'class-2026-07-02',
            date: 'July 2, 2026',
            status: 'present',
            title: 'Home decoration, antique shopping and lifestyle differences',
            summary:
              'The class explored personalized topics such as a new puppy, home decoration and antique shopping, with spontaneous speaking and present perfect vs simple past practice.',
          },
          {
            id: 'class-2026-07-09',
            date: 'July 9, 2026',
            status: 'absent',
            title: 'Absence recorded',
            summary: 'Official portfolio attendance record: absent. No class report is generated for this date.',
          },
          {
            id: 'class-2026-07-14',
            date: 'July 14, 2026',
            status: 'present',
            title: 'Reflective discussion on politics, resilience and lifelong learning',
            summary:
              'This reflective session combined political context, family responsibility and personal resilience, reinforcing vocabulary for emotional states, leadership and professional growth.',
          },
          {
            id: 'class-2026-08-13',
            date: 'August 13, 2026',
            status: 'absent',
            title: 'Absence recorded',
            summary: 'Official portfolio attendance record: absent. No class report is generated for this date.',
          },
          {
            id: 'class-2026-08-27',
            date: 'August 27, 2026',
            status: 'present',
            title: 'Lesson attended',
            summary: 'Attendance is confirmed in the official portfolio. The final Class Report will be added when it becomes available.',
          },
          {
            id: 'class-2026-09-03',
            date: 'September 3, 2026',
            status: 'absent',
            title: 'Absence recorded',
            summary: 'Official portfolio attendance record: absent. No class report is generated for this date.',
          },
        ],
        cumulativeImpact: {
          title: 'Cumulative Learning Impact',
          summary:
            'Rafael now has 15 scheduled lessons recorded in the official portfolio, with 11 attended lessons and 10 completed Class Reports. The August 27 Class Report will be added when the final report is available.',
          evidence: ['10 Class Reports available', '11 attended lessons', '42 active vocabulary items'],
        },
      }
    : baseStudent

  const profileImage = isRafael ? '/assets/rafael-profile.svg' : null

  return (
    <div className="dashboard-light space-y-4 md:space-y-5">
      {studentState.isPreviewingAnotherStudent ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm">
          <span className="font-semibold">Admin preview active.</span> You are logged in as {studentState.viewerEmail}, but viewing the dashboard for {student.studentEmail}.
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.95),transparent_28%),linear-gradient(120deg,#d8ecff_0%,#eff7ff_48%,#f8fbff_100%)] p-5 shadow-[0_22px_60px_rgba(25,74,135,0.12)] md:p-7">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${student.studentName} profile image`}
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-[0_14px_38px_rgba(15,52,110,0.20)] md:h-36 md:w-36"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-4xl font-bold text-white shadow-lg md:h-36 md:w-36">
                {student.studentName.charAt(0)}
              </div>
            )}
          </div>

          <div className="max-w-3xl space-y-2.5">
            <p className="text-sm font-semibold text-blue-600">Prime Digital Hub</p>
            <h2 className="text-[2rem] font-bold leading-[1.02] tracking-[-0.035em] text-[#0a235c] sm:text-4xl md:text-5xl">
              Welcome back,
              <span className="block text-blue-600">{student.studentName}!</span>
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-[#304d7d] md:text-base">
              Your central learning hub with class access, progress indicators, attendance history and the key feedback points guiding your next level jump.
            </p>
          </div>

          <div className="ml-auto hidden max-w-[15rem] rotate-[-3deg] text-right lg:block">
            <p className="font-display text-2xl font-semibold italic leading-tight text-[#0b2b69]">
              Fluency today.
              <br />New horizons tomorrow.
            </p>
            <div className="ml-auto mt-3 h-1 w-24 rotate-[-8deg] rounded-full bg-prime-red" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.07)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-xs text-slate-500">Current level</p><p className="text-xl font-bold text-[#0a235c]">{student.currentLevel}</p></div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-blue-100"><div className="h-full w-[68%] rounded-full bg-blue-500" /></div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.07)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-prime-red"><Target className="h-5 w-5" /></div>
            <div><p className="text-xs text-slate-500">Target level</p><p className="text-xl font-bold text-[#0a235c]">{student.targetLevel}</p></div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-rose-100"><div className="h-full w-[76%] rounded-full bg-prime-red" /></div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.07)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><UsersRound className="h-5 w-5" /></div>
            <div><p className="text-xs text-slate-500">Attendance</p><p className="text-xl font-bold text-[#0a235c]">{student.attendanceRate}</p></div>
          </div>
          <p className="mt-2 text-xs text-slate-500">{student.attendanceLabel}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100"><div className="h-full w-[73%] rounded-full bg-emerald-500" /></div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.07)]">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><BookOpen className="h-5 w-5" /></div>
            <div><p className="text-xs text-slate-500">Learning focus</p><p className="mt-1 text-sm font-semibold leading-5 text-[#0a235c]">{student.focus}</p></div>
          </div>
        </article>
      </section>

      {student.cumulativeImpact.evidence.length ? (
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,48,93,0.07)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><BarChart3 className="h-5 w-5" /></div>
              <div><h3 className="text-xl font-bold text-[#0a235c]">{student.cumulativeImpact.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{student.cumulativeImpact.summary}</p></div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {student.cumulativeImpact.evidence.map((item) => (
                <div key={item} className="rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-3 text-sm font-medium text-[#244575]">{item}</div>
              ))}
            </div>
          </article>

          <section id="portfolio-navigation" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,48,93,0.07)] scroll-mt-28">
            <h3 className="text-xl font-bold text-[#0a235c]">Portfolio Navigation</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Fast jump links to the core sections of this student&apos;s learning portfolio.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {student.portfolioNavigation.map((item) => (
                <PortfolioNavigationChip key={item.id} item={item} previewStudentEmail={studentState.isPreviewingAnotherStudent ? student.studentEmail : null} />
              ))}
            </div>
          </section>
        </section>
      ) : null}

      <section id="manage-space" className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-[#f4faff] to-white p-4 shadow-[0_12px_34px_rgba(15,48,93,0.06)] scroll-mt-28 md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600"><LinkIcon className="h-5 w-5" /></div>
          <div><h3 className="text-xl font-bold leading-tight text-[#0a235c]">My Learning Links</h3><p className="text-xs leading-5 text-slate-500">The core learning links organized for fast access.</p></div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {student.manageSpace.map((link) => <ManageSpaceCard key={link.id} link={link} />)}
        </div>
      </section>

      <section id="attendance-overview" className="space-y-3 scroll-mt-28">
        <div><h3 className="text-xl font-bold leading-tight text-[#0a235c]">Attendance Overview</h3><p className="text-xs leading-5 text-slate-500">15 scheduled lessons in the official portfolio: 11 attended and 4 absences.</p></div>
        <div className="grid gap-3 lg:grid-cols-2">
          {student.attendanceOverview.map((lesson) => {
            const isPresent = lesson.status === 'present'
            return (
              <article key={lesson.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-base font-semibold text-[#0a235c]">{lesson.date}</p><p className="mt-1 text-sm font-medium text-[#2f4b78]">{lesson.title}</p></div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${isPresent ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{isPresent ? 'Attended' : 'Absent'}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">{lesson.summary}</p>
              </article>
            )
          })}
        </div>
      </section>

      {student.classReports.length ? (
        <section id="class-reports" className="space-y-3 scroll-mt-28">
          <div><h3 className="text-xl font-bold leading-tight text-[#0a235c]">Class Reports</h3><p className="text-xs leading-5 text-slate-500">Published lesson reports from the official learning portfolio. The August 27 report will be added when available.</p></div>
          <div className="grid gap-3 lg:grid-cols-2">
            {student.classReports.map((report) => (
              <article key={report.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{report.date}</p>
                <h4 className="mt-1 text-lg font-semibold text-[#0a235c]">{report.title}</h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">{report.summary}</p>
                {report.focus.length ? <div className="mt-3 flex flex-wrap gap-2">{report.focus.map((focus) => <span key={focus} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-[#345481]">{focus}</span>)}</div> : null}
                {report.vocabulary.length ? <p className="mt-3 text-xs leading-5 text-slate-500">Vocabulary: {report.vocabulary.join(', ')}</p> : null}
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-[#49617f]">{report.teacherInsight}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section id="progress-tracker" className="space-y-3 scroll-mt-28">
        <div><h3 className="text-xl font-bold leading-tight text-[#0a235c]">Progress Tracker</h3><p className="text-xs leading-5 text-slate-500">A clear pedagogical snapshot combining fluency, grammar and analytical performance.</p></div>
        <div className="grid gap-4 lg:grid-cols-2">
          {student.progressTracker.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,48,93,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div><h4 className="text-lg font-semibold text-[#0a235c]">{item.title}</h4><p className="mt-2.5 text-sm leading-6 text-slate-500">{item.insight}</p></div>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${progressAccentClasses[item.accent]}`}>{item.status}</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${progressBarClasses[item.accent]} ${progressWidths[item.status] ?? 'w-[50%]'}`} /></div>
            </article>
          ))}
        </div>
      </section>

      <section id="vocabulary-bank" className="space-y-3 scroll-mt-28">
        <div><h3 className="text-xl font-bold leading-tight text-[#0a235c]">Vocabulary Bank</h3><p className="text-xs leading-5 text-slate-500">High-value vocabulary gathered from this student&apos;s lessons for active reuse.</p></div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {student.vocabularyBank.map((item, index) => (
            <article key={item.id} className={`rounded-2xl border p-4 shadow-sm ${vocabularyAccentClasses[index % vocabularyAccentClasses.length]}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Active vocabulary</p>
              <p className="mt-1.5 text-lg font-semibold text-[#0a235c]">{item.term}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.meaning}</p>
              <p className="mt-3 rounded-xl border border-white bg-white/70 px-3 py-2.5 text-sm italic text-slate-500">{item.example}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="grammar-overview" className="space-y-3 scroll-mt-28">
        <div><h3 className="text-xl font-bold leading-tight text-[#0a235c]">Grammar Overview</h3><p className="text-xs leading-5 text-slate-500">Cumulative grammar priorities from the official learning portfolio and teacher review.</p></div>
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,48,93,0.07)]">
          <h4 className="text-xl font-semibold text-[#0a235c]">{student.grammarOverview.title}</h4>
          <p className="mt-3 text-sm leading-7 text-slate-600">{student.grammarOverview.summary}</p>
          <ul className="mt-5 grid gap-3 lg:grid-cols-2">
            {student.grammarOverview.focusPoints.map((point, index) => (
              <li key={point} className={`rounded-2xl border px-4 py-4 text-sm leading-6 text-[#3d5578] ${grammarAccentClasses[index % grammarAccentClasses.length]}`}>
                <div className="flex gap-4"><span className="mt-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{String(index + 1).padStart(2, '0')}</span><span>{point}</span></div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section id="teacher-feedback" className="space-y-3 scroll-mt-28">
        <div><h3 className="text-xl font-bold leading-tight text-[#0a235c]">Teacher Feedback</h3><p className="text-xs leading-5 text-slate-500">Cumulative teacher perspective connected to Rafael&apos;s current learning priorities.</p></div>
        <div className="grid gap-3 lg:grid-cols-2">
          {student.teacherFeedback.map((feedback, index) => (
            <article key={feedback.id} className={`rounded-[24px] border p-5 shadow-[0_10px_30px_rgba(15,48,93,0.06)] ${index === 0 ? 'border-blue-100 bg-gradient-to-br from-blue-50 to-white' : 'border-rose-100 bg-gradient-to-br from-rose-50 to-white'}`}>
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm"><MessageSquareQuote className="h-5 w-5" /></div><div><h4 className="text-lg font-semibold text-[#0a235c]">{feedback.title}</h4><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Teacher perspective</p></div></div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{feedback.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
