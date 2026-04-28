import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'
import { getStudentDashboardState, isAdminUser } from '@/lib/student-data'

function getCompactConsistencyLabel(attendanceLabel: string) {
  const labelAfterColon = attendanceLabel.split(':').slice(1).join(':').trim()

  if (!labelAfterColon) {
    return attendanceLabel
  }

  return labelAfterColon.split('(')[0].trim() || attendanceLabel
}

type LessonsPageProps = {
  searchParams?: Promise<{
    studentEmail?: string
  }>
}

export default async function DashboardLessonsPage({ searchParams }: LessonsPageProps) {
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
    <SectionShell
      title="Attendance Overview"
      description="Lesson dates, attendance status and expandable class summaries for quick academic recall."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-amber-300/20 bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(255,255,255,0.03))] p-5 shadow-lg shadow-black/20">
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">Total lessons</p>
          <p className="mt-3 text-3xl font-bold text-white">{student.attendanceOverview.length}</p>
        </article>
        <article className="rounded-3xl border border-emerald-300/20 bg-[linear-gradient(135deg,rgba(52,211,153,0.16),rgba(255,255,255,0.03))] p-5 shadow-lg shadow-black/20">
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">Attended</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {student.attendanceOverview.filter((lesson) => lesson.status === 'present').length}
          </p>
        </article>
        <article className="rounded-3xl border border-sky-300/20 bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(255,255,255,0.03))] p-5 shadow-lg shadow-black/20">
          <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">Consistency</p>
          <p className="mt-3 text-lg font-semibold text-white">
            {getCompactConsistencyLabel(student.attendanceLabel)}
          </p>
        </article>
      </div>

      <div className="space-y-4">
        {student.attendanceOverview.map((lesson, index) => {
          const report = student.classReports[index]

          return (
            <details
              key={lesson.id}
              className="group overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-xl shadow-black/20"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 border-l-4 border-prime-red bg-[radial-gradient(circle_at_top_left,rgba(190,24,93,0.14),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-prime-cream/70">
                      {lesson.date}
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-100">
                      {lesson.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{lesson.title}</h3>
                  <p className="text-sm text-prime-cream/72">
                    Open to view the class summary, focus points and teacher insight.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-prime-red" />
                  <ChevronDown className="h-5 w-5 shrink-0 text-prime-cream/60 transition-transform group-open:rotate-180" />
                </div>
              </summary>

              <div className="border-t border-white/10 px-5 pb-5 pt-4">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-300/15 bg-amber-200/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">
                      Class summary
                    </p>
                    <p className="mt-2 text-sm leading-6 text-prime-cream/80">{lesson.summary}</p>
                  </div>

                  {report ? (
                    <>
                      <div className="rounded-2xl border border-rose-300/15 bg-rose-300/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">
                          Lesson focus
                        </p>
                        <ul className="mt-2 space-y-2">
                          {report.focus.map((item) => (
                            <li
                              key={`${report.id}-${item}`}
                              className="rounded-2xl border border-rose-200/10 bg-black/20 px-4 py-3 text-sm text-prime-cream/82"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-sky-300/15 bg-sky-300/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">
                          Teacher insight
                        </p>
                        <p className="mt-2 text-sm leading-6 text-prime-cream/80">
                          {report.teacherInsight}
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </details>
          )
        })}
      </div>
    </SectionShell>
  )
}
