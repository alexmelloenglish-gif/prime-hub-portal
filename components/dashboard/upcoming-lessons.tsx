'use client'

import { Clock, BookOpen } from 'lucide-react'

const lessons = [
  {
    id: 1,
    title: 'Speaking & Confidence',
    time: 'Hoje às 19:00',
    level: 'B1',
  },
  {
    id: 2,
    title: 'Grammar Essentials',
    time: 'Amanhã às 18:30',
    level: 'B1',
  },
  {
    id: 3,
    title: 'Business English',
    time: 'Quinta às 20:00',
    level: 'B2',
  },
]

export function UpcomingLessons() {
  return (
    <div className="glass-card p-6">
      <h2 className="font-display text-xl font-bold text-white mb-6">
        Próximas Aulas
      </h2>
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-prime-red/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-prime-red" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{lesson.title}</p>
                  <p className="text-prime-cream/60 text-xs flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {lesson.time}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-prime-red bg-prime-red/20 px-2 py-1 rounded">
                {lesson.level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
