'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BookOpen,
  BrainCircuit,
  ClipboardCheck,
  FileClock,
  Lightbulb,
  ListChecks,
  Users,
  Waypoints,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Cockpit', href: '/dashboard/admin/intelligence', icon: BrainCircuit },
  { label: 'Learners', href: '/dashboard/admin/intelligence/students', icon: Users },
  { label: 'Lessons', href: '/dashboard/admin/intelligence/lessons', icon: BookOpen },
  { label: 'Review', href: '/dashboard/admin/intelligence/review', icon: ClipboardCheck },
  { label: 'Signals', href: '/dashboard/admin/intelligence/signals', icon: Waypoints },
  { label: 'Insights', href: '/dashboard/admin/intelligence/insights', icon: Lightbulb },
  { label: 'Teaching Actions', href: '/dashboard/admin/intelligence/actions', icon: ListChecks },
  { label: 'Learning State', href: '/dashboard/admin/intelligence/learning-state', icon: Activity },
  { label: 'Audit', href: '/dashboard/admin/intelligence/audit', icon: FileClock },
]

export function TeacherIntelligenceNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Teacher Intelligence" className="overflow-x-auto">
      <div className="flex min-w-max gap-2 pb-1">
        {items.map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard/admin/intelligence' && pathname.startsWith(`${item.href}/`))

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
                active
                  ? 'border-[#263c86] bg-[#263c86] text-white shadow-[0_10px_24px_rgba(38,60,134,0.18)]'
                  : 'border-slate-200 bg-white/90 text-[#526783] hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#263c86]'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
