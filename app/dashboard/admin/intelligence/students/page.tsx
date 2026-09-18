import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { ShieldCheck, Users } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { listStudentsForAdmin } from '@/lib/admin-dashboard'
import { getTeacherDecisionPackageByStudent } from '@/lib/teacher-decision-packages'

export default async function TeacherStudentsPage() {
  const session = await getServerSession(authOptions)
  const students = await listStudentsForAdmin(session?.user)

  return (
    <section className="glass-card p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Learners</p>
      <h2 className="mt-1 text-xl font-semibold text-white">Authorized learners</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">
        Open a learner&apos;s dashboard, review lesson history and access teacher-reviewed learning updates from one place.
      </p>

      {students.length ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {students.map((student) => {
            const decisionPackage = getTeacherDecisionPackageByStudent(student.studentEmail)

            return (
              <article key={student.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{student.studentName}</h3>
                    <p className="mt-1 text-sm text-prime-cream/55">{student.studentEmail}</p>
                  </div>
                  {decisionPackage ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Teacher reviewed
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100/70">Learning record</p>
                  <p className="mt-1 text-sm font-semibold text-white">{student.learningRecordLabel || 'Learning record available'}</p>
                  <p className="mt-1 text-xs text-prime-cream/55">{student.canonicalReportCount ?? 0} class report{(student.canonicalReportCount ?? 0) === 1 ? '' : 's'} · {student.attendanceRate}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-prime-cream/55">
                  <p>Current level: <span className="text-prime-cream/80">{student.currentLevel}</span></p>
                  <p>Target: <span className="text-prime-cream/80">{student.targetLevel}</span></p>
                  <p>Class reports: <span className="text-prime-cream/80">{student.canonicalReportCount ?? 0}</span></p>
                  <p>Attendance: <span className="text-prime-cream/80">{student.attendanceRate}</span></p>
                </div>

                {decisionPackage ? (
                  <div className="mt-4 rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100/80">Reviewed learning update</p>
                    <p className="mt-1 text-xs leading-5 text-prime-cream/65">A teacher-reviewed learning state, priority and next-step package is available for this learner.</p>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {decisionPackage ? (
                    <Link href={`/dashboard/admin/intelligence/students/${encodeURIComponent(decisionPackage.studentId)}`} className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-300/20">
                      Open reviewed learning package
                    </Link>
                  ) : null}
                  <Link href={`/dashboard?studentEmail=${encodeURIComponent(student.studentEmail)}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">
                    Student dashboard
                  </Link>
                  <Link href={`/dashboard/admin/intelligence/lessons?studentEmail=${encodeURIComponent(student.studentEmail)}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">
                    Lesson history
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-prime-cream/60">
          <Users className="h-5 w-5" aria-hidden="true" />
          No authorized learners found.
        </div>
      )}
    </section>
  )
}
