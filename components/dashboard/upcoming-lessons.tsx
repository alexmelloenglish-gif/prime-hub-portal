'use client'

import { BookOpen, Clock } from 'lucide-react'
import { upcomingLessons } from '@/lib/dashboard-data'

export function UpcomingLessons() {
  return (
    <div className="glass-card p-6">
      <h2 className="mb-6 font-display text-xl font-bold text-white">Próximas aulas</h2>
      <div className="space-y-4">
        {upcomingLessons.map((lesson) => (
          <div key={lesson.id} className="cursor-pointer rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-prime-red/20">
                  <BookOpen className="h-4 w-4 text-prime-red" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{lesson.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-prime-cream/60">
                    <Clock className="h-3 w-3" />
                    {lesson.time}
                  </p>
                </div>
              </div>
              <span className="rounded bg-prime-red/20 px-2 py-1 text-xs font-semibold text-prime-red">{lesson.level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
