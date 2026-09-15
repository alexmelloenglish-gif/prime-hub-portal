import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

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
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Operational Validation</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Resolve operational authority gaps here. The system should prove facts from authoritative sources automatically; this queue is for cases that cannot be reconciled safely.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Clock3 className="h-4 w-4" aria-hidden="true" /> Pending</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{pending.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><AlertTriangle className="h-4 w-4" aria-hidden="true" /> Manual exceptions</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{pending.filter((task) => task.type !== 'attendance_reconciliation').length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Resolved history</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{recentResolved.length}</div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-950">Pending operational validation</h2>
          <p className="mt-1 text-sm text-slate-500">No pedagogical state is created by this queue.</p>
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
