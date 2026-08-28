'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { recordEvidenceReviewDecision, type EvidenceReviewDecision } from '@/lib/teacher-intelligence'

const allowedDecisions = new Set<EvidenceReviewDecision>(['accept', 'reject', 'return', 'block'])

export async function reviewEvidenceCandidateAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdminUser(session.user)) throw new Error('Administrator access required')

  const evidenceId = String(formData.get('evidenceId') || '').trim()
  const decision = String(formData.get('decision') || '').trim() as EvidenceReviewDecision
  const reason = String(formData.get('reason') || '').trim()
  if (!evidenceId || !allowedDecisions.has(decision)) throw new Error('Evidence ID and a valid decision are required')

  await recordEvidenceReviewDecision({
    evidenceId,
    reviewerId: session.user.email || session.user.id || 'admin',
    reviewerRole: session.user.role || 'admin',
    decision,
    reason,
  })

  revalidatePath('/dashboard/admin/intelligence')
  revalidatePath('/dashboard/admin/intelligence/review')
  revalidatePath('/dashboard/admin/intelligence/lessons')
}
