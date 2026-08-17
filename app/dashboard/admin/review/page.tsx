import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import { SectionShell } from '@/components/dashboard/section-shell'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { listPendingReviewTasks } from '@/lib/pipeline/run'
import { ReviewQueueActions } from './review-queue-actions'

export const dynamic = 'force-dynamic'

export default async function DashboardAdminReviewPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect('/login')
  if (!isAdminUser(session.user)) redirect('/pending-access')

  const tasks = await listPendingReviewTasks()

  return (
    <SectionShell
      title="Human review queue"
      description="Review the identity and source evidence before the pipeline is allowed to generate or publish student-facing projections."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-prime-cream/65">
          <div className="rounded-2xl bg-prime-red/15 p-3 text-prime-cream"><ClipboardCheck className="h-5 w-5" /></div>
          <p>{tasks.length} pending {tasks.length === 1 ? 'review' : 'reviews'}. The queue is the publication boundary.</p>
        </div>
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-prime-cream/85 transition hover:bg-white/10 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to admin
        </Link>
      </div>
      <ReviewQueueActions initialTasks={tasks} />
    </SectionShell>
  )
}
