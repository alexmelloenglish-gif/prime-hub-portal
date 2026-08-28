'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, BookOpen, TrendingUp, Target, CheckCircle2, MessageCircle, Settings, Shield, LogOut, BrainCircuit } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const baseMenuItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Lessons', href: '/dashboard/aulas', icon: BookOpen },
  { label: 'Progress', href: '/dashboard/progresso', icon: TrendingUp },
  { label: 'My Weekly Goals', href: '/dashboard/goals', icon: CheckCircle2 },
  { label: 'Vocabulary', href: '/dashboard/metas', icon: Target },
  { label: 'Grammar', href: '/dashboard/conversacao', icon: MessageCircle },
  { label: 'Feedback', href: '/dashboard/configuracoes', icon: Settings },
]

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previewStudentEmail = searchParams.get('studentEmail')
  const menuItems = isAdmin
    ? [
        ...baseMenuItems,
        { label: 'Teacher Intelligence', href: '/dashboard/admin/intelligence', icon: BrainCircuit },
        { label: 'Admin', href: '/dashboard/admin', icon: Shield },
      ]
    : baseMenuItems

  const buildHref = (href: string) => {
    if (!previewStudentEmail || href.startsWith('/dashboard/admin')) return href
    const params = new URLSearchParams()
    params.set('studentEmail', previewStudentEmail)
    return `${href}?${params.toString()}`
  }

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-dvh w-64 overflow-hidden border-r border-white/10 bg-gradient-to-b from-prime-dark to-prime-dark/95 p-4 md:flex md:flex-col">
        <Link href="/dashboard" className="mb-5 flex shrink-0 items-center justify-center">
          <img src="/assets/logo-mini.png" alt="Prime Digital Hub" className="h-12 w-12 object-contain" />
        </Link>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
            return (
              <Link key={item.href} href={buildHref(item.href)} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors', isActive ? 'bg-prime-red text-white' : 'text-prime-cream/70 hover:bg-white/10')}>
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="mt-3 flex w-full shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-prime-cream/70 transition-colors hover:bg-white/10">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign out</span>
        </button>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex overflow-x-auto border-t border-white/10 bg-prime-dark/95 px-2 py-2 backdrop-blur md:hidden">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
          return (
            <Link key={item.href} href={buildHref(item.href)} className={cn('flex min-w-[76px] flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] transition-colors', isActive ? 'bg-prime-red/20 text-white' : 'text-prime-cream/70')}>
              <Icon className="h-4 w-4" />
              <span className="max-w-[88px] truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
