import { upcomingLessons } from '@/lib/dashboard-data'
import { SectionShell } from '@/components/dashboard/section-shell'

export default function DashboardLessonsPage() {
  return (
    <SectionShell
      title="Minhas aulas"
      description="Visão rápida das próximas aulas agendadas e do ritmo atual da sua trilha."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {upcomingLessons.map((lesson) => (
          <article key={lesson.id} className="glass-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-white">{lesson.title}</h3>
                <p className="mt-2 text-sm text-prime-cream/70">{lesson.time}</p>
              </div>
              <span className="rounded-full bg-prime-red/20 px-3 py-1 text-xs font-semibold text-prime-red">
                {lesson.level}
              </span>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
