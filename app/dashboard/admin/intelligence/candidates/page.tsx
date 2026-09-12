import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/student-data'
import { listReviewableIntelligenceCandidates } from '@/lib/intelligence/authority-service'
import { CandidateReviewList } from './candidate-review-list'

export const dynamic = 'force-dynamic'

export default async function IntelligenceCandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdminUser(session.user)) redirect('/pending-access')

  const candidates = await listReviewableIntelligenceCandidates()
  const serialized = candidates.map((candidate) => ({
    id: candidate.id,
    candidateKey: candidate.candidateKey,
    lessonId: candidate.lessonId,
    studentEmail: candidate.studentEmail,
    sourceType: candidate.sourceType,
    sourceRef: candidate.sourceRef,
    sourceHash: candidate.sourceHash,
    sourceOccurredAt: candidate.sourceOccurredAt?.toISOString() || null,
    candidateType: candidate.candidateType,
    payload: candidate.payload,
    provenance: candidate.provenance,
    promptVersion: candidate.promptVersion,
    processorVersion: candidate.processorVersion,
    generatedAt: candidate.generatedAt.toISOString(),
    createdAt: candidate.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-amber-100 bg-white p-5 shadow-[0_18px_50px_rgba(37,55,120,0.08)] md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Lane 2 · New Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-[#0a235c]">Candidate review</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#49617f]">Review source-grounded AI candidates before any authority transition. This surface stops at the teacher decision: approved, edited or rejected. It never canonicalizes or projects learner-facing data.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-sky-800">SOURCE</span>
          <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-violet-800">AI CANDIDATE</span>
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-800">TEACHER DECISION</span>
        </div>
      </section>
      <CandidateReviewList candidates={serialized} />
    </div>
  )
}
