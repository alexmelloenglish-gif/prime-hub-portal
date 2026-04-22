'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, TrendingUp, Target, MessageCircle, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    label: 'Visão geral',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Minhas aulas',
    href: '/dashboard/aulas',
    icon: BookOpen,
  },
  {
    label: 'Meu progresso',
    href: '/dashboard/progresso',
    icon: TrendingUp,
  },
  {
    label: 'Metas',
    href: '/dashboard/metas',
    icon: Target,
  },
  {
    label: 'Conversação',
    href: '/dashboard/conversacao',
    icon: MessageCircle,
  },
  {
    label: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-gradient-to-b from-prime-dark to-prime-dark/95 p-6 md:flex md:flex-col">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-prime-red font-bold text-white">P</div>
          <span className="font-display text-lg font-bold text-white">Prime</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                  isActive ? 'bg-prime-red text-white' : 'text-prime-cream/70 hover:bg-white/10'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-prime-cream/70 transition-colors hover:bg-white/10"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sair</span>
        </button>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-white/10 bg-prime-dark/95 px-2 py-2 backdrop-blur md:hidden">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] transition-colors',
                isActive ? 'bg-prime-red/20 text-white' : 'text-prime-cream/70'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
