'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Target,
  CheckCircle2,
  MessageCircle,
  Settings,
  Shield,
  LogOut,
  BrainCircuit,
} from 'lucide-react'
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
  const isStudentPreview = Boolean(previewStudentEmail)
  const menuItems = isAdmin && !isStudentPreview
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
      <aside className="fixed left-0 top-0 hidden h-dvh w-64 overflow-hidden border-r border-[#eadfd3] bg-[#fffaf4] p-4 shadow-[10px_0_34px_rgba(15,48,93,0.05)] md:flex md:flex-col">
        <Link href={isStudentPreview ? buildHref('/dashboard') : '/dashboard'} className="mb-5 flex shrink-0 items-center justify-center rounded-2xl px-2 py-2">
          <img
            src="/brand/prime-digital-hub-full-transparent.png"
            alt="Prime Digital Hub"
            className="h-16 w-auto max-w-[190px] object-contain"
          />
        </Link>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
            return (
              <Link
                key={item.href}
                href={buildHref(item.href)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200',
                  isActive
                    ? 'border-[#ead0c7] bg-white text-[#0a235c] shadow-[0_8px_24px_rgba(15,48,93,0.07)] ring-1 ring-[#f4e4dc]'
                    : 'border-transparent text-[#526783] hover:border-[#eadfd3] hover:bg-white/75 hover:text-[#0a235c]'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-[#a82217]/10 text-[#a82217]'
                      : 'bg-[#f0e5da] text-[#7890ad] group-hover:bg-[#a82217]/8 group-hover:text-[#a82217]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="my-4 border-t border-[#eadfd3]" />

        <div className="mb-4 rounded-2xl border border-[#eadfd3] bg-white p-4 shadow-[0_12px_28px_rgba(15,48,93,0.05)]">
          <p className="text-[1.05rem] font-bold leading-tight text-[#0a235c]">Small steps.<br />Bigger futures.</p>
          <div className="mt-3 h-1 w-12 rounded-full bg-prime-red" />
          <p className="mt-3 text-xs leading-5 text-[#526783]">Consistent learning today. New opportunities tomorrow.</p>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="mt-auto flex w-full shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#526783] transition-colors hover:bg-white hover:text-[#0a235c]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0e5da] text-[#7890ad]">
            <LogOut className="h-4 w-4" />
          </span>
          <span className="font-medium">Sign out</span>
        </button>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex overflow-x-auto border-t border-[#eadfd3] bg-[#fffaf4]/95 px-2 py-2 shadow-[0_-8px_28px_rgba(15,48,93,0.08)] backdrop-blur md:hidden">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
          return (
            <Link
              key={item.href}
              href={buildHref(item.href)}
              className={cn(
                'flex min-w-[76px] flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] transition-colors',
                isActive ? 'bg-white text-[#a82217] shadow-sm' : 'text-[#607697]'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-[88px] truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
