import { BarChart3 } from 'lucide-react'
import { IntelligenceStatusBadge } from '@/components/teacher/intelligence-status-badge'
import { getTeacherIntelligenceAnalytics } from '@/lib/teacher-intelligence-analytics'

function MetricCard({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-prime-cream/40">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {note ? <p className="mt-2 text-xs leading-5 text-prime-cream/50">{note}</p> : null}
    </article>
  )
}

export default async function TeacherAnalyticsPage() {
  const data = await getTeacherIntelligenceAnalytics()

  return (
    <div className="space-y-5">
      <section className="glass-card p-5 md:p-6">
        <div className="flex items-start gap-3">
          <BarChart3 className="mt-1 h-5 w-5 text-prime-cream/50" aria-hidden="true" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Analytics</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Activity, runtime and cognitive pipeline are separate</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">These are persisted runtime counts, not a single completion percentage. Proposal counts do not prove validated learning, and technical completion does not prove cognitive validity.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="activity-heading" className="space-y-3">
        <h3 id="activity-heading" className="text-lg font-semibold text-white">Activity</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Pipeline runs" value={data.activity.pipelineRuns} />
          <MetricCard label="Transcripts" value={data.activity.transcripts} />
          <MetricCard label="Class Reports" value={data.activity.classReports} note="Document projections, not proof of cognition." />
          <MetricCard label="Review tasks" value={data.activity.reviewTasks} />
          <MetricCard label="Completed reviews" value={data.activity.completedReviews} note="Human workflow completions; inspect trace for resulting state." />
        </div>
      </section>

      <section aria-labelledby="technical-heading" className="space-y-3">
        <h3 id="technical-heading" className="text-lg font-semibold text-white">Technical runtime</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Completed runs" value={data.technicalRuntime.completedRuns} note="Completed is technical status only." />
          <MetricCard label="Not proven runs" value={data.technicalRuntime.notProvenRuns} />
          <MetricCard label="Failed runs" value={data.technicalRuntime.failedRuns} />
          <MetricCard label="Quality Gate rejected" value={data.technicalRuntime.qualityGateRejected} />
          <MetricCard label="Gemini failures" value={data.technicalRuntime.geminiGenerationFailed} />
        </div>
      </section>

      <section aria-labelledby="cognitive-heading" className="space-y-3">
        <h3 id="cognitive-heading" className="text-lg font-semibold text-white">Cognitive pipeline artifacts</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Evidence Candidates" value={data.cognitivePipeline.evidenceCandidatesGenerated} note="Generated candidates, not canonical validated Evidence." />
          <MetricCard label="Candidates accepted" value={data.cognitivePipeline.evidenceCandidatesAcceptedByTeacher} note="Teacher review state only; canonicalEvidenceCreated remains false." />
          <MetricCard label="Candidates rejected/blocked" value={data.cognitivePipeline.evidenceCandidatesRejectedOrBlocked} />
          <MetricCard label="Signal proposals" value={data.cognitivePipeline.signalProposals} note="LearningSignalProposal only." />
          <MetricCard label="Insight proposals" value={data.cognitivePipeline.insightProposals} note="TeacherInsightProposal only." />
          <MetricCard label="Official insight records" value={data.cognitivePipeline.officialInsightRecords} note="Persisted flag count; pedagogical validity still requires trace." />
          <MetricCard label="Coaching proposals" value={data.cognitivePipeline.coachingProposals} note="Recommendation is not TeacherDecision." />
        </div>
      </section>

      <section className="glass-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Learning loop</p>
        <h3 className="mt-1 text-lg font-semibold text-white">Canonical downstream stages remain explicit</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-sm text-prime-cream/70">Validated Evidence</span><IntelligenceStatusBadge label={data.canonicalStatus.validatedEvidence.replace('_', ' ')} state="NOT_PROVEN" /></div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-sm text-prime-cream/70">Canonical Learning Signal</span><IntelligenceStatusBadge label="NOT PROVEN" state="NOT_PROVEN" /></div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-sm text-prime-cream/70">Pedagogical Decision</span><IntelligenceStatusBadge label="NOT PROVEN" state="NOT_PROVEN" /></div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-sm text-prime-cream/70">Educational Action</span><IntelligenceStatusBadge label="NOT PROVEN" state="NOT_PROVEN" /></div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-sm text-prime-cream/70">Learning State transition</span><IntelligenceStatusBadge label="NOT PROVEN" state="NOT_PROVEN" /></div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-sm text-prime-cream/70">Longitudinal outcome</span><IntelligenceStatusBadge label="NOT PROVEN" state="NOT_PROVEN" /></div>
        </div>
      </section>
    </div>
  )
}
