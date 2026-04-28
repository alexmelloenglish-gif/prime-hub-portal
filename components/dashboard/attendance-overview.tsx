'use client'

import { useState } from 'react'
import type { AttendanceData, ClassReport } from '@/lib/student-data'
import { Calendar, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

type Props = {
  attendance: AttendanceData
  classes: ClassReport[]
}

export function AttendanceOverview({ attendance, classes }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const percent = Math.round((attendance.attended / attendance.total) * 100)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-prime-red">
          <Calendar className="h-4 w-4 text-white" />
        </div>
        <h2 className="font-display text-lg font-bold text-white">Attendance</h2>
      </div>

      {/* Círculo de progresso */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="26" fill="none"
              stroke="#ef4444" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - percent / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-bold text-white">{percent}%</span>
        </div>
        <div>
          <p className="text-white font-semibold">{attendance.attended}/{attendance.total} classes</p>
          <p className="text-xs text-prime-cream/50">Missed: {attendance.missed}</p>
          <p className="mt-1 text-xs font-medium text-green-400">Consistency: {attendance.consistency}</p>
        </div>
      </div>

      {/* Lista de aulas com expandir */}
      <div className="space-y-2">
        {classes.map((cls) => (
          <div key={cls.date} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(expanded === cls.date ? null : cls.date)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                <span className="text-sm font-medium text-white">{cls.date}</span>
              </div>
              {expanded === cls.date
                ? <ChevronUp className="h-4 w-4 text-prime-cream/40" />
                : <ChevronDown className="h-4 w-4 text-prime-cream/40" />
              }
            </button>

            {expanded === cls.date && (
              <div className="border-t border-white/10 px-4 py-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-prime-red uppercase tracking-wider mb-1">Class Summary</p>
                  <p className="text-xs text-prime-cream/70 leading-relaxed">{cls.summary}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-1">Grammar Focus</p>
                  <p className="text-xs text-prime-cream/70">{cls.grammarFocus}</p>
                </div>
                {cls.goals.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Goals</p>
                    <ul className="space-y-1">
                      {cls.goals.map((g) => (
                        <li key={g} className="text-xs text-prime-cream/60 flex items-start gap-1">
                          <span className="text-blue-400 mt-0.5">·</span> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {cls.vocabulary.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1">Vocabulary</p>
                    <div className="flex flex-wrap gap-1">
                      {cls.vocabulary.map((v) => (
                        <span key={v} className="rounded-full bg-green-400/10 border border-green-400/20 px-2 py-0.5 text-xs text-green-300">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
