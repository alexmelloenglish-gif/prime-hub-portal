import type { StudentInfo, AttendanceData } from '@/lib/student-data'
import { Target, TrendingUp, BookOpen, Award } from 'lucide-react'

type Props = {
  info: StudentInfo
  attendance: AttendanceData
}

export function StudentHeader({ info, attendance }: Props) {
  const attendancePercent = Math.round((attendance.attended / attendance.total) * 100)

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-prime-dark via-prime-dark/95 to-prime-red/10 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Saudação */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-prime-red font-bold text-white text-lg">
              {info.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">
                Welcome back, {info.name.split(' ')[0]}!
              </h1>
              <p className="text-sm text-prime-cream/60">
                Teacher: {info.teacher} · {info.program} · {info.frequency}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-prime-cream/70 max-w-xl">
            {info.learningFocus}
          </p>
        </div>

        {/* Nível atual → alvo */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 shrink-0">
          <div className="text-center">
            <p className="text-xs text-prime-cream/50 uppercase tracking-wider">Current</p>
            <p className="text-2xl font-bold text-prime-red">{info.currentLevel}</p>
          </div>
          <div className="text-prime-cream/30 text-xl">→</div>
          <div className="text-center">
            <p className="text-xs text-prime-cream/50 uppercase tracking-wider">Target</p>
            <p className="text-2xl font-bold text-green-400">{info.targetLevel}</p>
          </div>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
          <BookOpen className="h-5 w-5 text-prime-red shrink-0" />
          <div>
            <p className="text-xs text-prime-cream/50">Classes</p>
            <p className="font-semibold text-white">{attendance.attended}/{attendance.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
          <TrendingUp className="h-5 w-5 text-green-400 shrink-0" />
          <div>
            <p className="text-xs text-prime-cream/50">Attendance</p>
            <p className="font-semibold text-white">{attendancePercent}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
          <Award className="h-5 w-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-xs text-prime-cream/50">Consistency</p>
            <p className="font-semibold text-white">{attendance.consistency}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
          <Target className="h-5 w-5 text-blue-400 shrink-0" />
          <div>
            <p className="text-xs text-prime-cream/50">Program</p>
            <p className="font-semibold text-white">{info.program}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
