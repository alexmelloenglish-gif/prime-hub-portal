import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { listStudentsForAdmin } from '@/lib/admin-dashboard'

export default async function TeacherStudentsPage() {
  const session = await getServerSession(authOptions)
  const students = await listStudentsForAdmin(session?.user)
  return (
    <section className="glass-card p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-prime-cream/45">Students</p>
      <h2 className="mt-1 text-xl font-semibold text-white">Authorized student directory</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-prime-cream/60">Identity remains a security boundary. This view reuses the existing canonical student directory and pipeline enrichment instead of creating a parallel profile store.</p>
      {students.length ? <div className="mt-5 grid gap-3 lg:grid-cols-2">{students.map((student) => (
        <article key={student.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="font-semibold text-white">{student.studentName}</h3><p className="mt-1 text-sm text-prime-cream/55">{student.studentEmail}</p></div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-prime-cream/60">{student.dataSource || 'unknown source'}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-prime-cream/55"><p>Level: <span className="text-prime-cream/80">{student.currentLevel}</span></p><p>Target: <span className="text-prime-cream/80">{student.targetLevel}</span></p><p>Pipeline: <span className="text-prime-cream/80">{student.latestPipelineStatus || 'NO DATA'}</span></p><p>Published reports: <span className="text-prime-cream/80">{student.publishedReportCount ?? 0}</span></p></div>
          <div className="mt-4 flex flex-wrap gap-2"><Link href={`/dashboard?studentEmail=${encodeURIComponent(student.studentEmail)}`} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">Student projection</Link><Link href="/dashboard/admin/intelligence/lessons" className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white hover:bg-white/10">Runtime lessons</Link></div>
        </article>
      ))}</div> : <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-prime-cream/60"><Users className="h-5 w-5" aria-hidden="true" /> No authorized students found.</div>}
    </section>
  )
}
