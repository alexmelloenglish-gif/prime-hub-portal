'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BarChart3,
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
  { label: 'Home', href: '/dashboard/admin/intelligence', icon: BrainCircuit },
  { label: 'Students', href: '/dashboard/admin/intelligence/students', icon: Users },
  { label: 'Lessons', href: '/dashboard/admin/intelligence/lessons', icon: BookOpen },
  { label: 'Review Queue', href: '/dashboard/admin/intelligence/review', icon: ClipboardCheck },
  { label: 'Signals', href: '/dashboard/admin/intelligence/signals', icon: Waypoints },
  { label: 'Insights', href: '/dashboard/admin/intelligence/insights', icon: Lightbulb },
  { label: 'Actions', href: '/dashboard/admin/intelligence/actions', icon: ListChecks },
  { label: 'Learning State', href: '/dashboard/admin/intelligence/learning-state', icon: Activity },
  { label: 'Analytics', href: '/dashboard/admin/intelligence/analytics', icon: BarChart3 },
  { label: 'System / Audit', href: '/dashboard/admin/intelligence/audit', icon: FileClock },
]

export function TeacherIntelligenceNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Teacher Intelligence" className="overflow-x-auto border-b border-white/10 pb-3">
      <div className="flex min-w-max gap-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard/admin/intelligence' && pathname.startsWith(`${item.href}/`))
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prime-red',
                active
                  ? 'border-prime-red/60 bg-prime-red/20 text-white'
                  : 'border-white/10 bg-white/5 text-prime-cream/70 hover:bg-white/10 hover:text-white'
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
