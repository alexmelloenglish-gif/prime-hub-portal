import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { AlertTriangle, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import { listTeacherDecisionPackages } from '@/lib/teacher-decision-packages'
import { listTeacherIntelligenceCandidatePackages } from '@/lib/teacher-intelligence-candidates'

export const dynamic = 'force-dynamic'

export default async function TeacherValidationPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  if (!session?.user || (role !== 'admin' && role !== 'teacher')) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold text-slate-900">Validation</h1>
        <p className="mt-2 text-slate-600">This workspace is restricted to teacher and administrator accounts.</p>
      </main>
    )
  }

  const prisma = getPrismaClient()
  const teacherPackages = listTeacherDecisionPackages()
  const candidatePackages = listTeacherIntelligenceCandidatePackages()
  const [pending, recentResolved] = await Promise.all([
    prisma.validationTask.findMany({
      where: { status: 'pending' },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: 100,
    }),
    prisma.validationTask.findMany({
      where: { status: { not: 'pending' } },
      orderBy: { updatedAt: 'desc' },
      take: 25,
    }),
  ])

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Teacher Intelligence · Validation
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Exception-based authority</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Source-grounded facts should be processed automatically. This workspace exists for unresolved operational exceptions and bounded pedagogical authority transitions — not for approving every extracted sentence.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800"><Clock3 className="h-4 w-4" aria-hidden="true" /> Pedagogical pending</div>
          <div className="mt-2 text-3xl font-bold text-amber-950">{candidatePackages.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Clock3 className="h-4 w-4" aria-hidden="true" /> Operational pending</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{pending.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><AlertTriangle className="h-4 w-4" aria-hidden="true" /> Other manual exceptions</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{pending.filter((task) => task.type !== 'attendance_reconciliation').length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Operational resolved</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{recentResolved.length}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Teacher-authorized</div>
          <div className="mt-2 text-3xl font-bold text-emerald-950">{teacherPackages.length}</div>
        </div>
      </section>

      {candidatePackages.length ? (
        <section className="rounded-2xl border border-amber-200 bg-white shadow-sm">
          <div className="border-b border-amber-100 px-5 py-4">
            <h2 className="font-bold text-slate-950">Pending pedagogical authority transitions</h2>
            <p className="mt-1 text-sm text-slate-500">Evidence, signals, interpretations, boundaries and next verification are prepared first. The teacher then decides the bounded current-state / priority / next-action transition.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {candidatePackages.map((pkg) => (
              <article key={pkg.packageId} className="px-5 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700"><Clock3 className="h-4 w-4" aria-hidden="true" /> Awaiting teacher decision</div>
                    <h3 className="mt-1 font-semibold text-slate-950">{pkg.studentName} — V2 source-grounded candidate</h3>
                    <p className="mt-1 text-sm text-slate-600">{pkg.sourceLessons.length} primary-source lessons · {pkg.classReportsV2.length} rebuilt V2 reports · canonical projection blocked.</p>
                    <div className="mt-2 text-xs text-slate-500">Prepared {pkg.preparedAt} · legacy preserved · no automatic CEFR change</div>
                  </div>
                  <Link
                    href={`/dashboard/admin/intelligence/validation/candidates/${encodeURIComponent(pkg.studentEmail)}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    Review candidate package
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {teacherPackages.length ? (
        <section className="rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="border-b border-emerald-100 px-5 py-4">
            <h2 className="font-bold text-slate-950">Resolved pedagogical authority transitions</h2>
            <p className="mt-1 text-sm text-slate-500">One bounded teacher decision can authorize the complete source-grounded package without individual evidence checkboxes.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {teacherPackages.map((pkg) => (
              <article key={pkg.packageId} className="px-5 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Teacher authorized</div>
                    <h3 className="mt-1 font-semibold text-slate-950">{pkg.studentName} — V2 source-grounded package</h3>
                    <p className="mt-1 text-sm text-slate-600">State/priority update accepted · next action accepted · CEFR unchanged · canonical projection authorized.</p>
                    <div className="mt-2 text-xs text-slate-500">{pkg.teacher.name} · {pkg.decisionDate} · {pkg.sourceLessons.length} source-grounded lessons</div>
                  </div>
                  <Link
                    href={`/dashboard/admin/intelligence/students/${encodeURIComponent(pkg.studentEmail)}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    Open authorized package
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-950">Pending operational validation</h2>
          <p className="mt-1 text-sm text-slate-500">No pedagogical state is created by this queue. Attendance reaches this queue only when automatic Google Meet participant reconciliation cannot establish one authoritative learner match; normal matched attendance requires no teacher click.</p>
        </div>
        {pending.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">No operational exceptions are currently waiting for validation.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pending.map((task) => (
              <article key={task.id} className="px-5 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{task.type}</div>
                    <h3 className="mt-1 font-semibold text-slate-950">{task.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                    <div className="mt-2 text-xs text-slate-500">
                      {task.studentEmail || 'No learner'} · {task.lessonId || 'No lesson'} · priority {task.priority}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/admin/intelligence/validation/${task.id}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Open validation
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
