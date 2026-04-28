import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStudentData, rafaelData } from '@/lib/student-data'
import { SectionShell } from '@/components/dashboard/section-shell'
import { CheckCircle2, BookOpen } from 'lucide-react'

export default async function ClassesPage() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? ''
  const student = (await getStudentData(email)) ?? rafaelData

  return (
    <SectionShell
      title="My Classes"
      description={`${student.attendance.attended} classes attended · Consistency: ${student.attendance.consistency}`}
    >
      <div className="space-y-4">
        {student.classes.map((cls, idx) => (
          <article key={cls.date} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-prime-red/20 text-prime-red font-bold text-sm">
                {student.classes.length - idx}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  <h3 className="font-display text-lg font-semibold text-white">{cls.date}</h3>
                </div>

                <p className="text-sm text-prime-cream/70 leading-relaxed mb-4">{cls.summary}</p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Grammar Focus */}
                  <div className="rounded-lg bg-yellow-400/5 border border-yellow-400/20 p-3">
                    <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-1">Grammar Focus</p>
                    <p className="text-xs text-prime-cream/70">{cls.grammarFocus}</p>
                  </div>

                  {/* Goals */}
                  <div className="rounded-lg bg-blue-400/5 border border-blue-400/20 p-3">
                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Goals</p>
                    <ul className="space-y-1">
                      {cls.goals.map((g) => (
                        <li key={g} className="text-xs text-prime-cream/70 flex items-start gap-1">
                          <span className="text-blue-400 mt-0.5 shrink-0">·</span>{g}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Vocabulary */}
                  <div className="rounded-lg bg-green-400/5 border border-green-400/20 p-3">
                    <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1">
                      <BookOpen className="inline h-3 w-3 mr-1" />Vocabulary
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cls.vocabulary.map((v) => (
                        <span key={v} className="rounded-full bg-green-400/10 px-2 py-0.5 text-xs text-green-300">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
