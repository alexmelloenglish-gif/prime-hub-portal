import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Eye, Plus, Shield } from 'lucide-react'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'
import { listStudentsForAdmin } from '@/lib/admin-dashboard'
import { isAdminUser } from '@/lib/student-data'

export default async function DashboardAdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  if (!isAdminUser(session.user)) {
    redirect('/pending-access')
  }

  const students = await listStudentsForAdmin(session.user)

  return (
    <SectionShell
      title="Admin Panel"
      description="Preview student dashboards as they will appear to the learner and manage the onboarding flow."
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
        <article className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-prime-red/15 p-3 text-prime-cream">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Admin access</h3>
              <p className="text-sm text-prime-cream/65">{session.user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">
                How to add more students
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-prime-cream/80">
                <li>1. Create a new document in Firestore under the `students` collection.</li>
                <li>2. Use the student&apos;s Google email in `studentEmail`.</li>
                <li>3. Add the portfolio fields used by Rafael as the base model.</li>
                <li>4. Open the preview link below to see exactly what the student will see.</li>
              </ol>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/50">
                Current model
              </p>
              <p className="mt-3 text-sm leading-6 text-prime-cream/80">
                Rafael is now the reference model. New students should reuse the same Firestore
                structure and replace only the portfolio-specific data.
              </p>
            </div>
          </div>
        </article>

        <div className="space-y-4">
          {students.map((student) => {
            const previewHref = `/dashboard?studentEmail=${encodeURIComponent(student.studentEmail)}`

            return (
              <article key={student.id} className="glass-card p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-prime-cream/70">
                        {student.currentLevel}
                      </span>
                      <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-100">
                        Target {student.targetLevel}
                      </span>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-100">
                        Attendance {student.attendanceRate}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white">{student.studentName}</h3>
                      <p className="text-sm text-prime-cream/65">{student.studentEmail}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={previewHref}
                      className="inline-flex items-center gap-2 rounded-2xl bg-prime-red px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-prime-red/90"
                    >
                      <Eye className="h-4 w-4" />
                      Open student view
                    </Link>
                    <Link
                      href={`${previewHref.replace('/dashboard', '/dashboard/aulas')}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-prime-cream/85 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Open lessons view
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </SectionShell>
  )
}
