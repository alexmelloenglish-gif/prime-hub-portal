import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStudentData, rafaelData } from '@/lib/student-data'
import { SectionShell } from '@/components/dashboard/section-shell'
import { cn } from '@/lib/utils'

const statusStyle: Record<string, string> = {
  'Improving':    'bg-pink-400/10 border-pink-400/30 text-pink-400',
  'Developing':   'bg-orange-400/10 border-orange-400/30 text-orange-400',
  'Active':       'bg-green-400/10 border-green-400/30 text-green-400',
  'Consolidated': 'bg-blue-400/10 border-blue-400/30 text-blue-400',
}

export default async function GrammarPage() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? ''
  const student = (await getStudentData(email)) ?? rafaelData

  return (
    <SectionShell
      title="Grammar Overview"
      description="Cumulative grammar focus areas tracked across all classes."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {student.grammarOverview.map((item) => (
          <div key={item.focusArea} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-white text-sm">{item.focusArea}</h3>
              <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold', statusStyle[item.status] ?? statusStyle['Developing'])}>
                {item.status}
              </span>
            </div>
            <p className="text-xs text-prime-cream/60 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Teacher Feedback */}
      <div className="mt-6 rounded-xl border border-prime-red/20 bg-prime-red/5 p-5">
        <p className="text-xs font-semibold text-prime-red uppercase tracking-wider mb-2">
          Teacher Feedback — {student.teacherFeedbackMonth}
        </p>
        <p className="text-sm text-prime-cream/80 leading-relaxed italic">
          &ldquo;{student.teacherFeedback}&rdquo;
        </p>
        <p className="mt-2 text-xs text-prime-cream/40">— Alexandre Mello, Prime Digital Hub</p>
      </div>
    </SectionShell>
  )
}
