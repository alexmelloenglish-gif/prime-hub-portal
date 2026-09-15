import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { listStudentsForAdmin } from '@/lib/admin-dashboard'

function pipelineLabel(status?: string | null) {
  if (!status) return 'No recent processing'
  if (status === 'completed') return 'Completed'
  if (status === 'failed') return 'Failed — technical attempt only'
  if (status === 'running') return 'Processing'
  return status.replace(/_/g, ' ')
}

export default async function TeacherStudentsPage() {
  const session = await getServerSession(authOptions)
  const students = await listStudentsForAdmin(session?.user)
  return (
    <section className="glass-card p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Students</p>
      <h2 className="mt-1 text-xl font-semibold text-white">Authorized student directory</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">
        Every authorized learner is represented by the canonical learning record. Runtime pipeline status is shown separately so a failed or absent processing attempt never erases an existing learner record.
      </p>
      {students.length ? <div className="mt-5 grid gap-3 lg:grid-cols-2">{students.map((student) => (
        <article key={student.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="font-semibold text-white">{student.studentName}</h3><p className="mt-1 text-sm text-prime-cream/55">{student.studentEmail}</p></div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-prime-cream/60">{student.dataSource || 'unknown source'}</span>
          </div>
          <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100/70">Learning record</p>
            <p className="mt-1 text-sm font-semibold text-white">{student.learningRecordLabel || 'Learning record available'}</p>
            <p className="mt-1 text-xs text-prime-cream/55">{student.canonicalReportCount ?? 0} canonical class report{(student.canonicalReportCount ?? 0) === 1 ? '' : 's'} · {student.attendanceRate}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-prime-cream/55">
            <p>Current level: <span className="text-prime-cream/80">{student.currentLevel}</span></p>
            <p>Target: <span className="text-prime-cream/80">{student.targetLevel}</span></p>
            <p>Canonical reports: <span className="text-prime-cream/80">{student.canonicalReportCount ?? 0}</span></p>
            <p>Runtime reports: <span className="text-prime-cream/80">{student.publishedReportCount ?? 0}</span></p>
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-prime-cream/40">Runtime processing</p>
            <p className="mt-1 text-xs text-prime-cream/65">{pipelineLabel(student.latestPipelineStatus)}</p>
            <p className="mt-1 text-[11px] leading-5 text-prime-cream/40">This technical state does not replace the learner's canonical portfolio, level, attendance record or learning history.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><Link href={`/dashboard?studentEmail=${encodeURIComponent(student.studentEmail)}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">Student projection</Link><Link href="/dashboard/admin/intelligence/lessons" className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">Runtime lessons</Link></div>
        </article>
      ))}</div> : <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-prime-cream/60"><Users className="h-5 w-5" aria-hidden="true" /> No authorized students found.</div>}
    </section>
  )
}
