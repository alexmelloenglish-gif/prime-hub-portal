import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function decideValidation(formData: FormData) {
  'use server'

  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user || (role !== 'admin' && role !== 'teacher')) return

  const taskId = String(formData.get('taskId') || '')
  const decision = String(formData.get('decision') || '')
  if (!taskId || !['approved', 'rejected'].includes(decision)) return

  const prisma = getPrismaClient()
  const task = await prisma.validationTask.findUnique({ where: { id: taskId } })
  if (!task) return

  await prisma.validationTask.update({
    where: { id: taskId },
    data: {
      status: decision,
      decision,
      reviewerId: session.user.id,
      reviewedAt: new Date(),
      reason: String(formData.get('reason') || '').trim() || null,
    },
  })

  if (task.type === 'attendance_reconciliation' && decision === 'approved') {
    await prisma.attendanceRecord.update({
      where: { id: task.entityId },
      data: {
        status: 'attended',
        authorityStatus: 'authoritative',
        reconciledAt: new Date(),
      },
    })
  }

  redirect('/dashboard/admin/intelligence/validation')
}

export default async function ValidationTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user || (role !== 'admin' && role !== 'teacher')) {
    return <main className="mx-auto max-w-4xl p-6">Validation is restricted to teacher and administrator accounts.</main>
  }

  const { taskId } = await params
  const prisma = getPrismaClient()
  const task = await prisma.validationTask.findUnique({ where: { id: taskId } })
  if (!task) notFound()

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Link href="/dashboard/admin/intelligence/validation" className="text-sm font-semibold text-indigo-700 hover:underline">
        ← Back to Validation
      </Link>

      <header>
        <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{task.type}</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{task.title}</h1>
        <p className="mt-2 text-slate-600">{task.description}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-950">Evidence supplied to the validator</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">
          {JSON.stringify(task.evidence, null, 2)}
        </pre>
      </section>

      {task.status === 'pending' ? (
        <form action={decideValidation} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="taskId" value={task.id} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Decision note</span>
            <textarea name="reason" rows={4} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm" placeholder="Record why this operational fact is accepted or rejected." />
          </label>
          <div className="flex flex-wrap gap-3">
            <button name="decision" value="approved" className="rounded-xl bg-[#263c86] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e2f6b]">
              Approve as proven
            </button>
            <button name="decision" value="rejected" className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Reject
            </button>
          </div>
        </form>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-slate-950">Decision: {task.status}</p>
          {task.reason ? <p className="mt-2 text-sm text-slate-600">{task.reason}</p> : null}
        </section>
      )}
    </main>
  )
}
