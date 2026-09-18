import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { AlertTriangle, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import { prepareCanonicalAuthorityValidationTask } from '@/lib/canonical-authority-review'
import { listTeacherDecisionPackages } from '@/lib/teacher-decision-packages'

export const dynamic = 'force-dynamic'

async function prepareCanonicalAuthorityReview(formData: FormData) {
  'use server'

  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user || (role !== 'admin' && role !== 'teacher')) return

  const packageId = String(formData.get('packageId') || '').trim()
  if (!packageId) return

  const task = await prepareCanonicalAuthorityValidationTask(packageId)
  redirect(`/dashboard/admin/intelligence/validation/${task.id}`)
}

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
  const [pendingRaw, recentResolvedRaw, canonicalAuthorityTasks] = await Promise.all([
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
    prisma.validationTask.findMany({
      where: {
        type: 'canonical_learning_record_authority',
        entityType: 'TeacherDecisionPackage',
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  const pending = pendingRaw.filter((task) => !task.studentEmail?.toLowerCase().endsWith('@invalid.test'))
  const recentResolved = recentResolvedRaw.filter((task) => !task.studentEmail?.toLowerCase().endsWith('@invalid.test'))
  const canonicalTaskByPackageId = new Map(
    canonicalAuthorityTasks.map((task) => [task.entityId, task]),
  )

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Teacher Intelligence · Review
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Teacher decisions and exceptions</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Use this workspace when a learner record needs a teacher or administrator decision. Routine lesson evidence stays automatic; meaningful learning-state changes remain under teacher control.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Clock3 className="h-4 w-4" aria-hidden="true" /> Pending</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{pending.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><AlertTriangle className="h-4 w-4" aria-hidden="true" /> Exceptions</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{pending.filter((task) => task.type !== 'attendance_reconciliation').length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Recently resolved</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{recentResolved.length}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Teacher-reviewed learners</div>
          <div className="mt-2 text-3xl font-bold text-emerald-950">{teacherPackages.length}</div>
        </div>
      </section>

      {teacherPackages.length ? (
        <section className="rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="border-b border-emerald-100 px-5 py-4">
            <h2 className="font-bold text-slate-950">Reviewed learning updates</h2>
            <p className="mt-1 text-sm text-slate-500">Learning-state and next-step updates that have already been reviewed by the teacher.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {teacherPackages.map((pkg) => (
              <article key={pkg.packageId} className="px-5 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Teacher reviewed</div>
                    <h3 className="mt-1 font-semibold text-slate-950">{pkg.studentName}</h3>
                    <p className="mt-1 text-sm text-slate-600">Current learning focus and next action reviewed; CEFR level unchanged.</p>
                    <div className="mt-2 text-xs text-slate-500">{pkg.teacher.name} · {pkg.decisionDate} · {pkg.sourceLessons.length} reviewed lessons</div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/dashboard/admin/intelligence/students/${encodeURIComponent(pkg.studentId)}`}
                      className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                    >
                      Open learning package
                    </Link>
                    {canonicalTaskByPackageId.get(pkg.packageId) ? (
                      <Link
                        href={`/dashboard/admin/intelligence/validation/${canonicalTaskByPackageId.get(pkg.packageId)!.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-100"
                      >
                        Open canonical review
                      </Link>
                    ) : (
                      <form action={prepareCanonicalAuthorityReview}>
                        <input type="hidden" name="packageId" value={pkg.packageId} />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-100"
                        >
                          Prepare canonical authority review
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-950">Waiting for validation</h2>
          <p className="mt-1 text-sm text-slate-500">Only items that need a human decision should appear here.</p>
        </div>
        {pending.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">Nothing is currently waiting for validation.</div>
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
                    Review item
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
